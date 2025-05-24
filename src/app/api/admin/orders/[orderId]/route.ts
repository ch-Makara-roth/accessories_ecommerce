
// src/app/api/admin/orders/[orderId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role, OrderStatus as PrismaOrderStatusEnum } from '@prisma/client';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const orderStatusValues = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession(authOptions);
  const { orderId } = params;

  // Updated: Allow DELIVERY role to also update status
  if (!session || !session.user || ![Role.ADMIN, Role.SELLER, Role.DELIVERY].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin, Seller, or Delivery access required.' }, { status: 403 });
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

    // Role-specific status update restrictions
    const userRole = session.user.role as Role;
    if (userRole === Role.SELLER && !['Processing', 'Shipped'].includes(newStatus)) {
        return NextResponse.json({ error: 'Sellers can only update status to Processing or Shipped.' }, { status: 403 });
    }
    if (userRole === Role.DELIVERY && newStatus !== 'Delivered') {
        return NextResponse.json({ error: 'Delivery personnel can only update status to Delivered.' }, { status: 403 });
    }
    // Admins can update to any status handled by the schema.

    let updatedOrder;

    if (newStatus === "Shipped") {
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
      
      if (orderToShip.status !== PrismaOrderStatusEnum.Processing) {
        return NextResponse.json({ error: `Order cannot be marked as Shipped from current status: ${orderToShip.status}. Must be 'Processing'.` }, { status: 400 });
      }

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

      const orderStatusUpdateOperation = prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus as PrismaOrderStatusEnum },
        include: {
          user: { select: { name: true, email: true } },
          orderItems: { include: { product: { select: { id:true, name: true, image: true, stock: true } } } },
        },
      });
      
      const transactionResults = await prisma.$transaction([...productUpdates, orderStatusUpdateOperation]);
      updatedOrder = transactionResults[transactionResults.length -1]; 

    } else {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus as PrismaOrderStatusEnum },
        include: {
          user: { select: { name: true, email: true } },
          orderItems: { include: { product: { select: { id: true, name: true, image: true, stock: true } } } },
        },
      });
    }

    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred while updating order status.';
    let statusCode = 500;

    console.error(`API PUT /api/admin/orders/${orderId}: Error during status update. Raw error object:`);
    let errorDetailsToLog: any = { message: error.message };
    if (error.stack) errorDetailsToLog.stack = error.stack;
    if (error.name) errorDetailsToLog.name = error.name;
    if (error.code) errorDetailsToLog.code = error.code; 
    if (error.meta) errorDetailsToLog.meta = error.meta; 

    try {
        console.error(JSON.stringify(errorDetailsToLog, null, 2));
    } catch (stringifyError) {
        console.error("Could not stringify the raw error object. Fallback to default logging:", error);
    }
    
    if (error && typeof error === 'object') {
      if ((error as any).code === 'P2025') { 
        errorMessage = 'Order or related product not found during update.';
        statusCode = 404;
      } else if ((error as any).message?.includes("Insufficient stock")) {
        errorMessage = (error as any).message;
        statusCode = 400; 
      } else if ((error as any).message) { 
        errorMessage = (error as any).message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error(`API PUT /api/admin/orders/${orderId}: Processed error message for client: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to update order status', details: errorMessage }, { status: statusCode });
  }
}
