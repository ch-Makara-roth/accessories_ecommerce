
'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, ShoppingCart, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { popularCategories } from '@/data/categories';
import { useCart } from '@/context/CartContext';
import { useState, type KeyboardEvent, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Header = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Potentially close any open dropdowns on route change if needed in the future
  }, [pathname]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Reusable NavLinks component, simplified for consistent layout
  const NavLinks = () => {
    const linkClass = "px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-header-foreground hover:text-accent whitespace-nowrap";

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(linkClass, "flex items-center")}
            >
              Categories <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {popularCategories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Link href="/category/all">All Categories</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/deals" className={linkClass}>Deals</Link>
        <Link href="/whats-new" className={linkClass}>What's New</Link>
        <Link href="/delivery" className={linkClass}>Delivery</Link>
      </>
    );
  };

  return (
    <header
      className={cn(
        "text-header-foreground sticky top-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-card shadow-lg" : "bg-header-background shadow-md"
      )}
    >
      <div className="container mx-auto px-4">
        {/* --- TOP ROW --- */}
        <div className="flex items-center justify-between py-3 gap-2 sm:gap-4">
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Unified Search Bar */}
          <div className="flex-grow min-w-0 sm:flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg relative">
            <Input
              type="search"
              placeholder="Search products..."
              className={cn(
                "h-9 pr-10 pl-3 sm:pl-4 w-full text-xs sm:text-sm rounded-md border-primary/30 focus:placeholder:text-muted-foreground",
                "text-foreground placeholder:text-muted-foreground",
                isScrolled ? "bg-background focus:bg-background" : "bg-card focus:bg-card"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Unified Right side: Auth links and Icons */}
          <div className="flex items-center shrink-0 space-x-1 sm:space-x-2">
            <Link href="/auth" className="hidden sm:inline-block text-xs sm:text-sm font-medium text-header-foreground hover:text-accent px-1 sm:px-2 py-2 rounded-md">
              Sign Up / Login
            </Link>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent" asChild>
              <Link href="/auth"><User className="h-5 w-5" /></Link>
            </Button>
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* --- BOTTOM ROW (NAVIGATION) --- */}
        <nav className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 lg:gap-x-4 py-2 border-t border-primary/20">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;
