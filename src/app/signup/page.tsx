
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { useState, type FormEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase'; // Ensure db is imported
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!auth) {
        console.warn("SignUpPage: Firebase Auth instance not available on mount. Check .env configuration and Firebase initialization in src/lib/firebase.ts.");
        // Optionally, you could show a specific error toast here if auth is persistently null
        return;
    }
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/welcome');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUsernameValidation = async (uname: string): Promise<boolean> => {
    if (!db) {
      console.error("Firestore instance (db) is not available. Check Firebase initialization in src/lib/firebase.ts and .env configuration.");
      toast({ variant: 'destructive', title: 'Configuration Error', description: 'Cannot connect to database. Please check configuration or contact support.' });
      return false;
    }
    if (uname.length < 3 || uname.length > 20) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Username must be between 3 and 20 characters.' });
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(uname)) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Username can only contain letters, numbers, and underscores.' });
      return false;
    }

    const usernameDocRef = doc(db, 'usernames', uname.toLowerCase());
    try {
      const usernameDoc = await getDoc(usernameDocRef);
      if (usernameDoc.exists()) {
        toast({ variant: 'destructive', title: 'Username Unavailable', description: 'This username is already taken. Please choose another.' });
        return false;
      }
    } catch (error: any) {
      console.error("Error checking username (likely connectivity or config issue):", error.code, error.message, error);
      // This is where "client is offline" or similar errors surface for getDoc
      toast({ variant: 'destructive', title: 'Error', description: "Can't validate username. Check connection or try later." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in all fields.'});
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Password Mismatch', description: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Weak Password', description: 'Password must be at least 6 characters long.' });
      return;
    }
    
    if (!auth) {
      console.error("SignUp Error: Firebase Auth instance is not available. Check Firebase initialization in src/lib/firebase.ts and ensure .env variables are correct.");
      toast({ variant: 'destructive', title: 'Configuration Error', description: 'Authentication service is not available. Please contact support or check console logs.' });
      setIsLoading(false);
      return;
    }
     if (!db) {
      console.error("SignUp Error: Firestore instance (db) is not available. Check Firebase initialization in src/lib/firebase.ts and ensure .env variables (especially NEXT_PUBLIC_FIREBASE_PROJECT_ID) are correct.");
      toast({ variant: 'destructive', title: 'Configuration Error', description: 'Database service is not available. Please contact support or check console logs.' });
      setIsLoading(false);
      return;
    }


    setIsLoading(true);

    const isUsernameValid = await handleUsernameValidation(username);
    if (!isUsernameValid) {
      setIsLoading(false);
      return;
    }

    let createdUserId: string | null = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      createdUserId = user.uid; 

      await updateProfile(user, { displayName: username });
      
      // Firestore transaction
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', user.uid);
        const usernameDocRef = doc(db, 'usernames', username.toLowerCase());

        // It's good practice to re-check username inside transaction for race conditions
        const freshUsernameDoc = await transaction.get(usernameDocRef);
        if (freshUsernameDoc.exists()) {
          // This specific error will be caught and handled below
          throw new Error("Username was claimed during sign-up. Please try a different username.");
        }
        
        transaction.set(userDocRef, {
          uid: user.uid,
          email: user.email,
          username: username,
          displayName: username, // Store consistently
          createdAt: serverTimestamp(),
        });
        transaction.set(usernameDocRef, { uid: user.uid });
      });

      toast({
        title: 'Sign Up Successful!',
        description: 'Redirecting to your welcome page...',
      });
      
      router.push('/welcome');

    } catch (error: any) {
      console.error("Sign up error:", error.code, error.message, error);
      let errorMessage = 'An unexpected error occurred during sign up. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in or use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. Please choose a stronger password.';
      } else if (error.message && error.message.includes("Username was claimed")) {
        errorMessage = error.message; // Use the specific message from the transaction
        // If username was claimed after auth user was created, sign out the partially created user.
        if (auth.currentUser && auth.currentUser.uid === createdUserId) {
          await signOut(auth); 
        }
      } else if (error.code === 'unavailable' || (error.message && error.message.toLowerCase().includes('offline'))) {
        errorMessage = 'Cannot connect to Firebase. Please check your internet connection and Firebase configuration in .env. See browser console for details.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
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
            <UserPlus className="mr-2 h-7 w-7 text-primary" />
            Create Your NutriScan Account
          </CardTitle>
          <CardDescription>Join us to start analyzing your food products.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username (3-20 chars, a-z, 0-9, _)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]+$"
              />
            </div>
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
                placeholder="Create a strong password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6 shadow-md hover:shadow-primary/40 transition-shadow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
