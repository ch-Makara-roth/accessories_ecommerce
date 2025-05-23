
'use client';

import ProductGrid from '@/components/products/ProductGrid';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function DealsPage() {
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDealProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products?isOnOffer=true&limit=10');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API error fetching deals. Status: ${response.status}` }));
        throw new Error(errorData.error || 'Failed to fetch deals.');
      }
      const data = await response.json();
      setDealProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching deal products:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Loading Deals', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDealProducts();
  }, [fetchDealProducts]);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading deals...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">Hot Deals</h1>
      {error && (
        <div className="text-center py-10 text-destructive">
          <p>Could not load deals: {error}</p>
        </div>
      )}
      {!error && dealProducts.length > 0 ? (
        <ProductGrid products={dealProducts} />
      ) : !error ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-6">No special deals at the moment. Check back soon!</p>
          <Button asChild>
            <Link href="/">Explore Products</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
