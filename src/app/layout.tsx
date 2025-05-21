import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ // Changed from Geist_Sans
  variable: '--font-inter', // Changed variable name
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Audio Emporium',
  description: 'Your Shopping Partner for Headphones',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`antialiased font-sans bg-background text-foreground`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
