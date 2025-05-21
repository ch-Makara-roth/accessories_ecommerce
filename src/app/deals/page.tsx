import ProductGrid from '@/components/products/ProductGrid';
import { products } from '@/data/products';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DealsPage() {
  // Filter products that have an offer or a significant discount
  const dealProducts: Product[] = products.filter(
    p => p.offer || (p.originalPrice && p.price < p.originalPrice * 0.8) // Example: 20% off or more
  ).slice(0, 10); // Limit to 10 deals for example

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">Hot Deals</h1>
      {dealProducts.length > 0 ? (
        <ProductGrid products={dealProducts} />
      ) : (
        <div className="text-center py-10">
            <p className="text-xl text-muted-foreground mb-6">No special deals at the moment. Check back soon!</p>
            <Button asChild>
                <Link href="/">Explore Products</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
