
'use client';

import Link from 'next/link';
import { EatInformedLogo } from '@/components/icons/NutriScanLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PackageSearch, HomeIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/check', label: 'Check Product', icon: PackageSearch },
];

export default function Navbar() {
  const pathname = usePathname();

  const mobileNavLinks = navItems.map(item => (
    <Link
      key={`mobile-${item.href}`}
      href={item.href}
      className={cn(
        "flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground",
        pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
      )}
    >
      <item.icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="EatInformed Home">
          <EatInformedLogo width={32} height={32} />
           <span className="font-bold text-lg hidden sm:inline-block">EatInformed</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col space-y-2 p-4">
                  <Link href="/" className="flex items-center space-x-2 mb-4" aria-label="EatInformed Home">
                    <EatInformedLogo width={28} height={28} />
                     <span className="font-bold text-lg">EatInformed</span>
                  </Link>
                  <div className="flex flex-col space-y-1">
                    {mobileNavLinks}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
