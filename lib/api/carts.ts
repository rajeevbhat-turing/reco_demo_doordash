import { Cart } from '@/store/cart-store';

interface CartsResponse {
  success: boolean;
  data?: Cart[];
  message?: string;
}

export async function fetchUserCarts(userId: string): Promise<Cart[]> {
  const response = await fetch(`/api/carts?userId=${userId}`);

  const result: CartsResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch carts');
  }

  return result.data || [];
}
