import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <div className="bg-primary p-2 rounded-full group-hover:opacity-90 transition-opacity">
        <ShoppingCart className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <span className="text-2xl font-bold text-header-foreground group-hover:opacity-90 transition-opacity">Shopcart</span>
        <p className="text-xs text-header-foreground opacity-80 group-hover:opacity-70 transition-opacity">Your Shopping Partner</p>
      </div>
    </Link>
  );
};

export default Logo;
