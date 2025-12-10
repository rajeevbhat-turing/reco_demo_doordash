'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';

/**
 * Route: /merchant/store-availability
 *
 * Redirects to /merchant/store/[id]/store-availability with the current store ID
 */
export default function StoreAvailabilityRedirect() {
  const router = useRouter();
  const { currentStoreId } = useCurrentStore();

  useEffect(() => {
    // Redirect to the store-specific store availability route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/store-availability`);
    } else {
      // Redirect to merchant landing page if no store ID is set
      router.replace('/merchant');
    }
  }, [currentStoreId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to store availability...</p>
      </div>
    </div>
  );
}
