import { useMemo } from 'react';
import { useMerchantOrders } from './use-merchant-orders';
import { Order } from '@/constants/order-data';

interface MerchantMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
}

/**
 * Hook to calculate sales metrics from orders for a merchant store
 */
export function useMerchantMetrics(storeId: string | null) {
  const { data: orders = [], isLoading } = useMerchantOrders(storeId);

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
    const totalSales = orders.reduce((sum: number, order: Order) => {
      return sum + (order.total || 0);
    }, 0);

    const totalOrders = orders.length;

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Count unique customers (by user_id if available, or by order)
    const uniqueCustomers = new Set(
      orders
        .map((order: Order) => {
          // Try to get user ID from order, fallback to order ID for guest orders
          return (order as any).userId || order.id;
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

