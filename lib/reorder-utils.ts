import { CartCategory, CartItem } from "@/store/cart-store"
import { Order, OrderItem } from "@/constants/order-data"
import type { Restaurant } from "@/constants/restaurants"

/**
 * Detects the category from a restaurantId or storeId
 * Only restaurants are supported now
 * @param id - The restaurant/store ID to check
 * @param restaurants - Array of restaurants from backend
 */
export function detectCategoryFromRestaurantId(id: string, restaurants: Restaurant[]): CartCategory {
  // Check if it's a restaurant
  const isRestaurant = restaurants.some(r => r.id === id)
  if (isRestaurant) {
    return 'restaurant'
  }

  // Default to restaurant if not found
  console.warn(`[REORDER] Could not detect category for id: ${id}, defaulting to 'restaurant'`)
  return 'restaurant'
}

/**
 * Attempts to find the menu item image by matching name
 * @param itemName - Name of the item to find
 * @param restaurantId - ID of the restaurant
 * @param category - Category of the store
 * @param menuItems - Array of menu items for this restaurant (optional)
 */
function findMenuItemImage(
  itemName: string, 
  restaurantId: string, 
  category: CartCategory,
  menuItems?: any[]
): string {
  // Only try to fetch images for restaurants (menu items are only for restaurants)
  if (category === 'restaurant' && menuItems && menuItems.length > 0) {
    try {
      // Try exact match first
      let menuItem = menuItems.find(mi => mi.name.toLowerCase() === itemName.toLowerCase())
      
      // If no exact match, try partial match
      if (!menuItem) {
        menuItem = menuItems.find(mi => 
          mi.name.toLowerCase().includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(mi.name.toLowerCase())
        )
      }
      
      if (menuItem && menuItem.image) {
        console.log(`[REORDER] Found image for "${itemName}":`, menuItem.image)
        return menuItem.image
      }
    } catch (error) {
      console.warn(`[REORDER] Could not fetch menu items for restaurant ${restaurantId}:`, error)
    }
  }
  
  // Fallback to placeholder
  console.log(`[REORDER] Using placeholder image for "${itemName}"`)
  return '/placeholder.jpg'
}

/**
 * Converts order items to cart items format
 * @param orderItems - Items from the order
 * @param restaurantId - ID of the restaurant
 * @param restaurantName - Name of the restaurant
 * @param category - Category of the store
 * @param menuItems - Optional array of menu items for this restaurant
 */
export function convertOrderItemsToCartItems(
  orderItems: OrderItem[],
  restaurantId: string,
  restaurantName: string,
  category: CartCategory,
  menuItems?: any[]
): CartItem[] {
  return orderItems.map((item, index) => {
    // Generate a unique ID for the cart item based on name and index
    const cartItemId = `${restaurantId}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`
    
    const cartItem: CartItem = {
      id: cartItemId,
      itemName: item.name,
      price: item.price,
      quantity: item.quantity,
      // Try to fetch the actual image, fallback to placeholder
      image: findMenuItemImage(item.name, restaurantId, category, menuItems),
      appliedModifications: item.modifications,
    }

    console.log(`[REORDER] Created cart item:`, {
      id: cartItem.id,
      name: cartItem.itemName,
      image: cartItem.image,
      quantity: cartItem.quantity
    })

    return cartItem
  })
}

/**
 * Prepares order data for reordering
 * Supports backward compatibility with both restaurantId/storeId and restaurantName/storeName
 * @param order - The order to reorder
 * @param restaurants - Array of restaurants from backend
 * @param menuItems - Optional array of menu items for the restaurant
 */
export function prepareOrderForReorder(
  order: Order,
  restaurants: Restaurant[],
  menuItems?: any[]
): {
  orderId: string
  items: CartItem[]
  category: CartCategory
  storeId: string
  storeName: string
} {
  // Get the store/restaurant ID (backward compatibility)
  const storeId = order.storeId || order.restaurantId || ''
  const storeName = order.storeName || order.restaurantName || 'Store'
  
  if (!storeId) {
    console.error('[REORDER] No storeId or restaurantId found in order:', order)
    throw new Error('Cannot reorder: missing store/restaurant ID')
  }

  if (!order.items || order.items.length === 0) {
    console.error('[REORDER] No items found in order:', order)
    throw new Error('Cannot reorder: no items in order')
  }

  const category = detectCategoryFromRestaurantId(storeId, restaurants)
  const items = convertOrderItemsToCartItems(
    order.items,
    storeId,
    storeName,
    category,
    menuItems
  )

  return {
    orderId: order.id,
    items,
    category,
    storeId,
    storeName,
  }
}

