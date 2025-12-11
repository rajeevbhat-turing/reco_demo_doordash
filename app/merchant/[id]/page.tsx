'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';

/**
 * Route: /merchant/[id]
 *
 * Sets the current store in the merchant portal and redirects to merchant home
 * Example: /merchant/21 sets store 21 (Vietnamese Market) and redirects to /merchant
 */
export default function MerchantStoreRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { setCurrentStoreId } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();

  const storeIdParam = params.id as string;

  useEffect(() => {
    if (isLoading) return;

    // Try to find restaurant by numeric ID first
    let restaurant = restaurants?.find(r => r.id === storeIdParam);

    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants?.find(
        r =>
          r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
          r.name === storeIdParam
      );
    }

    if (restaurant) {
      // Set the current store ID (numeric ID as string)
      setCurrentStoreId(restaurant.id);
      // Set merchant mode flag in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true');
      }
      // Redirect to merchant store route (keeps URL as /merchant/store/[id])
      router.replace(`/merchant/store/${restaurant.id}`);
    } else {
      // Redirect to merchant landing page if no store ID is set
      router.replace('/merchant');
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, router]);

  // Show loading state while finding store
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Loading store...</p>
      </div>
    </div>
  );
}
