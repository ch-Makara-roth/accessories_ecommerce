
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

  // Most critical check: Is Prisma client itself available?
  if (!prisma) {
    const errorMsg = 'CRITICAL - Prisma client (imported as `prisma`) is undefined! This is a fundamental setup issue. Check server logs, DATABASE_URL in .env.local, ensure `npx prisma generate` has run, and server was restarted.';
    console.error(`API POST /api/orders: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMsg, message: errorMsg }, { status: 500 });
  }
  console.log('API POST /api/orders: Prisma client instance IS defined.');

  // Next critical check: Is the `order` model accessible and does it have a `create` method?
  if (!prisma.order || typeof prisma.order.create !== 'function') {
    const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_') && typeof (prisma as any)[key] === 'object');
    const errorMsg = `CRITICAL - Prisma 'order' model or its 'create' method is not accessible. This strongly indicates that 'npx prisma generate' has not been run successfully after defining/updating the Order model in schema.prisma, or there's a DATABASE_URL issue. Available Prisma models found: [${availableModels.join(', ')}]. Prisma.order object: ${prisma.order === undefined ? 'undefined' : 'exists (but create method might be missing)'}. Typeof prisma.order.create: ${typeof prisma.order?.create}.`;
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
      // TODO: Implement stock checking if product.stock is used
      // if (product.stock !== null && product.stock < cartItem.quantity) {
      //   console.log(`API POST /api/orders: Not enough stock for ${product.name}. Available: ${product.stock}`);
      //   return NextResponse.json({ error: `Not enough stock for ${product.name}. Available: ${product.stock}` }, { status: 400 });
      // }

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
    const createdOrder = await prisma.$transaction(async (tx) => {
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

      // Optional: Decrement stock levels
      // for (const item of orderItemsData) {
      //   await tx.product.update({
      //     where: { id: item.productId },
      //     data: { stock: { decrement: item.quantity } },
      //   });
      // }
      return order;
    });
    console.log(`API POST /api/orders: Prisma transaction completed. Order ID: ${createdOrder.id}`);

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
