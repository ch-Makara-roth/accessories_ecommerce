import ProductGrid from '@/components/products/ProductGrid';
import FilterBar from '@/components/products/FilterBar';
import { getProductsByCategory, products as allProducts } from '@/data/products';
import { popularCategories } from '@/data/categories';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const categorySlugs = popularCategories.map(cat => ({ slug: cat.slug }));
  // Add an "all" category if desired
  // categorySlugs.push({ slug: 'all' }); 
  return categorySlugs;
}


export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const category = popularCategories.find(cat => cat.slug === slug);
  const categoryProducts: Product[] = category ? getProductsByCategory(slug) : allProducts; // Show all if slug not found or is 'all'

  if (!category && slug !== 'all') { // If slug is not 'all' and category not found
    return (
        <div className="text-center py-10">
            <h1 className="text-3xl font-bold mb-4 text-destructive">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">The category "{slug}" does not exist.</p>
            <Button asChild>
                <Link href="/">Go to Homepage</Link>
            </Button>
        </div>
    );
  }
  
  const pageTitle = category ? category.name : "All Products";

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-center my-8 text-primary">{pageTitle}</h1>
      <FilterBar />
      <ProductGrid products={categoryProducts} />
    </div>
  );
}
