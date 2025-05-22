
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Product } from '@/types'; // Ensure your types are correctly defined

// GET handler remains the same

export async function GET(request: NextRequest) {
  try {
    // Using Prisma for GET as well for consistency
    const productsFromDB = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true }, // Include category data if needed
    });

    const sanitizedProducts: Product[] = productsFromDB.map(productDoc => ({
      id: productDoc.id,
      _id: productDoc.id,
      name: productDoc.name || 'Unknown Product',
      price: typeof productDoc.price === 'number' ? productDoc.price : 0,
      originalPrice: typeof productDoc.originalPrice === 'number' ? productDoc.originalPrice : (productDoc.originalPrice === null ? undefined : 0),
      rating: typeof productDoc.rating === 'number' ? productDoc.rating : 0,
      reviewCount: typeof productDoc.reviewCount === 'number' ? productDoc.reviewCount : (productDoc.reviewCount === null ? 0 : 0),
      description: productDoc.description || '',
      image: productDoc.image || 'https://placehold.co/600x400.png',
      category: productDoc.category,
      type: productDoc.type || '',
      color: productDoc.color || '',
      material: productDoc.material || '',
      offer: productDoc.offer || '',
      tags: Array.isArray(productDoc.tags) ? productDoc.tags : [],
      dataAiHint: productDoc.dataAiHint || `${productDoc.category?.name || 'product'} ${productDoc.name || 'item'}`.substring(0,50).toLowerCase(),
      stock: typeof productDoc.stock === 'number' ? productDoc.stock : (productDoc.stock === null ? 0 : 0),
      status: productDoc.status || 'Draft',
      categoryId: productDoc.categoryId,
    }));

    return NextResponse.json({ products: sanitizedProducts }, { status: 200 });

  } catch (e: any) {
    let errorMessage = 'An unexpected error occurred while fetching products.';
    let errorDetails = e.message;
    console.error('API GET /api/products Error:', e);

    if (e.name === 'MongoServerSelectionError' || e.name === 'MongoNetworkError' || e.message?.includes('ECONNREFUSED') || e.message?.includes('tlsv1 alert internal error')) {
        errorMessage = `MongoDB Connection Error: ${e.message}. Please verify MONGODB_URI and DATABASE_URL in .env.local. Ensure MongoDB Atlas IP Access List includes your current IP and the server is restarted. Also, check server console logs.`;
    } else if (e.message?.includes("Environment variable not found: DATABASE_URL")) {
        errorMessage = "CRITICAL: DATABASE_URL environment variable is not defined. Please set it in .env.local and restart the server.";
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorDetails, message: errorMessage }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    // Enhanced logging for debugging Prisma client state
    if (!prisma) {
      console.error('API POST /api/products: CRITICAL - Prisma client (imported as `prisma`) is undefined!');
      return NextResponse.json({ error: 'Internal Server Error: Prisma client is not initialized. Check server logs, DATABASE_URL in .env.local, and ensure server was restarted.' }, { status: 500 });
    }
    // Check if prisma.product is available
    if (!prisma.product) {
        console.error('API POST /api/products: CRITICAL - prisma.product is undefined. This means the Prisma client is initialized but models are not accessible. Ensure `npx prisma generate` has been run successfully after any schema changes and the server was restarted.');
        return NextResponse.json({ error: 'Internal Server Error: Prisma product model is not accessible. Ensure `npx prisma generate` has been run and server restarted.' }, { status: 500 });
    }
    console.log('API POST /api/products: Prisma client and prisma.product seem available.');


    const formData = await request.formData();
    const productFields: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (key !== 'imageFile') {
        productFields[key] = value;
      }
    });

    if (!productFields.name || !productFields.price || !productFields.category || !productFields.description) {
      return NextResponse.json({ error: 'Missing required product fields (name, price, category, description)' }, { status: 400 });
    }

    let imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(String(productFields.name).substring(0,20)) || 'No+Image'}`;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile) {
      console.log(`API POST /api/products: SIMULATING UPLOAD - Received image file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}. Using placeholder URL.`);
      imageUrl = `https://placehold.co/600x400.png?text=Uploaded+${encodeURIComponent(imageFile.name.substring(0,15))}`;
    } else {
        console.log("API POST /api/products: No image file provided for product:", productFields.name);
    }

    const dataToCreate: any = {
      name: String(productFields.name),
      price: parseFloat(String(productFields.price)) || 0,
      description: String(productFields.description),
      image: imageUrl,
      originalPrice: productFields.originalPrice ? parseFloat(String(productFields.originalPrice)) : null,
      stock: productFields.stock ? parseInt(String(productFields.stock), 10) : 0,
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : null,
      color: productFields.color ? String(productFields.color) : null,
      material: productFields.material ? String(productFields.material) : null,
      offer: productFields.offer ? String(productFields.offer) : null,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      dataAiHint: `${productFields.category || 'product'} ${productFields.name || 'item'}`.substring(0, 50).toLowerCase(),
      rating: 0, // Default rating
      reviewCount: 0, // Default review count
    };

    if (productFields.category) {
      const categoryId = String(productFields.category);
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (categoryExists) {
        dataToCreate.category = { connect: { id: categoryId } };
      } else {
        console.warn(`API POST /api/products: Category with ID "${categoryId}" not found. Product will be created without category linkage.`);
      }
    }

    if (isNaN(dataToCreate.price)) {
      return NextResponse.json({ error: 'Price must be a valid number.' }, { status: 400 });
    }
    if (dataToCreate.originalPrice !== null && isNaN(dataToCreate.originalPrice)) {
      return NextResponse.json({ error: 'Original price must be a valid number if provided.' }, { status: 400 });
    }
    if (isNaN(dataToCreate.stock)) {
      return NextResponse.json({ error: 'Stock quantity must be a valid number.' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: dataToCreate,
    });

    return NextResponse.json({ message: "Product added successfully with Prisma", product: newProduct }, { status: 201 });

  } catch (e: any) {
    console.error('API POST /api/products Error (Prisma):', e);
    let errorMessage = 'An unexpected error occurred while adding the product.';
    let errorDetails = e.message;

    if (e.code === 'P2002' && e.meta?.target) {
      errorMessage = `A product with this ${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target} already exists.`;
      errorDetails = `The field(s) '${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target}' must be unique.`;
    } else if (e.message?.includes("Cannot read properties of undefined (reading 'create')") || (e.message?.includes("TypeError") && e.message?.includes(".create is not a function"))) {
      errorMessage = 'Prisma model access error (cannot call .create). This often means the Prisma client is not fully initialized or `npx prisma generate` needs to be re-run. Check server logs, DATABASE_URL in .env.local, and ensure the server was restarted after any changes.';
      errorDetails = e.stack || e.message;
    } else if (e.message?.includes('ECONNREFUSED') || e.message?.includes('MongoServerSelectionError')) {
        errorMessage = "MongoDB Connection Error during product creation. Please verify MONGODB_URI / DATABASE_URL in .env.local and ensure MongoDB Atlas IP Access List includes your current IP. Also, check server console logs.";
        errorDetails = e.message;
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }

    return NextResponse.json({ error: 'Failed to add product', details: errorDetails, message: errorMessage }, { status: 500 });
  }
}
