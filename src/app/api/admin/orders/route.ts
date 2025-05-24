
// src/app/api/admin/orders/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Updated: Allow DELIVERY role to fetch orders as well
  if (!session || !session.user || ![Role.ADMIN, Role.SELLER, Role.DELIVERY].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin, Seller, or Delivery access required.' }, { status: 403 });
  }

  if (!prisma || !prisma.order || typeof prisma.order.findMany !== 'function') {
    const errorMsg = 'CRITICAL - Prisma `order` model or `findMany` method is not accessible in GET /api/admin/orders. Ensure `npx prisma generate` has been run and server restarted.';
    console.error(`API GET /api/admin/orders: ${errorMsg}`);
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue.', details: errorMsg }, { status: 500 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('API GET /api/admin/orders: Error fetching orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to fetch orders for admin/seller/delivery', details: errorMessage }, { status: 500 });
  }
}
