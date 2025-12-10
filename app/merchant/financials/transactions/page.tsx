'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';

/**
 * Route: /merchant/financials/transactions
 *
 * Redirects to /merchant/store/[id]/financials/transactions with the current store ID
 */
export default function TransactionsRedirect() {
  const router = useRouter();
  const { currentStoreId } = useCurrentStore();

  useEffect(() => {
    // Redirect to the store-specific transactions route
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/financials/transactions`);
    } else {
      // Redirect to merchant landing page if no store ID is set
      router.replace('/merchant');
    }
  }, [currentStoreId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to transactions...</p>
      </div>
    </div>
  );
}
