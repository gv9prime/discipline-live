'use client';

import React, { useEffect } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { AppLayout } from '@/components/AppLayout';
import { useFirebase } from '@/components/FirebaseProvider';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect if it's a real Firebase user OR if it's our bypassed local user with email
      if (user.uid !== 'local-user' || user.email) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 flex flex-col items-center">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </AppLayout>
  );
}
