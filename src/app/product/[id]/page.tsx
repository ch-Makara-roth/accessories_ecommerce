
'use client'; // Added 'use client' for useState

import { getProductById, products as allProducts } from '@/data/products';
import type { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/products/StarRating';
import ProductGrid from '@/components/products/ProductGrid';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from '@/components/products/AddToCartButton';
import { useState } from 'react'; // Added useState

interface ProductDetailPageProps {
  params: { id: string };
}

// export async function generateStaticParams() { // Removed as we are using client component features
//   return allProducts.map(product => ({
//     id: product.id,
//   }));
// } 
// Disabling generateStaticParams as this page now uses client-side hooks (useState)
// For a production app, you'd fetch product data client-side or use a different pattern
// if you need generateStaticParams with client interactivity.

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id);
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In a real app, you'd also update backend/context state here
  };

  if (!product) {
    return (
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold mb-4 text-destructive">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you are looking for does not exist.</p>
            <Button asChild>
                <Link href="/">Go to Homepage</Link>
            </Button>
        </div>
    );
  }

  const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Product Image Gallery (simplified) */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="w-full h-auto object-cover aspect-square"
            data-ai-hint={product.dataAiHint || 'product detail'}
            priority
          />
          {/* Placeholder for thumbnails if multiple images */}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-3">{product.name}</h1>
          <div className="flex items-center mb-4">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} showText size={20} />
            {product.tags && product.tags.length > 0 && (
                <>
                    <Separator orientation="vertical" className="h-5 mx-3" />
                    <span className="text-sm text-muted-foreground">{product.tags.join(', ')}</span>
                </>
            )}
          </div>
          <p className="text-2xl lg:text-3xl font-semibold text-foreground mb-4">
            ${product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="ml-3 text-lg line-through text-muted-foreground">${product.originalPrice.toFixed(2)}</span>
            )}
          </p>
          {product.offer && <p className="text-accent font-semibold mb-4 text-lg">{product.offer}</p>}
          
          <p className="text-foreground/80 leading-relaxed mb-6">{product.description}</p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <AddToCartButton 
              product={product} 
              size="lg" 
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" 
            >
              Add to Cart
            </AddToCartButton>
            <Button 
              variant="outline" 
              size="lg" 
              className={`flex-1 ${isFavorited ? 'border-red-500 text-red-500 hover:bg-red-500/10' : 'text-primary border-primary hover:bg-primary/10'}`}
              onClick={toggleFavorite}
              aria-pressed={isFavorited}
            >
              <Heart className={`mr-2 h-5 w-5 ${isFavorited ? 'fill-red-500' : ''}`} /> {isFavorited ? 'Favorited' : 'Favorite'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Category: <Link href={`/category/${product.category}`} className="text-primary hover:underline">{product.category}</Link></p>
            {product.type && <p>Type: {product.type}</p>}
            {product.color && <p>Color: {product.color}</p>}
            {product.material && <p>Material: {product.material}</p>}
          </div>
          <Button variant="ghost" size="sm" className="mt-4 text-muted-foreground hover:text-primary">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductGrid products={relatedProducts} title="You Might Also Like" />
      )}
    </div>
  );
}
