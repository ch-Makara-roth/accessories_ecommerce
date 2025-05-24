
// src/app/api/admin/orders/[orderId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role, OrderStatus } from '@prisma/client'; // Import OrderStatus enum
import { z } from 'zod';

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  const { orderId } = params;

  if (!session || !session.user || ![Role.ADMIN, Role.SELLER].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin or Seller access required.' }, { status: 403 });
  }

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  if (!prisma || !prisma.order || typeof prisma.order.update !== 'function') {
    const errorMsg = 'CRITICAL - Prisma `order` model or `update` method is not accessible in PUT /api/admin/orders/[orderId]. Ensure `npx prisma generate` has been run and server restarted.';
    console.error(`API PUT /api/admin/orders/${orderId}: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue for order update.', details: errorMsg }, { status: 500 });
  }

  try {
    const body = await req.json();
    const validation = updateOrderStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid status provided.', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status: newStatus } = validation.data;

    // Optional: Add logic to validate status transitions if needed
    // e.g., an order cannot go from "Shipped" back to "Pending" by seller action.

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { // Return the updated order with some details
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: { select: { name: true, image: true } } } },
      }
    });

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error(`API PUT /api/admin/orders/${orderId}: Error updating order status:`, error);
    if (error.code === 'P2025') { // Record to update not found
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to update order status', details: errorMessage }, { status: 500 });
  }
}
