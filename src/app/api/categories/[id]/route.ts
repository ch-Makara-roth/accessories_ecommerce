
// src/app/api/categories/[id]/route.ts
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

const categoryUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required.' }).max(100),
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.SELLER, Role.STOCK].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin, Seller or Stock role required to update categories.' }, { status: 403 });
  }

  let validatedNameFromRequest: string | undefined;
  let generatedSlugFromRequest: string | undefined;

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = categoryUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input for category name.', 
        details: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }
    
    validatedNameFromRequest = validation.data.name; 
    generatedSlugFromRequest = generateSlug(validatedNameFromRequest);

    if (!generatedSlugFromRequest && validatedNameFromRequest) { 
        return NextResponse.json({ error: 'Category name must result in a valid slug (e.g., contain alphanumeric characters).' }, { status: 400 });
    }

    const conflictingCategoryByName = await prisma.category.findFirst({
        where: {
            name: validatedNameFromRequest,
            id: { not: id } 
        }
    });
    if (conflictingCategoryByName) {
        return NextResponse.json({ error: `A category with the name "${validatedNameFromRequest}" already exists.` }, { status: 409 });
    }

    const conflictingCategoryBySlug = await prisma.category.findFirst({
        where: {
            slug: generatedSlugFromRequest,
            id: { not: id }
        }
    });
    if (conflictingCategoryBySlug) {
        return NextResponse.json({ error: `A category with a similar name (resulting in slug "${generatedSlugFromRequest}") already exists. Please choose a different name.` }, { status: 409 });
    }
    
    const updateData = {
      name: validatedNameFromRequest,
      slug: generatedSlugFromRequest,
    };
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCategory, { status: 200 });

  } catch (error: any) {
    console.error(`API PUT /api/categories/${params.id} Error:`, error);
    let errorMessage = 'Failed to update category.';
    let status = 500;

    if (error.code === 'P2025') { 
        errorMessage = 'Category not found for update.';
        status = 404;
    } else if (error.code === 'P2002') { 
        status = 409;
        const targetFields = error.meta?.target as string[] | string | undefined;

        if (targetFields && (typeof targetFields === 'string' ? targetFields.includes('name') : targetFields.includes('name'))) {
            errorMessage = `A category with the name "${validatedNameFromRequest || 'the provided name'}" already exists (database constraint).`;
        } else if (targetFields && (typeof targetFields === 'string' ? targetFields.includes('slug') : targetFields.includes('slug'))) {
            errorMessage = `A category with a similar name (slug: "${generatedSlugFromRequest || 'derived slug'}") already exists (database constraint).`;
        } else {
            errorMessage = 'A category with this name or a similar name already exists (unique constraint violated).';
        }
    } else if (error instanceof z.ZodError) { 
        errorMessage = 'Invalid input: ' + error.errors.map(e => e.message).join(', ');
        status = 400;
    } else if (error instanceof Error) { 
        errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage, details: error.message || String(error) }, { status });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.STOCK].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin or Stock role required to delete categories.' }, { status: 403 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`API DELETE /api/categories/${params.id} Error:`, error);
    if (error.code === 'P2025') { 
        return NextResponse.json({ error: 'Category not found for deletion.' }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to delete category', details: errorMessage }, { status: 500 });
  }
}
