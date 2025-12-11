import { useMemo } from 'react';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';

interface MerchantMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
}

/**
 * Hook to calculate sales metrics from orders for a merchant store
 * Uses merchant-orders-store (not user-side store)
 */
export function useMerchantMetrics(storeId: string | null) {
  // Get orders from merchant orders store
  const { orders: allOrders = [] } = useMerchantOrdersStore();

  // Filter orders for this store
  const orders = useMemo(() => {
    if (!storeId) return [];
    return allOrders.filter((order: any) => {
      const orderStoreId = order.storeId || order.restaurantId;
      return String(orderStoreId) === String(storeId);
    });
  }, [allOrders, storeId]);

  const isLoading = false; // No loading since we're using store

  const metrics = useMemo<MerchantMetrics>(() => {
    if (!orders || orders.length === 0) {
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
      };
    }

    // Calculate metrics from orders
    const totalSales = orders.reduce((sum: number, order: any) => {
      return sum + (order.total || 0);
    }, 0);

    const totalOrders = orders.length;

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Count unique customers (by user_id if available, or by order)
    const uniqueCustomers = new Set(
      orders
        .map((order: any) => {
          // Try to get user ID from order, fallback to order ID for guest orders
          return order.userId || order.id;
        })
        .filter(Boolean)
    );

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      totalCustomers: uniqueCustomers.size,
    };
  }, [orders]);

  return {
    metrics,
    isLoading,
  };
}
