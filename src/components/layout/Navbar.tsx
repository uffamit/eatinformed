
'use client';

import Link from 'next/link';
import { EatInformedLogo } from '@/components/icons/NutriScanLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PackageSearch, HomeIcon, LogIn, UserPlus, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  // { href: '/check', label: 'Check Product', icon: PackageSearch }, // Temporarily disabled for debugging
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: isLoadingAuth, verifyAuth } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    verifyAuth(); // This will trigger the hook to update state to null
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/');
  };

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

  let mobileAuthActions;
  if (isLoadingAuth) {
    mobileAuthActions = <div className="flex justify-center p-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  } else if (user) {
    mobileAuthActions = (
      <>
        <DropdownMenuItem onClick={() => router.push('/welcome')} className="cursor-pointer justify-start p-2">
            <UserCircle className="mr-2 h-4 w-4" /> My Account
        </DropdownMenuItem>
        <Button variant="outline" className="w-full justify-start mt-2 p-2" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </>
    );
  } else {
    mobileAuthActions = (
      <>
        <Button variant="outline" className="w-full justify-start p-2" asChild>
          <Link href="/login" className="flex items-center">
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Link>
        </Button>
        <Button className="w-full justify-start mt-2 p-2" asChild>
          <Link href="/signup" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Link>
        </Button>
      </>
    );
  }

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
          {isLoadingAuth ? (
             <div className="hidden md:flex items-center justify-center h-8 w-20">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
             </div>
          ) : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <UserCircle className="h-6 w-6 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email.split('@')[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => router.push('/welcome')} className="cursor-pointer">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Welcome Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50 dark:focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
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
          )}
        
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
                  
                  <div className="border-t pt-4 mt-2 space-y-2">
                    {mobileAuthActions}
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
