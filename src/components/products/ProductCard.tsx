
'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import { Heart, PackageCheck, PackageX } from 'lucide-react';
import React, { useState } from 'react'; 
import AddToCartButton from './AddToCartButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const isOutOfStock = product.stock == null || product.stock <= 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="p-0 relative">
        <Link href={`/product/${product.id}`} className="block aspect-[4/3] overflow-hidden group">
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.dataAiHint || 'product image'}
          />
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-card/50 hover:bg-card/80 rounded-full text-primary hover:text-primary/80"
          onClick={toggleFavorite}
          aria-pressed={isFavorited}
        >
          <Heart 
            className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-primary'}`} 
          />
          <span className="sr-only">Favorite</span>
        </Button>
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            Out of Stock
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1 leading-tight">
          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </CardTitle>
        <div className="flex items-center mb-2">
          <StarRating rating={product.rating} size={16} />
          {product.reviewCount != null && <span className="ml-2 text-xs text-muted-foreground">({product.reviewCount})</span>}
        </div>
        <p className="text-sm text-muted-foreground mb-3 h-10 overflow-hidden">{product.description}</p>
        
        <div className="flex items-baseline mb-1">
          <p className="text-lg sm:text-xl font-semibold text-primary">
            ${product.price.toFixed(2)}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="ml-2 text-sm line-through text-muted-foreground">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {!isOutOfStock && product.stock != null && product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">Only {product.stock} left in stock!</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton 
          product={product} 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </AddToCartButton>
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
