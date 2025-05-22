
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Product } from '@/types';
import type { Prisma } from '@prisma/client';

// GET handler
export async function GET(request: NextRequest) {
  console.log('API GET /api/products: Received request.');
  if (!prisma) {
    console.error('API GET /api/products: CRITICAL - Prisma client (imported as `prisma`) is undefined!');
    return NextResponse.json({ error: 'Internal Server Error: Prisma client is not initialized. Check server logs, DATABASE_URL in .env.local, and ensure server was restarted.' }, { status: 500 });
  }
  if (!prisma.product || typeof prisma.product.findMany !== 'function') {
      console.error('API GET /api/products: CRITICAL - prisma.product or prisma.product.findMany is undefined/not a function. This strongly suggests `npx prisma generate` has not been run successfully or the server needs a restart after schema changes. Check server console logs.');
      return NextResponse.json({ error: 'Internal Server Error: Prisma product model is not accessible. Ensure `npx prisma generate` has been run and server restarted.' }, { status: 500 });
  }
  console.log('API GET /api/products: Prisma client and prisma.product.findMany seem available.');

  try {
    const productsFromDB = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true }, // Include category data
    });

    const sanitizedProducts: Product[] = productsFromDB.map(productDoc => ({
      id: productDoc.id,
      _id: productDoc.id,
      name: productDoc.name || 'Unknown Product',
      price: typeof productDoc.price === 'number' ? productDoc.price : 0,
      originalPrice: typeof productDoc.originalPrice === 'number' ? productDoc.originalPrice : undefined,
      rating: typeof productDoc.rating === 'number' ? productDoc.rating : 0,
      reviewCount: typeof productDoc.reviewCount === 'number' ? productDoc.reviewCount : 0,
      description: productDoc.description || '',
      image: productDoc.image || 'https://placehold.co/600x400.png',
      category: productDoc.category ? {
        id: productDoc.category.id,
        name: productDoc.category.name,
        slug: productDoc.category.slug,
        createdAt: productDoc.category.createdAt,
        updatedAt: productDoc.category.updatedAt,
      } : null,
      categoryId: productDoc.categoryId,
      type: productDoc.type || '',
      color: productDoc.color || '',
      material: productDoc.material || '',
      offer: productDoc.offer || '',
      tags: Array.isArray(productDoc.tags) ? productDoc.tags : [],
      dataAiHint: productDoc.dataAiHint || `${productDoc.category?.name || 'product'} ${productDoc.name || 'item'}`.substring(0,50).toLowerCase(),
      stock: typeof productDoc.stock === 'number' ? productDoc.stock : 0,
      status: productDoc.status || 'Draft',
    }));
    console.log(`API GET /api/products: Successfully fetched ${sanitizedProducts.length} products.`);
    return NextResponse.json({ products: sanitizedProducts }, { status: 200 });

  } catch (e: any) {
    let errorMessage = 'An unexpected error occurred while fetching products.';
    let errorDetails = e.message;
    console.error('API GET /api/products Error (Prisma):', e);

    if (e.name === 'MongoServerSelectionError' || e.name === 'MongoNetworkError' || e.message?.includes('ECONNREFUSED') || e.message?.includes('tlsv1 alert internal error')) {
        errorMessage = `MongoDB Connection Error: ${e.message}. Please verify MONGODB_URI and DATABASE_URL in .env.local. Ensure MongoDB Atlas IP Access List includes your current IP and the server is restarted. Also, check server console logs.`;
    } else if (e.message?.includes("Environment variable not found: DATABASE_URL")) {
        errorMessage = "CRITICAL: DATABASE_URL environment variable is not defined. Please set it in .env.local and restart the server.";
    }  else if (e.code === 'P2021' || e.message?.includes("The table `accessorice-app.Product` does not exist in the current database")) {
        errorMessage = `Prisma Error: The collection 'Product' (mapped to 'accessorice-app') was not found in the database 'accessorice-app'. Ensure 'npx prisma db push' has been run successfully after defining models.`;
        errorDetails = e.message;
    }  else if (e.code === 'P2002' && e.meta?.target) { // Unique constraint failed
        errorMessage = `Database Error: A unique constraint failed on ${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target}.`;
    } else if (e.message?.includes("Cannot read properties of undefined (reading 'findMany')") || (e.message?.includes("TypeError") && e.message?.includes(".findMany is not a function"))) {
      errorMessage = 'Internal Server Error: Prisma product model is not accessible (cannot call .findMany). Ensure `npx prisma generate` has been run and server restarted.';
      errorDetails = e.stack || e.message;
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: errorDetails, message: errorMessage }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  console.log('API POST /api/products: Received request.');
  if (!prisma) {
    console.error('API POST /api/products: CRITICAL - Prisma client (imported as `prisma`) is undefined!');
    return NextResponse.json({ error: 'Internal Server Error: Prisma client is not initialized. Check server logs, DATABASE_URL in .env.local, and ensure server was restarted.' }, { status: 500 });
  }
  if (!prisma.product || typeof prisma.product.create !== 'function') {
      console.error('API POST /api/products: CRITICAL - prisma.product or prisma.product.create is undefined/not a function. This strongly suggests `npx prisma generate` has not been run successfully or the server needs a restart after schema changes. Check server console logs.');
      return NextResponse.json({ error: 'Internal Server Error: Prisma product model is not accessible (cannot call .create). Ensure `npx prisma generate` has been run and server restarted.' }, { status: 500 });
  }
  console.log('API POST /api/products: Prisma client and prisma.product.create seem available.');

  try {
    const formData = await request.formData();
    const productFields: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (key !== 'imageFile') {
        productFields[key] = value;
      }
    });

    if (!productFields.name || !productFields.price || !productFields.description) {
      return NextResponse.json({ error: 'Missing required product fields (name, price, description)' }, { status: 400 });
    }

    let imageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(String(productFields.name).substring(0,20)) || 'No+Image'}`;
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile) {
      console.log(`API POST /api/products: SIMULATING UPLOAD - Received image file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}. Using placeholder URL.`);
      // In a real app, upload to cloud storage and get URL
      imageUrl = `https://placehold.co/600x400.png?text=Uploaded+${encodeURIComponent(imageFile.name.substring(0,15))}`;
    } else {
        console.log("API POST /api/products: No image file provided for product:", productFields.name);
    }
    
    const parsedPrice = parseFloat(String(productFields.price));
    const parsedOriginalPrice = productFields.originalPrice ? parseFloat(String(productFields.originalPrice)) : undefined;
    const parsedStock = productFields.stock ? parseInt(String(productFields.stock), 10) : undefined;

    if (isNaN(parsedPrice)) {
      return NextResponse.json({ error: 'Price must be a valid number.' }, { status: 400 });
    }
    if (parsedOriginalPrice !== undefined && isNaN(parsedOriginalPrice)) {
      return NextResponse.json({ error: 'Original price must be a valid number if provided.' }, { status: 400 });
    }
    if (parsedStock !== undefined && isNaN(parsedStock)) {
      return NextResponse.json({ error: 'Stock quantity must be a valid number if provided.' }, { status: 400 });
    }

    const dataToCreate: Prisma.ProductCreateInput = {
      name: String(productFields.name),
      price: parsedPrice,
      description: String(productFields.description),
      image: imageUrl,
      originalPrice: parsedOriginalPrice,
      stock: parsedStock,
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : undefined,
      color: productFields.color ? String(productFields.color) : undefined,
      material: productFields.material ? String(productFields.material) : undefined,
      offer: productFields.offer ? String(productFields.offer) : undefined,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      rating: 0, // Default value
      reviewCount: 0, // Default value
      dataAiHint: `${productFields.name || 'product'} image`, // Simple default
    };
    
    let categoryNameForHint = 'product'; // Default if no category
    if (productFields.category && String(productFields.category).trim() !== '') {
      const categoryId = String(productFields.category);
      // Basic validation for ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(categoryId)) {
          console.warn(`API POST /api/products: Provided category ID "${categoryId}" for product "${dataToCreate.name}" is not a valid ObjectId format. Product will be created without category linkage.`);
          // Optionally, return an error:
          // return NextResponse.json({ error: `Invalid Category ID format: ${categoryId}. Please select a valid category.` }, { status: 400 });
      } else {
          try {
            const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
            if (categoryExists) {
              dataToCreate.category = { connect: { id: categoryId } };
              categoryNameForHint = categoryExists.name; // Use actual category name for hint
            } else {
              console.warn(`API POST /api/products: Category with ID "${categoryId}" not found for product "${dataToCreate.name}". Product will be created without category linkage.`);
              // Optionally, return an error:
              // return NextResponse.json({ error: `Category with ID ${categoryId} not found. Please select an existing category.` }, { status: 400 });
            }
          } catch (catError: any) {
            console.error(`API POST /api/products: Error finding category with ID "${categoryId}" for product "${dataToCreate.name}":`, catError.message);
            // Consider how to handle this: proceed without category, or return error?
          }
      }
    }
    
    dataToCreate.dataAiHint = `${categoryNameForHint} ${dataToCreate.name || 'item'}`.substring(0, 50).toLowerCase();

    console.log('API POST /api/products: Attempting to create product with data:', JSON.stringify(dataToCreate, null, 2));
    const newProduct = await prisma.product.create({ data: dataToCreate });
    console.log('API POST /api/products: Product created successfully:', newProduct.id);

    return NextResponse.json({ message: "Product added successfully with Prisma", product: newProduct }, { status: 201 });

  } catch (e: any) {
    console.error('API POST /api/products Error (Prisma):', e);
    let errorMessage = 'An unexpected error occurred while adding the product.';
    let errorDetails = e.message || String(e);

    if (e.code === 'P2002' && e.meta?.target) {
      errorMessage = `A product with this ${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target} already exists.`;
      errorDetails = `The field(s) '${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target}' must be unique.`;
    } else if (e.code === 'P2023' && e.message?.includes('Malformed ObjectID')) {
      errorMessage = `Invalid Category ID format. Please ensure a valid category is selected. Details: ${e.message}`;
      errorDetails = e.message;
    } else if (e.message && e.message.includes("Argument `category`: Invalid value provided. Expected String or Null, provided Object.")) {
      errorMessage = "Prisma schema mismatch for 'category' field. Please ensure `npx prisma generate` has been run successfully after defining the Product-Category relation in your `schema.prisma` and that your server has been restarted. This is a critical step for Prisma to understand your data model correctly."
      errorDetails = e.message;
    } else if (e.message?.includes("Cannot read properties of undefined (reading 'create')") || (e.message?.includes("TypeError") && e.message?.includes(".create is not a function"))) {
      errorMessage = 'Internal Server Error: Prisma product model is not accessible (cannot call .create). Ensure `npx prisma generate` has been run and server restarted.';
      errorDetails = e.stack || e.message;
    } else if (e.message?.includes('ECONNREFUSED') || e.message?.includes('MongoServerSelectionError')) {
        errorMessage = "MongoDB Connection Error during product creation. Please verify MONGODB_URI / DATABASE_URL in .env.local and ensure MongoDB Atlas IP Access List includes your current IP. Also, check server console logs.";
        errorDetails = e.message;
    }

    return NextResponse.json({ error: 'Failed to add product', details: errorDetails, message: errorMessage }, { status: 500 });
  }
}
    

    