# Cart Store Documentation

This document provides comprehensive documentation for the cart store used in the DoorDash clone application. The cart store is built using Zustand and includes persistence to maintain cart state across page refreshes.

## Overview

The cart store manages the shopping cart functionality, including:
- Adding items to the cart
- Removing items from the cart
- Updating item quantities
- Calculating totals
- Managing restaurant context (items can only be from one restaurant at a time)

## Data Structures

### CartItem

```
interface CartItem {
  id: string;              // Unique identifier for the item
  restaurantId: string;    // ID of the restaurant this item belongs to
  name: string;            // Name of the item
  price: string;           // Price as a string (e.g., "A$10.99")
  image: string;           // URL or path to the item image
  quantity: number;        // Quantity of this item in the cart
  customizations?: string; // Optional string describing customizations
}
```

### CartStore

```
interface CartStore {
  items: CartItem[];                                      // Array of items in the cart
  restaurantId: string | null;                            // ID of the current restaurant
  addItem: (item: Omit<CartItem, "quantity">) => void;    // Add an item to the cart
  removeItem: (id: string) => void;                       // Remove an item from the cart
  updateQuantity: (id: string, quantity: number) => void; // Update item quantity
  clearCart: () => void;                                  // Clear all items from the cart
  getTotalItems: () => number;                            // Get total number of items
  getTotalPrice: () => string;                            // Get total price as formatted string
}
```

## Usage

### Importing the Store

```
import { useCartStore } from "@/store/cart-store";
```

### Adding Items to the Cart

```
const addItem = useCartStore((state) => state.addItem);

// Add a new item to the cart
addItem({
  id: "item-123",
  restaurantId: "restaurant-456",
  name: "Double Quarter Pounder",
  price: "A$18.70",
  image: "/mcdonalds-double-quarter-pounder.png",
});

// Add with customizations
addItem({
  id: "item-123",
  restaurantId: "restaurant-456",
  name: "Double Quarter Pounder",
  price: "A$18.70",
  image: "/mcdonalds-double-quarter-pounder.png",
  customizations: "No pickles, Extra cheese",
});
```

**Note:** When adding an item from a different restaurant than what's currently in the cart, the cart will be cleared first.

### Removing Items from the Cart

```
const removeItem = useCartStore((state) => state.removeItem);

// Remove an item by its ID
removeItem("item-123");
```

### Updating Item Quantity

```
const updateQuantity = useCartStore((state) => state.updateQuantity);

// Increase quantity to 3
updateQuantity("item-123", 3);

// Decrease quantity to 1
updateQuantity("item-123", 1);

// Setting quantity to 0 or less will remove the item
updateQuantity("item-123", 0); // This will remove the item
```

### Clearing the Cart

```
const clearCart = useCartStore((state) => state.clearCart);

// Remove all items from the cart
clearCart();
```

### Getting Cart Information

```
// Get the cart items
const items = useCartStore((state) => state.items);

// Get the total number of items in the cart
const totalItems = useCartStore((state) => state.getTotalItems());

// Get the formatted total price
const totalPrice = useCartStore((state) => state.getTotalPrice());

// Get the current restaurant ID
const restaurantId = useCartStore((state) => state.restaurantId);
```

## Subscribing to Cart Changes

You can subscribe to cart changes to update UI components when the cart state changes:

```
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

function CartIndicator() {
  const [itemCount, setItemCount] = useState(0);
  
  useEffect(() => {
    // Get initial count
    setItemCount(useCartStore.getState().getTotalItems());
    
    // Subscribe to changes
    const unsubscribe = useCartStore.subscribe(
      (state) => state.items,
      () => {
        setItemCount(useCartStore.getState().getTotalItems());
      }
    );
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);
  
  return <div>Cart Items: {itemCount}</div>;
}
```

## Common Use Cases

### Adding an Item with Customizations

```
const addItem = useCartStore((state) => state.addItem);

function handleAddCustomItem(item, customizations) {
  // Create a customization string
  const customizationText = Object.entries(customizations)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
  
  addItem({
    id: `${item.id}-${Date.now()}`, // Create unique ID for customized item
    restaurantId: item.restaurantId,
    name: item.name,
    price: item.price,
    image: item.image,
    customizations: customizationText,
  });
}
```

### Displaying Cart Total in Header

```
function Header() {
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    // Get initial count
    setCartCount(useCartStore.getState().getTotalItems());
    
    // Subscribe to changes
    const unsubscribe = useCartStore.subscribe(
      (state) => state.items,
      () => {
        setCartCount(useCartStore.getState().getTotalItems());
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  return (
    <header>
      <div className="cart-icon">
        <span className="cart-count">{cartCount}</span>
      </div>
    </header>
  );
}
```

### Checking if Cart Has Items from a Specific Restaurant

```
function canAddFromRestaurant(restaurantId) {
  const { items, restaurantId: currentRestaurantId } = useCartStore.getState();
  
  return items.length === 0 || currentRestaurantId === restaurantId;
}
```

## Best Practices

1. **Always use the provided methods** instead of directly modifying the state.

2. **Handle restaurant switching gracefully** - When a user tries to add items from a different restaurant, show a confirmation dialog before clearing the cart.

3. **Use unique IDs for items** - Especially for customized items, ensure each item has a unique ID.

4. **Subscribe to specific state changes** - When subscribing to store changes, target specific parts of the state to avoid unnecessary re-renders.

5. **Clean up subscriptions** - Always return the unsubscribe function from useEffect to prevent memory leaks.

6. **Format prices consistently** - Use the store's getTotalPrice method to ensure consistent price formatting.

## Troubleshooting

### Cart not updating in UI

If the UI is not reflecting cart changes, check:

1. You're properly subscribing to the store changes
2. The component is re-rendering when the state changes
3. You're using the correct store instance

### Items not being added to cart

If items aren't being added to the cart:

1. Check that you're providing all required fields
2. Verify the item has a unique ID
3. Ensure you're not mixing items from different restaurants

### Cart total price is incorrect

If the total price calculation seems off:

1. Verify the price strings are in the correct format (e.g., "A$10.99")
2. Check that quantity values are correct
3. Ensure the price parsing logic handles your currency format