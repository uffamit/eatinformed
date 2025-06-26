
'use client';

import Link from 'next/link';
import { EatInformedLogo } from '@/components/icons/NutriScanLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ScanLine } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it Works' },
  { href: '/#examples', label: 'Examples' },
  { href: '/#pricing', label: 'Pricing' },
];

export default function Navbar() {
  const pathname = usePathname();

  const mobileNavLinks = navItems.map(item => (
    <Link
      key={`mobile-${item.href}`}
      href={item.href}
      className={cn(
        "block rounded-md p-2 transition-colors hover:bg-secondary text-lg",
        pathname === item.href ? "bg-secondary text-primary" : "text-foreground/80"
      )}
    >
      {item.label}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="EatInformed Home">
          <EatInformedLogo width={36} height={36} />
           <span className="font-bold text-xl hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">EatInformed</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative transition-colors hover:text-primary after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                pathname === item.href ? "text-primary" : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/30">
            <Link href="/check">
              Get Started
              <ScanLine className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background/95 backdrop-blur-lg">
                <div className="flex flex-col p-6">
                  <Link href="/" className="flex items-center space-x-2 mb-8" aria-label="EatInformed Home">
                    <EatInformedLogo width={32} height={32} />
                     <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">EatInformed</span>
                  </Link>
                  <div className="flex flex-col space-y-4">
                    {mobileNavLinks}
                  </div>
                  <Button asChild size="lg" className="mt-8 w-full">
                    <Link href="/check">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
