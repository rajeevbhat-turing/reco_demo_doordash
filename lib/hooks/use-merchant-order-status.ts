'use client';

import { useEffect, useRef } from 'react';
import { useMerchantOrdersStore, MerchantOrder } from '@/store/merchant-orders-store';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { getCurrentTimestamp } from '@/store/bootstrap-store';

// Configuration constants
const UPDATE_INTERVAL = 3000; // Check every 3 seconds
const STATUS_UPDATE_MULTIPLIER = 0.5; // Speed multiplier
const DELIVERY_AUTO_COMPLETE_HOURS = 2; // Auto-complete delivery orders after 2 hours
const PICKUP_SCHEDULED_GRACE_MINUTES = 1; // Grace period for pickup after scheduled

// Completed statuses - never auto-update
const COMPLETED_STATUSES = ['delivered', 'cancelled', 'returned', 'abandoned'];

// Manual statuses - restaurant handles these, no auto-update
const MANUAL_STATUSES = ['pending', 'confirmed'];

// Auto-progression from preparing (delivery only): preparing → dasher_assigned → dasher_waiting
const PREPARING_FLOW_DELIVERY = ['preparing', 'dasher_assigned', 'dasher_waiting'];

// Auto-progression from ready (delivery): ready → picked_up → on_the_way → dasher_nearby → delivered
const READY_FLOW_DELIVERY = ['ready', 'picked_up', 'on_the_way', 'dasher_nearby', 'delivered'];

// Auto-progression from ready (pickup): ready → scheduled (awaiting customer pickup)
const READY_FLOW_PICKUP = ['ready', 'scheduled'];

// Time thresholds for auto-progression (in seconds, before multiplier)
const PREPARING_TIMES_DELIVERY: Record<string, number> = {
  dasher_assigned: 30, // 30 seconds after preparing
  dasher_waiting: 60, // 60 seconds after preparing
};

const READY_TIMES_DELIVERY: Record<string, number> = {
  picked_up: 15, // 15 seconds after ready
  on_the_way: 30, // 30 seconds after ready
  dasher_nearby: 90, // 90 seconds after ready
  delivered: 120, // 120 seconds after ready
};

const READY_TIMES_PICKUP: Record<string, number> = {
  scheduled: 30, // 30 seconds after ready (awaiting customer pickup)
};

// Track when each order entered its current status
const statusStartTimes: Map<string, number> = new Map();

/**
 * Calculate the next status for an order based on elapsed time
 * Handles delivery and pickup orders differently
 */
function calculateNextStatus(order: MerchantOrder): string | null {
  const currentStatus = order.status.toLowerCase();
  const isPickup = order.fulfillmentType === 'Customer pickup';

  // Don't update completed orders
  if (COMPLETED_STATUSES.includes(currentStatus)) {
    return null;
  }

  // Check if order is old enough to auto-complete
  const orderDate = order.orderDate ? new Date(order.orderDate) : null;
  const now = getCurrentTimestamp(); // Supports simulated time

  // For DELIVERY orders: Auto-complete if order is more than 2 hours old (all non-completed statuses)
  if (!isPickup && orderDate) {
    const hoursSinceOrder = (now - orderDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceOrder >= DELIVERY_AUTO_COMPLETE_HOURS) {
      return 'delivered';
    }
  }

  // For PICKUP orders: Auto-complete if order is past grace period (all non-completed statuses)
  if (isPickup && orderDate) {
    const minutesSinceOrder = (now - orderDate.getTime()) / (1000 * 60);
    if (minutesSinceOrder >= PICKUP_SCHEDULED_GRACE_MINUTES) {
      return 'delivered';
    }
  }

  // Don't update manual statuses (pending, confirmed)
  if (MANUAL_STATUSES.includes(currentStatus)) {
    return null;
  }

  // For pickup orders: Don't auto-update during preparing phase
  // Restaurant manually marks as ready, then auto-progress to scheduled
  if (isPickup && currentStatus === 'preparing') {
    return null;
  }

  // Get or initialize start time for this order's current status
  const orderKey = `${order.id}-${currentStatus}`;
  if (!statusStartTimes.has(orderKey)) {
    statusStartTimes.set(orderKey, getCurrentTimestamp());
  }

  const statusStartTime = statusStartTimes.get(orderKey)!;
  const elapsedSeconds = (getCurrentTimestamp() - statusStartTime) / 1000; // Supports simulated time

  // Handle preparing flow (DELIVERY ONLY): preparing → dasher_assigned → dasher_waiting
  if (!isPickup && PREPARING_FLOW_DELIVERY.includes(currentStatus)) {
    const currentIndex = PREPARING_FLOW_DELIVERY.indexOf(currentStatus);

    // Check each subsequent status in the flow
    for (let i = PREPARING_FLOW_DELIVERY.length - 1; i > currentIndex; i--) {
      const targetStatus = PREPARING_FLOW_DELIVERY[i];
      const threshold = PREPARING_TIMES_DELIVERY[targetStatus] * STATUS_UPDATE_MULTIPLIER;

      if (elapsedSeconds >= threshold) {
        // Clean up old tracking key
        statusStartTimes.delete(orderKey);
        return targetStatus;
      }
    }
  }

  // Handle ready flow for DELIVERY: ready → picked_up → on_the_way → dasher_nearby → delivered
  if (!isPickup && READY_FLOW_DELIVERY.includes(currentStatus)) {
    const currentIndex = READY_FLOW_DELIVERY.indexOf(currentStatus);

    // Check each subsequent status in the flow
    for (let i = READY_FLOW_DELIVERY.length - 1; i > currentIndex; i--) {
      const targetStatus = READY_FLOW_DELIVERY[i];
      const threshold = READY_TIMES_DELIVERY[targetStatus] * STATUS_UPDATE_MULTIPLIER;

      if (elapsedSeconds >= threshold) {
        // Clean up old tracking key
        statusStartTimes.delete(orderKey);
        return targetStatus;
      }
    }
  }

  // Handle ready flow for PICKUP: ready → scheduled (awaiting customer pickup)
  if (isPickup && READY_FLOW_PICKUP.includes(currentStatus)) {
    const currentIndex = READY_FLOW_PICKUP.indexOf(currentStatus);

    // Check each subsequent status in the flow
    for (let i = READY_FLOW_PICKUP.length - 1; i > currentIndex; i--) {
      const targetStatus = READY_FLOW_PICKUP[i];
      const threshold = READY_TIMES_PICKUP[targetStatus] * STATUS_UPDATE_MULTIPLIER;

      if (elapsedSeconds >= threshold) {
        // Clean up old tracking key
        statusStartTimes.delete(orderKey);
        return targetStatus;
      }
    }
  }

  return null;
}

/**
 * Hook to automatically update merchant order statuses based on time progression
 * 
 * Auto-completion rules (applies to ALL non-completed statuses):
 * - DELIVERY: If order is more than 2 hours old → delivered
 * - PICKUP: If order is past grace period (1 min) after the scheduled time → delivered
 * 
 * Auto-progression rules (if not auto-completed):
 * - pending, confirmed: Manual by restaurant (no auto-update)
 * 
 * DELIVERY orders:
 * - preparing → dasher_assigned → dasher_waiting (auto)
 * - ready → picked_up → on_the_way → dasher_nearby → delivered (auto)
 * 
 * PICKUP orders:
 * - preparing: Manual by restaurant (no auto-update)
 * - ready → scheduled (auto, awaiting customer pickup)
 * 
 * - completed statuses: No auto-update
 */
export function useMerchantOrderStatus() {
  const { currentStoreId } = useCurrentStore();
  const orders = useMerchantOrdersStore(state => state.orders);
  const updateOrder = useMerchantOrdersStore(state => state.updateOrder);
  const prevOrdersRef = useRef<string>('');

  useEffect(() => {
    // Don't run if no store is selected
    if (!currentStoreId) {
      return;
    }

    // Clear status tracking when orders change significantly (new orders added, etc.)
    const ordersKey = orders.map(o => `${o.id}:${o.status}`).join(',');
    if (prevOrdersRef.current !== ordersKey) {
      // Keep existing tracking, just update the reference
      prevOrdersRef.current = ordersKey;
    }

    // Function to update all order statuses
    const updateStatuses = () => {
      orders.forEach(order => {
        const newStatus = calculateNextStatus(order);
        if (newStatus) {
          console.log(
            `[MERCHANT ORDER STATUS] Updating order ${order.id} from ${order.status} to ${newStatus}`
          );
          updateOrder(order.id, { status: newStatus });
        }
      });
    };

    // Run immediately on mount
    updateStatuses();

    // Set up interval
    const intervalId = setInterval(updateStatuses, UPDATE_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentStoreId, orders, updateOrder]);

  return { orders };
}
