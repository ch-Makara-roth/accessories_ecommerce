
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client
import type { Product } from '@/types'; // Ensure your types are correctly defined
import { ObjectId } from 'mongodb'; // Keep for GET for now if it uses it

// Configuration for direct MongoDB client (used by GET)
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'accessorice-app';
const COLLECTION_NAME = 'accessorice-app'; // Explicitly using the collection name from your image

export async function GET(request: NextRequest) {
  try {
    if (!DATABASE_NAME) {
      console.error(`API GET /api/products Error: Database name is not configured. MONGODB_DB_NAME env variable is missing or fallback invalid. Current fallback: ${DATABASE_NAME}`);
      return NextResponse.json({ error: 'Database configuration error', details: 'Database name not found.' }, { status: 500 });
    }

    // Using Prisma for GET as well for consistency
    const productsFromDB = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true }, // Include category data if needed
    });

    const sanitizedProducts: Product[] = productsFromDB.map(productDoc => ({
      id: productDoc.id, // Prisma uses 'id' by default which is string for MongoDB ObjectId
      _id: productDoc.id, // For compatibility if any part still expects _id as string
      name: productDoc.name || 'Unknown Product',
      price: typeof productDoc.price === 'number' ? productDoc.price : 0,
      originalPrice: typeof productDoc.originalPrice === 'number' ? productDoc.originalPrice : (productDoc.originalPrice === null ? undefined : 0),
      rating: typeof productDoc.rating === 'number' ? productDoc.rating : 0,
      reviewCount: typeof productDoc.reviewCount === 'number' ? productDoc.reviewCount : (productDoc.reviewCount === null ? 0 : 0),
      description: productDoc.description || '',
      image: productDoc.image || 'https://placehold.co/600x400.png',
      category: productDoc.category, // Prisma will return the related category object
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
    console.error('API GET /api/products Error:', e);
    let errorMessage = 'An unexpected error occurred while fetching products.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    if (e.name === 'MongoServerSelectionError' || e.name === 'MongoNetworkError' || e.message?.includes('ECONNREFUSED')) {
        errorMessage = `MongoDB Connection Error: ${e.message}. Please verify MONGODB_URI and DATABASE_URL in .env.local. Ensure MongoDB Atlas IP Access List includes your current IP and the server is restarted. Also, check server console logs.`;
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to /api/products');

    // Detailed Prisma client logging
    if (!prisma) {
      console.error('CRITICAL: Prisma client (imported as `prisma`) is undefined in POST /api/products!');
      return NextResponse.json({ error: 'Internal Server Error: Prisma client is not initialized. Check server logs, .env.local for DATABASE_URL, and ensure server was restarted.' }, { status: 500 });
    }
    if (!prisma.product) {
        console.error('CRITICAL: prisma.product is undefined. Prisma client might be initialized but models are not accessible. Ensure `npx prisma generate` has been run successfully after any schema changes and the server was restarted.');
        return NextResponse.json({ error: 'Internal Server Error: Prisma product model is not accessible. Ensure `npx prisma generate` has been run and server restarted.' }, { status: 500 });
    }
    console.log('Prisma client and prisma.product seem available.');

    const formData = await request.formData();
    const productFields: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      if (key !== 'imageFile') { // Exclude the file itself from productFields for direct DB storage
        productFields[key] = value;
      }
    });

    if (!productFields.name || !productFields.price || !productFields.category || !productFields.description) {
      return NextResponse.json({ error: 'Missing required product fields (name, price, category, description)' }, { status: 400 });
    }
    
    let imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(String(productFields.name).substring(0,20)) || 'No+Image'}`;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile) {
      // SIMULATE UPLOAD: In a real app, upload to cloud storage (S3, Firebase Storage, etc.) and get URL
      console.log(`SIMULATING UPLOAD: Received image file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}. Using placeholder URL.`);
      // Using a placeholder that incorporates the filename for better visual feedback
      imageUrl = `https://placehold.co/600x400.png?text=Uploaded+${encodeURIComponent(imageFile.name.substring(0,15))}`;
    } else {
        console.log("No image file provided for product:", productFields.name);
    }
    
    const dataToCreate: any = {
      name: String(productFields.name),
      price: parseFloat(String(productFields.price)) || 0,
      description: String(productFields.description),
      image: imageUrl, // Storing the (placeholder) URL
      // category field for Prisma should be a connect operation if category is a relation
      // For now, assuming 'category' from form is category name for simplicity in this version
      // categoryId: productFields.category, // This should be an ID if linking to an existing Category
      originalPrice: productFields.originalPrice ? parseFloat(String(productFields.originalPrice)) : null,
      stock: productFields.stock ? parseInt(String(productFields.stock), 10) : 0,
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : null,
      color: productFields.color ? String(productFields.color) : null,
      material: productFields.material ? String(productFields.material) : null,
      offer: productFields.offer ? String(productFields.offer) : null,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      dataAiHint: `${productFields.category || 'product'} ${productFields.name || 'item'}`.substring(0, 50).toLowerCase(),
    };

     // If you have a categoryId from the form and want to connect to an existing category:
    if (productFields.category) { // Assuming productFields.category contains the ID of the category
      const categoryId = String(productFields.category);
      // Optional: verify categoryId exists before attempting to connect
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (categoryExists) {
        dataToCreate.category = { connect: { id: categoryId } };
      } else {
        console.warn(`Category with ID "${categoryId}" not found. Product will be created without category linkage.`);
        // Decide if you want to prevent product creation or create it without category
        // For now, it will create without linkage if category not found
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

    