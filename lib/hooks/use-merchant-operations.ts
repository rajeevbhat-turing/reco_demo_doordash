'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';

interface OperationsMetrics {
  ratings: number; // Average rating from reviews
  avoidableCancellationsRate: number; // Percentage of cancelled orders
  averageWait: number; // Average wait time in minutes
  missingIncorrectRate: number; // Percentage of orders with missing/incorrect items
  downtime: number; // Percentage of time store is closed/unavailable
}

/**
 * Hook to calculate operations metrics for a merchant store
 * Uses merchant-specific APIs and stores (not user-side)
 */
export function useMerchantOperations(storeId: string | null) {
  // Get orders from merchant orders store
  const { orders: allOrders } = useMerchantOrdersStore();

  // Filter orders for this store
  const orders = useMemo(() => {
    if (!storeId) return [];
    return allOrders.filter((order: any) => {
      const orderStoreId = order.storeId || order.restaurantId;
      return String(orderStoreId) === String(storeId);
    });
  }, [allOrders, storeId]);

  // Fetch reviews from merchant API
  const { data: reviews = [] } = useQuery({
    queryKey: ['merchant-operations-reviews', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const response = await fetch(`/api/merchant/reviews/${storeId}?approvalStatus=approved`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!storeId,
  });

  const metrics = useMemo<OperationsMetrics>(() => {
    // Calculate average rating from merchant reviews
    const ratings =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
          reviews.length
        : 0;

    // Calculate avoidable cancellations rate
    const cancelledOrders = orders.filter(
      (order: any) => order.status?.toLowerCase() === 'cancelled'
    ).length;
    const avoidableCancellationsRate =
      orders.length > 0 ? (cancelledOrders / orders.length) * 100 : 0;

    // For now, these are placeholder calculations
    // In a real system, these would come from order fulfillment data
    const averageWait = 0; // Would calculate from order fulfillment times
    const missingIncorrectRate = 0; // Would calculate from order issues/complaints
    const downtime = 0; // Would calculate from store hours vs actual availability

    return {
      ratings: Math.round(ratings * 10) / 10, // Round to 1 decimal place
      avoidableCancellationsRate: Math.round(avoidableCancellationsRate * 10) / 10,
      averageWait,
      missingIncorrectRate,
      downtime,
    };
  }, [orders, reviews]);

  return metrics;
}
