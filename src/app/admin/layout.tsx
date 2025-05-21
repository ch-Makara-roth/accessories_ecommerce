
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ShoppingBag, Users, Settings, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Shopcart',
  description: 'Admin panel for Shopcart',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    // Future admin sections can be added here
    // { href: '/admin/orders', label: 'Orders', icon: Package },
    // { href: '/admin/users', label: 'Customers', icon: Users },
    // { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 h-screen w-64 bg-background border-r hidden md:flex flex-col">
        <div className="flex items-center justify-center h-16 border-b px-6">
          <Link href="/admin" className="text-2xl font-bold text-primary">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start text-left"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/">Back to Shop</Link>
            </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 h-16 flex items-center justify-between bg-background border-b px-6 md:justify-end">
             <div className="md:hidden">
                <Link href="/admin" className="text-xl font-bold text-primary">
                    Admin
                </Link>
             </div>
            {/* User/Auth section for admin */}
            <div>
                <Button variant="outline" size="sm">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Admin User
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
