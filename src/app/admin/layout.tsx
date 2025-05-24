
'use client';

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
  List,
  Shapes,
  Search,
  Menu,
  X,
  LogOut,
  Truck as DeliveryIcon, // Added DeliveryIcon
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, type KeyboardEvent } from 'react';
import type { AdminNotification } from '@/types';
import { useSession, signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Role } from '@prisma/client'; 

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: AdminNavItem[];
  isAccordion?: boolean;
  badgeCount?: number;
  allowedRoles: Role[]; 
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const { toast } = useToast();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const userRole = session?.user?.role;
  const allowedAdminAccessRoles: Role[] = [Role.ADMIN, Role.SELLER, Role.STOCK, Role.DELIVERY]; // Added DELIVERY

  useEffect(() => {
    if (status === 'loading') return; 
    if (status === 'unauthenticated' || !session || !userRole || !allowedAdminAccessRoles.includes(userRole)) {
      router.push('/auth?error=AccessDeniedAdmin'); 
    }
  }, [session, status, userRole, router, allowedAdminAccessRoles]);


  useEffect(() => {
    if (!session || !userRole || !allowedAdminAccessRoles.includes(userRole)) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/admin/notifications?unread=true');
        if (response.ok) {
          const data: AdminNotification[] = await response.json();
          setUnreadNotificationsCount(data.length);
        } else {
          console.error('Failed to fetch unread notifications count for admin layout');
        }
      } catch (error) {
        console.error('Error fetching unread notifications count for admin layout:', error);
      }
    };
    fetchUnreadCount();
  }, [session, userRole, allowedAdminAccessRoles]);

  const navItems: AdminNavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: [Role.ADMIN, Role.SELLER, Role.STOCK, Role.DELIVERY] },
    {
      href: '/admin/products',
      label: 'Products',
      icon: ShoppingBag,
      isAccordion: true,
      subItems: [
        { href: '/admin/products', label: 'Product List', icon: List, allowedRoles: [Role.ADMIN, Role.SELLER, Role.STOCK] },
        { href: '/admin/products/categories', label: 'Categories', icon: Shapes, allowedRoles: [Role.ADMIN, Role.SELLER] },
      ],
      allowedRoles: [Role.ADMIN, Role.SELLER, Role.STOCK], 
    },
    { href: '/admin/sales', label: 'Order Management', icon: DollarSign, allowedRoles: [Role.ADMIN, Role.SELLER] }, // Renamed Sales to Order Management
    { href: '/admin/delivery', label: 'Delivery Management', icon: DeliveryIcon, allowedRoles: [Role.ADMIN, Role.DELIVERY] }, // New Delivery Management link
    { href: '/admin/users', label: 'Users', icon: Users, allowedRoles: [Role.ADMIN] },
    { href: '/admin/analytics', label: 'Analytics', icon: LineChart, allowedRoles: [Role.ADMIN] },
    {
      href: '/admin/notifications',
      label: 'Notifications',
      icon: Bell,
      badgeCount: unreadNotificationsCount,
      allowedRoles: [Role.ADMIN, Role.SELLER, Role.STOCK, Role.DELIVERY],
    },
    { href: '/admin/settings', label: 'Settings', icon: Settings, allowedRoles: [Role.ADMIN] },
  ];

  const isActive = (href: string, isExact: boolean = true) => {
    if (isExact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const handleAdminSearchSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && adminSearchTerm.trim()) {
      console.log('Admin search submitted:', adminSearchTerm);
      toast({
        title: 'Admin Search (Placeholder)',
        description: `Searched for: "${adminSearchTerm}". Implement actual search logic.`,
      });
    }
  };
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); 
    setIsSheetOpen(false);
  };

  const renderNavItems = () => navItems
    .filter(item => userRole && item.allowedRoles.includes(userRole)) 
    .map((item) =>
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
              item.subItems?.some(sub => isActive(sub.href)) && "text-foreground/80 hover:text-foreground"
            )}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-0 pl-4">
            <div className="space-y-1">
            {item.subItems
              .filter(subItem => userRole && subItem.allowedRoles.includes(userRole)) 
              .map((subItem) => (
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

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading admin area...</p>
      </div>
    );
  }

  if (!session || !userRole || !allowedAdminAccessRoles.includes(userRole)) {
    return (
         <div className="flex justify-center items-center min-h-screen bg-muted/40">
            <p className="text-lg text-destructive">Access Denied. Redirecting...</p>
         </div>
    );
  }

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
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
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
            <SheetContent side="left" className="w-3/4 max-w-xs p-0 flex flex-col">
                <SheetHeader className="flex flex-row items-center justify-between h-16 border-b px-4 py-2">
                   <Link href="/admin" onClick={() => setIsSheetOpen(false)}>
                     <SheetTitle>Admin Menu</SheetTitle>
                   </Link>
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setIsSheetOpen(false)}>
                        <XIcon className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </SheetHeader>
                <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                    {renderNavItems()}
                </nav>
                 <div className="p-4 border-t mt-auto">
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
            </SheetContent>
          </Sheet>

          <div className="md:hidden text-xl font-bold text-primary">
             {/* Placeholder for mobile title if needed */}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center gap-2">
              {isSearchVisible ? (
                <>
                  <Input
                    type="search"
                    placeholder="Search admin..."
                    className="h-9 w-40 md:w-56 text-sm"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    onKeyDown={handleAdminSearchSubmit}
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={() => { setIsSearchVisible(false); setAdminSearchTerm(''); }}>
                    <X className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Close search</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsSearchVisible(true)}
                >
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Search</span>
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Admin Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {session?.user?.name || session?.user?.email || 'Admin Account'} ({userRole})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
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
