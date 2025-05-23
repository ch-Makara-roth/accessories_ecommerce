
'use client'; // Converted to client component for client-side data fetching

import HomePageLayout from '@/components/layouts/HomePageLayout';
import PromotionalBanner from '@/components/home/PromotionalBanner';
import ProductGrid from '@/components/products/ProductGrid';
import FilterBar from '@/components/products/FilterBar';
import type { Product } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


export default function Home() {
  const [headphoneProducts, setHeadphoneProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHomepageProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products?categorySlug=headphones&limit=8`); // Fetch 8 headphones
      if (!res.ok) {
        const errorBody = await res.text();
        const errorMessage = `Failed to fetch products for homepage. Status: ${res.status} ${res.statusText}. URL: /api/products?categorySlug=headphones. Body: ${errorBody.substring(0, 200)}...`;
        console.error(errorMessage);
        throw new Error('Could not load products for the homepage.');
      }
      const data = await res.json();
      setHeadphoneProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching homepage products:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Loading Products', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHomepageProducts();
  }, [fetchHomepageProducts]);

  const mainContent = (
    <>
      <PromotionalBanner />
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary">Headphones For You!</h1>
      <FilterBar />
      {isLoading ? (
         <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">
          <p className="mb-4">Could not load products: {error}</p>
           <Button onClick={fetchHomepageProducts}>Try Again</Button>
        </div>
      ) : headphoneProducts.length > 0 ? (
        <ProductGrid products={headphoneProducts} />
      ) : (
        <div className="text-center py-10">
            <p className="text-xl text-muted-foreground mb-6">No headphones found at the moment.</p>
            <Button asChild>
                <Link href="/category/all">Explore All Products</Link>
            </Button>
        </div>
      )}
    </>
  );

  return (
    <HomePageLayout mainContent={mainContent} />
  );
}
