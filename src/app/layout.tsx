
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import ParticleBackground from '@/components/layout/ParticleBackground';
import FloatingIcons from '@/components/layout/FloatingIcons';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Default metadata, can be overridden by individual pages
export const metadata: Metadata = {
  title: 'EatInformed - AI Nutrition Analysis',
  description: 'Transform your nutrition with AI power. Upload a food label for instant analysis of ingredients, health, and dietary suitability.',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EatInformed',
  url: 'https://eatinformed.amitdivekar.qzz.io/',
  logo: 'https://eatinformed.amitdivekar.qzz.io/favicon.png', 
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ParticleBackground />
        <FloatingIcons />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="bg-transparent text-muted-foreground text-center py-6 text-sm">
          © {new Date().getFullYear()} EatInformed. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
