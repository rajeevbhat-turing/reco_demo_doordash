import { useEffect } from 'react';
import { useOrdersStore } from '@/store/orders-store';
import { useUserStore } from '@/store/user-store';
import { Order } from '@/constants/order-data';
import { COMPLETED_STATUSES, IN_PROGRESS_STATUSES } from '@/lib/utils/order-utils';

// Configuration constants
const UPDATE_INTERVAL = 3000; // Interval in milliseconds to check for status updates (3 seconds)
const STATUS_UPDATE_MULTIPLIER = 0.2; // Multiplier for status transition times (0.1 = 10x faster, 2 = 2x slower, 1x = update status like in real world)

// Order status progression
const STATUS_FLOW = IN_PROGRESS_STATUSES;

/**
 * Calculate the next status for an order based on elapsed time
 * @param order The order to calculate status for
 * @returns Object with new status and remaining time, or null if no update needed
 */
function calculateNextStatus(order: Order): { newStatus: string; remainingTime: string } | null {
  const currentStatus = order.status.toLowerCase();

  // Don't update completed orders
  if (COMPLETED_STATUSES.includes(currentStatus)) {
    return null;
  }

  const orderDate = new Date(order.orderDate);
  const now = new Date();
  const elapsedSeconds = (now.getTime() - orderDate.getTime()) / 1000;

  // Calculate base preparation time based on number of items (in seconds)
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;
  const basePreparationTime = Math.min(180 + itemCount * 120, 1200); // 180-1200 seconds (3-20 minutes)

  // Parse delivery time from the order (e.g., "25-35 min" -> 1800 seconds)
  let estimatedDeliverySeconds = 1800; // Default: 1800 seconds (30 minutes)
  if (order.deliveryOption?.deliveryTime) {
    const match = order?.deliveryOption?.deliveryTime?.match(/(\d+)(?:-(\d+))?\s*min/i);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      estimatedDeliverySeconds = ((min + max) / 2) * 60; // Convert to seconds
    }
  }

  // Calculate time thresholds for each status (all in seconds, multiplied by STATUS_UPDATE_MULTIPLIER)
  const confirmedTime = 15 * STATUS_UPDATE_MULTIPLIER; // starts 15 seconds after order placed
  const preparingTime = confirmedTime + 10 * STATUS_UPDATE_MULTIPLIER; // starts 10 seconds after confirmed
  const dasherAssignedTime = preparingTime + 60 * STATUS_UPDATE_MULTIPLIER; // 60 seconds after preparing starts
  const dasherWaitingTime = dasherAssignedTime + 45 * STATUS_UPDATE_MULTIPLIER; // 45 seconds after dasher assigned
  const readyTime = basePreparationTime * STATUS_UPDATE_MULTIPLIER; // Based on items (180-1200 seconds)
  const pickedUpTime = readyTime + 10 * STATUS_UPDATE_MULTIPLIER; // 10 seconds after ready (dasher is already waiting)
  const onTheWayTime = pickedUpTime + 20 * STATUS_UPDATE_MULTIPLIER; // 20 seconds after picked up
  const dasherNearbyTime =
    estimatedDeliverySeconds * STATUS_UPDATE_MULTIPLIER - 60 * STATUS_UPDATE_MULTIPLIER; // 1 minute before delivery
  const deliveredTime = estimatedDeliverySeconds * STATUS_UPDATE_MULTIPLIER; // Full delivery time

  // Determine the next status based on elapsed time
  let newStatus = currentStatus;

  if (elapsedSeconds >= deliveredTime && currentStatus !== 'delivered') {
    newStatus = 'delivered';
  } else if (
    elapsedSeconds >= dasherNearbyTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('dasher_nearby')
  ) {
    newStatus = 'dasher_nearby';
  } else if (
    elapsedSeconds >= onTheWayTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('on_the_way')
  ) {
    newStatus = 'on_the_way';
  } else if (
    elapsedSeconds >= pickedUpTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('picked_up')
  ) {
    newStatus = 'picked_up';
  } else if (
    elapsedSeconds >= readyTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('ready')
  ) {
    newStatus = 'ready';
  } else if (
    elapsedSeconds >= dasherWaitingTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('dasher_waiting')
  ) {
    newStatus = 'dasher_waiting';
  } else if (
    elapsedSeconds >= dasherAssignedTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('dasher_assigned')
  ) {
    newStatus = 'dasher_assigned';
  } else if (
    elapsedSeconds >= preparingTime &&
    STATUS_FLOW.indexOf(currentStatus) < STATUS_FLOW.indexOf('preparing')
  ) {
    newStatus = 'preparing';
  } else if (elapsedSeconds >= confirmedTime && currentStatus === 'pending') {
    newStatus = 'confirmed';
  }

  // Calculate remaining time until delivery
  // Only update remaining time when dasher is on_the_way or dasher_nearby
  let remainingTime = order.remainingTime || order.deliveryOption?.deliveryTime || '';

  // Only calculate countdown for on_the_way and dasher_nearby statuses
  if (newStatus === 'on_the_way' || newStatus === 'dasher_nearby') {
    // Calculate remaining time until delivery
    const remainingSeconds = Math.max(0, deliveredTime - elapsedSeconds);
    const remainingMinutes = Math.round(remainingSeconds / 60);

    if (remainingMinutes <= 0) {
      remainingTime = order.remainingTime || '0 min';
    } else {
      // Create a range (e.g., "15-25 min" becomes "10-20 min" as time passes)
      const rangeSize = 10; // 10 minute range
      const minTime = Math.max(0, remainingMinutes - Math.floor(rangeSize / 2));
      const maxTime = remainingMinutes + Math.floor(rangeSize / 2);

      if (minTime === maxTime) {
        remainingTime = `${minTime} min`;
      } else {
        remainingTime = `${minTime}-${maxTime} min`;
      }
    }
  }

  // Only return if status actually changed
  if (newStatus !== currentStatus) {
    return { newStatus, remainingTime };
  }

  return null;
}

/**
 * Hook to automatically update order statuses based on time progression
 * Runs at UPDATE_INTERVAL and updates non-completed orders
 * Only runs if user is authenticated
 */
export function useOrderStatus() {
  const currentUser = useUserStore(state => state.currentUser);
  const orders = useOrdersStore(state => state.orders);
  const updateOrderStatus = useOrdersStore(state => state.updateOrderStatus);

  useEffect(() => {
    // Don't run if user is not authenticated
    if (!currentUser) {
      return;
    }

    // Function to update all order statuses
    const updateStatuses = () => {
      orders.forEach(order => {
        const result = calculateNextStatus(order);
        if (result) {
          const { newStatus, remainingTime } = result;
          console.log(
            `[ORDER STATUS] Updating order ${order.id} from ${order.status} to ${newStatus}, remainingTime: ${remainingTime}`
          );
          updateOrderStatus(order.id, newStatus, remainingTime);
        }
      });
    };

    // Run immediately on mount
    updateStatuses();

    // Set up interval to run at UPDATE_INTERVAL
    const intervalId = setInterval(updateStatuses, UPDATE_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUser, orders, updateOrderStatus]);

  return {
    orders,
  };
}
