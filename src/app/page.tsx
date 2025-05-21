import HomePageLayout from '@/components/layouts/HomePageLayout';
import PromotionalBanner from '@/components/home/PromotionalBanner';
import ProductGrid from '@/components/products/ProductGrid';
import FilterBar from '@/components/products/FilterBar';
import { products } from '@/data/products';

export default function Home() {
  const mainContent = (
    <>
      <PromotionalBanner />
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary">Headphones For You!</h1>
      <FilterBar />
      <ProductGrid products={products.filter(p => p.category === 'headphones')} />
    </>
  );

  return (
    <HomePageLayout mainContent={mainContent} />
  );
}
