
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';
import { useState, type FormEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.warn("LoginPage: Firebase Auth instance not available on mount. Check .env configuration and Firebase initialization in src/lib/firebase.ts.");
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/welcome');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
     if (!email || !password) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter both email and password.'});
      return;
    }
    setIsLoading(true);

    if (!auth) {
      console.error("LoginPage: Firebase Auth instance is not available for handleSubmit. Check Firebase initialization in src/lib/firebase.ts and ensure .env variables are correct. Login cannot proceed.");
      toast({ variant: 'destructive', title: 'Configuration Error', description: 'Authentication service is not available. Please contact support or check console logs.' });
      setIsLoading(false);
      return;
    }

    try {
      console.log("LoginPage: Attempting signInWithEmailAndPassword...");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("LoginPage: Login successful.");
      toast({
        title: 'Login Successful!',
        description: 'Redirecting to your welcome page...',
      });
      router.push('/welcome');
    } catch (error: any) {
      console.error("LoginPage: Login error:", error.code, error.message, error);
      let errorMessage = 'An unexpected error occurred during login.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase authentication configuration is missing or incorrect. Please check the setup (especially .env file and Firebase project settings). Contact support if this persists.';
      } else if (error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes('offline'))) {
        errorMessage = 'Cannot connect to Firebase. Please check your internet connection and Firebase configuration in .env.';
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline flex items-center justify-center">
            <LogIn className="mr-2 h-7 w-7 text-primary" />
            Log In to NutriScan
          </CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>              
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6 shadow-md hover:shadow-primary/40 transition-shadow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
