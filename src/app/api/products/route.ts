
// src/app/api/products/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Role } from '@prisma/client';

// GET handler
export async function GET(request: NextRequest) {
  console.log('API GET /api/products: Received request.');

  if (!prisma || typeof prisma.product?.findMany !== 'function') {
      const errorMsg = 'Internal Server Error: Prisma product model is not accessible. Ensure `npx prisma generate` has been run and server restarted.';
      console.error(`API GET /api/products: CRITICAL - ${errorMsg}`);
      return NextResponse.json({ error: errorMsg, message: errorMsg }, { status: 500 });
  }
  console.log('API GET /api/products: Prisma client and prisma.product.findMany seem available.');
  
  const { searchParams } = new URL(request.url);
  const categoryIdParam = searchParams.get('categoryId');
  const categorySlugParam = searchParams.get('categorySlug');
  const statusesParam = searchParams.get('status');
  const searchQueryParam = searchParams.get('searchQuery');
  const isOnOfferParam = searchParams.get('isOnOffer');
  const sortByParam = searchParams.get('sortBy');
  const sortOrderParam = searchParams.get('sortOrder') as Prisma.SortOrder | undefined || 'asc';
  const limitParam = searchParams.get('limit');
  const excludeProductIdParam = searchParams.get('excludeProductId');

  try {
    const whereClause: Prisma.ProductWhereInput = {};
    const orderByClause: Prisma.ProductOrderByWithRelationInput = {};

    if (excludeProductIdParam) {
      whereClause.id = { not: excludeProductIdParam };
    }
    
    let resolvedCategoryIds: string[] | undefined = undefined;

    if (categoryIdParam && categoryIdParam !== 'all') {
      resolvedCategoryIds = categoryIdParam.split(',');
    } else if (categorySlugParam && categorySlugParam !== 'all-categories') {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlugParam },
        select: { id: true }
      });
      if (category) {
        resolvedCategoryIds = [category.id];
      } else {
        return NextResponse.json({ products: [] }, { status: 200 });
      }
    }
    
    if (resolvedCategoryIds && resolvedCategoryIds.length > 0) {
        whereClause.categoryId = { in: resolvedCategoryIds };
    }


    if (statusesParam && statusesParam !== 'all-statuses') {
      const statuses = statusesParam.split(',');
      if (statuses.length > 0) {
        whereClause.status = { in: statuses };
      }
    }

    if (searchQueryParam) {
      whereClause.OR = [
        { name: { contains: searchQueryParam, mode: 'insensitive' } },
        { description: { contains: searchQueryParam, mode: 'insensitive' } },
        { tags: { has: searchQueryParam.toLowerCase() } }, 
      ];
    }

    if (isOnOfferParam === 'true') {
      whereClause.OR = [
        ...(whereClause.OR || []), 
        { offer: { not: null, not: '' } },
        { 
          AND: [
            { originalPrice: { not: null } },
            { originalPrice: { gt: 0 } }, 
            { price: { lt: prisma.product.fields.originalPrice } } 
          ]
        }
      ];
      if (whereClause.OR.length === 2 && JSON.stringify(whereClause.OR[0]) === "{}") {
         whereClause.OR.shift();
      }
    }
    
    if (sortByParam) {
        if (sortByParam === 'createdAt' || sortByParam === 'price' || sortByParam === 'name' || sortByParam === 'rating' || sortByParam === 'stock' ) {
             orderByClause[sortByParam] = sortOrderParam;
        } else {
            orderByClause['createdAt'] = 'desc'; 
        }
    } else {
        orderByClause['createdAt'] = 'desc'; 
    }


    console.log('API GET /api/products: Using whereClause:', JSON.stringify(whereClause));
    console.log('API GET /api/products: Using orderByClause:', JSON.stringify(orderByClause));

    const productsFromDB = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limitParam ? parseInt(limitParam, 10) : undefined,
      include: { category: true },
    });

    const sanitizedProducts = productsFromDB.map(productDoc => ({
      id: productDoc.id,
      _id: productDoc.id,
      name: productDoc.name || 'Unknown Product',
      price: typeof productDoc.price === 'number' ? productDoc.price : 0,
      originalPrice: typeof productDoc.originalPrice === 'number' ? productDoc.originalPrice : undefined,
      rating: typeof productDoc.rating === 'number' ? productDoc.rating : 0,
      reviewCount: typeof productDoc.reviewCount === 'number' ? productDoc.reviewCount : 0,
      description: productDoc.description || '',
      image: productDoc.image || '/placehold.co/600x400.png', 
      category: productDoc.category ? {
        id: productDoc.category.id,
        _id: productDoc.category.id,
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
      createdAt: productDoc.createdAt,
      updatedAt: productDoc.updatedAt, 
    }));
    console.log(`API GET /api/products: Successfully fetched ${sanitizedProducts.length} products with filters.`);
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
    }  else if (e.code === 'P2002' && e.meta?.target) { 
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
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user || ![Role.ADMIN, Role.SELLER, Role.STOCK].includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Unauthorized. Admin, Seller, or Stock role required to add products.' }, { status: 403 });
  }
  
  if (!prisma) {
    console.error('API POST /api/products: CRITICAL - Prisma client (imported as `prisma`) is undefined!');
    return NextResponse.json({ error: 'Internal Server Error: Prisma client is not initialized. Check server logs, DATABASE_URL in .env.local, and ensure server was restarted.' }, { status: 500 });
  }
   if (!prisma.product || typeof prisma.product.create !== 'function') {
    const errorMsg = 'Internal Server Error: Prisma product model not accessible. Ensure `npx prisma generate` has been run and server restarted.';
    console.error(`API POST /api/products: CRITICAL - ${errorMsg}. Prisma object keys: ${Object.keys(prisma || {})}. prisma.product type: ${typeof prisma?.product}`);
    return NextResponse.json({ error: errorMsg, message: errorMsg }, { status: 500 });
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

    let imageUrl = `/placehold.co/600x400.png?text=${encodeURIComponent(String(productFields.name).substring(0,20)) || 'No+Image'}`; 
    const imageFile = formData.get('imageFile') as File | null;

    if (imageFile && imageFile.size > 0) {
      console.log("API POST /api/products: Image file provided:", imageFile.name, imageFile.type, imageFile.size);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      await fs.mkdir(uploadsDir, { recursive: true }); 

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(imageFile.name) || '.jpg'; 
      const uniqueFilename = `${path.basename(imageFile.name, fileExtension).replace(/[^a-zA-Z0-9-_]/g, '')}-${uniqueSuffix}${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, fileBuffer);

      imageUrl = `/uploads/products/${uniqueFilename}`; 
      console.log(`API POST /api/products: Image saved locally to ${filePath}. Public URL: ${imageUrl}`);
    } else {
        console.log("API POST /api/products: No image file provided or file is empty for product:", productFields.name);
    }

    const parsedPrice = parseFloat(String(productFields.price));
    const parsedOriginalPrice = productFields.originalPrice && String(productFields.originalPrice).trim() !== '' ? parseFloat(String(productFields.originalPrice)) : undefined;
    const parsedStock = productFields.stock && String(productFields.stock).trim() !== '' ? parseInt(String(productFields.stock), 10) : undefined;


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
      originalPrice: parsedOriginalPrice === undefined ? null : parsedOriginalPrice,
      stock: parsedStock === undefined ? null : parsedStock,
      status: String(productFields.status || 'Draft'),
      type: productFields.type ? String(productFields.type) : undefined,
      color: productFields.color ? String(productFields.color) : undefined,
      material: productFields.material ? String(productFields.material) : undefined,
      offer: productFields.offer ? String(productFields.offer) : undefined,
      tags: typeof productFields.tags === 'string' ? productFields.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      rating: 0, 
      reviewCount: 0,
    };

    let categoryNameForHint = 'product'; 
    const categoryId = productFields.category ? String(productFields.category) : null;

    if (categoryId && categoryId.trim() !== '' && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
        try {
          const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
          if (categoryExists) {
            dataToCreate.category = { connect: { id: categoryId } }; 
            categoryNameForHint = categoryExists.name;
          } else {
            console.warn(`API POST /api/products: Category with ID "${categoryId}" not found for product "${dataToCreate.name}". Product will be created without category linkage.`);
          }
        } catch (catError: any) {
           if (catError.code === 'P2023' && catError.message?.includes('Malformed ObjectID')) { 
             console.warn(`API POST /api/products: Provided category ID "${categoryId}" for product "${dataToCreate.name}" is not a valid ObjectId format according to Prisma. Product will be created without category linkage.`);
           } else {
            console.error(`API POST /api/products: Error finding category with ID "${categoryId}" for product "${dataToCreate.name}":`, catError.message);
           }
        }
    } else if (categoryId && categoryId.trim() !== '') {
        console.warn(`API POST /api/products: Provided category ID "${categoryId}" for product "${dataToCreate.name}" is not a valid ObjectId format. Product will be created without category linkage.`);
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

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002' && e.meta?.target) { 
            errorMessage = `A product with this ${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target} already exists.`;
            errorDetails = `The field(s) '${Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target}' must be unique.`;
        } else if (e.code === 'P2023' && e.message?.includes('Malformed ObjectID')) {
            errorMessage = `Invalid Category ID format. Please ensure a valid category is selected. Details: ${e.message}`;
        } else if (e.code === 'P2025' ) { 
            errorMessage = "Record not found. The category ID you tried to connect might not exist.";
        } else {
            errorMessage = `Prisma Error: ${e.message}`;
        }
    } else if (e.message && (e.message.includes("Argument `category`: Invalid value provided. Expected String or Null, provided Object.") || e.message.includes("Expected `ProductCreateInput` or `ProductUncheckedCreateInput`"))) {
      errorMessage = "Prisma schema mismatch or outdated client. Ensure `npx prisma generate` has been run successfully after defining the Product-Category relation in your `schema.prisma` and that your server has been restarted. This is a critical step for Prisma to understand your data model correctly."
    } else if (e.message?.includes("Cannot read properties of undefined (reading 'create')") || (e.message?.includes("TypeError") && e.message?.includes(".create is not a function"))) {
      errorMessage = 'Internal Server Error: Prisma product model is not accessible (cannot call .create). Ensure `npx prisma generate` has been run and server restarted.';
      errorDetails = e.stack || e.message;
    } else if (e.message?.includes('ECONNREFUSED') || e.message?.includes('MongoServerSelectionError')) {
        errorMessage = "MongoDB Connection Error during product creation. Please verify MONGODB_URI / DATABASE_URL in .env.local and ensure MongoDB Atlas IP Access List includes your current IP. Also, check server console logs.";
    }

    return NextResponse.json({ error: 'Failed to add product', details: errorDetails, message: errorMessage }, { status: 500 });
  }
}
