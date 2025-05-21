
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
  Search, // Added Search import
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { usePathname } from 'next/navigation';

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
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
    { href: '/admin/users', label: 'Customers', icon: Users }, // Assuming /admin/users for customers
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string, isExact: boolean = true) => {
    if (isExact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 h-screen w-64 bg-background border-r hidden md:flex flex-col">
        <div className="flex items-center justify-center h-16 border-b px-6">
          <Link href="/admin" className="text-2xl font-bold text-primary">
            {/* Using existing name, Spodut is from image */}
            Admin Panel
          </Link>
        </div>
        <nav className="flex-grow p-2 space-y-1">
          {navItems.map((item) =>
            item.isAccordion && item.subItems ? (
              <Accordion key={item.label} type="single" collapsible className="w-full" defaultValue={isActive(item.href, false) ? item.label : undefined}>
                <AccordionItem value={item.label} className="border-b-0">
                  <AccordionTrigger
                    className={cn(
                      "w-full justify-start text-left hover:no-underline hover:bg-muted/80 rounded-md px-3 py-2 text-sm font-medium",
                      isActive(item.href, false) && !item.subItems?.some(sub => isActive(sub.href)) && "bg-muted text-primary",
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
                          "w-full justify-start text-left hover:bg-muted/80 rounded-md px-3 py-2 text-sm font-medium",
                          isActive(subItem.href) ? "bg-primary/10 text-primary font-semibold" : "text-foreground/80"
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
                  "w-full justify-start text-left hover:bg-muted/80 rounded-md px-3 py-2 text-sm font-medium",
                  isActive(item.href) ? "bg-primary/10 text-primary font-semibold" : "text-foreground/80"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              </Button>
            )
          )}
        </nav>
        <div className="p-4 border-t mt-auto">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Back to Shop</Link>
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 h-16 flex items-center justify-between bg-background border-b px-6 md:justify-end">
          <div className="md:hidden"> {/* For mobile view, if a toggle is added later */}
            <Link href="/admin" className="text-xl font-bold text-primary">
              Admin
            </Link>
          </div>
          <div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
             <Button variant="ghost" size="icon" className="rounded-full ml-2">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
