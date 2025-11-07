'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';

export default function ConsumerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (currentUser === null) {
      router.push('/home');
    }
  }, [currentUser, router]);

  // Don't render children if not authenticated
  if (currentUser === null) {
    return null;
  }

  return <>{children}</>;
}

