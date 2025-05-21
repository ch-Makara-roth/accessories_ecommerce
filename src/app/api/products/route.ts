
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/types';
import { ObjectId } from 'mongodb';

// It's good practice for MONGODB_URI to include the database name.
// This MONGODB_DB_NAME is a fallback or override if needed.
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'accessorice-app'; // Updated fallback
const COLLECTION_NAME = 'accessorice-app'; // Updated collection name based on user image

export async function GET(request: NextRequest) {
  try {
    if (!DATABASE_NAME) {
      console.error(`API GET /api/products Error: Database name is not configured. MONGODB_DB_NAME env variable is missing and fallback was not set or was invalid. Current fallback: ${DATABASE_NAME}`);
      return NextResponse.json({ error: 'Database configuration error', details: 'Database name not found.' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const productsCollection = db.collection<Product>(COLLECTION_NAME);

    const productsFromDB = await productsCollection.find({}).sort({ name: 1 }).toArray();

    const sanitizedProducts = productsFromDB.map(product => {
      // Ensures that _id is an ObjectId if it's coming from DB as string, or vice-versa for new ObjectId()
      // However, product._id from MongoDB find() will be an ObjectId.
      const idStr = product._id ? product._id.toString() : new ObjectId().toString();
      
      // Provide defaults for all fields in the Product type
      return {
        id: idStr,
        _id: product._id || new ObjectId(idStr), // Ensure _id is ObjectId if it was generated as string
        name: product.name || 'Unknown Product',
        price: typeof product.price === 'number' ? product.price : 0,
        originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
        rating: typeof product.rating === 'number' ? product.rating : 0,
        reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : 0,
        description: product.description || '',
        image: product.image || 'https://placehold.co/600x400.png',
        category: product.category || 'uncategorized',
        type: product.type || '',
        color: product.color || '',
        material: product.material || '',
        offer: product.offer || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        dataAiHint: product.dataAiHint || `${product.category || 'product'} ${product.name || 'item'}`.substring(0,50).toLowerCase(),
        stock: typeof product.stock === 'number' ? product.stock : 0,
        status: product.status || 'Draft',
      } as Product; // Assert as Product type after ensuring all fields
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

    const productData = await request.json();

    if (!productData.name || typeof productData.price !== 'number' || !productData.category || !productData.image || !productData.description) {
      return NextResponse.json({ error: 'Missing required product fields (name, price, category, image, description) or incorrect type for price' }, { status: 400 });
    }

    // Ensure all fields are present and typed correctly before insertion
    const newProductDocument = {
      name: productData.name,
      price: parseFloat(productData.price) || 0,
      description: productData.description,
      image: productData.image,
      category: productData.category.toLowerCase(),
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
      stock: parseInt(productData.stock, 10) || 0,
      status: productData.status || 'Draft',
      type: productData.type || '',
      color: productData.color || '',
      material: productData.material || '',
      offer: productData.offer || '',
      tags: Array.isArray(productData.tags) ? productData.tags : (productData.tags && typeof productData.tags === 'string' ? productData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      rating: productData.rating !== undefined ? Number(productData.rating) : 0,
      reviewCount: productData.reviewCount !== undefined ? Number(productData.reviewCount) : 0,
      dataAiHint: productData.dataAiHint || `${productData.category || 'product'} ${productData.name || 'item'}`.substring(0, 50).toLowerCase(),
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
       // Explicitly cast to ensure all fields of Product are covered by newProductDocument structure
      name: newProductDocument.name,
      price: newProductDocument.price,
      description: newProductDocument.description,
      image: newProductDocument.image,
      category: newProductDocument.category,
      rating: newProductDocument.rating, // already defaulted
      reviewCount: newProductDocument.reviewCount, // already defaulted
    };

    return NextResponse.json({ message: "Product added", product: insertedProduct }, { status: 201 });

  } catch (e) {
    console.error('API POST /api/products Error:', e);
    let errorMessage = 'An unexpected error occurred while adding the product.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    // It's good to see the actual error in logs if it's a MongoError or similar
    console.error("Full error object (POST /api/products):", JSON.stringify(e, null, 2));
    return NextResponse.json({ error: 'Failed to add product', details: errorMessage }, { status: 500 });
  }
}
