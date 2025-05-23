
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import type { Product } from '@/types';
import { getPersonalizedProductRecommendations, type PersonalizedProductRecommendationsOutput } from '@/ai/flows/personalized-product-recommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '../products/AddToCartButton';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecommendedProductItemProps {
  product: Product;
}

const RecommendedProductItem: React.FC<RecommendedProductItemProps> = React.memo(({ product }) => {
  return (
    <div className="flex items-start space-x-3 p-3 bg-muted/30 hover:bg-muted/60 rounded-lg transition-colors">
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
          <h4 className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">{product.name}</h4>
        </Link>
        <p className="text-sm text-primary font-bold">${product.price.toFixed(2)}</p>
          <AddToCartButton product={product} size="sm" variant="outline" className="mt-2 text-xs">
            Add to Cart
          </AddToCartButton>
      </div>
    </div>
  );
});
RecommendedProductItem.displayName = 'RecommendedProductItem';

const AiProductRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProductDetails = useCallback(async (productId: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        console.warn(`Failed to fetch details for product ID ${productId}. Status: ${res.status}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(`Error fetching details for product ID ${productId}:`, err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const browsingHistory = ['p1', 'p4']; // Example: Replace with actual user browsing history
        
        const aiResult: PersonalizedProductRecommendationsOutput = await getPersonalizedProductRecommendations({ browsingHistory });
        
        if (aiResult && aiResult.productRecommendations && aiResult.productRecommendations.length > 0) {
          const productPromises = aiResult.productRecommendations
            .slice(0, 3) // Take top 3 IDs
            .map(id => fetchProductDetails(id));
          
          const fetchedProducts = (await Promise.all(productPromises)).filter((p): p is Product => p !== null);
          setRecommendations(fetchedProducts);

          if (fetchedProducts.length === 0 && aiResult.productRecommendations.length > 0) {
            console.warn("AI recommended product IDs, but failed to fetch details for them.");
            // setError("Could not load recommendation details."); // Optionally set error
          }
        } else {
          setRecommendations([]); // No recommendations from AI
        }
      } catch (err) {
        console.error("Error fetching AI recommendations flow:", err);
        setError("Failed to load recommendations at this time.");
        toast({ variant: 'destructive', title: 'Recommendation Error', description: 'Could not load personalized recommendations.' });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [fetchProductDetails, toast]);

  if (loading) {
    return (
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Recommended For You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-md animate-pulse">
                <div className="w-16 h-16 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Recommended For You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (recommendations.length === 0 && !error) {
     return (
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Recommended For You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No specific recommendations for you at the moment. Explore our popular items!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Recommended For You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map(product => (
            <RecommendedProductItem key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiProductRecommendations;
