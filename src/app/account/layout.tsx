
'use client';

import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Bell, Settings, UserCircle, Package, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/common/Logo'; // Assuming a Logo component exists

interface AccountNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navItems: AccountNavItem[] = [
    { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/account/orders', label: 'My Orders', icon: Package },
    { href: '/account/notifications', label: 'Notifications', icon: Bell },
    { href: '/account/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };
  
  useEffect(() => {
    // Close sheet on route change
    setIsSheetOpen(false);
  }, [pathname]);

  const renderNavItems = () => navItems.map((item) => (
    <Button
      key={item.label}
      variant="ghost"
      className={cn(
        "w-full justify-start text-left rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/80",
        isActive(item.href)
          ? "bg-primary/10 text-primary font-semibold hover:text-primary"
          : "text-foreground/80 hover:text-foreground"
      )}
      asChild
    >
      <Link href={item.href}>
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        {item.label}
      </Link>
    </Button>
  ));

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-muted/40"> {/* Adjust min-height if header/footer heights are dynamic */}
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 h-screen w-60 bg-background border-r hidden md:flex flex-col">
        <div className="flex items-center justify-center h-16 border-b px-6">
          <Link href="/account" className="text-xl font-bold text-primary">
            My Account
          </Link>
        </div>
        <nav className="flex-grow p-2 space-y-1">
          {renderNavItems()}
        </nav>
         <div className="p-4 border-t mt-auto">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Back to Shop</Link>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
         {/* Mobile Header with Menu Trigger */}
        <header className="sticky top-0 h-16 flex items-center justify-between bg-background border-b px-4 md:hidden">
          <Link href="/account" className="text-xl font-bold text-primary">
            My Account
          </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 sm:w-60 p-0 flex flex-col">
              <SheetHeader className="flex flex-row items-center justify-between h-16 border-b px-4 py-2">
                <Link href="/account" className="text-xl font-bold text-primary" onClick={() => setIsSheetOpen(false)}>
                  My Account
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="text-muted-foreground">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                </Button>
              </SheetHeader>
              <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                {renderNavItems()}
              </nav>
              <div className="p-4 border-t mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/" onClick={() => setIsSheetOpen(false)}>Back to Shop</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
