'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

export default function MerchantStoreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const { currentMerchant } = useMerchantAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for hydration
    if (typeof window === 'undefined') return;

    // Check if user is authenticated
    if (!currentMerchant) {
      router.replace('/merchant');
      return;
    }

    // Check if the store belongs to the logged-in user
    const userStoreIds = currentMerchant.storeIds || [];
    const hasAccess = userStoreIds.includes(storeId) || currentMerchant.primaryStoreId === storeId;

    if (!hasAccess) {
      // Redirect to primary store
      const primaryStoreId = currentMerchant.primaryStoreId;
      if (primaryStoreId) {
        router.replace(`/merchant/store/${primaryStoreId}`);
      } else {
        // No primary store, redirect to merchant landing
        router.replace('/merchant');
      }
      return;
    }

    // User is authorized
    setIsAuthorized(true);
    setIsChecking(false);
  }, [currentMerchant, storeId, router]);

  // Show loading while checking authorization
  if (isChecking && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Render children only if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
