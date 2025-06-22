
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: number;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    // No need to set loading to true here, causes flicker on every call
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    verifyAuth();

    // Listen for storage changes to sync across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        setLoading(true);
        verifyAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [verifyAuth]);

  return { user, loading, verifyAuth };
}
