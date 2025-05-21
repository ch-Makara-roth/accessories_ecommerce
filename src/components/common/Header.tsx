
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const Header = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header 
      className={cn(
        "text-header-foreground sticky top-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-card shadow-lg" : "bg-header-background shadow-md"
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-header-foreground hover:bg-accent/20 hover:text-accent px-3 py-2 rounded-md text-sm font-medium">
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
          <Link href="/deals" className="hover:text-accent px-3 py-2 rounded-md text-sm font-medium">Deals</Link>
          <Link href="/whats-new" className="hover:text-accent px-3 py-2 rounded-md text-sm font-medium">What's New</Link>
          <Link href="/delivery" className="hover:text-accent px-3 py-2 rounded-md text-sm font-medium">Delivery</Link>
        </nav>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative flex items-center">
            <Input
              type="search"
              placeholder="Search products..."
              className={cn(
                "h-9 pr-10 pl-3 text-sm text-header-foreground placeholder:text-header-foreground/70 border-primary/30 focus:placeholder:text-primary-foreground/70",
                isScrolled ? "bg-background focus:bg-background text-primary-foreground" : "bg-card focus:bg-card text-primary-foreground"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <Link href="/auth" className="hidden sm:inline hover:text-accent px-3 py-2 rounded-md text-sm font-medium">Sign Up / Login</Link>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
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
      {/* Mobile Navigation (optional, basic for now) */}
      <div className="md:hidden flex flex-wrap justify-center items-center space-x-2 p-2 border-t border-primary/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-accent/20 hover:text-accent">
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
          <Link href="/deals" className="hover:text-accent px-2 py-1 text-xs">Deals</Link>
          <Link href="/whats-new" className="hover:text-accent px-2 py-1 text-xs">What's New</Link>
          <Link href="/delivery" className="hover:text-accent px-2 py-1 text-xs">Delivery</Link>
          <Link href="/auth" className="sm:hidden hover:text-accent px-2 py-1 text-xs">Login</Link>
      </div>
    </header>
  );
};

export default Header;
