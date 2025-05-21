
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Product } from '@/types';
import { ObjectId } from 'mongodb';

const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'AudioEmporiumDB'; // Or your specific DB name

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const productsCollection = db.collection<Product>('products');

    const products = await productsCollection.find({}).sort({ name: 1 }).toArray();

    const sanitizedProducts = products.map(product => {
      const { _id, ...rest } = product;
      // Ensure all fields are present, providing defaults if necessary
      return {
        id: _id ? _id.toString() : new ObjectId().toString(), // Fallback if _id is somehow missing
        name: rest.name || 'Unknown Product',
        price: typeof rest.price === 'number' ? rest.price : 0,
        description: rest.description || '',
        image: rest.image || 'https://placehold.co/600x400.png',
        category: rest.category || 'uncategorized',
        rating: typeof rest.rating === 'number' ? rest.rating : 0,
        reviewCount: typeof rest.reviewCount === 'number' ? rest.reviewCount : 0,
        originalPrice: typeof rest.originalPrice === 'number' ? rest.originalPrice : undefined,
        stock: typeof rest.stock === 'number' ? rest.stock : 0,
        status: rest.status || 'Draft',
        type: rest.type || '',
        color: rest.color || '',
        material: rest.material || '',
        offer: rest.offer || '',
        tags: Array.isArray(rest.tags) ? rest.tags : [],
        dataAiHint: rest.dataAiHint || `${rest.category || 'product'} ${rest.name || 'item'}`.substring(0,50).toLowerCase(),
        ...rest, // Spread remaining fields, but explicitly defined ones take precedence
      } as Product;
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
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const productsCollection = db.collection('products');

    const productData = await request.json();

    if (!productData.name || !productData.price || !productData.category || !productData.image || !productData.description) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const newProduct: Omit<Product, 'id' | '_id' | 'rating' | 'reviewCount'> & { rating?: number; reviewCount?: number } = {
      name: productData.name,
      price: parseFloat(productData.price) || 0,
      description: productData.description,
      image: productData.image,
      category: productData.category.toLowerCase(),
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
      stock: parseInt(productData.stock, 10) || 0,
      status: productData.status || 'Draft',
      type: productData.type,
      color: productData.color,
      material: productData.material,
      offer: productData.offer,
      tags: Array.isArray(productData.tags) ? productData.tags : (productData.tags ? productData.tags.split(',').map((t: string) => t.trim()) : []),
      rating: 0,
      reviewCount: 0,
      dataAiHint: productData.dataAiHint || `${productData.category} ${productData.name}`.substring(0, 50).toLowerCase(),
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
    console.error('API POST /api/products Error:', e);
    let errorMessage = 'An unexpected error occurred while adding the product.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return NextResponse.json({ error: 'Failed to add product', details: errorMessage }, { status: 500 });
  }
}
