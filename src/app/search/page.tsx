
'use client';

import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import { products as allProducts } from '@/data/products';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))) ||
        product.category.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
    setIsLoading(false);
  }, [query]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4 text-primary">Searching...</h1>
        {/* You could add a spinner or skeleton loaders here */}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4 text-primary">Enter a search term</h1>
        <p className="text-muted-foreground mb-6">Please enter a search term in the search bar above to find products.</p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-primary">
        Search Results for "{query}"
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found.
      </p>
      
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-6">No products found matching your search term.</p>
          <Button asChild>
            <Link href="/">Explore Other Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
