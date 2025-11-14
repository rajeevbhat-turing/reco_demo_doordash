/**
 * Extract numeric price from a price string (e.g., "$7.40+" -> 7.40)
 */
export function extractPrice(priceStr: string | number): number {
  if (typeof priceStr === "number") {
    return priceStr
  }
  // Remove all non-numeric characters except decimal point
  const numericStr = priceStr.toString().replace(/[^0-9.]/g, "")
  const price = parseFloat(numericStr)
  return isNaN(price) ? 0 : price
}

/**
 * Check if a restaurant has menu items within the specified price range
 * @param restaurantId - ID of the restaurant
 * @param minPrice - Minimum price filter (null for no minimum)
 * @param maxPrice - Maximum price filter (null for no maximum)
 * @param menuItems - Array of menu items for this restaurant from backend
 */
export function restaurantHasItemsInPriceRange(
  restaurantId: string,
  minPrice: number | null,
  maxPrice: number | null,
  menuItems: Array<{ price: string | number }>
): boolean {
  // If no price filter is set, return true (don't filter)
  if (minPrice === null && maxPrice === null) {
    return true
  }

  if (!menuItems || menuItems.length === 0) {
    return false // No items to check
  }

  // Check if any menu item falls within the price range
  return menuItems.some((item) => {
    const itemPrice = extractPrice(item.price)

    // Check if price is within range
    if (minPrice !== null && maxPrice !== null) {
      return itemPrice >= minPrice && itemPrice <= maxPrice
    } else if (minPrice !== null) {
      return itemPrice >= minPrice
    } else if (maxPrice !== null) {
      return itemPrice <= maxPrice
    }

    return true
  })
}

/**
 * Check if a store has products within the specified price range
 * For stores (grocery, pets, retail, convenience), we need to check their products
 */
export function storeHasProductsInPriceRange(
  products: Array<{ price: string | number }>,
  minPrice: number | null,
  maxPrice: number | null
): boolean {
  // If no price filter is set, return true (don't filter)
  if (minPrice === null && maxPrice === null) {
    return true
  }

  if (!products || products.length === 0) {
    return false // No products to check
  }

  // Check if any product falls within the price range
  return products.some((product) => {
    const productPrice = extractPrice(product.price)

    // Check if price is within range
    if (minPrice !== null && maxPrice !== null) {
      return productPrice >= minPrice && productPrice <= maxPrice
    } else if (minPrice !== null) {
      return productPrice >= minPrice
    } else if (maxPrice !== null) {
      return productPrice <= maxPrice
    }

    return true
  })
}

