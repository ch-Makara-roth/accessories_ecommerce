
// src/app/api/categories/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Placeholder for slug generation if needed for updates
function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') 
      .replace(/[^\w-]+/g, '') 
      .replace(/--+/g, '-') 
      .replace(/^-+/, '') 
      .replace(/-+$/, ''); 
  }

const categoryUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required.' }).max(100).optional(),
  // slug: z.string().min(1).optional(), // Slug might be auto-generated from name
});


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Category ID is required and must be a string.' }, { status: 400 });
      }
  
      const category = await prisma.category.findUnique({
        where: { id },
      });
  
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
  
      return NextResponse.json(category, { status: 200 });
    } catch (error) {
      console.error(`API GET /api/categories/${params.id} Error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return NextResponse.json({ error: 'Failed to fetch category', details: errorMessage }, { status: 500 });
    }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = categoryUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { name } = validation.data;
    let slug;
    if (name) {
        slug = generateSlug(name);
    }

    const updateData: {name?: string; slug?: string} = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No fields to update provided.' }, { status: 400 });
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: any) {
    console.error(`API PUT /api/categories/${params.id} Error:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ error: 'Category not found for update.' }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return NextResponse.json({ error: `Category with name "${error.meta?.values?.[0] || 'provided'}" already exists.` }, { status: 409 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
        return NextResponse.json({ error: `Category with slug "${error.meta?.values?.[0] || 'provided'}" already exists.` }, { status: 409 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to update category', details: errorMessage }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    // Optional: Check if any products are associated with this category
    // For now, onDelete: SetNull in Product model handles this by nullifying product.categoryId

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error(`API DELETE /api/categories/${params.id} Error:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
        return NextResponse.json({ error: 'Category not found for deletion.' }, { status: 404 });
    }
    // Add other specific error handling if needed, e.g., P2003 for foreign key constraint violation if products aren't handled by SetNull
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to delete category', details: errorMessage }, { status: 500 });
  }
}
