
'use client';
import React from 'react';
import { products } from '@/data/products';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from '../products/StarRating';
import AddToCartButton from '../products/AddToCartButton'; // Updated import

const bestSellerProducts: Product[] = products
  .sort((a, b) => (b.reviewCount || 0) * b.rating - (a.reviewCount || 0) * a.rating) // Simple sort logic
  .slice(0, 4); // Get top 4

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
            <h4 className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight">{product.name}</h4>
          </Link>
        <StarRating rating={product.rating} size={14} className="my-1" />
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
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Best Sellers</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {bestSellerProducts.map(product => (
            <BestSellerItem key={product.id} product={product} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default BestSellers;
