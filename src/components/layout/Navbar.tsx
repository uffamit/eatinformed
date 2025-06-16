
'use client';

import Link from 'next/link';
import { NutriScanLogo } from '@/components/icons/NutriScanLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PackageSearch, HomeIcon, LogIn, UserPlus, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/check', label: 'Check Product', icon: PackageSearch },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false); // To prevent hydration mismatch

  useEffect(() => {
    setIsClient(true); // Indicates component has mounted on client
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isUserLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
    }
  }, [pathname]); // Re-check on pathname change to reflect login/logout across pages

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isUserLoggedIn');
      localStorage.removeItem('loggedInUsername');
    }
    setIsLoggedIn(false);
    router.push('/'); // Redirect to home page after logout
  };

  // Mobile navigation items need to be dynamic based on login state
  const mobileNavItems = [...navItems];
  const mobileAuthActions = isLoggedIn ? (
    <Button variant="outline" className="w-full" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Log Out
    </Button>
  ) : (
    <>
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
    </>
  );


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

        {isClient && ( // Only render auth buttons on client after hydration check
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}


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
                {mobileNavItems.map((item) => (
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
                {isClient && ( // Only render auth buttons on client
                  <div className="border-t pt-4 space-y-2">
                    {mobileAuthActions}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
