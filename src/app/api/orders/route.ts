
// src/app/api/orders/route.ts
import prisma from '@/lib/prisma'; // Ensure this is the correct path to your Prisma client instance
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { CartItem } from '@/types';

interface CreateOrderRequestBody {
  cartItems: CartItem[];
  shippingAddress?: any;
}

export async function POST(req: NextRequest) {
  console.log('API POST /api/orders: Received order creation request.');

  if (!prisma) {
    const errorMsg = 'CRITICAL - Prisma client (imported as `prisma`) is undefined! This is a fundamental setup issue. Check server logs, DATABASE_URL in .env.local, ensure `npx prisma generate` has run, and server was restarted.';
    console.error(`API POST /api/orders: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMsg, message: errorMsg }, { status: 500 });
  }
  console.log('API POST /api/orders: Prisma client instance IS defined.');

  if (!prisma.order || typeof prisma.order.create !== 'function') {
    const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_') && typeof (prisma as any)[key] === 'object' && (prisma as any)[key] !== null && typeof (prisma as any)[key].create === 'function');
    const errorMsg = `CRITICAL - Prisma 'order' model or its 'create' method is not accessible. Ensure 'npx prisma generate' has been run successfully after defining/updating the Order model in schema.prisma, or there's a DATABASE_URL issue. Available Prisma models with create method: [${availableModels.join(', ')}]. Prisma.order type: ${typeof prisma.order}, prisma.order.create type: ${typeof prisma.order?.create}.`;
    console.error(`API POST /api/orders: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error: Prisma order model not accessible.', details: errorMsg, message: errorMsg }, { status: 500 });
  }
  console.log('API POST /api/orders: Prisma client and prisma.order.create seem available. Proceeding with order creation attempt.');


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

    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

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
        return NextResponse.json({ error: `Product with ID ${cartItem.product.id} not found.` }, { status: 404 });
      }
      
      const itemPrice = product.price; 
      totalAmount += itemPrice * cartItem.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: itemPrice,
      });
    }
    console.log(`API POST /api/orders: Calculated total amount: ${totalAmount}`);
    
    console.log('API POST /api/orders: Starting Prisma transaction to create order.');
    let createdOrder;
    createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
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
      console.log(`API POST /api/orders: Order ${order.id} created within transaction.`);
      return order;
    });
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
    console.error('API POST /api/orders: Error creating order:', error);
    let errorMessage = 'Failed to create order.';
    let errorDetails = String(error);
    if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || String(error);
    }
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
