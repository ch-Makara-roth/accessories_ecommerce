
'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, ShoppingCart, ChevronDown, Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Effect to close sheet on route change or search
  useEffect(() => {
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only depend on pathname for route changes

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); 
      if (isSheetOpen) setIsSheetOpen(false); // Close sheet if open
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Reusable NavLinks component
  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
    const linkAction = isMobile ? () => setIsSheetOpen(false) : undefined;
    const commonLinkClass = "text-header-foreground hover:text-accent";
    const mobileLinkClass = "block px-4 py-3 text-base font-medium hover:bg-accent/20";
    const desktopLinkClass = "px-3 py-2 rounded-md text-sm font-medium";

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                commonLinkClass,
                isMobile ? `${mobileLinkClass} w-full justify-start` : desktopLinkClass
              )}
              onClick={isMobile ? (e) => e.stopPropagation() : undefined} // Prevent sheet close for dropdown trigger
            >
              Categories <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {popularCategories.map((category) => (
              <DropdownMenuItem key={category.id} asChild onClick={linkAction}>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild onClick={linkAction}>
              <Link href="/category/all">All Categories</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/deals" className={cn(commonLinkClass, isMobile ? mobileLinkClass : desktopLinkClass)} onClick={linkAction}>Deals</Link>
        <Link href="/whats-new" className={cn(commonLinkClass, isMobile ? mobileLinkClass : desktopLinkClass)} onClick={linkAction}>What's New</Link>
        <Link href="/delivery" className={cn(commonLinkClass, isMobile ? mobileLinkClass : desktopLinkClass)} onClick={linkAction}>Delivery</Link>
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
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="container mx-auto px-4">
          {/* --- TOP ROW --- */}
          <div className="flex items-center justify-between py-3">
            <Logo />

            {/* Tablet/Desktop Search (centered) */}
            <div className="hidden md:flex flex-1 max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg mx-auto items-center relative px-2 sm:px-4">
              <Input
                type="search"
                placeholder="Search products..."
                className={cn(
                  "h-9 pr-10 pl-4 w-full text-sm rounded-md border-primary/30 focus:placeholder:text-muted-foreground",
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
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent"
                onClick={handleSearch}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* Tablet/Desktop Right side: Auth links and Icons */}
            <div className="hidden md:flex items-center space-x-1 sm:space-x-3">
              <Link href="/auth" className="text-sm font-medium text-header-foreground hover:text-accent px-2 sm:px-3 py-2 rounded-md">
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

            {/* Mobile Right side: Search input and Icons */}
            <div className="flex md:hidden items-center space-x-2">
              <div className="relative flex items-center flex-grow max-w-[150px] xs:max-w-[180px] sm:max-w-xs">
                 <Input
                    type="search"
                    placeholder="Search..."
                    className={cn(
                      "h-9 pr-10 pl-3 text-sm text-header-foreground placeholder:text-header-foreground/70 border-primary/30 focus:placeholder:text-muted-foreground",
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
              <Link href="/cart" passHref>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent relative shrink-0">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Cart</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent shrink-0">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
            </div>
          </div>

          {/* --- BOTTOM ROW (TABLET/DESKTOP NAV) --- */}
          <nav className="hidden md:flex items-center justify-center space-x-1 lg:space-x-4 py-2 border-t border-primary/20">
            <NavLinks />
          </nav>
        </div>

        <SheetContent side="left" className="bg-card p-0 w-full max-w-xs sm:max-w-sm text-header-foreground overflow-y-auto">
          <SheetHeader className="p-4 border-b border-primary/20 flex flex-row justify-between items-center space-x-2">
            <SheetTitle><Logo /></SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-header-foreground">
                <CloseIcon className="h-6 w-6" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="py-2 space-y-1">
            <NavLinks isMobile />
            <div className="border-t border-primary/20 mx-4 my-2"></div>
            <Link href="/auth" className="block w-full text-left px-4 py-3 text-base font-medium text-header-foreground hover:bg-accent/20 hover:text-accent rounded-md" onClick={() => setIsSheetOpen(false)}>
              Sign Up / Login
            </Link>
            <Link href="/auth" className="block w-full text-left px-4 py-3 text-base font-medium text-header-foreground hover:bg-accent/20 hover:text-accent rounded-md" onClick={() => setIsSheetOpen(false)}>
               Account
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
