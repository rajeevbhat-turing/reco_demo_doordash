'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

export default function DeliveryIndexPage() {
  const router = useRouter();
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.replace('/delivery/dashboard');
    } else {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4561ED] mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

