
// src/app/api/categories/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client';

// Function to generate a URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, ''); 
}

const categoryCreateSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required.' }).max(100),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('API GET /api/categories Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to fetch categories', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.SELLER, Role.STOCK].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin, Seller or Stock role required to create categories.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = categoryCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name } = validation.data;
    const slug = generateSlug(name);

    const existingCategoryByName = await prisma.category.findUnique({ where: { name } });
    if (existingCategoryByName) {
      return NextResponse.json({ error: `Category with name "${name}" already exists.` }, { status: 409 });
    }
    const existingCategoryBySlug = await prisma.category.findUnique({ where: { slug } });
    if (existingCategoryBySlug) {
      return NextResponse.json({ error: `Category with slug "${slug}" already exists (derived from name). Please choose a different name.` }, { status: 409 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('API POST /api/categories Error:', error);
    let errorMessage = 'An unexpected error occurred while creating the category.';
    if (error instanceof Error && (error as any).code === 'P2002' && (error as any).meta?.target?.includes('name')) {
        errorMessage = `A category with the name "${(error as any).meta?.values?.[0] || 'provided'}" already exists.`;
        return NextResponse.json({ error: errorMessage }, { status: 409 });
    }
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to create category', details: errorMessage }, { status: 500 });
  }
}
