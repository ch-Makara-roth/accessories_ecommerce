
// src/app/api/orders/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Product as ProductType, CartItem } from '@/types';

interface CreateOrderRequestBody {
  cartItems: CartItem[];
  shippingAddress?: any; // Define a more specific type for shippingAddress
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to place an order.' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json() as CreateOrderRequestBody;
    const { cartItems, shippingAddress } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty. Cannot create an order.' }, { status: 400 });
    }

    // Fetch current product details and calculate total amount
    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const cartItem of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: cartItem.product.id },
      });

      if (!product) {
        return NextResponse.json({ error: `Product with ID ${cartItem.product.id} not found.` }, { status: 404 });
      }
      if (product.stock !== null && product.stock < cartItem.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product.name}. Available: ${product.stock}` }, { status: 400 });
      }

      const itemPrice = product.price; // Use current price from DB
      totalAmount += itemPrice * cartItem.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: itemPrice,
      });
    }
    
    // Create order and order items in a transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'Pending', // Default status
          shippingAddress: shippingAddress || {}, // Store shipping address
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: true, // Include product details in the response
            },
          },
        },
      });

      // Optional: Decrement stock levels
      // for (const item of orderItemsData) {
      //   await tx.product.update({
      //     where: { id: item.productId },
      //     data: { stock: { decrement: item.quantity } },
      //   });
      // }
      return order;
    });

    // In a real app, you might trigger email confirmations, payment processing, etc. here

    return NextResponse.json(createdOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    let errorMessage = 'Failed to create order.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to view orders.' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: { // Include product details: name, image, etc.
              select: {
                id: true,
                name: true,
                image: true,
                price: true, // You might want original price if stored, or rely on OrderItem.price
                description: true,
                dataAiHint: true,
              }
            }
          }
        },
        user: { // Optionally include basic user details if needed on order list
            select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Error fetching orders:', error);
    let errorMessage = 'Failed to fetch orders.';
     if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 });
  }
}
