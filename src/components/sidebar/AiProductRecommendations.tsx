
'use client';

import React, { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { getPersonalizedProductRecommendations, type PersonalizedProductRecommendationsOutput } from '@/ai/flows/personalized-product-recommendations';
import { products as allProducts, getProductById } from '@/data/products'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';

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
          <h4 className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{product.name}</h4>
        </Link>
        <p className="text-sm text-primary font-bold">${product.price.toFixed(2)}</p>
          <Button variant="outline" size="sm" className="mt-2 text-xs">
            <ShoppingCart className="mr-1 h-3 w-3" /> Add to Cart
          </Button>
      </div>
    </div>
  );
});
RecommendedProductItem.displayName = 'RecommendedProductItem';

const AiProductRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Mock browsing history
        const browsingHistory = ['p1', 'p4']; // Example product IDs
        
        const result: PersonalizedProductRecommendationsOutput = await getPersonalizedProductRecommendations({ browsingHistory });
        
        if (result && result.productRecommendations) {
          const recommendedProducts = result.productRecommendations
            .map(id => getProductById(id))
            .filter((p): p is Product => p !== undefined) // Type guard to filter out undefined
            .slice(0, 3); // Limit to 3 recommendations for display
          setRecommendations(recommendedProducts);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error("Error fetching AI recommendations:", err);
        setError("Failed to load recommendations.");
        // Fallback to generic popular items if AI fails
        setRecommendations(allProducts.slice(0,3).sort(() => 0.5 - Math.random()));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

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
          <p className="text-muted-foreground">{error}</p>
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
          <p className="text-muted-foreground">No specific recommendations for you at the moment. Check out our popular items!</p>
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
