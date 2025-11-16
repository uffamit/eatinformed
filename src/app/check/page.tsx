
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CheckPageClient } from '@/components/features/ImageUploadForm';
import { Loader2 } from 'lucide-react';

export default function CheckPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While loading, show a full-screen loader to prevent content flash
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there is a user, render the main page content
  if (user) {
    return <CheckPageClient />;
  }

  // If not loading and no user, this will be briefly rendered before redirect kicks in.
  // Or it will be shown if the redirect fails for some reason.
  return null;
}
