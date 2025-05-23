
// src/app/api/admin/notifications/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
// Potentially add admin authentication/authorization here in a real app

export async function GET(request: NextRequest) {
  if (!prisma || !prisma.adminNotification || typeof prisma.adminNotification.findMany !== 'function') {
    console.error('API GET /api/admin/notifications: Prisma client or AdminNotification model is not available.');
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  try {
    const notifications = await prisma.adminNotification.findMany({
      where: unreadOnly ? { isRead: false } : {},
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('API GET /api/admin/notifications: Error fetching admin notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to fetch admin notifications', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Placeholder for marking notifications as read - can be expanded
  // For example, to mark a specific notification as read:
  // const { id } = await request.json();
  // await prisma.adminNotification.update({ where: { id }, data: { isRead: true } });
  // Or to mark all as read:
  // await prisma.adminNotification.updateMany({ data: { isRead: true } });
  return NextResponse.json({ message: "PUT request received, implement marking as read logic." }, { status: 200 });
}
