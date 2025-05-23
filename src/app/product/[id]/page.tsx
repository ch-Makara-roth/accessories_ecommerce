
'use client';

import type { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/products/StarRating';
import ProductGrid from '@/components/products/ProductGrid';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from '@/components/products/AddToCartButton';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const fetchProductData = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const productRes = await fetch(`/api/products/${productId}`);
      if (!productRes.ok) {
        const errorData = await productRes.json().catch(() => ({ error: `Product not found or API error. Status: ${productRes.status}` }));
        throw new Error(errorData.error || 'Failed to fetch product details.');
      }
      const productData: Product = await productRes.json();
      setProduct(productData);

      // Fetch related products if category exists
      if (productData.category?.slug) {
        const relatedRes = await fetch(`/api/products?categorySlug=${productData.category.slug}&limit=4&excludeProductId=${productId}`); // Fetch 4 to get 3 related
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData.products?.filter((p: Product) => p.id !== productId).slice(0, 3) || []);
        } else {
          console.warn("Failed to fetch related products for product:", productId);
          setRelatedProducts([]);
        }
      } else {
        setRelatedProducts([]);
      }

    } catch (err) {
      console.error("Error fetching product page data:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Error Loading Product', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In a real app, you'd also update backend/context state here
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Product</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

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

  return (
    <div className="py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
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
        </div>

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
            {product.category && <p>Category: <Link href={`/category/${product.category.slug}`} className="text-primary hover:underline">{product.category.name}</Link></p>}
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

      {relatedProducts.length > 0 && (
        <ProductGrid products={relatedProducts} title="You Might Also Like" />
      )}
    </div>
  );
}
