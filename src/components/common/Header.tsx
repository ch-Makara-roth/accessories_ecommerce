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


const Header = () => {
  const cartItemCount = 1; // Placeholder for actual cart item count

  return (
    <header className="bg-header-background text-header-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-header-foreground hover:bg-primary/80 hover:text-header-foreground px-3 py-2 rounded-md text-sm font-medium">
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
          <Link href="/deals" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Deals</Link>
          <Link href="/whats-new" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">What's New</Link>
          <Link href="/delivery" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Delivery</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-primary/80 hover:text-header-foreground">
            <Search className="h-5 w-5 mr-1 md:mr-2" />
            <span className="hidden md:inline">Search</span>
          </Button>
          <Link href="/auth" className="hidden sm:inline hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Sign Up / Login</Link>
          <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-primary/80 hover:text-header-foreground">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-primary/80 hover:text-header-foreground relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      {/* Mobile Navigation (optional, basic for now) */}
      <div className="md:hidden flex flex-wrap justify-center items-center space-x-2 p-2 border-t border-primary/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-primary/80 hover:text-header-foreground">
                Categories <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {popularCategories.map((category) => (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/category/${category.slug}`}>{category.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/deals" className="hover:text-gray-300 px-2 py-1 text-xs">Deals</Link>
          <Link href="/whats-new" className="hover:text-gray-300 px-2 py-1 text-xs">What's New</Link>
          <Link href="/delivery" className="hover:text-gray-300 px-2 py-1 text-xs">Delivery</Link>
          <Link href="/auth" className="sm:hidden hover:text-gray-300 px-2 py-1 text-xs">Login</Link>
      </div>
    </header>
  );
};

export default Header;
