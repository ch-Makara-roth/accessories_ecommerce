// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/types'; // Assuming your Product type is here

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your default database or specify one: client.db("yourDbName")

    // You can specify the database name in your MONGODB_URI
    // or here like client.db("yourDatabaseName")

    const productsCollection = db.collection<Product>('products'); // Assuming your collection is named 'products'
    
    // Example: Fetching all products
    const products = await productsCollection.find({}).toArray();

    // Remove _id field before sending response, or transform it to string if needed
    const sanitizedProducts = products.map(product => {
        const { _id, ...rest } = product;
        return { id: _id.toString(), ...rest } as unknown as Product; // Cast if your Product type expects id as string
      });

    return NextResponse.json({ products: sanitizedProducts }, { status: 200 });

  } catch (e) {
    console.error('API Error fetching products:', e);
    // In a real app, you might want to check the type of e
    // and return a more specific error message.
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorMessage }, { status: 500 });
  }
}

// You can also add POST, PUT, DELETE handlers here to manage products
// Example POST handler (very basic, without validation):
/*
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');
    
    const productData = await request.json();
    
    // Basic validation or transformation could happen here
    // For example, ensuring required fields are present

    const result = await productsCollection.insertOne(productData);

    return NextResponse.json({ message: "Product added", productId: result.insertedId }, { status: 201 });

  } catch (e) {
    console.error('API Error adding product:', e);
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json({ error: 'Failed to add product', details: errorMessage }, { status: 500 });
  }
}
*/
