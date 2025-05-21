
'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, ShoppingCart, ChevronDown, LogOut, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import { popularCategories } from '@/data/categories';
import { useCart } from '@/context/CartContext';
import { useState, type KeyboardEvent, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useSession, signOut } from 'next-auth/react'; // Import useSession and signOut

const Header = () => {
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const hasMounted = useHasMounted();
  const { data: session, status } = useSession(); // Get session data
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    const baseLinkClasses = cn(
      "px-3 py-2 rounded-md text-sm font-medium text-header-foreground whitespace-nowrap hover:text-accent",
      isMobile && "block w-full text-left px-4 py-3 text-base"
    );
    const activeLinkClass = "text-accent font-semibold";
    
    const getLinkClass = (href: string) => cn(
      baseLinkClasses,
      pathname === href ? activeLinkClass : ''
    );
    
    const categoriesButtonClass = cn(
        baseLinkClasses, 
        "flex items-center",
        "hover:bg-transparent data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
    );

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={categoriesButtonClass}
            >
              Categories <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {popularCategories.map((category) => (
              <DropdownMenuItem key={category.id} asChild onClick={() => isMobile && setIsMobileMenuOpen(false)}>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </DropdownMenuItem>
            ))}
             <DropdownMenuItem asChild onClick={() => isMobile && setIsMobileMenuOpen(false)}>
              <Link href="/category/all">All Categories</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/deals" className={getLinkClass('/deals')} onClick={() => isMobile && setIsMobileMenuOpen(false)}>Deals</Link>
        <Link href="/whats-new" className={getLinkClass('/whats-new')} onClick={() => isMobile && setIsMobileMenuOpen(false)}>What&apos;s New</Link>
        <Link href="/delivery" className={getLinkClass('/delivery')} onClick={() => isMobile && setIsMobileMenuOpen(false)}>Delivery</Link>
      </>
    );
  };
  
  const UserMenu = () => {
    if (status === 'loading') {
      return <div className="h-9 w-20 bg-muted/30 rounded animate-pulse"></div>; // Placeholder for loading state
    }
    if (session) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center h-9 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-header-foreground hover:text-accent">
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
        <Link href="/auth" className="hidden sm:inline-block text-xs sm:text-sm font-medium text-header-foreground hover:text-accent px-1 sm:px-2 py-2 rounded-md">
          Sign Up / Login
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent sm:hidden" asChild>
          <Link href="/auth"><User className="h-5 w-5" /></Link>
        </Button>
      </>
    );
  };

  return (
    <header
      className={cn(
        "text-header-foreground sticky top-0 z-50 transition-all duration-300 ease-in-out",
        hasMounted && isScrolled ? "bg-card shadow-lg" : "bg-header-background shadow-md"
      )}
    >
      <div className="container mx-auto px-4">
        {/* --- TOP ROW --- */}
        <div className="flex items-center justify-between py-3 gap-2 sm:gap-4">
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Search bar - visible on all, more prominent on md+ */}
          <div className="hidden md:flex flex-grow min-w-0 sm:flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg relative">
            <Input
              type="search"
              placeholder="Search products..."
              className={cn(
                "h-9 pr-10 pl-3 sm:pl-4 w-full text-xs sm:text-sm rounded-md border-primary/30 focus:placeholder:text-muted-foreground",
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
              className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side icons/links */}
          <div className="flex items-center shrink-0 space-x-1 sm:space-x-2">
            <div className="hidden md:flex items-center">
              <UserMenu />
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
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-header-foreground hover:bg-accent/20 hover:text-accent">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-3/4 max-w-sm p-0 flex flex-col">
                  <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <Logo />
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
                          className={cn(
                            "h-9 pr-10 pl-3 w-full text-xs rounded-md border-primary/30 focus:placeholder:text-muted-foreground",
                            "text-foreground placeholder:text-muted-foreground bg-card focus:bg-card"
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
                    <NavLinks isMobile={true} />
                    <DropdownMenuSeparator />
                     <div className="pt-2">
                      {session ? (
                        <>
                          <Link href="/account" className="flex items-center px-4 py-3 text-base font-medium text-header-foreground hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                            <User className="mr-3 h-5 w-5" /> My Account
                          </Link>
                          <button
                            onClick={() => { signOut({ callbackUrl: '/' }); setIsMobileMenuOpen(false); }}
                            className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-header-foreground hover:text-accent"
                          >
                            <LogOut className="mr-3 h-5 w-5" /> Logout
                          </button>
                        </>
                      ) : (
                        <Link href="/auth" className="flex items-center px-4 py-3 text-base font-medium text-header-foreground hover:text-accent" onClick={() => setIsMobileMenuOpen(false)}>
                           <User className="mr-3 h-5 w-5" /> Sign Up / Login
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* --- BOTTOM ROW (NAVIGATION) - Hidden on <md --- */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 lg:gap-x-4 py-2 border-t border-primary/20">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
};

export default Header;
