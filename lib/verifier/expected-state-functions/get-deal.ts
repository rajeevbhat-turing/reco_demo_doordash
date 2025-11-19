export interface Deal {
  id: string;
  restaurantId: string | null;
  title: string;
  description: string;
  buttonText: string | null;
  buttonLink: string | null;
  minimumPurchase: number | null;
  discountType: string | null;
  discountValue: number | null;
  maximumDiscount: number | null;
  promocode: string | null;
  freeItems?: Array<{
    id: string;
    name: string;
    sortOrder: number;
  }>;
}

/**
 * Get a deal/promotion by promo code from the database
 * 
 * @param args - Object containing promocode
 * @returns Deal object or null if not found
 */
export async function get_deal(args: { promocode: string }): Promise<Deal | null> {
  try {
    const { promocode } = args;
    
    if (!promocode) {
      console.error('Promocode is required');
      return null;
    }

    // Call API route to fetch deal from database
    const response = await fetch(`/api/expected-state/get-deal?promocode=${encodeURIComponent(promocode)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch deal');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching deal:', error);
    return null;
  }
}

