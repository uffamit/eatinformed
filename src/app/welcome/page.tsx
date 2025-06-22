
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, Home, Loader2 } from 'lucide-react';
import { EatInformedLogo } from '@/components/icons/NutriScanLogo';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth check is complete and there is no user, redirect to login.
    // Using replace so the user can't click "back" to a broken welcome page.
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // While loading, or if there's no user yet (before redirect happens), show a full-page loader.
  // This prevents any part of the welcome message from rendering with incomplete data.
  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
        <Card className="w-full max-w-lg shadow-xl p-8">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <CardTitle className="text-3xl font-headline">Verifying Session...</CardTitle>
          <CardDescription>Please wait while we check your credentials.</CardDescription>
        </Card>
      </div>
    );
  }
  
  // Only render the welcome content if loading is complete AND the user exists.
  const displayName = user.email.split('@')[0] || 'Valued User';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <PartyPopper className="mr-3 h-8 w-8 text-primary" />
            Welcome, {displayName}!
          </CardTitle>
          <CardDescription className="text-lg">
            We're glad to have you at EatInformed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mx-auto flex justify-center items-center aspect-square sm:w-full lg:order-last lg:max-w-[150px] shadow-xl bg-muted/30 p-8 rounded-xl">
            <EatInformedLogo width={150} height={150} />
          </div>
          <p className="text-muted-foreground">
            You're all set to start exploring and making healthier food choices.
            What would you like to do next?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-md" disabled>
                 Scan a Product (Temporarily Disabled)
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
