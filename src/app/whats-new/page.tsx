import ProductGrid from '@/components/products/ProductGrid';
import { products } from '@/data/products';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WhatsNewPage() {
  // For "What's New", we can sort by a hypothetical date or just take the latest additions
  // For this example, let's just take the last few products as "new"
  const newProducts: Product[] = [...products].reverse().slice(0, 6); // Example: last 6 products

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">What's New</h1>
      {newProducts.length > 0 ? (
        <ProductGrid products={newProducts} />
      ) : (
         <div className="text-center py-10">
            <p className="text-xl text-muted-foreground mb-6">No new arrivals right now. Stay tuned!</p>
            <Button asChild>
                <Link href="/">Explore Products</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
