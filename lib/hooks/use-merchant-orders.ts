import { useQuery } from '@tanstack/react-query';
import { fetchMerchantOrders } from '@/lib/api/orders';

/**
 * Hook to fetch orders for a merchant store
 */
export function useMerchantOrders(storeId: string | null) {
  return useQuery({
    queryKey: ['merchant-orders', storeId],
    queryFn: () => fetchMerchantOrders(storeId!),
    enabled: !!storeId,
    staleTime: 1000 * 5, // 5 seconds - more frequent updates
    refetchInterval: 1000 * 10, // Refetch every 10 seconds for real-time feel
  });
}

