import type { Deal } from '@/constants/deals';

// Cart item interface for deal checking
export interface CartItemForDeal {
  id: string | number;
  itemName: string;
  price?: number | string;
  quantity?: number;
  [key: string]: any; // Allow additional properties
}

/**
 * Check if a deal's criteria are met for the given cart items
 * @param deal - The deal to check
 * @param cartItems - Array of cart items
 * @param cartSubtotal - The subtotal of the cart
 * @returns Object with `meets` boolean and optional `message` string
 */
export function checkDealCriteria(
  deal: Deal,
  cartItems: CartItemForDeal[],
  cartSubtotal: number
): { meets: boolean; message?: string } {
  // For free item deals, check:
  // 1. Are the free items already in the cart?
  // 2. Does the cart meet minimum purchase (excluding free item price if any)?
  if (deal.freeItems && deal.freeItems.length > 0) {
    // Check 1: Verify at least one free item is in cart
    const freeItemIds = deal.freeItems.map(fi => fi.id);

    // Check if at least one free item is in the cart
    const hasFreeItem = freeItemIds.some(freeId => {
      return cartItems.some(item => {
        const itemId = typeof item.id === 'string' ? item.id : item.id.toString();
        const itemName = (item.itemName || '').toLowerCase().trim();

        // Check by ID
        // We need to check if the cart item ID starts with the free item ID followed by a dash or is exactly equal
        const matchesById = itemId === freeId || itemId.startsWith(freeId + '-');

        // Also check by name - both ID and name must match
        const freeItemName = deal.freeItems
          ?.find(fi => fi.id === freeId)
          ?.name.toLowerCase()
          .trim();
        const matchesByName = freeItemName && itemName === freeItemName;

        return matchesById && matchesByName;
      });
    });

    if (!hasFreeItem) {
      return {
        meets: false,
        message: 'To use this promotion, make sure your cart contains the required items.',
      };
    }

    // Check 2: Calculate subtotal excluding free items
    // Track if ANY free item from the deal has been applied (only one free item total, not one of each type)
    let hasAppliedFreeItem = false;
    let subtotalExcludingFreeItems = 0;

    cartItems.forEach(item => {
      const itemId = typeof item.id === 'string' ? item.id : item.id.toString();
      const itemName = (item.itemName || '').toLowerCase().trim();

      // Check if this item matches any free item
      let matchedFreeItemId: string | null = null;
      for (const freeId of freeItemIds) {
        const matchesById = itemId === freeId || itemId.startsWith(freeId + '-');
        const freeItemName = deal.freeItems
          ?.find(fi => fi.id === freeId)
          ?.name.toLowerCase()
          .trim();
        const matchesByName = freeItemName && itemName === freeItemName;

        if (matchesById && matchesByName) {
          matchedFreeItemId = freeId;
          break;
        }
      }

      // Parse price - handle both number and string formats (e.g., "$17.05" or "$17.05+")
      let itemPrice = 0;
      if (typeof item.price === 'number') {
        itemPrice = item.price;
      } else if (typeof item.price === 'string') {
        // Remove currency symbols and extract numeric value
        const priceStr = item.price.replace(/[^0-9.]/g, '');
        itemPrice = parseFloat(priceStr) || 0;
      }
      
      // Get quantity, default to 1 if not provided
      const itemQuantity = item.quantity || 1;

      if (matchedFreeItemId) {
        // This is a free item - only exclude one quantity from the FIRST free item found
        if (!hasAppliedFreeItem) {
          // First free item from the deal - exclude one quantity
          hasAppliedFreeItem = true;
          // Add price for remaining quantities (quantity - 1)
          if (itemQuantity > 1) {
            subtotalExcludingFreeItems += itemPrice * (itemQuantity - 1);
          }
          // If quantity is 1, don't add anything (fully free)
        } else {
          // Another free item from the deal - add full price for all quantities
          subtotalExcludingFreeItems += itemPrice * itemQuantity;
        }
      } else {
        // Not a free item - add full price
        subtotalExcludingFreeItems += itemPrice * itemQuantity;
      }
    });

    // Check if subtotal (excluding free items) meets minimum purchase
    if (deal.minimumPurchase && subtotalExcludingFreeItems < deal.minimumPurchase) {
      return {
        meets: false,
        message: 'To use this promotion, make sure your cart contains the required items.',
      };
    }

    return { meets: true };
  }

  // For discount deals, check minimum purchase
  if (deal.minimumPurchase && cartSubtotal < deal.minimumPurchase) {
    return {
      meets: false,
      message: 'To use this promotion, make sure your cart contains the required items.',
    };
  }

  return { meets: true };
}

/**
 * Check if a deal's criteria are met (returns boolean only, for simpler use cases)
 * @param deal - The deal to check
 * @param cartItems - Array of cart items
 * @param cartSubtotal - The subtotal of the cart
 * @returns boolean indicating if criteria are met
 */
export function checkDealCriteriaBoolean(
  deal: Deal,
  cartItems: CartItemForDeal[],
  cartSubtotal: number
): boolean {
  const result = checkDealCriteria(deal, cartItems, cartSubtotal);
  return result.meets;
}

