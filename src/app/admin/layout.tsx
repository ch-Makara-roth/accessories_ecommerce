
'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  Users,
  LineChart,
  Bell,
  Settings,
  UserCircle,
  ChevronDown,
  List,
  Shapes,
  Search, // Added Search icon
  Menu, // Added Menu icon for mobile
  X, // Added X icon for mobile sheet close
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Added Sheet components
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Logo from '@/components/common/Logo'; // Assuming you might want a logo in the mobile sheet

// No static metadata for client component layout
// export const metadata: Metadata = {
//   title: 'Admin Dashboard - Spodut',
//   description: 'Admin panel for Spodut',
// };

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: AdminNavItem[];
  isAccordion?: boolean;
  badgeCount?: number; // Added for notification badge
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const mockUnreadNotifications = 3; // Placeholder for actual notification count

  const navItems: AdminNavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      href: '/admin/products',
      label: 'Products',
      icon: ShoppingBag,
      isAccordion: true,
      subItems: [
        { href: '/admin/products', label: 'Product List', icon: List },
        { href: '/admin/products/categories', label: 'Categories', icon: Shapes },
      ],
    },
    { href: '/admin/sales', label: 'Sales', icon: DollarSign },
    { href: '/admin/users', label: 'Customers', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
    {
      href: '/admin/notifications',
      label: 'Notifications',
      icon: Bell,
      badgeCount: mockUnreadNotifications, // Add badge count here
    },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string, isExact: boolean = true) => {
    if (isExact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    // Close sheet on route change
    setIsSheetOpen(false);
  }, [pathname]);

  const renderNavItems = (isMobileSheet: boolean = false) => navItems.map((item) =>
    item.isAccordion && item.subItems ? (
      <Accordion key={item.label} type="single" collapsible className="w-full" defaultValue={isActive(item.href, false) ? item.label : undefined}>
        <AccordionItem value={item.label} className="border-b-0">
          <AccordionTrigger
            className={cn(
              "w-full justify-between text-left hover:no-underline rounded-md px-3 py-2 text-sm font-medium",
              "hover:bg-muted/80",
              isActive(item.href, false) && !item.subItems?.some(sub => isActive(sub.href))
                ? "bg-muted text-primary hover:text-primary"
                : "text-foreground/80 hover:text-foreground",
              item.subItems?.some(sub => isActive(sub.href)) && "text-foreground/80 hover:text-foreground" // Ensure parent is not primary if child is active
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-0 pl-4">
            <div className="space-y-1">
            {item.subItems.map((subItem) => (
              <Button
                key={subItem.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/80",
                  isActive(subItem.href)
                    ? "bg-primary/10 text-primary font-semibold hover:text-primary"
                    : "text-foreground/80 hover:text-foreground"
                )}
                asChild
              >
                <Link href={subItem.href}>
                  <subItem.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {subItem.label}
                </Link>
              </Button>
            ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ) : (
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
        <Link href={item.href} className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.label}
          </div>
          {item.badgeCount && item.badgeCount > 0 && (
            <span className={cn(
              "ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full",
              isActive(item.href) ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
            )}>
              {item.badgeCount}
            </span>
          )}
        </Link>
      </Button>
    )
  );


  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-background border-r hidden md:flex flex-col">
        <div className="flex items-center justify-center h-16 border-b px-6">
          <Link href="/admin" className="text-2xl font-bold text-primary">
            Admin Panel
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
        <header className="sticky top-0 h-16 flex items-center justify-between bg-background border-b px-4 md:px-6">
          {/* Mobile Menu Trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 sm:w-64 p-0 flex flex-col">
                <SheetHeader className="flex flex-row items-center justify-between h-16 border-b px-4 py-2">
                    <Link href="/admin" className="text-xl font-bold text-primary" onClick={() => setIsSheetOpen(false)}>
                        Admin Panel
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="text-muted-foreground">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </SheetHeader>
                <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                    {renderNavItems(true)}
                </nav>
                <div className="p-4 border-t mt-auto">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/" onClick={() => setIsSheetOpen(false)}>Back to Shop</Link>
                    </Button>
                </div>
            </SheetContent>
          </Sheet>

          {/* Title for mobile view if needed, or leave empty */}
          <div className="md:hidden text-xl font-bold text-primary">
             {/* Can put current page title here if needed, or keep it clean */}
          </div>


          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="rounded-full hidden sm:inline-flex">
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">Search</span>
            </Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Admin Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert('Admin Profile clicked!')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Admin Logout clicked!')}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
