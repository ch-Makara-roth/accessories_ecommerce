
'use client';

import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function WhatsNewPage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNewProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products?sortBy=createdAt&sortOrder=desc&limit=6');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API error fetching new products. Status: ${response.status}` }));
        throw new Error(errorData.error || 'Failed to fetch new products.');
      }
      const data = await response.json();
      setNewProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching new products:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Loading New Arrivals', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNewProducts();
  }, [fetchNewProducts]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading new arrivals...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">What's New</h1>
      {error && (
        <div className="text-center py-10 text-destructive">
          <p>Could not load new arrivals: {error}</p>
        </div>
      )}
      {!error && newProducts.length > 0 ? (
        <ProductGrid products={newProducts} />
      ) : !error ? (
         <div className="text-center py-10">
            <p className="text-xl text-muted-foreground mb-6">No new arrivals right now. Stay tuned!</p>
            <Button asChild>
                <Link href="/">Explore Products</Link>
            </Button>
        </div>
      ) : null}
    </div>
  );
}
