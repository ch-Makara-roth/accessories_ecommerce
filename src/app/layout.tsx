
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import AuthSessionProvider from '@/components/providers/AuthSessionProvider'; // Import the SessionProvider

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Metadata was removed previously because this became a client component.
// If you need to set global metadata, it's typically done in a higher-level Server Component
// or you manage document.title dynamically for client-rendered sections.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isAccountPage = pathname.startsWith('/account');
  const showMainHeaderFooter = !isAdminPage && !isAccountPage;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`antialiased font-sans bg-background text-foreground`} suppressHydrationWarning>
        <AuthSessionProvider> {/* Wrap with AuthSessionProvider */}
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {showMainHeaderFooter && <Header />}
              <main className={`flex-grow ${showMainHeaderFooter ? 'container mx-auto px-4 py-8' : ''}`}>
                {children}
              </main>
              {showMainHeaderFooter && <Footer />}
            </div>
            <Toaster />
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
