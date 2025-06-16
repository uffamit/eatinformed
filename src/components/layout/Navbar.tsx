
'use client';

import Link from 'next/link';
import { NutriScanLogo } from '@/components/icons/NutriScanLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PackageSearch, HomeIcon, LogIn, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/check', label: 'Check Product', icon: PackageSearch },
];

const authNavItems = [
  { href: '/login', label: 'Log In', icon: LogIn },
  { href: '/signup', label: 'Sign Up', icon: UserPlus },
]

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label="NutriScan Home">
          <NutriScanLogo />
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

        <div className="hidden md:flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 p-4">
                <Link href="/" className="flex items-center space-x-2 mb-4" aria-label="NutriScan Home">
                  <NutriScanLogo />
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                     <Link href="/signup">
                      <UserPlus className="mr-2 h-4 w-4" />
                       Sign Up
                     </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
