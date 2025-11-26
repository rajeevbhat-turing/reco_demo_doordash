'use client'

import { useMemo } from 'react'
import { useStoreApprovedReviews } from './use-reviews'
import { useMerchantOrders } from './use-merchant-orders'
import { Order } from '@/constants/order-data'

interface OperationsMetrics {
  ratings: number // Average rating from reviews
  avoidableCancellationsRate: number // Percentage of cancelled orders
  averageWait: number // Average wait time in minutes
  missingIncorrectRate: number // Percentage of orders with missing/incorrect items
  downtime: number // Percentage of time store is closed/unavailable
}

/**
 * Hook to calculate operations metrics for a merchant store
 */
export function useMerchantOperations(storeId: string | null) {
  const { data: orders = [] } = useMerchantOrders(storeId)
  const { data: reviews = [] } = useStoreApprovedReviews(storeId || '')

  const metrics = useMemo<OperationsMetrics>(() => {
    // Calculate average rating from reviews
    const ratings = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    // Calculate avoidable cancellations rate
    const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length
    const avoidableCancellationsRate = orders.length > 0
      ? (cancelledOrders / orders.length) * 100
      : 0

    // For now, these are placeholder calculations
    // In a real system, these would come from order fulfillment data
    const averageWait = 0 // Would calculate from order fulfillment times
    const missingIncorrectRate = 0 // Would calculate from order issues/complaints
    const downtime = 0 // Would calculate from store hours vs actual availability

    return {
      ratings: Math.round(ratings * 10) / 10, // Round to 1 decimal place
      avoidableCancellationsRate: Math.round(avoidableCancellationsRate * 10) / 10,
      averageWait,
      missingIncorrectRate,
      downtime,
    }
  }, [orders, reviews])

  return metrics
}

