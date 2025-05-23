
'use client';

import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSearchResults = useCallback(async () => {
    if (!query) {
      setFilteredProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products?searchQuery=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API error during search. Status: ${response.status}` }));
        throw new Error(errorData.error || 'Failed to fetch search results.');
      }
      const data = await response.json();
      setFilteredProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching search results:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Search Error', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Searching for "{query}"...</p>
      </div>
    );
  }
  
  if (error && !query) { // Show error if query is empty and there was an issue (unlikely with current flow)
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4 text-destructive">Search Error</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
         <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }


  if (!query) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4 text-primary">Enter a search term</h1>
        <p className="text-muted-foreground mb-6">Please enter a search term in the search bar above to find products.</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-primary">
        Search Results for "{query}"
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        {error ? 'Could not load results.' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found.`}
      </p>
      
      {filteredProducts.length > 0 && !error ? (
        <ProductGrid products={filteredProducts} />
      ) : !error ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-6">No products found matching your search term.</p>
          <Button asChild>
            <Link href="/">Explore Other Products</Link>
          </Button>
        </div>
      ) : null }
    </div>
  );
}
