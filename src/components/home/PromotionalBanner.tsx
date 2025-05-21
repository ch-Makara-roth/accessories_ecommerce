import Image from 'next/image';
import { Button } from '@/components/ui/button';

const PromotionalBanner = () => {
  return (
    <section 
      className="relative w-full py-16 md:py-24 bg-banner-background rounded-lg shadow-lg overflow-hidden mb-12"
      aria-labelledby="promo-banner-heading"
    >
      <div className="absolute inset-0">
        <Image
          src="https://placehold.co/1600x600.png?text=+" // Placeholder for blurred image
          alt="Person wearing headphones"
          layout="fill"
          objectFit="cover"
          className="opacity-20 blur-sm"
          data-ai-hint="headphones lifestyle"
          priority
        />
         <div className="absolute inset-0 bg-gradient-to-r from-banner-background/80 via-banner-background/50 to-banner-background/80"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 id="promo-banner-heading" className="text-3xl md:text-5xl font-extrabold mb-6">
          <span className="block text-banner-text-primary">Grab Up to</span>
          <span className="block text-primary">50% Off</span>
          <span className="block text-banner-text-primary">on Selected Headphones</span>
        </h2>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-10 py-6 text-lg font-semibold shadow-md transition-transform hover:scale-105">
          Buy Now
        </Button>
      </div>
    </section>
  );
};

export default PromotionalBanner;
