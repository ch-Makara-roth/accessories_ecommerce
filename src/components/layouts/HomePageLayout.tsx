import CheckoutPreview from '@/components/sidebar/CheckoutPreview';
import PopularCategories from '@/components/sidebar/PopularCategories';
import AiProductRecommendations from '@/components/sidebar/AiProductRecommendations';
import BestSellers from '@/components/sidebar/BestSellers';

interface HomePageLayoutProps {
  mainContent: React.ReactNode;
}

const HomePageLayout: React.FC<HomePageLayoutProps> = ({ mainContent }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-3/4 xl:w-2/3 w-full">
        {mainContent}
      </div>
      <aside className="lg:w-1/4 xl:w-1/3 w-full lg:sticky lg:top-24 self-start"> {/* Made sidebar sticky */}
        <CheckoutPreview />
        <PopularCategories />
        <AiProductRecommendations />
        <BestSellers />
      </aside>
    </div>
  );
};

export default HomePageLayout;
