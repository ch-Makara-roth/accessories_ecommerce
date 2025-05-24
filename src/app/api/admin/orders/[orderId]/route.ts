
// src/app/api/admin/orders/[orderId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client'; // Role enum is fine for session checks
import { z } from 'zod';

// Define OrderStatus values explicitly for Zod
const OrderStatusValues = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const; // Use "as const" for stricter typing with z.enum

const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatusValues),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  const { orderId } = params; // This is the standard way to get route params in App Router API routes

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
      console.error(`API PUT /api/admin/orders/${orderId}: Zod validation failed. Errors:`, validation.error.flatten().fieldErrors);
      return NextResponse.json({ error: 'Invalid status provided.', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status: newStatus } = validation.data;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }, // Prisma client will use the string value here, which is correct
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: { select: { name: true, image: true } } } },
      }
    });

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error(`API PUT /api/admin/orders/${orderId}: Error during status update. Raw error object:`);
    try {
      // Attempt to log more details from the error object
      const errorDetailsToLog = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code, // For Prisma errors
        meta: error.meta, // For Prisma errors
      };
      console.error(JSON.stringify(errorDetailsToLog, null, 2));
    } catch (stringifyError) {
      console.error("Could not stringify the raw error object. Fallback to default logging:", error);
    }

    let errorMessage = 'An unexpected error occurred while updating order status.';
    let statusCode = 500;

    if (error && typeof error === 'object') {
      if (error.code === 'P2025') { // Prisma: Record to update not found
        errorMessage = 'Order not found.';
        statusCode = 404;
      } else if (error.message) { // Standard Error object
        errorMessage = error.message;
      } else {
        try {
          errorMessage = `Non-standard error object: ${JSON.stringify(error)}`;
        } catch (e) {
          errorMessage = 'An unidentifiable error object was caught and could not be stringified.';
        }
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error(`API PUT /api/admin/orders/${orderId}: Processed error message for client: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to update order status', details: errorMessage }, { status: statusCode });
  }
}
