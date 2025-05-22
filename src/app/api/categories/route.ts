
// src/app/api/categories/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Function to generate a URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
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
  try {
    const body = await request.json();
    const validation = categoryCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name } = validation.data;
    const slug = generateSlug(name);

    // Check if category with the same name or slug already exists
    const existingCategoryByName = await prisma.category.findUnique({ where: { name } });
    if (existingCategoryByName) {
      return NextResponse.json({ error: `Category with name "${name}" already exists.` }, { status: 409 });
    }
    const existingCategoryBySlug = await prisma.category.findUnique({ where: { slug } });
    if (existingCategoryBySlug) {
        // This case is less likely if slug is derived from a unique name, but good to have
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
