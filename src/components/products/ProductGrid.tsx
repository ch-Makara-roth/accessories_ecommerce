import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title }) => {
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No products found.</p>;
  }

  return (
    <section aria-labelledby={title ? 'product-grid-title' : undefined} className="mb-12">
      {title && <h2 id="product-grid-title" className="text-3xl font-bold text-center mb-8 text-primary">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
