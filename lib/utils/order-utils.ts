// Get order status message
export const getOrderStatusMessage = (orderStatus: string): string => {
  switch (orderStatus) {
    case 'pending':
      return 'Order placed';
    case 'confirmed':
      return 'Order placed';
    case 'preparing':
      return 'Preparing your order';
    case 'dasher_assigned':
      return 'Picking up your order';
    case 'dasher_waiting':
      return 'Dasher waiting for order';
    case 'ready':
      return 'Order is ready to be picked up';
    case 'picked_up':
      return 'Picked up your order';
    case 'on_the_way':
      return 'Heading to you';
    case 'dasher_nearby':
      return 'Your dasher is nearby';
    case 'delivered':
      return 'Order complete';
    case 'cancelled':
      return 'Order cancelled';
    case 'returned':
      return 'Order returned';
    case 'abandoned':
      return 'Order abandoned';
    default:
      return '';
  }
};

// Get order updation message
export const getOrderUpdationMessage = (orderStatus: string, storeName: string): string => {
  switch (orderStatus) {
    case 'pending':
      return `We sent your order to ${storeName} for final confirmation.`;
    case 'confirmed':
      return `Your order has been confirmed by ${storeName}.`;
    case 'preparing':
      return `${storeName} is preparing your order.`;
    case 'dasher_assigned':
      return `${storeName} is preparing your order. Your Dasher is heading to the store.`;
    case 'dasher_waiting':
      return `Your Dasher is at ${storeName} waiting to pick up your order.`;
    case 'ready':
      return 'Your order is ready to be picked up.';
    case 'picked_up':
      return 'Your order has been picked up.';
    case 'on_the_way':
      return 'Your Dasher is heading to you with your order.';
    case 'dasher_nearby':
      return 'Your Dasher will arrive soon.';
    case 'delivered':
      return 'Your order is complete. Enjoy!';
    default:
      return '';
  }
};

// Completed order statuses
export const COMPLETED_STATUSES = ['delivered', 'cancelled', 'returned', 'abandoned'];

// In progress order statuses
export const IN_PROGRESS_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'dasher_assigned',
  'dasher_waiting',
  'ready',
  'picked_up',
  'on_the_way',
  'dasher_nearby',
];

// Get current order step
export const getCurrentOrderStep = (orderStatus: string): number => {
  if (orderStatus === 'pending' || orderStatus === 'confirmed') {
    return 1;
  } else if (orderStatus === 'preparing' || orderStatus === 'dasher_assigned') {
    return 2;
  } else if (
    orderStatus === 'dasher_waiting' ||
    orderStatus === 'ready' ||
    orderStatus === 'picked_up' ||
    orderStatus === 'on_the_way' ||
    orderStatus === 'dasher_nearby'
  ) {
    return 3;
  } else if (orderStatus === 'delivered') {
    return 4;
  } else {
    return 0;
  }
};

// Calculate orderStatusUpdatedAt for completed orders
export const calculateOrderCompletionTime = (
  orderDate: string,
  orderStatus: string,
  deliveryTime?: string
): string => {
  const orderDateTime = new Date(orderDate);

  // For cancelled, returned, or abandoned orders, use the order date for now
  if (orderStatus === 'cancelled' || orderStatus === 'returned' || orderStatus === 'abandoned') {
    return orderDateTime.toISOString();
  }

  // For delivered orders, calculate based on delivery time
  if (orderStatus === 'delivered') {
    let deliveryMinutes = 30; // Default 30 minutes

    if (deliveryTime) {
      // Parse delivery time (e.g., "25-35 min" -> 30)
      const match = deliveryTime.match(/(\d+)(?:-(\d+))?\s*min/i);
      if (match) {
        const min = parseInt(match[1]);
        const max = match[2] ? parseInt(match[2]) : min;
        deliveryMinutes = (min + max) / 2;
      }
    }

    // Add delivery time to order date
    const completionTime = new Date(orderDateTime.getTime() + deliveryMinutes * 60 * 1000);
    return completionTime.toISOString();
  }

  // For any other status, return current time
  return new Date().toISOString();
};

// Get delivery status message (early, on time, late)
// Compares the remaining time with the original delivery window
export const getDeliveryStatus = (
  orderDate: string,
  remainingTime?: string,
  originalDeliveryTime?: string
): 'Early' | 'On time' | 'Late' | null => {
  if (!remainingTime || !originalDeliveryTime || !orderDate) {
    return null;
  }

  try {
    const orderDateTime = new Date(orderDate);
    const now = new Date();

    // Parse original delivery time to get the original expected delivery window
    const originalMatch = originalDeliveryTime.match(/(\d+)(?:-(\d+))?\s*min/i);
    if (!originalMatch) return null;

    const originalMin = parseInt(originalMatch[1]);
    const originalMax = originalMatch[2] ? parseInt(originalMatch[2]) : originalMin;

    // Calculate original expected delivery window (absolute times)
    const originalDeliveryStart = new Date(
      orderDateTime.getTime() + originalMin * 60 * 1000
    ).getTime();
    const originalDeliveryEnd = new Date(
      orderDateTime.getTime() + originalMax * 60 * 1000
    ).getTime();

    // Parse remaining time
    const remainingMatch = remainingTime.match(/(\d+)(?:-(\d+))?\s*min/i);
    if (!remainingMatch) return null;

    const remainingMin = parseInt(remainingMatch[1]);

    // Calculate current expected delivery time (now + remaining time)
    const currentExpectedDelivery = new Date(now.getTime() + remainingMin * 60 * 1000).getTime();

    // Determine status by comparing current expected delivery with original window
    const threshold = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (currentExpectedDelivery < originalDeliveryStart - threshold) {
      return 'Early'; // Will arrive more than 5 minutes before the original window
    } else if (currentExpectedDelivery > originalDeliveryEnd + threshold) {
      return 'Late'; // Will arrive more than 5 minutes after the original window
    } else {
      return 'On time'; // Within or close to the original window
    }
  } catch (error) {
    console.error('Error determining delivery status:', error);
    return null;
  }
};

// Get estimated delivery time range (e.g., "3:07 AM - 3:17 AM")
// If current time is past the minimum delivery time, returns exact time (e.g., "3:12 AM")
export const getEstimatedDeliveryTime = (orderDate: string, deliveryTime: string): string => {
  try {
    const orderDateTime = new Date(orderDate);
    const now = new Date();

    // Parse delivery time (e.g., "25-35 min" -> min: 25, max: 35)
    const match = deliveryTime.match(/(\d+)(?:-(\d+))?\s*min/i);
    if (!match) {
      return '';
    }

    const minDeliveryMinutes = parseInt(match[1]);
    const maxDeliveryMinutes = match[2] ? parseInt(match[2]) : minDeliveryMinutes;

    // Calculate start and end time
    const startTime = new Date(orderDateTime.getTime() + minDeliveryMinutes * 60 * 1000);
    const endTime = new Date(orderDateTime.getTime() + maxDeliveryMinutes * 60 * 1000);

    // Format times
    const formatTime = (date: Date): string => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
      return `${hours}:${minutesStr} ${ampm}`;
    };

    // If current time is past the minimum delivery time (we're inside the window), return exact time
    if (now.getTime() > startTime.getTime()) {
      // Return midpoint between now and end time, or just midpoint of original range
      const midDeliveryMinutes = (minDeliveryMinutes + maxDeliveryMinutes) / 2;
      const exactTime = new Date(orderDateTime.getTime() + midDeliveryMinutes * 60 * 1000);
      return formatTime(exactTime);
    }

    // Otherwise, return time range
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  } catch (error) {
    console.error('Error calculating estimated delivery time:', error);
    return '';
  }
};
