
'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, ShoppingCart, ChevronDown, LogOut, Menu as MenuIcon, X as XIcon, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import type { Category } from '@/types'; // Import Category type
import { useCart } from '@/context/CartContext';
import { useState, type KeyboardEvent, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const hasMounted = useHasMounted();
  const { data: session, status: sessionStatus } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data: Category[] = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories for header:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load categories for navigation.' });
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
    const baseLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-header-foreground whitespace-nowrap";
    const hoverClass = "hover:text-accent"; // Use accent for hover on main nav links
    const activeLinkClass = "text-accent font-semibold";
    
    const getLinkClass = (href: string) => cn(
      baseLinkClasses,
      hoverClass,
      pathname === href ? activeLinkClass : ''
    );
    
    const categoriesButtonClass = cn(
        baseLinkClasses, 
        "flex items-center", // Ensure icon and text are aligned
        // When dropdown is open, apply active-like styling
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        // Normal hover for the button itself
        "hover:bg-accent hover:text-accent-foreground" 
    );

    const mobileNavItemClass = "block w-full text-left px-4 py-3 text-base hover:bg-muted/10";


    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(isMobile ? mobileNavItemClass : categoriesButtonClass, "flex items-center")}
            >
              Categories {isLoadingCategories && !isMobile ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {isLoadingCategories ? (
              <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <DropdownMenuItem key={category.id} asChild onClick={() => isMobile && setIsMobileMenuOpen(false)}>
                  <Link href={`/category/${category.slug}`}>{category.name}</Link>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
            )}
             <DropdownMenuItem asChild onClick={() => isMobile && setIsMobileMenuOpen(false)}>
              <Link href="/category/all">All Products</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/deals" className={isMobile ? mobileNavItemClass : getLinkClass('/deals')} onClick={() => isMobile && setIsMobileMenuOpen(false)}>Deals</Link>
        <Link href="/whats-new" className={isMobile ? mobileNavItemClass : getLinkClass('/whats-new')} onClick={() => isMobile && setIsMobileMenuOpen(false)}>What&apos;s New</Link>
        <Link href="/delivery" className={isMobile ? mobileNavItemClass : getLinkClass('/delivery')} onClick={() => isMobile && setIsMobileMenuOpen(false)}>Delivery</Link>
      </>
    );
  };
  
  const UserAuthLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
    const baseClass = isMobile 
      ? "flex items-center w-full text-left px-4 py-3 text-base font-medium text-header-foreground hover:bg-muted/10"
      : "h-9 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-header-foreground hover:text-accent";

    if (sessionStatus === 'loading') {
      return isMobile 
        ? <div className={cn(baseClass, "animate-pulse bg-muted/30")}>Loading...</div>
        : <div className="h-9 w-20 bg-muted/30 rounded animate-pulse"></div>;
    }
    if (session) {
      return isMobile ? (
        <>
          <Link href="/account" className={baseClass} onClick={() => setIsMobileMenuOpen(false)}>
            <User className="mr-3 h-5 w-5" /> My Account
          </Link>
          <button
            onClick={() => { signOut({ callbackUrl: '/' }); setIsMobileMenuOpen(false); }}
            className={baseClass}
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn(baseClass, "flex items-center")}>
              <User className="h-5 w-5 mr-0 sm:mr-1" />
              <span className="hidden sm:inline truncate max-w-[100px]">{session.user?.email || session.user?.name || 'Account'}</span>
              <ChevronDown className="h-4 w-4 ml-1 hidden sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/account">My Account</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <>
        <Link 
            href="/auth" 
            className={isMobile ? baseClass : cn(baseClass, "hidden sm:inline-block")}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {isMobile && <User className="mr-3 h-5 w-5" />} Sign Up / Login
        </Link>
        {!isMobile && (
             <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent sm:hidden" asChild>
                <Link href="/auth"><User className="h-5 w-5" /></Link>
            </Button>
        )}
      </>
    );
  };

  return (
    <header
      className={cn(
        "text-header-foreground sticky top-0 z-50 transition-all duration-300 ease-in-out",
        hasMounted && isScrolled ? "bg-card shadow-lg" : "bg-header-background" // Removed initial shadow-md for cleaner look if not scrolled
      )}
    >
      <div className="container mx-auto px-4">
        {/* --- TOP ROW --- */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Search bar - more prominent */}
          <div className="hidden lg:flex flex-grow min-w-0 flex-1 max-w-md xl:max-w-lg relative mx-auto">
            <Input
              type="search"
              placeholder="Search headphones, speakers, and more..."
              className={cn(
                "h-10 pr-12 pl-4 w-full text-sm rounded-md border-primary/30 focus:placeholder:text-muted-foreground",
                "text-foreground placeholder:text-muted-foreground",
                hasMounted && isScrolled ? "bg-background focus:bg-background" : "bg-card focus:bg-card"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-accent/20 hover:text-accent"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side icons/links */}
          <div className="flex items-center shrink-0 space-x-1 sm:space-x-2">
            <div className="hidden lg:flex items-center">
              <UserAuthLinks />
            </div>
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
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-3/4 max-w-xs p-0 flex flex-col bg-card">
                  <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}><Logo /></Link>
                    <SheetTrigger asChild>
                       <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <XIcon className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetTrigger>
                  </SheetHeader>
                  <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    <div className="relative mb-4">
                       <Input
                          type="search"
                          placeholder="Search products..."
                          className="h-10 pr-10 pl-3 w-full text-sm rounded-md border-primary/30 focus:placeholder:text-muted-foreground text-foreground placeholder:text-muted-foreground bg-background focus:bg-background"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-accent/20 hover:text-accent"
                          onClick={handleSearch}
                          aria-label="Search"
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    <NavLinks isMobile={true} />
                    <DropdownMenuSeparator />
                     <div className="pt-2">
                      <UserAuthLinks isMobile={true} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* --- BOTTOM ROW (NAVIGATION) - Hidden on <lg screens --- */}
        <nav className="hidden lg:flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 lg:gap-x-4 py-2 border-t border-primary/10">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;
