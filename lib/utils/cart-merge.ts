import type { Cart, CartItem } from '@/store/cart-store';
import type { AppliedModification, AppliedModificationOption } from '@/types';

/**
 * Checks if two AppliedModificationOptions are identical
 */
function areAppliedOptionsEqual(
  option1: AppliedModificationOption,
  option2: AppliedModificationOption
): boolean {
  return (
    option1.optionId === option2.optionId &&
    option1.optionName === option2.optionName &&
    option1.price === option2.price &&
    option1.quantity === option2.quantity
  );
}

/**
 * Checks if two AppliedModifications are identical
 */
function areModificationsEqual(
  mod1: AppliedModification,
  mod2: AppliedModification
): boolean {
  if (mod1.modificationId !== mod2.modificationId) return false;
  if (mod1.modificationDescription !== mod2.modificationDescription) return false;
  
  // Check if appliedOptions arrays have same length
  if (mod1.appliedOptions.length !== mod2.appliedOptions.length) return false;
  
  // Check if all options match (order-independent comparison)
  for (const option1 of mod1.appliedOptions) {
    const matchingOption = mod2.appliedOptions.find(option2 =>
      areAppliedOptionsEqual(option1, option2)
    );
    if (!matchingOption) return false;
  }
  
  return true;
}

/**
 * Checks if two cart items have the same modifications
 * Two items are considered to have the same modifications if:
 * 1. They have the same item ID
 * 2. They have identical modifications (or both have no modifications)
 */
export function haveSameModifications(item1: CartItem, item2: CartItem): boolean {
  // Items must have the same ID
  if (item1.id !== item2.id) return false;
  
  // If both have no modifications, they're the same
  const mods1 = item1.appliedModifications || [];
  const mods2 = item2.appliedModifications || [];
  
  if (mods1.length === 0 && mods2.length === 0) return true;
  
  // If one has modifications and the other doesn't, they're different
  if (mods1.length !== mods2.length) return false;
  
  // Check if all modifications match (order-independent)
  for (const mod1 of mods1) {
    const matchingMod = mods2.find(mod2 => areModificationsEqual(mod1, mod2));
    if (!matchingMod) return false;
  }
  
  return true;
}

/**
 * Merges two carts for the same restaurant
 * Items with the same modifications will have their quantities added
 * Items with different modifications will be kept separately
 */
export function mergeCarts(guestCart: Cart, dbCart: Cart): Cart {
  console.log(`[CART MERGE] Merging carts for ${guestCart.storeName}`);
  
  const mergedItems: CartItem[] = [...dbCart.items];
  
  // Process each item from guest cart
  for (const guestItem of guestCart.items) {
    // Find if there's a matching item in DB cart (same item ID and modifications)
    const matchingItemIndex = mergedItems.findIndex(dbItem =>
      haveSameModifications(guestItem, dbItem)
    );
    
    if (matchingItemIndex >= 0) {
      // Found a match - add quantities
      const existingItem = mergedItems[matchingItemIndex];
      mergedItems[matchingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + guestItem.quantity,
      };
      console.log(
        `[CART MERGE] Merged item "${guestItem.itemName}" - new quantity: ${mergedItems[matchingItemIndex].quantity}`
      );
    } else {
      // No match found - add as new item
      mergedItems.push(guestItem);
      console.log(`[CART MERGE] Added new item "${guestItem.itemName}" to cart`);
    }
  }
  
  return {
    ...dbCart,
    items: mergedItems,
  };
}

/**
 * Merges guest carts with database carts
 * Handles two scenarios:
 * 1. Guest cart is for a restaurant not in DB carts - just add it
 * 2. Guest cart is for a restaurant in DB carts - merge items intelligently
 */
export function mergeGuestCartsWithDBCarts(
  guestCarts: Cart[],
  dbCarts: Cart[]
): Cart[] {
  console.log(
    `[CART MERGE] Starting merge: ${guestCarts.length} guest carts, ${dbCarts.length} DB carts`
  );
  
  // Start with all DB carts
  const mergedCarts: Cart[] = [...dbCarts];
  
  // Process each guest cart
  for (const guestCart of guestCarts) {
    // Find if there's a cart for the same restaurant and category in DB carts
    const existingCartIndex = mergedCarts.findIndex(
      dbCart =>
        dbCart.storeId === guestCart.storeId &&
        dbCart.storeCategory === guestCart.storeCategory
    );
    
    if (existingCartIndex >= 0) {
      // Scenario 2: Cart exists - merge items
      console.log(
        `[CART MERGE] Found existing cart for ${guestCart.storeName}, merging items`
      );
      mergedCarts[existingCartIndex] = mergeCarts(
        guestCart,
        mergedCarts[existingCartIndex]
      );
    } else {
      // Scenario 1: Cart doesn't exist - add guest cart
      console.log(
        `[CART MERGE] No existing cart for ${guestCart.storeName}, adding guest cart`
      );
      mergedCarts.push(guestCart);
    }
  }
  
  console.log(`[CART MERGE] Merge complete: ${mergedCarts.length} total carts`);
  return mergedCarts;
}

