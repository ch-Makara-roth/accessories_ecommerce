
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client
import clientPromise from '@/lib/mongodb'; // Keep for GET for now, or migrate GET too
import type { Product } from '@/types';
import { ObjectId } from 'mongodb';


// Configuration for direct MongoDB client (used by GET)
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'accessorice-app';
const COLLECTION_NAME = 'accessorice-app';

export async function GET(request: NextRequest) {
  try {
    if (!DATABASE_NAME) {
      console.error(`API GET /api/products Error: Database name is not configured. MONGODB_DB_NAME env variable is missing or fallback invalid. Current fallback: ${DATABASE_NAME}`);
      return NextResponse.json({ error: 'Database configuration error', details: 'Database name not found.' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const productsCollection = db.collection<Omit<Product, 'id'>>(COLLECTION_NAME);

    const productsFromDB = await productsCollection.find({}).sort({ name: 1 }).toArray();

    const sanitizedProducts: Product[] = productsFromDB.map(productDoc => {
      const idStr = productDoc._id ? productDoc._id.toString() : new ObjectId().toString();
      return {
        id: idStr,
        _id: productDoc._id || new ObjectId(idStr), // Ensure _id is present
        name: productDoc.name || 'Unknown Product',
        price: typeof productDoc.price === 'number' ? productDoc.price : 0,
        originalPrice: typeof productDoc.originalPrice === 'number' ? productDoc.originalPrice : undefined,
        rating: typeof productDoc.rating === 'number' ? productDoc.rating : 0,
        reviewCount: typeof productDoc.reviewCount === 'number' ? productDoc.reviewCount : 0,
        description: productDoc.description || '',
        image: productDoc.image || 'https://placehold.co/600x400.png',
        category: productDoc.category || 'uncategorized',
        type: productDoc.type || '',
        color: productDoc.color || '',
        material: productDoc.material || '',
        offer: productDoc.offer || '',
        tags: Array.isArray(productDoc.tags) ? productDoc.tags : [],
        dataAiHint: productDoc.dataAiHint || `${productDoc.category || 'product'} ${productDoc.name || 'item'}`.substring(0,50).toLowerCase(),
        stock: typeof productDoc.stock === 'number' ? productDoc.stock : 0,
        status: productDoc.status || 'Draft',
        // Ensure createdAt and updatedAt are handled if needed by Product type, 
        // or add them to the DB documents if they are not already there.
        // For now, they are not explicitly part of the Product type used here.
      };
    });

    return NextResponse.json({ products: sanitizedProducts }, { status: 200 });

  } catch (e: any) {
    console.error('API GET /api/products Error:', e);
    let errorMessage = 'An unexpected error occurred while fetching products.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    // Check if it's a MongoDB specific error and add more details if so
    if (e.name === 'MongoServerSelectionError' || e.name === 'MongoNetworkError') {
        errorMessage = `MongoDB Connection Error: ${e.message}. Please verify MONGODB_URI in .env.local and ensure MongoDB Atlas IP Access List includes your current IP. Also, check server console logs.`;
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    let imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(productFields.name.substring(0,20)) || 'No+Image'}`;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile) {
      console.log(`SIMULATING UPLOAD: Received image file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}`);
      imageUrl = `https://placehold.co/600x400.png?text=Uploaded+${encodeURIComponent(imageFile.name.substring(0,20))}`;
    } else {
        console.log("No image file provided for product:", productFields.name);
    }
    
    const dataToCreate: any = {
      name: String(productFields.name),
      price: parseFloat(String(productFields.price)) || 0,
      description: String(productFields.description),
      image: imageUrl,
      category: String(productFields.category).toLowerCase(),
      originalPrice: productFields.originalPrice ? parseFloat(String(productFields.originalPrice)) : null, // Use null for optional Prisma Float
      stock: productFields.stock ? parseInt(String(productFields.stock), 10) : 0,
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : null,
      color: productFields.color ? String(productFields.color) : null,
      material: productFields.material ? String(productFields.material) : null,
      offer: productFields.offer ? String(productFields.offer) : null,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      // Prisma defaults will handle rating, reviewCount, createdAt, updatedAt
      dataAiHint: `${productFields.category || 'product'} ${productFields.name || 'item'}`.substring(0, 50).toLowerCase(),
    };

    // Validate price and stock are numbers
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

    if (e.code === 'P2002' && e.meta?.target) { // Prisma unique constraint violation
      errorMessage = `A product with this ${e.meta.target.join(', ')} already exists.`;
      errorDetails = `The field(s) '${e.meta.target.join(', ')}' must be unique.`;
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }
    
    // Check if the error is due to MongoDB connection/configuration issues
    if (e.message?.includes('MongoServerSelectionError') || e.message?.includes('ECONNREFUSED') || e.message?.includes('ENOTFOUND')) {
        errorMessage = "MongoDB Connection Error during product creation. Please verify MONGODB_URI / DATABASE_URL in .env.local and ensure MongoDB Atlas IP Access List includes your current IP. Also, check server console logs.";
        errorDetails = e.message; // Keep original MongoDB error message for details
    }


    return NextResponse.json({ error: 'Failed to add product', details: errorDetails, message: errorMessage }, { status: 500 });
  }
}
