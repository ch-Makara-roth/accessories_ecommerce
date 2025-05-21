
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
        <AuthSessionProvider> {/* Wrap with AuthSessionProvider */}
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
        </AuthSessionProvider>
      </body>
    </html>
  );
}
