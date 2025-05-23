
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from '../products/StarRating';
import AddToCartButton from '../products/AddToCartButton';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BestSellerItemProps {
  product: Product;
}

const BestSellerItem: React.FC<BestSellerItemProps> = React.memo(({ product }) => {
  return (
    <li className="flex items-start space-x-3 p-3 bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors">
      <Link href={`/product/${product.id}`} className="shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="rounded-md object-cover aspect-square"
          data-ai-hint={product.dataAiHint || 'product image'}
        />
      </Link>
      <div className="flex-1">
          <Link href={`/product/${product.id}`}>
            <h4 className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight line-clamp-2">{product.name}</h4>
          </Link>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} size={14} className="my-1" showText={false}/>
        <p className="text-sm text-primary font-bold">${product.price.toFixed(2)}</p>
        <AddToCartButton product={product} size="sm" variant="outline" className="mt-2 text-xs">
           Add to Cart
        </AddToCartButton>
      </div>
    </li>
  );
});
BestSellerItem.displayName = 'BestSellerItem';

const BestSellers = () => {
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBestSellers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products?sortBy=rating&sortOrder=desc&limit=4');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `API error fetching best sellers. Status: ${response.status}`}));
        throw new Error(errorData.error || 'Failed to fetch best sellers.');
      }
      const data = await response.json();
      setBestSellerProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching best seller products:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Loading Best Sellers', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBestSellers();
  }, [fetchBestSellers]);

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Best Sellers</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-muted-foreground text-sm">Could not load best sellers: {error}</p>
        ) : bestSellerProducts.length > 0 ? (
          <ul className="space-y-4">
            {bestSellerProducts.map(product => (
              <BestSellerItem key={product.id} product={product} />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No best sellers to display right now.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BestSellers;
