
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, PartyPopper, Home } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // This code runs only on the client side
    const storedUsername = localStorage.getItem('loggedInUsername');
    const isLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';

    if (!isLoggedIn) {
      router.replace('/login'); // Redirect to login if not authenticated
    } else {
      setUsername(storedUsername);
    }
  }, [router]);

  if (username === null && typeof window !== 'undefined' && localStorage.getItem('isUserLoggedIn') === 'true') {
    // Still loading username or it's genuinely not set but logged in
    // You could show a loading spinner here if desired
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
        <Card className="w-full max-w-lg shadow-xl p-8">
          <PartyPopper className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Loading Welcome Page...</CardTitle>
        </Card>
      </div>
    );
  }
  
  if (!username && (typeof window === 'undefined' || localStorage.getItem('isUserLoggedIn') !== 'true')) {
    // If not logged in (e.g. direct navigation, or logout happened), this will be caught by useEffect redirect
    // but this is a fallback for SSR or initial render before useEffect runs
    return null; 
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <PartyPopper className="mr-3 h-8 w-8 text-primary" />
            Welcome, {username || 'User'}!
          </CardTitle>
          <CardDescription className="text-lg">
            We're glad to have you here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/300x200.png"
              data-ai-hint="celebration confetti"
              alt="Welcome illustration"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
          <p className="text-muted-foreground">
            You're all set to start exploring and making healthier food choices.
            What would you like to do next?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="shadow-md hover:shadow-primary/40 transition-shadow">
              <Link href="/check">
                <Smile className="mr-2 h-5 w-5" />
                Scan a Product
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
