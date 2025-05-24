
// src/app/api/admin/orders/[orderId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role, OrderStatus } from '@prisma/client'; // Import OrderStatus
import { z } from 'zod';

const OrderStatusValues = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatusValues),
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

  if (!prisma || !prisma.order || typeof prisma.order.update !== 'function' || typeof prisma.product?.update !== 'function') {
    const errorMsg = 'CRITICAL - Prisma models (Order/Product) or their update methods are not accessible in PUT /api/admin/orders/[orderId]. Ensure `npx prisma generate` has been run and server restarted.';
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

    let updatedOrder;

    if (newStatus === OrderStatus.Shipped) {
      // Fetch order with items and products to check stock
      const orderToShip = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, stock: true },
              },
            },
          },
        },
      });

      if (!orderToShip) {
        return NextResponse.json({ error: 'Order not found to mark as shipped.' }, { status: 404 });
      }
      
      // Optional: Check if current status allows moving to Shipped (e.g., from Processing)
      // if (orderToShip.status !== OrderStatus.Processing) {
      //   return NextResponse.json({ error: `Order cannot be marked as Shipped from current status: ${orderToShip.status}` }, { status: 400 });
      // }

      const productUpdates: Prisma.PrismaPromise<any>[] = [];
      for (const item of orderToShip.orderItems) {
        if (item.product.stock === null || item.product.stock === undefined || item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.product.name}. Available: ${item.product.stock ?? 0}, Required: ${item.quantity}`);
        }
        productUpdates.push(
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        );
      }

      const orderStatusUpdate = prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
          user: { select: { name: true, email: true } },
          orderItems: { include: { product: { select: { id:true, name: true, image: true, stock: true } } } },
        },
      });
      
      // Perform all updates in a transaction
      const transactionResults = await prisma.$transaction([...productUpdates, orderStatusUpdate]);
      updatedOrder = transactionResults[transactionResults.length -1]; // The last result is the updated order

    } else {
      // For other status updates, just update the order status
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
          user: { select: { name: true, email: true } },
          orderItems: { include: { product: { select: { id: true, name: true, image: true, stock: true } } } },
        },
      });
    }

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    console.error(`API PUT /api/admin/orders/${orderId}: Error during status update. Raw error object:`);
    try {
      const errorDetailsToLog = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code, 
        meta: error.meta, 
      };
      console.error(JSON.stringify(errorDetailsToLog, null, 2));
    } catch (stringifyError) {
      console.error("Could not stringify the raw error object. Fallback to default logging:", error);
    }

    let errorMessage = 'An unexpected error occurred while updating order status.';
    let statusCode = 500;

    if (error && typeof error === 'object') {
      if (error.code === 'P2025') { 
        errorMessage = 'Order or related product not found during update.';
        statusCode = 404;
      } else if (error.message?.includes("Insufficient stock")) {
        errorMessage = error.message;
        statusCode = 400; // Bad request due to business logic failure
      }
      else if (error.message) { 
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
