
// src/app/api/admin/users/[userId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  const { userId } = params;

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  // Prevent admin from changing their own role via this specific endpoint
  if (session.user.id === userId) {
    return NextResponse.json({ error: 'Admins cannot change their own role through this interface.' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = updateUserRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid role provided.', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { role: newRole } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { // Select only non-sensitive fields to return
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error: any) {
    console.error(`API PUT /api/admin/users/${userId}: Error updating user role:`, error);
    if (error.code === 'P2025') { // Record to update not found
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to update user role', details: errorMessage }, { status: 500 });
  }
}
