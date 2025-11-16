
'use client';

import Link from 'next/link';
import { EatInformedLogo } from '@/components/icons/NutriScanLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User as UserIcon, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AuthForm } from '../features/AuthForm';

const navItems = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it Works' },
  { href: '/#pricing', label: 'Pricing' },
];

const AuthButton = () => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [openAuthDialog, setOpenAuthDialog] = useState(false);


  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      // Call the API route to clear the cookie
      await fetch('/api/auth/logout', { method: 'GET' });
      router.push('/'); // Redirect to home after sign out
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" className="rounded-full" size="icon">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </Button>
    );
  }

  if (user && userProfile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL ?? ''} alt={userProfile.name} />
              <AvatarFallback>
                {userProfile.name?.charAt(0).toUpperCase() || <UserIcon />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userProfile.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button onClick={() => setOpenAuthDialog(true)} className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/30">
        Login / Sign Up
        <UserIcon className="ml-2 h-4 w-4" />
      </Button>
      <Dialog open={openAuthDialog} onOpenChange={setOpenAuthDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="text-center text-2xl">Welcome to EatInformed</DialogTitle>
                <DialogDescription className="text-center">
                    Sign in or create an account to get started.
                </DialogDescription>
            </DialogHeader>
            <AuthForm onAuthSuccess={() => {
                setOpenAuthDialog(false);
                router.push('/check');
            }} />
        </DialogContent>
      </Dialog>
    </>
  );
};


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
           <span className="font-bold text-xl hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">EatInformed</span>
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
          <AuthButton />
          
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
                     <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">EatInformed</span>
                  </Link>
                  <div className="flex flex-col space-y-4">
                    {mobileNavLinks}
                  </div>
                  <Button asChild size="lg" className="mt-8 w-full">
                    <Link href="/login">Login / Sign Up</Link>
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
