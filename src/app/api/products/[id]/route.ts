
// src/app/api/products/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// GET a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ error: 'Valid Product ID is required.' }, { status: 400 });
  }

  if (!prisma || !prisma.product || typeof prisma.product.findUnique !== 'function') {
    console.error('API GET /api/products/[id]: Prisma client or product model is not available.');
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue. Check server logs.' }, { status: 500 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    // Map Prisma _id to id for consistency if needed, though Prisma usually handles this
    const sanitizedProduct = {
        ...product,
        id: product.id, // Prisma client often returns id as string
        _id: product.id, // For explicit MongoDB _id if ever needed
        price: Number(product.price), // Ensure price is number
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        stock: product.stock ?? 0,
        rating: product.rating ?? 0,
        reviewCount: product.reviewCount ?? 0,
        tags: product.tags ?? [],
        status: product.status ?? 'Draft',
        dataAiHint: product.dataAiHint || `${product.category?.name || 'product'} ${product.name || 'item'}`.substring(0,50).toLowerCase(),
    };

    return NextResponse.json(sanitizedProduct, { status: 200 });
  } catch (e: any) {
    console.error(`API GET /api/products/${id} Error:`, e);
    let errorMessage = 'Failed to fetch product.';
    if (e.code === 'P2023' && e.message?.includes('Malformed ObjectID')) {
      errorMessage = `Invalid Product ID format: ${id}.`;
      return NextResponse.json({ error: errorMessage, details: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage, details: e.message || String(e) }, { status: 500 });
  }
}

// UPDATE a product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ error: 'Valid Product ID is required for update.' }, { status: 400 });
  }

  if (!prisma || !prisma.product || typeof prisma.product.update !== 'function') {
    console.error('API PUT /api/products/[id]: Prisma client or product model is not available for update.');
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue for update. Check server logs.' }, { status: 500 });
  }
  
  try {
    const formData = await request.formData();
    const productFields: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (key !== 'imageFile') {
        productFields[key] = value;
      }
    });
    
    if (!productFields.name || !productFields.price || !productFields.description) {
      return NextResponse.json({ error: 'Missing required product fields (name, price, description) for update' }, { status: 400 });
    }

    const imageFile = formData.get('imageFile') as File | null;
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      console.log(`API PUT /api/products/${id}: SIMULATING UPLOAD - Received image file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}. Using placeholder URL.`);
      imageUrl = `https://placehold.co/600x400.png?text=Updated+${encodeURIComponent(imageFile.name.substring(0,15))}`;
    }

    const parsedPrice = parseFloat(String(productFields.price));
    const parsedOriginalPrice = productFields.originalPrice ? parseFloat(String(productFields.originalPrice)) : undefined;
    const parsedStock = productFields.stock ? parseInt(String(productFields.stock), 10) : undefined;

    if (isNaN(parsedPrice)) {
      return NextResponse.json({ error: 'Price must be a valid number for update.' }, { status: 400 });
    }
    
    const dataToUpdate: Prisma.ProductUpdateInput = {
      name: String(productFields.name),
      price: parsedPrice,
      description: String(productFields.description),
      ...(imageUrl && { image: imageUrl }), // Only update image if a new one is provided
      originalPrice: parsedOriginalPrice,
      stock: parsedStock,
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : undefined,
      color: productFields.color ? String(productFields.color) : undefined,
      material: productFields.material ? String(productFields.material) : undefined,
      offer: productFields.offer ? String(productFields.offer) : undefined,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };

    let categoryNameForHint = productFields.name || 'item'; 
    if (productFields.category && String(productFields.category).trim() !== '') {
        const categoryId = String(productFields.category);
        if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
            console.warn(`API PUT /api/products/${id}: Provided category ID "${categoryId}" is not a valid ObjectId format. Category will not be updated.`);
        } else {
            const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
            if (categoryExists) {
                dataToUpdate.category = { connect: { id: categoryId } };
                categoryNameForHint = categoryExists.name;
            } else {
                console.warn(`API PUT /api/products/${id}: Category with ID "${categoryId}" not found. Category will not be updated.`);
                // To disconnect a category if an invalid ID is sent, or if you want to allow unsetting category:
                // dataToUpdate.category = { disconnect: true }; 
                // dataToUpdate.categoryId = null; // Explicitly set foreign key to null
            }
        }
    } else if (productFields.category === '') { // Handle explicitly unsetting the category
        dataToUpdate.category = { disconnect: true };
        dataToUpdate.categoryId = null;
    }


    dataToUpdate.dataAiHint = `${categoryNameForHint} ${dataToUpdate.name || 'item'}`.substring(0,50).toLowerCase();


    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
    
    console.log(`API PUT /api/products/${id}: Product updated successfully:`, updatedProduct.id);
    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct }, { status: 200 });

  } catch (e: any) {
    console.error(`API PUT /api/products/${id} Error:`, e);
    let errorMessage = 'Failed to update product.';
    let errorDetails = e.message || String(e);

    if (e.code === 'P2025') { // Record to update not found
      errorMessage = `Product with ID ${id} not found.`;
      return NextResponse.json({ error: errorMessage, details: e.message }, { status: 404 });
    }
    if (e.code === 'P2023' && e.message?.includes('Malformed ObjectID')) {
      errorMessage = `Invalid Category ID format used during update. Details: ${e.message}`;
    }
    if (e.message && e.message.includes("Expected String or Null, provided Object") && e.message.includes("Argument `category`")) {
        errorMessage = "Prisma schema mismatch for 'category' field during update. Ensure `npx prisma generate` has been run and server restarted.";
    }
    return NextResponse.json({ error: errorMessage, details: errorDetails, message: errorMessage }, { status: 500 });
  }
}


// DELETE a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
   if (!id || typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ error: 'Valid Product ID is required for deletion.' }, { status: 400 });
  }

  if (!prisma || !prisma.product || typeof prisma.product.delete !== 'function') {
    console.error('API DELETE /api/products/[id]: Prisma client or product model is not available for delete.');
    return NextResponse.json({ error: 'Internal Server Error: Prisma setup issue for delete. Check server logs.' }, { status: 500 });
  }

  try {
    await prisma.product.delete({
      where: { id },
    });
    console.log(`API DELETE /api/products/${id}: Product deleted successfully.`);
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (e: any) {
    console.error(`API DELETE /api/products/${id} Error:`, e);
    if (e.code === 'P2025') { // Record to delete not found
      return NextResponse.json({ error: 'Product not found for deletion.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete product', details: e.message || String(e) }, { status: 500 });
  }
}
