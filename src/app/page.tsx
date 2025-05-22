
import HomePageLayout from '@/components/layouts/HomePageLayout';
import PromotionalBanner from '@/components/home/PromotionalBanner';
import ProductGrid from '@/components/products/ProductGrid';
import FilterBar from '@/components/products/FilterBar';
import type { Product } from '@/types';

async function getProducts(): Promise<Product[]> {
  // Ensure NEXT_PUBLIC_APP_URL is set in your .env.local (e.g., NEXT_PUBLIC_APP_URL=http://localhost:9002)
  // Fallback to localhost:9002 to match the dev script if not set.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: 'no-store' // Or 'force-cache' or revalidate options
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Failed to fetch products for homepage. Status: ${res.status} ${res.statusText}. URL: ${baseUrl}/api/products. Body: ${errorBody.substring(0, 500)}...`);
      return []; // Return empty array on error
    }
    // If res.ok, proceed to parse as JSON.
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products for homepage:", error);
    return []; // Return empty array on error
  }
}


export default async function Home() {
  const allProducts = await getProducts();
  
  // Filter for headphones category specifically for the homepage, or adjust as needed
  const headphoneProducts = allProducts.filter(p => p.category?.name?.toLowerCase() === 'headphones');

  const mainContent = (
    <>
      <PromotionalBanner />
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary">Headphones For You!</h1>
      <FilterBar />
      {headphoneProducts.length > 0 ? (
        <ProductGrid products={headphoneProducts} />
      ) : (
        <p className="text-center text-muted-foreground py-8">
          {allProducts.length === 0 ? "Could not load products. Please check the connection or try again later." : "No headphones found in this category currently."}
        </p>
      )}
    </>
  );

  return (
    <HomePageLayout mainContent={mainContent} />
  );
}
