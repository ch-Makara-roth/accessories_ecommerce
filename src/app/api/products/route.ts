
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/types';
import { ObjectId } from 'mongodb';

// It's good practice for MONGODB_URI to include the database name.
// This MONGODB_DB_NAME is a fallback or override if needed.
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'accessorice-app';
const COLLECTION_NAME = 'accessorice-app';

export async function GET(request: NextRequest) {
  try {
    if (!DATABASE_NAME) {
      console.error(`API GET /api/products Error: Database name is not configured. MONGODB_DB_NAME env variable is missing and fallback was not set or was invalid. Current fallback: ${DATABASE_NAME}`);
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
        _id: productDoc._id || new ObjectId(idStr),
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
      };
    });

    return NextResponse.json({ products: sanitizedProducts }, { status: 200 });

  } catch (e) {
    console.error('API GET /api/products Error:', e);
    let errorMessage = 'An unexpected error occurred while fetching products.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!DATABASE_NAME) {
      console.error(`API POST /api/products Error: Database name is not configured. MONGODB_DB_NAME env variable is missing and fallback was not set or was invalid. Current fallback: ${DATABASE_NAME}`);
      return NextResponse.json({ error: 'Database configuration error', details: 'Database name not found.' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const productsCollection = db.collection(COLLECTION_NAME);

    const formData = await request.formData();
    const productFields: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      if (key !== 'imageFile') { // Exclude the file itself from direct assignment
        productFields[key] = value;
      }
    });

    if (!productFields.name || !productFields.price || !productFields.category || !productFields.description) {
      return NextResponse.json({ error: 'Missing required product fields (name, price, category, description)' }, { status: 400 });
    }
    
    let imageUrl = 'https://placehold.co/600x400.png?text=No+Image'; // Default if no file
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile) {
      // **SIMULATED IMAGE UPLOAD**
      // In a real app, you would upload imageFile to cloud storage (S3, Firebase Storage, Cloudinary)
      // and get back a public URL. For this prototype, we'll use a placeholder.
      console.log(`SIMULATING UPLOAD: Received image file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}`);
      imageUrl = `https://placehold.co/600x400.png?text=Uploaded+${encodeURIComponent(imageFile.name.substring(0,20))}`;
      // **END SIMULATED IMAGE UPLOAD**
    }

    const newProductDocument = {
      name: productFields.name,
      price: parseFloat(productFields.price) || 0,
      description: productFields.description,
      image: imageUrl, // Use the (potentially simulated) image URL
      category: productFields.category.toLowerCase(),
      originalPrice: productFields.originalPrice ? parseFloat(productFields.originalPrice) : undefined,
      stock: parseInt(productFields.stock, 10) || 0,
      status: productFields.status || 'Draft',
      type: productFields.type || '',
      color: productFields.color || '',
      material: productFields.material || '',
      offer: productFields.offer || '',
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      rating: 0, // Default rating
      reviewCount: 0, // Default review count
      dataAiHint: `${productFields.category || 'product'} ${productFields.name || 'item'}`.substring(0, 50).toLowerCase(),
      // _id will be auto-generated by MongoDB
    };

    const result = await productsCollection.insertOne(newProductDocument);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to add product to database' }, { status: 500 });
    }

    const insertedProduct: Product = {
      id: result.insertedId.toString(),
      _id: result.insertedId,
      ...newProductDocument,
      name: newProductDocument.name, // Ensure these are explicitly part of the returned type
      price: newProductDocument.price,
      description: newProductDocument.description,
      image: newProductDocument.image,
      category: newProductDocument.category,
      rating: newProductDocument.rating, 
      reviewCount: newProductDocument.reviewCount,
    };

    return NextResponse.json({ message: "Product added", product: insertedProduct }, { status: 201 });

  } catch (e) {
    console.error('API POST /api/products Error:', e);
    let errorMessage = 'An unexpected error occurred while adding the product.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error("Full error object (POST /api/products):", JSON.stringify(e, null, 2));
    return NextResponse.json({ error: 'Failed to add product', details: errorMessage }, { status: 500 });
  }
}
