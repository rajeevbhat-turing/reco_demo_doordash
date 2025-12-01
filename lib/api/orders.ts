import { Order } from '@/constants/order-data';

interface OrdersResponse {
  success: boolean;
  data?: Order[];
  message?: string;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const response = await fetch(`/api/orders?userId=${userId}`);
  const result: OrdersResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch orders');
  }

  if (!result.data) {
    throw new Error('Orders data not found');
  }

  return result.data;
}
