
'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Note: Metadata export is for Server Components.
// Since this layout is now a client component ('use client'),
// the static metadata export has been removed to prevent errors.
// If global metadata is needed, it should be handled in a parent server component
// or by other means suitable for client components (e.g. dynamic updates via useEffect for document.title).

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`antialiased font-sans bg-background text-foreground`} suppressHydrationWarning>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            {!isAdminPage && <Header />}
            <main className={`flex-grow ${!isAdminPage ? 'container mx-auto px-4 py-8' : ''}`}>
              {children}
            </main>
            {!isAdminPage && <Footer />}
          </div>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
