import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getMenuItemsByRestaurantId, MenuItem } from "../constants/menu-items";

interface MenuCategory {
  id: string;
  name: string;
  restaurantId: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseCurrency(currencyValue: string | number): number {
  // If the value is already a number, return it directly
  if (typeof currencyValue === 'number') {
    return currencyValue;
  }
  
  // If it's a string, clean it and convert to number
  if (typeof currencyValue === 'string') {
    return parseFloat(currencyValue.replace(/[^0-9.]/g, "")) || 0;
  }
  
  // For any other type, return 0
  return 0;
}

export const getMenuCategoriesByRestaurantId = (restaurantId: string): MenuCategory[] => {
  const menuItems = getMenuItemsByRestaurantId(restaurantId);
  const menuCategoriesList: string[] = [];
  const menuCategories: MenuCategory[] = [];

  menuItems.forEach((item: MenuItem) => {
    if (menuCategoriesList.includes(item.category)) return;
    menuCategoriesList.push(item.category);
  });

  menuCategoriesList.forEach(category => {
    const id = category.trim().toLowerCase().replace(/[\s']/g, '-') + '-' + restaurantId;

    menuCategories.push({
      id,
      name: category,
      restaurantId,
    });
  });

  return menuCategories;
};
