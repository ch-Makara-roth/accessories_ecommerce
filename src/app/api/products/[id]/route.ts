
// src/app/api/products/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

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
    const sanitizedProduct = {
        ...product,
        id: product.id, 
        _id: product.id,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        stock: product.stock ?? 0,
        rating: product.rating ?? 0,
        reviewCount: product.reviewCount ?? 0,
        tags: product.tags ?? [],
        status: product.status ?? 'Draft',
        image: product.image || '/placehold.co/600x400.png', // Default if no image
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

    let imageUrl: string | undefined = undefined;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile) {
        // --- DEVELOPMENT ONLY: Local File Storage ---
        console.warn(`API PUT /api/products/${id}: USING LOCAL FILE STORAGE FOR IMAGE UPDATE. THIS IS FOR DEVELOPMENT ONLY.`);
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        await fs.mkdir(uploadsDir, { recursive: true });

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(imageFile.name) || '.jpg';
        const uniqueFilename = `${path.basename(imageFile.name, fileExtension)}-${uniqueSuffix}${fileExtension}`;
        const filePath = path.join(uploadsDir, uniqueFilename);
        
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(filePath, fileBuffer);

        imageUrl = `/uploads/products/${uniqueFilename}`;
        console.log(`API PUT /api/products/${id}: New image saved to ${filePath}. Public URL: ${imageUrl}`);
        // TODO: Optionally delete old image file if replacing
        // --- END DEVELOPMENT ONLY ---
    }


    const parsedPrice = parseFloat(String(productFields.price));
    if (isNaN(parsedPrice)) {
      return NextResponse.json({ error: 'Price must be a valid number for update.' }, { status: 400 });
    }

    let parsedOriginalPrice: number | null = null;
    if (productFields.originalPrice !== undefined) {
      if (String(productFields.originalPrice).trim() === '') {
        parsedOriginalPrice = null;
      } else {
        parsedOriginalPrice = parseFloat(String(productFields.originalPrice));
        if (isNaN(parsedOriginalPrice)) {
          return NextResponse.json({ error: 'Original Price must be a valid number or empty.' }, { status: 400 });
        }
      }
    }
    
    let parsedStock: number | null = null;
     if (productFields.stock !== undefined) {
      if (String(productFields.stock).trim() === '') {
        parsedStock = null;
      } else {
        parsedStock = parseInt(String(productFields.stock), 10);
        if (isNaN(parsedStock)) {
          return NextResponse.json({ error: 'Stock Quantity must be a valid integer or empty.' }, { status: 400 });
        }
      }
    }
    
    const dataToUpdate: Prisma.ProductUpdateInput = {
      name: String(productFields.name),
      price: parsedPrice,
      description: String(productFields.description),
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : undefined,
      color: productFields.color ? String(productFields.color) : undefined,
      material: productFields.material ? String(productFields.material) : undefined,
      offer: productFields.offer ? String(productFields.offer) : undefined,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };

    if (imageUrl !== undefined) {
      dataToUpdate.image = imageUrl;
    }
    if (productFields.originalPrice !== undefined) {
      dataToUpdate.originalPrice = parsedOriginalPrice;
    }
    if (productFields.stock !== undefined) {
      dataToUpdate.stock = parsedStock;
    }


    let categoryNameForHint = productFields.name || 'item'; 
    const categoryId = productFields.category ? String(productFields.category) : null;

    if (categoryId && categoryId.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (categoryExists) {
        dataToUpdate.category = { connect: { id: categoryId } };
        categoryNameForHint = categoryExists.name;
      } else {
        console.warn(`API PUT /api/products/${id}: Category with ID "${categoryId}" not found. Category link will not be updated.`);
        dataToUpdate.category = { disconnect: true }; // Or set categoryId to null
        dataToUpdate.categoryId = null;
      }
    } else if (categoryId === '' || categoryId === null) { // Explicitly unsetting category
        dataToUpdate.category = { disconnect: true };
        dataToUpdate.categoryId = null;
    } else if (categoryId) {
        console.warn(`API PUT /api/products/${id}: Provided category ID "${categoryId}" is not valid. Category link will not be updated.`);
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

    if (e.code === 'P2025') { 
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
    // Optionally, retrieve product to get image path for deletion
    // const product = await prisma.product.findUnique({ where: { id } });

    await prisma.product.delete({
      where: { id },
    });

    // TODO: If product.image pointed to a locally stored file in public/uploads, delete it here.
    // For example: if (product?.image?.startsWith('/uploads/')) {
    //   await fs.unlink(path.join(process.cwd(), 'public', product.image));
    // }

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


    