
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, PartyPopper, Home, Loader2 } from 'lucide-react';
import { NutriScanLogo } from '@/components/icons/NutriScanLogo';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  username: string;
  email: string;
  // Add other fields if you store more data in Firestore user profile
}

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          // Fallback if Firestore profile doesn't exist, use auth display name
          setUserProfile({ 
            username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || 'No email'
          });
        }
      } else {
        router.replace('/login'); // Redirect to login if not authenticated
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
        <Card className="w-full max-w-lg shadow-xl p-8">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <CardTitle className="text-3xl font-headline">Loading Welcome Page...</CardTitle>
          <CardDescription>Please wait while we fetch your details.</CardDescription>
        </Card>
      </div>
    );
  }
  
  if (!user || !userProfile) {
    // This case should ideally be handled by the redirect in useEffect,
    // but acts as a fallback or if data fetching failed.
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
        <Card className="w-full max-w-lg shadow-xl p-8">
            <CardTitle className="text-3xl font-headline">Error</CardTitle>
            <CardDescription>Could not load user data. Please try logging in again.</CardDescription>
            <Button asChild className="mt-4">
                <Link href="/login">Go to Login</Link>
            </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-8 text-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <PartyPopper className="mr-3 h-8 w-8 text-primary" />
            Welcome, {userProfile.username}!
          </CardTitle>
          <CardDescription className="text-lg">
            We're glad to have you here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center bg-muted/30 p-6 rounded-lg shadow-inner">
            <NutriScanLogo width={150} height={150} />
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
