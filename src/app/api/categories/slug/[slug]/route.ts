
// src/app/api/categories/slug/[slug]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Category slug is required and must be a string.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error(`API GET /api/categories/slug/${params.slug} Error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to fetch category by slug', details: errorMessage }, { status: 500 });
  }
}
