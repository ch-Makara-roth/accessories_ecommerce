
'use client';

import ProductGrid from '@/components/products/ProductGrid';
import FilterBar from '@/components/products/FilterBar';
import type { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    try {
      let categoryData: Category | null = null;
      let productsApiUrl = '';

      if (slug === 'all') {
        categoryData = { id: 'all', name: 'All Products', slug: 'all', createdAt: new Date(), updatedAt: new Date() }; // Mock category for "All Products"
        productsApiUrl = `/api/products?categorySlug=all-categories`; // Use the special slug for API
      } else {
        // Fetch specific category details
        const categoryRes = await fetch(`/api/categories/slug/${slug}`);
        if (!categoryRes.ok) {
          if (categoryRes.status === 404) {
            throw new Error(`Category "${slug}" not found.`);
          }
          const errorData = await categoryRes.json().catch(() => ({ error: `Failed to fetch category details. Status: ${categoryRes.status}` }));
          throw new Error(errorData.error);
        }
        categoryData = await categoryRes.json();
        productsApiUrl = `/api/products?categorySlug=${slug}`;
      }
      
      setCategory(categoryData);

      // Fetch products
      if (productsApiUrl) {
        const productsRes = await fetch(productsApiUrl);
        if (!productsRes.ok) {
          const errorData = await productsRes.json().catch(() => ({ error: `Failed to fetch products. Status: ${productsRes.status}` }));
          throw new Error(errorData.error);
        }
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      } else if (slug !== 'all' && !categoryData) {
        // This case might occur if category fetch succeeded but somehow categoryData is null (should not happen with current logic)
         throw new Error(`Category "${slug}" data could not be processed correctly.`);
      }


    } catch (err) {
      console.error("Error fetching category page data:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      // Do not toast here, let the UI render the error state
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading {slug === 'all' ? 'products' : `category: ${slug}`}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4 text-destructive">Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  const pageTitle = category ? category.name : "Products";

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-center my-8 text-primary">{pageTitle}</h1>
      <FilterBar />
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-center text-muted-foreground py-8">No products found {slug === 'all' ? '' : `in the "${pageTitle}" category`}.</p>
      )}
    </div>
  );
}
