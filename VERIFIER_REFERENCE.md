# Verifier Task Reference

This file contains all available verifier task IDs and their descriptions for easy reference.

## Restaurant Cart Verifiers

| Task ID | Description |
|---------|-------------|
| `add-sweet-pretzel` | Add a sweet pretzel from Jamba Juice to the cart |
| `pick-meal-under-10` | Pick a Meal Under $10 That Looks Tasty |
| `add-cooler-bag` | Navigate to Boichik Bagels and add a Blue Cooler Bag to the cart |
| `add-most-ordered` | Navigate to Philz Coffee and add 'Mint Mojito Iced Coffee' from the Most Ordered section |
| `add-customized-croissant` | Navigate to Gateway Croissant and add a Ham, Egg and Cheese Croissant with Large size, Light Salad, Fruit Portion, Juice, and Low Sugar |
| `add-two-custom-lattes` | Add 2 Caffè Latte from Starbucks: one vegan medium size and one low sugar small size |

## Search Verifiers

| Task ID | Description |
|---------|-------------|
| `search-target` | Search for 'target' and navigate to Target Store |
| `search-starbucks` | Search for 'starbucks' and navigate to a Starbucks store |
| `find-pizza-restaurants` | Search for 'pizza' to find restaurants that offer pizza |
| `find-dessert-restaurants` | Search for dessert restaurants with average price range ($ or $$) |

## Grocery Cart Verifiers

| Task ID | Description |
|---------|-------------|
| `add-organic-eggs` | Navigate to Sprouts Farmers Market and add 2 Vital Farms Organic Pasture Raised Eggs to the cart |
| `add-vegetables` | Shop for vegetables (cucumber, broccoli and carrot) on Target |
| `add-fruits` | Go to Gus's Community Market and shop for fruits: 3 kiwis, 1 avocado, 1 bunch of strawberries |
| `add-milk-from-safeway` | Search for Safeway in the Grocery section and add a gallon of milk to the cart |

## Retail Cart Verifiers

| Task ID | Description |
|---------|-------------|
| `add-gift-from-michaels` | Navigate to Michaels and add a $2.99 gift item to the cart |
| `add-headphones` | Navigate to Best Buy and add 2 JBL TUNE520BT wireless headphones to the cart |
| `add-airpods` | Search for Best Buy in the Retail section and add a pair of AirPods Pro 2 to the cart |

## Pet Cart Verifiers

| Task ID | Description |
|---------|-------------|
| `add-pet-items` | Search for a dog poop bag and a cat shampoo on PetSmart and add it to the cart |
| `buy-dog-cupcake` | Buy a cupcake for my dog |

## Cart Management Verifiers

| Task ID | Description |
|---------|-------------|
| `clear-cart` | Add 3 Items and Clear the Cart |
| `remove-item-from-cart` | Remove items from cart until only a Burger remains |

## Convenience Store Verifiers

| Task ID | Description |
|---------|-------------|
| `order-7eleven-with-tip` | Order 2 Lays Crisps, 1 fruit punch and 1 red bull from 7-Eleven, and add a $5 tip |

---

## Usage

### For Agents:
1. Navigate to `http://localhost:3000/verify`
2. Enter any task ID from the table above
3. Click "Run" to verify completion
4. Executions will also be logged under the logs folder by session for analytics
