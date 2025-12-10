'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';

export default function MarketingRedirect() {
  const router = useRouter();
  const { currentStoreId } = useCurrentStore();

  useEffect(() => {
    if (currentStoreId) {
      router.replace(`/merchant/store/${currentStoreId}/marketing/campaigns`);
    } else {
      // Redirect to merchant landing page if no store ID is set
      router.replace('/merchant');
    }
  }, [currentStoreId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to marketing...</p>
      </div>
    </div>
  );
}
