// Maps raw status to high-level order status for the "Status" column
export const formatOrderStatus = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'pending') {
    return 'New';
  } else if (
    ['confirmed', 'preparing', 'dasher_assigned', 'dasher_waiting'].includes(statusLower)
  ) {
    return 'In progress';
  } else if (statusLower === 'scheduled') {
    return 'Scheduled';
  } else if (['ready', 'picked_up', 'on_the_way', 'dasher_nearby'].includes(statusLower)) {
    return 'Out for delivery';
  } else if (['delivered', 'cancelled', 'returned', 'abandoned'].includes(statusLower)) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  return status;
};

// Maps raw status to detailed fulfillment status for the "Fulfillment status" column
export const formatFulfillmentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Show "-" for early statuses
    pending: '-',
    confirmed: '-',
    preparing: '-',
    // Dasher statuses
    dasher_assigned: 'Dasher assigned',
    dasher_waiting: 'Dasher waiting',
    // Scheduled
    scheduled: 'Scheduled',
    // Out for delivery statuses
    ready: 'Ready for pickup',
    picked_up: 'Picked up',
    on_the_way: 'Dasher on the way',
    dasher_nearby: 'Dasher nearby',
    // Completed statuses
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    abandoned: 'Abandoned',
  };
  return statusMap[status.toLowerCase()] || status;
};

// Returns color classes for order status badge
export const getOrderStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'pending') {
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' };
  } else if (
    statusLower === 'confirmed' ||
    statusLower === 'preparing' ||
    statusLower === 'dasher_assigned' ||
    statusLower === 'dasher_waiting'
  ) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-500',
    };
  } else if (statusLower === 'scheduled') {
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      dot: 'bg-orange-500',
    };
  } else if (
    statusLower === 'ready' ||
    statusLower === 'picked_up' ||
    statusLower === 'on_the_way' ||
    statusLower === 'dasher_nearby'
  ) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      dot: 'bg-yellow-500',
    };
  } else if (statusLower === 'delivered') {
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      dot: 'bg-green-500',
    };
  } else if (
    statusLower === 'cancelled' ||
    statusLower === 'returned' ||
    statusLower === 'abandoned'
  ) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      dot: 'bg-gray-500',
    };
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    dot: 'bg-gray-500',
  };
};
