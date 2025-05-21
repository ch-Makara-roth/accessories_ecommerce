
'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, ShoppingCart, ChevronDown, Menu as MenuIcon, X } from 'lucide-react'; // Added MenuIcon and X
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; // Added Sheet components
import { popularCategories } from '@/data/categories';
import { useCart } from '@/context/CartContext';
import { useState, type KeyboardEvent, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const Header = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For Sheet

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
    setIsMobileMenuOpen(false); // Close mobile menu on route change
  }, [pathname]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false); // Close mobile menu on search
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
    const baseLinkClasses = "px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-header-foreground whitespace-nowrap";
    const activeLinkClass = "text-accent font-semibold";

    const commonLinkProps = {
      onClick: () => setIsMobileMenuOpen(false),
    };

    const getLinkClass = (href: string) => cn(
      baseLinkClasses,
      "hover:text-accent", // This hover is for non-button Links
      pathname === href ? activeLinkClass : ''
    );
    
    const categoriesButtonClass = cn(
        baseLinkClasses, 
        "flex items-center", // Keep flex for icon alignment
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground" // Style for open state
    );


    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={categoriesButtonClass} // Uses Button's ghost variant for hover
              {...(isMobile ? commonLinkProps : {})}
            >
              Categories <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {popularCategories.map((category) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link href={`/category/${category.slug}`} {...commonLinkProps}>{category.name}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild>
              <Link href="/category/all" {...commonLinkProps}>All Categories</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/deals" className={getLinkClass('/deals')} {...commonLinkProps}>Deals</Link>
        <Link href="/whats-new" className={getLinkClass('/whats-new')} {...commonLinkProps}>What's New</Link>
        <Link href="/delivery" className={getLinkClass('/delivery')} {...commonLinkProps}>Delivery</Link>
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

          {/* Unified Search Bar - Visible on md+ */}
          <div className="hidden md:flex flex-grow min-w-0 sm:flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg relative">
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

          {/* Right side: Auth links and Icons (Desktop/Tablet) */}
          <div className="hidden md:flex items-center shrink-0 space-x-1 sm:space-x-2">
            <Link href="/auth" className="text-xs sm:text-sm font-medium text-header-foreground hover:text-accent px-1 sm:px-2 py-2 rounded-md">
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

          {/* Mobile-only controls: Search, Cart, Menu */}
          <div className="flex md:hidden items-center space-x-1">
            {/* Mobile Search - can be a button that opens an input or a compact input */}
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="top" className="p-4">
                    <div className="flex items-center gap-2">
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className={cn(
                                "h-10 flex-grow text-sm rounded-md border-primary/30 focus:placeholder:text-muted-foreground",
                                "text-foreground placeholder:text-muted-foreground",
                                isScrolled ? "bg-background focus:bg-background" : "bg-card focus:bg-card"
                            )}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Button
                            type="button"
                            variant="default"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => { handleSearch(); }}
                            aria-label="Search"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>


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
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/4 sm:w-1/2 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center justify-between">
                    <Logo />
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </SheetClose>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-2">
                  <NavLinks isMobile={true} />
                  <Separator className="my-3" />
                   <Link href="/auth" passHref>
                        <Button variant="ghost" className="w-full justify-start text-base font-medium text-header-foreground hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                            <User className="mr-2 h-5 w-5" /> Sign Up / Login
                        </Button>
                    </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* --- BOTTOM ROW (NAVIGATION) - Desktop/Tablet --- */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 lg:gap-x-4 py-2 border-t border-primary/20">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;
