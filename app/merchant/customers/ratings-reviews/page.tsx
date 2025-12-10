'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';

/**
 * Route: /merchant/customers/ratings-reviews
 *
 * Redirects to /merchant/store/[id]/customers/ratings-reviews with the current store ID
 */
export default function RatingsReviewsRedirect() {
  const router = useRouter();
  const { currentStoreId } = useCurrentStore();

  useEffect(() => {
    // Redirect to the store-specific ratings & reviews route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/customers/ratings-reviews`);
    } else {
      // Redirect to merchant landing page if no store ID is set
      router.replace('/merchant');
    }
  }, [currentStoreId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to ratings & reviews...</p>
      </div>
    </div>
  );
}
