
// src/app/api/orders/route.ts
import prisma from '@/lib/prisma';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { CartItem } from '@/types';
import type { Prisma } from '@prisma/client';

interface CreateOrderRequestBody {
  cartItems: CartItem[];
  shippingAddress?: any; // Consider defining a stricter type for this
}

export async function POST(req: NextRequest) {
  console.log('API POST /api/orders: Received order creation request.');

  if (!prisma) {
    const errorMsg = 'CRITICAL - Prisma client (imported as `prisma`) is undefined! This is a fundamental setup issue. Check server logs, DATABASE_URL in .env.local, ensure `npx prisma generate` has run, and server was restarted.';
    console.error(`API POST /api/orders: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMsg, message: errorMsg }, { status: 500 });
  }
  console.log('API POST /api/orders: Prisma client instance IS defined.');

  if (!prisma.order || typeof prisma.order.create !== 'function' || !prisma.product || typeof prisma.product.update !== 'function') {
    const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_') && typeof (prisma as any)[key] === 'object' && (prisma as any)[key] !== null);
    const errorMsg = `CRITICAL - Prisma 'order' model or its 'create' method, or 'product' model or its 'update' method is not accessible. Ensure 'npx prisma generate' has been run successfully. Available Prisma models: [${availableModels.join(', ')}]. Prisma.order type: ${typeof prisma.order}, prisma.order.create type: ${typeof prisma.order?.create}.`;
    console.error(`API POST /api/orders: CRITICAL - ${errorMsg}. Prisma object: ${JSON.stringify(Object.keys(prisma))}`);
    return NextResponse.json({ error: 'Internal Server Error: Prisma models not fully accessible.', details: errorMsg, message: errorMsg }, { status: 500 });
  }
  console.log('API POST /api/orders: Prisma client and prisma.order.create and prisma.product.update seem available.');


  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    console.log('API POST /api/orders: Unauthorized attempt to create order.');
    return NextResponse.json({ error: 'Unauthorized. Please log in to place an order.' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log(`API POST /api/orders: User ${userId} attempting to place order.`);

  try {
    const body = await req.json() as CreateOrderRequestBody;
    const { cartItems, shippingAddress } = body;

    if (!cartItems || cartItems.length === 0) {
      console.log('API POST /api/orders: Cart is empty. Cannot create an order.');
      return NextResponse.json({ error: 'Cart is empty. Cannot create an order.' }, { status: 400 });
    }
    console.log(`API POST /api/orders: Processing ${cartItems.length} cart items.`);

    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    const productUpdates: Prisma.PrismaPromise<any>[] = [];
    let totalAmount = 0;

    // First pass: Validate stock and prepare operations
    for (const cartItem of cartItems) {
      if (!cartItem.product || !cartItem.product.id) {
        console.error('API POST /api/orders: Invalid cart item detected (missing product or product.id):', cartItem);
        return NextResponse.json({ error: 'Invalid cart item data.'}, { status: 400});
      }
      const product = await prisma.product.findUnique({
        where: { id: cartItem.product.id },
      });

      if (!product) {
        console.log(`API POST /api/orders: Product with ID ${cartItem.product.id} not found.`);
        return NextResponse.json({ error: `Product "${cartItem.product.name || cartItem.product.id}" not found.` }, { status: 404 });
      }
      
      // Stock check
      if (product.stock == null || product.stock < cartItem.quantity) {
        const availableStock = product.stock ?? 0;
        console.log(`API POST /api/orders: Insufficient stock for product ID ${product.id} ("${product.name}"). Requested: ${cartItem.quantity}, Available: ${availableStock}.`);
        return NextResponse.json({ error: `Insufficient stock for product "${product.name}". Only ${availableStock} available.` }, { status: 400 });
      }

      const itemPrice = product.price; 
      totalAmount += itemPrice * cartItem.quantity;
      
      orderItemsData.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: itemPrice, // Price at the time of order
      });

      productUpdates.push(
        prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: cartItem.quantity } },
        })
      );
    }
    console.log(`API POST /api/orders: Calculated total amount: ${totalAmount}. All items have sufficient stock.`);
    
    console.log('API POST /api/orders: Starting Prisma transaction to create order and update stock.');
    
    const createOrderOperation = prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'Pending', 
        shippingAddress: shippingAddress || {}, 
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true, 
          },
        },
      },
    });
    
    // Combine product stock updates and order creation in a single transaction
    const transactionOperations = [...productUpdates, createOrderOperation];
    const transactionResults = await prisma.$transaction(transactionOperations);
    
    // The result of the last operation in the transaction array is the createdOrder
    const createdOrder = transactionResults[transactionResults.length - 1] as any; // Cast as 'any' if specific type is complex

    console.log(`API POST /api/orders: Prisma transaction completed. Order ID: ${createdOrder.id}`);

    if (createdOrder) {
      try {
        const shortOrderId = createdOrder.id.substring(0, 8);
        const userEmail = session.user?.email || 'Unknown User';
        await prisma.adminNotification.create({
          data: {
            title: `New Order: #${shortOrderId}...`,
            description: `Order #${shortOrderId} by ${userEmail} for $${createdOrder.totalAmount.toFixed(2)} has been placed.`,
            category: 'Orders',
          },
        });
        console.log(`API POST /api/orders: Admin notification created for order ${createdOrder.id}`);
      } catch (notificationError) {
        console.error(`API POST /api/orders: Failed to create admin notification for order ${createdOrder.id}:`, notificationError);
      }
    }

    return NextResponse.json(createdOrder, { status: 201 });

  } catch (error) {
    console.error('API POST /api/orders: Error creating order:');
    let errorMessage = 'Failed to create order.';
    let errorDetails = String(error);

    if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || String(error);
        if (error.message.startsWith("Insufficient stock for product")) { // Specific error from our stock check
            return NextResponse.json({ error: error.message, details: errorDetails }, { status: 400 });
        }
    }
    console.error("Raw error object in POST /api/orders:", error);
    return NextResponse.json({ error: errorMessage, details: errorDetails, message: errorMessage }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to view orders.' }, { status: 401 });
  }

  const userId = session.user.id;

  if (!prisma || !prisma.order || typeof prisma.order.findMany !== 'function') {
    const errorMsg = 'CRITICAL - Prisma `order` model or `findMany` method is not accessible in GET /api/orders. Ensure `npx prisma generate` has been run and server restarted.';
    console.error(`API GET /api/orders: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue.', details: errorMsg }, { status: 500 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: { 
              select: {
                id: true,
                name: true,
                image: true,
                price: true, 
                description: true,
                dataAiHint: true,
                stock: true, // Ensure stock is selected
              }
            }
          }
        },
        user: { 
            select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('API GET /api/orders: Error fetching orders:', error);
    let errorMessage = 'Failed to fetch orders.';
     if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}
