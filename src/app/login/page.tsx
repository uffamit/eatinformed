
'use client';

import { AuthForm } from '@/components/features/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/check');
        }
    }, [user, loading, router]);


    if (loading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader className="text-center">
          <CardTitle>Welcome to EatInformed</CardTitle>
          <CardDescription>Sign in or create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
            <AuthForm onAuthSuccess={() => router.push('/check')} />
        </CardContent>
      </Card>
    </div>
  );
}
