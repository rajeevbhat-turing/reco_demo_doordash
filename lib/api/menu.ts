import { MenuItem } from '@/constants/menu-items';

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface MenuData {
  menuItems: MenuItem[];
  categories: MenuCategory[];
}

interface MenuResponse {
  success: boolean;
  data?: MenuData;
  message?: string;
}

export async function fetchRestaurantMenu(restaurantId: string): Promise<MenuData> {
  const response = await fetch(`/api/restaurants/${restaurantId}/menu`);
  
  const result: MenuResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch menu');
  }

  if (!result.data) {
    throw new Error('Menu data not found');
  }

  return result.data;
}

