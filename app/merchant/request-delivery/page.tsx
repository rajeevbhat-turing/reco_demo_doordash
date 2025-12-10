'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';

/**
 * Route: /merchant/request-delivery
 *
 * Redirects to /merchant/store/[id]/request-delivery with the current store ID
 */
export default function RequestDeliveryRedirect() {
  const router = useRouter();
  const { currentStoreId } = useCurrentStore();

  useEffect(() => {
    // Redirect to the store-specific request delivery route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/request-delivery`);
    } else {
      // Redirect to merchant landing page if no store ID is set
      router.replace('/merchant');
    }
  }, [currentStoreId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to request delivery...</p>
      </div>
    </div>
  );
}
