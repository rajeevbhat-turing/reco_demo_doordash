'use client'

import { useMemo } from 'react'
import { useMerchantOrders } from './use-merchant-orders'
import { Order } from '@/constants/order-data'

interface CustomerSegments {
  new: number // Customers with 1 order
  occasional: number // Customers with 2-4 orders
  returning: number // Customers with 5+ orders
}

/**
 * Hook to calculate customer segments for a merchant store
 */
export function useMerchantCustomers(storeId: string | null) {
  const { data: orders = [] } = useMerchantOrders(storeId)

  const segments = useMemo<CustomerSegments>(() => {
    // Group orders by customer (userId)
    const customerOrderCounts = new Map<string, number>()
    
    orders.forEach((order: Order) => {
      const userId = (order as any).userId || order.id // Use userId if available, fallback to order.id
      if (userId) {
        customerOrderCounts.set(userId, (customerOrderCounts.get(userId) || 0) + 1)
      }
    })

    // Categorize customers
    let newCustomers = 0
    let occasionalCustomers = 0
    let returningCustomers = 0

    customerOrderCounts.forEach((orderCount) => {
      if (orderCount === 1) {
        newCustomers++
      } else if (orderCount >= 2 && orderCount <= 4) {
        occasionalCustomers++
      } else if (orderCount >= 5) {
        returningCustomers++
      }
    })

    return {
      new: newCustomers,
      occasional: occasionalCustomers,
      returning: returningCustomers,
    }
  }, [orders])

  return segments
}

