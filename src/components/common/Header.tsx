
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"; // Added SheetClose
import type { Category } from '@/types';
import { useCart } from '@/context/CartContext';
import { useState, type KeyboardEvent, useEffect, useCallback }
from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
        const errorData = await response.json().catch(() => ({error: 'Failed to fetch categories for header'}));
        throw new Error(errorData.error || 'Failed to fetch categories');
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
      setIsScrolled(window.scrollY > 20); // Increased threshold slightly
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      setSearchQuery(''); 
    }
  }, [isMobileMenuOpen]);

  const handleSearch = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent<HTMLInputElement>) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch(event);
    }
  };

  const NavLinks = ({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) => {
    const baseLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-header-foreground whitespace-nowrap";
    const hoverClass = "hover:text-accent"; 
    const activeLinkClass = "text-accent font-semibold";
    
    const getLinkClass = (href: string) => cn(
      baseLinkClasses,
      hoverClass,
      pathname === href ? activeLinkClass : '',
      isMobile ? "block w-full text-left py-3 text-base" : "inline-flex items-center"
    );
    
    const categoriesButtonClass = cn(
        baseLinkClasses, 
        "flex items-center", 
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        isMobile ? "block w-full text-left py-3 text-base" : "hover:bg-accent hover:text-accent-foreground"
    );

    return (
      <>
        {isMobile ? (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories-mobile" className="border-b-0">
                    <AccordionTrigger className={cn(categoriesButtonClass, "justify-between hover:no-underline hover:bg-transparent")}>
                        Categories {isLoadingCategories ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : null}
                    </AccordionTrigger>
                    <AccordionContent className="pl-4">
                        {isLoadingCategories ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">Loading...</p>
                        ) : categories.length > 0 ? (
                          categories.map((category) => (
                            <Link key={category.id} href={`/category/${category.slug}`} className={getLinkClass(`/category/${category.slug}`)} onClick={onLinkClick}>
                              {category.name}
                            </Link>
                          ))
                        ) : (
                          <p className="px-3 py-2 text-sm text-muted-foreground">No categories.</p>
                        )}
                        <Link href="/category/all" className={getLinkClass('/category/all')} onClick={onLinkClick}>
                          All Products
                        </Link>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={categoriesButtonClass}
              >
                Categories {isLoadingCategories ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isLoadingCategories ? (
                <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link href={`/category/${category.slug}`}>{category.name}</Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
              )}
               <DropdownMenuItem asChild>
                <Link href="/category/all">All Products</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Link href="/deals" className={getLinkClass('/deals')} onClick={onLinkClick}>Deals</Link>
        <Link href="/whats-new" className={getLinkClass('/whats-new')} onClick={onLinkClick}>What&apos;s New</Link>
        <Link href="/delivery" className={getLinkClass('/delivery')} onClick={onLinkClick}>Delivery</Link>
      </>
    );
  };
  
  const UserAuthLinks = ({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) => {
    const baseClass = isMobile 
      ? "flex items-center w-full text-left px-4 py-3 text-base font-medium text-header-foreground hover:bg-muted/10"
      : "h-9 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-header-foreground hover:text-accent";

    if (sessionStatus === 'loading') {
      return isMobile 
        ? <div className={cn(baseClass, "animate-pulse bg-muted/30")}>Loading...</div>
        : <div className="h-9 w-20 bg-muted/30 rounded animate-pulse"></div>;
    }
    if (session) {
      return (
        <>
          <Link href="/account" className={baseClass} onClick={onLinkClick}>
            <User className="mr-3 h-5 w-5" /> {isMobile ? 'My Account' : <span className="hidden sm:inline truncate max-w-[100px]">{session.user?.email || session.user?.name || 'Account'}</span>}
            {!isMobile && <ChevronDown className="h-4 w-4 ml-1 hidden sm:inline" />}
          </Link>
          <button
            onClick={() => { signOut({ callbackUrl: '/' }); if(onLinkClick) onLinkClick(); }}
            className={cn(baseClass, isMobile ? '' : 'hover:bg-destructive/10 hover:text-destructive')}
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </>
      );
    }
    return (
      <Link 
          href="/auth" 
          className={baseClass}
          onClick={onLinkClick}
      >
        {isMobile && <User className="mr-3 h-5 w-5" />} Sign Up / Login
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "text-header-foreground sticky top-0 z-50 transition-all duration-300 ease-in-out",
        hasMounted && isScrolled ? "bg-card shadow-lg" : "bg-header-background"
      )}
    >
      <div className="container mx-auto px-4">
        {/* --- TOP ROW --- */}
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Search bar - visible on md and up */}
          <div className="hidden md:flex flex-grow min-w-0 max-w-lg relative mx-auto">
            <Input
              type="search"
              placeholder="Search products..."
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
            {/* User Auth Links for md and up */}
            <div className="hidden md:flex items-center space-x-1">
              <UserAuthLinks onLinkClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <Link href="/cart" passHref>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {hasMounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-3/4 max-w-xs p-0 flex flex-col bg-card">
                  <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <Logo />
                    <SheetClose asChild>
                       <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <XIcon className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
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
                    <NavLinks isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
                    <DropdownMenuSeparator />
                     <div className="pt-2 space-y-1">
                      <UserAuthLinks isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* --- BOTTOM ROW (NAVIGATION) - Hidden on <md screens --- */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 lg:gap-x-4 py-2 border-t border-primary/10">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;

