
// src/app/api/admin/users/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true, // Include createdAt
        updatedAt: true, // Include updatedAt for completeness
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('API GET /api/admin/users: Error fetching users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to fetch users', details: errorMessage }, { status: 500 });
  }
}

