
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'EatInformed - Know Your Food',
  description: 'Upload food package photos to get health insights and safety ratings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="bg-muted/50 text-muted-foreground text-center py-4 text-sm">
          © {new Date().getFullYear()} EatInformed. All rights reserved. Created by AmitDevX.
        </footer>
      </body>
    </html>
  );
}
