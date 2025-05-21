// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/types'; 
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(); 
    const productsCollection = db.collection<Product>('products');
    
    const products = await productsCollection.find({}).sort({ name: 1 }).toArray(); // Sort by name for consistency

    const sanitizedProducts = products.map(product => {
        const { _id, ...rest } = product;
        // Ensure all fields are present, providing defaults if necessary
        return { 
          id: _id.toString(), 
          name: rest.name || 'Unknown Product',
          price: rest.price || 0,
          description: rest.description || '',
          image: rest.image || 'https://placehold.co/600x400.png',
          category: rest.category || 'uncategorized',
          rating: rest.rating || 0,
          reviewCount: rest.reviewCount || 0,
          ...rest 
        } as Product;
      });

    return NextResponse.json({ products: sanitizedProducts }, { status: 200 });

  } catch (e) {
    console.error('API Error fetching products:', e);
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const productsCollection = db.collection('products');
    
    const productData = await request.json();
    
    // Basic validation or transformation could happen here
    // For example, ensuring required fields are present
    if (!productData.name || !productData.price || !productData.category || !productData.image || !productData.description) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    // Ensure price and stock are numbers, provide defaults
    const newProduct: Omit<Product, 'id' | '_id' | 'rating' | 'reviewCount'> & { rating?: number; reviewCount?: number } = {
      name: productData.name,
      price: parseFloat(productData.price) || 0,
      description: productData.description,
      image: productData.image,
      category: productData.category.toLowerCase(), // Standardize category to lowercase
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
      stock: parseInt(productData.stock, 10) || 0,
      status: productData.status || 'Draft',
      type: productData.type,
      color: productData.color,
      material: productData.material,
      offer: productData.offer,
      tags: Array.isArray(productData.tags) ? productData.tags : (productData.tags ? productData.tags.split(',').map((t: string) => t.trim()) : []),
      // rating and reviewCount are typically not set on creation, but managed by a review system
      rating: 0, 
      reviewCount: 0,
      dataAiHint: productData.dataAiHint || `${productData.category} ${productData.name}`.substring(0, 50).toLowerCase(), // Basic AI hint
    };

    const result = await productsCollection.insertOne(newProduct);

    if (!result.insertedId) {
      return NextResponse.json({ error: 'Failed to add product to database' }, { status: 500 });
    }
    
    const insertedProduct = {
      id: result.insertedId.toString(),
      ...newProduct
    } as Product;

    return NextResponse.json({ message: "Product added", product: insertedProduct }, { status: 201 });

  } catch (e) {
    console.error('API Error adding product:', e);
    let errorMessage = 'An unexpected error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json({ error: 'Failed to add product', details: errorMessage }, { status: 500 });
  }
}
