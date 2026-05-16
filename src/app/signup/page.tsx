'use client';

import { AuthForm } from '@/components/features/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EatInformedLogo } from '@/components/icons/NutriScanLogo';
import Link from 'next/link';

export default function SignupPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/check');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return (
            <div className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-12 px-4 relative z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="w-full max-w-md transform transition-all duration-500 hover:scale-[1.01]">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
              <EatInformedLogo width={48} height={48} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">EatInformed</h1>
          </Link>
        </div>
        
        <Card className="bg-background/60 backdrop-blur-2xl border-border/30 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <CardHeader className="text-center space-y-2 pb-6 pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
            <CardDescription className="text-base text-muted-foreground">Join EatInformed to start tracking your food</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
              <AuthForm initialTab="signup" onAuthSuccess={() => router.push('/check')} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
