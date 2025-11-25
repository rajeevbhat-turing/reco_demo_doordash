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
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

