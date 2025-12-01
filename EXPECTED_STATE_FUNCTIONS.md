# Expected State Functions Documentation

This document describes all available expected state functions, their arguments, return structures, and usage patterns.

## Table of Contents
1. [Using JSONPath to Reference Previous Results](#using-jsonpath-to-reference-previous-results)
2. [get_user_payment_method](#get_user_payment_method)
3. [get_deal](#get_deal)
4. [get_user_address](#get_user_address)
5. [get_restaurants](#get_restaurants)
6. [get_items](#get_items)
7. [get_orders](#get_orders)
8. [get_carts](#get_carts)
9. [get_menu_categories](#get_menu_categories)
10. [get_date_N_days_from_today](#get_date_n_days_from_today)
11. [get_time_slot](#get_time_slot)

---

## Using JSONPath to Reference Previous Results

Expected state functions are executed sequentially, and you can reference results from previous functions using JSONPath syntax.

### JSONPath Format
- Results are stored in an array indexed by execution order
- Use `$[index]` to reference a specific result
- Valid patterns: `$[0]`, `$[1].field`, `$[2].array[0].property`

### JSONPath Wildcards
- Use `[*]` to select all elements in an array
- Example: `$[0].orders[*].storeId` returns an array of ALL storeIds from all orders
- Wildcard results are automatically returned as arrays
- Non-wildcard paths return single values (first match)

### Example
```json
[
  {
    "function": "get_orders",
    "args": {
      "sort_type": [{ "key": "cuisine.count", "order": "desc" }],
      "limit": 1
    }
  },
  {
    "function": "get_restaurants",
    "args": {
      "filters": {
        "cuisine": "$[0].orders[0].cuisine"
      }
    }
  }
]
```

In this example:
- First function executes and its result is stored at `$[0]`
- Second function references `$[0].orders[0].cuisine` to get the cuisine from the first order
- The JSONPath is automatically resolved before the second function executes

---

## get_user_payment_method

Gets a user's payment method with optional filtering.

### Arguments
```typescript
{
  user?: string;           // Optional: User email. If not provided, uses logged-in user
  filters?: {
    default?: boolean;     // Optional: Filter by default status
    last_four_digits?: string;  // Optional: Filter by last 4 digits (e.g., "4242")
  };
}
```

### Defaults
- `user`: Uses currently logged-in user if not specified
- `filters`: No filters applied if not specified

### Returns
```typescript
{
  paymentMethod: {
    id: string;
    type: string;              // e.g., "credit_card", "debit_card"
    cardNumber: string;
    lastFour: string;
    cvc: string;
    expiry: string;
    zipCode: string;
    default: boolean;
  }
} | null
```

Returns `null` if payment method is not found or user doesn't exist.

### Examples

**Get logged-in user's default payment method:**
```json
{
  "function": "get_user_payment_method",
  "args": {
    "filters": {
      "default": true
    }
  }
}
```

**Get specific payment method by last four digits:**
```json
{
  "function": "get_user_payment_method",
  "args": {
    "filters": {
      "last_four_digits": "4242"
    }
  }
}
```

**Get specific user's default payment method by email:**
```json
{
  "function": "get_user_payment_method",
  "args": {
    "user": "john.doe@example.com",
    "filters": {
      "default": true
    }
  }
}
```

**Using JSONPath:**
```json
{
  "function": "get_user_payment_method",
  "args": {
    "user": "$[0].orders[0].userEmail",
    "filters": {
      "default": true
    }
  }
}
```

**No filters (gets first payment method for user):**
```json
{
  "function": "get_user_payment_method",
  "args": {}
}
```

---

## get_deal

Gets a promotional deal by promo code.

### Arguments
```typescript
{
  promocode: string;  // Required: The promo code to lookup
}
```

### Returns
```typescript
{
  id: string;
  restaurantId: string | null;
  title: string;
  description: string;
  buttonText: string | null;
  buttonLink: string | null;
  minimumPurchase: number | null;     // In cents
  discountType: string | null;
  discountValue: number | null;
  maximumDiscount: number | null;     // In cents
  promocode: string | null;
  freeItems?: Array<{
    id: string;
    name: string;
    sortOrder: number;
  }>;
} | null
```

Returns `null` if promo code is not found.

### Example
```json
{
  "function": "get_deal",
  "args": {
    "promocode": "SUMMER2024"
  }
}
```

### Example with JSONPath
```json
{
  "function": "get_deal",
  "args": {
    "promocode": "$[0].savedPromocode"
  }
}
```

---

## get_user_address

Gets a user's address by address type or returns the default address.

### Arguments
```typescript
{
  type?: string;     // Optional: Address type ("house", "apartment", "hotel", "office", "other")
                     //           If not provided, returns the default address
  user?: string;     // Optional: User email. If not provided, uses logged-in user
}
```

### Defaults
- `type`: If not provided, returns the user's default address
- `user`: Uses currently logged-in user if not specified

### Returns
```typescript
{
  address: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    lat: number;
    lng: number;
    addressType: string;
    default: boolean;
    gateCode?: string;
    apartmentSuite?: string;
    entryCode?: string;
    roomSuite?: string;
    hotelName?: string;
    suiteFloor?: string;
    businessName?: string;
    buildingName?: string;
    deliveryPreference?: string;
    meetLocation?: string;
    deliveryInstructions?: string;
    personalLabel?: string;
  }
} | null
```

Returns `null` if address is not found or user doesn't exist.

### Examples

**Get logged-in user's default address:**
```json
{
  "function": "get_user_address",
  "args": {}
}
```

**Get logged-in user's house address:**
```json
{
  "function": "get_user_address",
  "args": {
    "type": "house"
  }
}
```

**Get specific user's address by email:**
```json
{
  "function": "get_user_address",
  "args": {
    "type": "apartment",
    "user": "john.doe@example.com"
  }
}
```

**Using JSONPath:**
```json
{
  "function": "get_user_address",
  "args": {
    "type": "office",
    "user": "$[0].orders[0].userEmail"
  }
}
```

---

## get_restaurants

Gets restaurants with optional filtering, sorting, and radius filtering.

### Arguments
```typescript
{
  name?: string;                   // Optional: Filter by restaurant name (partial match, case-insensitive)
  lat?: number;                    // Optional: Explicit latitude
  lng?: number;                    // Optional: Explicit longitude
  sort_type?: SortSpec[];          // Optional: Multi-level sorting
  limit?: number;                  // Optional: Number of restaurants to return
  filters?: {
    item_keyword?: string;         // Optional: Filter by menu item keyword (finds restaurants with matching items)
    cuisines?: string[];           // Optional: Array of cuisines (matches any)
    categories?: string[];         // Optional: Array of categories (matches any)
    prices?: string[];             // Optional: Array of price ranges: "$", "$$", "$$$", "$$$$"
    dashpass?: boolean;            // Optional: Filter by DashPass availability
    has_deals?: boolean;           // Optional: Filter by restaurants with deals (default: false). When true, includes deals in response
    restaurant_ids_not_in?: string[];  // Optional: Exclude these restaurant IDs
  };
}
```

**SortSpec:**
```typescript
{
  key: string;           // Field name (e.g., "distance", "minDeliveryFee", "priceRange")
  order?: "asc" | "desc" // Sort direction (default: "asc")
}
```

### Defaults
- `lat`/`lng`: Uses logged-in user's selected or default address if not provided
- `sort_type`: Defaults to `[{ key: "distance", order: "asc" }]` if not specified (nearest restaurants first)
- `order`: "asc" if not specified in a sort spec
- `limit`: Returns all matching restaurants if not specified
- `has_deals`: Defaults to false
- **Automatic radius filtering**: All restaurants are filtered to within 10 miles of the user's location

### Returns
```typescript
{
  restaurants: Array<{
    id: string;
    name: string;
    logo: string;
    cuisine: string;
    minDeliveryFee: number;        // In cents
    priceRange: number;            // 1-4 ($-$$$$)
    dashPass: boolean;
    rating: number | null;         // Average rating from approved user reviews (1 decimal place)
    ratingCount: number;           // Number of approved reviews
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    distance: number;              // Distance in miles (always present)
    deals?: Array<{                // Only included when has_deals filter is true
      id: string;
      title: string;
      description: string;
      buttonText: string | null;
      buttonLink: string | null;
      minimumPurchase: number | null;     // In cents
      discountType: string | null;
      discountValue: number | null;
      maximumDiscount: number | null;     // In cents
      promocode: string | null;
    }>;
  }>
}
```

### Examples

**Get nearest restaurants (uses default sort by distance):**
```json
{
  "function": "get_restaurants",
  "args": {
    "limit": 5
  }
}
```
Returns the 5 nearest restaurants (default sort by distance ascending).

**Filter by restaurant name:**
```json
{
  "function": "get_restaurants",
  "args": {
    "name": "Pizza",
    "limit": 5
  }
}
```
This will find all restaurants with "Pizza" in their name (e.g., "Pizza Palace", "Mario's Pizza"), sorted by distance.

**Filter by menu item keyword:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "item_keyword": "tacos"
    },
    "limit": 10
  }
}
```
Finds restaurants that have menu items with "tacos" in the name, sorted by nearest first.

**Filter by DashPass:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "dashpass": true
    },
    "limit": 10
  }
}
```
Returns only DashPass restaurants, sorted by nearest first.

**Filter by restaurants with deals:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "has_deals": true
    },
    "limit": 10
  }
}
```
Returns only restaurants that have deals, including the deals data in the response. Each restaurant will have a `deals` array containing all available deals.

**Get nearest vegetarian restaurants:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "cuisines": ["vegetarian"]
    },
    "sort_type": [
      { "key": "distance", "order": "asc" }
    ],
    "limit": 5
  }
}
```

**Filter by multiple cuisines:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "cuisines": ["Italian", "Mexican", "Chinese"]
    },
    "sort_type": [
      { "key": "distance", "order": "asc" }
    ]
  }
}
```

**Filter by categories and price range:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "categories": ["breakfast", "brunch"],
      "prices": ["$", "$$"]
    },
    "sort_type": [
      { "key": "distance", "order": "asc" }
    ],
    "limit": 10
  }
}
```

**Sort by highest rating:**
```json
{
  "function": "get_restaurants",
  "args": {
    "sort_type": [
      { "key": "rating", "order": "desc" }
    ],
    "limit": 10
  }
}
```
Returns the top 10 highest-rated restaurants (based on approved user reviews).

**Sort by rating, then by distance:**
```json
{
  "function": "get_restaurants",
  "args": {
    "sort_type": [
      { "key": "rating", "order": "desc" },
      { "key": "distance", "order": "asc" }
    ],
    "limit": 10
  }
}
```
Returns restaurants sorted by highest rating first, with nearest restaurants as tiebreakers for same ratings.

**Combine all filters:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "cuisines": ["American", "Italian"],
      "categories": ["lunch", "dinner"],
      "prices": ["$$", "$$$"]
    },
    "sort_type": [
      { "key": "minDeliveryFee", "order": "asc" }
    ]
  }
}
```

**Multi-level sort (nearest, then cheapest delivery):**
```json
{
  "function": "get_restaurants",
  "args": {
    "sort_type": [
      { "key": "distance", "order": "asc" },
      { "key": "minDeliveryFee", "order": "asc" }
    ],
    "limit": 3
  }
}
```

**Using explicit coordinates:**
```json
{
  "function": "get_restaurants",
  "args": {
    "lat": 37.7749,
    "lng": -122.4194,
    "sort_type": [
      { "key": "distance", "order": "asc" }
    ],
    "limit": 1
  }
}
```

**Using JSONPath from previous result:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "cuisines": ["$[0].orders[0].cuisine"]
    },
    "sort_type": [
      { "key": "minDeliveryFee", "order": "asc" }
    ]
  }
}
```

**Exclude restaurants user has already ordered from (using wildcard):**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "cuisines": ["Italian"],
      "restaurant_ids_not_in": "$[0].orders[*].storeId"
    },
    "sort_type": [
      { "key": "distance", "order": "asc" }
    ],
    "limit": 5
  }
}
```

**Explanation:**
- `$[0].orders[*].storeId` uses the wildcard `[*]` to get ALL storeIds from all orders
- Returns an array: `["rest_1", "rest_3", "rest_7"]`
- These restaurants are excluded from the results

**Note:** When using JSONPath in arrays (without wildcards), wrap the path in an array. The path will be resolved before the function executes.

---

## get_items

Gets menu items with optional filtering and multi-level sorting.

### Arguments
```typescript
{
  restaurant_id?: string;          // Optional: Search specific restaurant or all
  keywords?: string[];             // Optional: Keywords to match against item name
  sort_type?: SortSpec[];          // Optional: Multi-level sorting
  limit?: number;                  // Optional: Number of items to return
  lat?: number;                    // Optional: Explicit latitude
  lng?: number;                    // Optional: Explicit longitude
  filters?: {
    menu_categories?: string[];    // Optional: Array of menu category names (matches any)
    restaurant_ids_not_in?: string[]; // Optional: Exclude items from these restaurant IDs
  };
}
```

**SortSpec:**
```typescript
{
  key: string;           // Field name (e.g., "price", "rating", "calories")
  order?: "asc" | "desc" // Sort direction (default: "asc")
}
```

### Defaults
- `restaurant_id`: Searches all restaurants if not provided
- `lat`/`lng`: Uses logged-in user's selected or default address if not provided
- `order`: "asc" if not specified
- `limit`: Returns all matching items if not specified

### Distance Filtering
- **When `restaurant_id` is NOT provided**: Filters restaurants by 10 mile radius using lat/lng
- **When `restaurant_id` IS provided**: No distance filtering (searches only that restaurant)

### Returns
```typescript
{
  items: Array<{
    id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number;                 // In cents
    image: string | null;
    calories: number | null;
    rating: number | null;
    ratingCount: number | null;
    popular: boolean;
    featured: boolean;
  }>
}
```

### Examples

**Find cheapest salad or bowl items (searches all restaurants within 10 miles):**
```json
{
  "function": "get_items",
  "args": {
    "keywords": ["salad", "bowl"],
    "sort_type": [
      { "key": "price", "order": "asc" }
    ],
    "limit": 5
  }
}
```

**Filter by menu categories:**
```json
{
  "function": "get_items",
  "args": {
    "restaurant_id": "123",
    "filters": {
      "menu_categories": ["Appetizers", "Salads"]
    },
    "sort_type": [
      { "key": "price", "order": "asc" }
    ],
    "limit": 10
  }
}
```
This will find items that belong to either "Appetizers" or "Salads" menu categories.

**Exclude items from specific restaurants:**
```json
{
  "function": "get_items",
  "args": {
    "keywords": ["tacos"],
    "filters": {
      "restaurant_ids_not_in": ["$[0].orders[*].storeId"]
    },
    "sort_type": [
      { "key": "price", "order": "asc" }
    ],
    "limit": 5
  }
}
```
Finds the cheapest tacos, excluding restaurants the user has already ordered from.

**Search with explicit coordinates:**
```json
{
  "function": "get_items",
  "args": {
    "lat": 37.7749,
    "lng": -122.4194,
    "keywords": ["salad"],
    "sort_type": [
      { "key": "price", "order": "asc" }
    ],
    "limit": 5
  }
}
```

**Multi-level sort (cheapest, then highest rated):**
```json
{
  "function": "get_items",
  "args": {
    "restaurant_id": "123",
    "sort_type": [
      { "key": "price", "order": "asc" },
      { "key": "rating", "order": "desc" }
    ],
    "limit": 3
  }
}
```

**Using JSONPath for restaurant_id:**
```json
{
  "function": "get_items",
  "args": {
    "restaurant_id": "$[0].restaurants[0].id",
    "keywords": ["grain bowl", "cucumber salad"],
    "sort_type": [
      { "key": "price", "order": "asc" }
    ],
    "limit": 1
  }
}
```

---

## get_orders

Gets user orders with optional filtering, sorting, and aggregation support.

### Arguments
```typescript
{
  restaurant_id?: string;          // Optional: Filter by restaurant ID
  user?: string;                   // Optional: User email (uses logged-in user if not provided)
  sort_type?: SortSpec[];          // Optional: Multi-level sorting with aggregation support
  limit?: number;                  // Optional: Number of orders to return
  filters?: {
    status?: string;               // Optional: Filter by status ("delivered", "cancelled", etc.)
    date_from?: string;            // Optional: ISO date string (e.g., "2024-01-01")
    date_to?: string;              // Optional: ISO date string
  };
}
```

**SortSpec:**
```typescript
{
  key: string;           // Field name OR "field.count" for aggregation
  order?: "asc" | "desc" // Sort direction (default: "asc")
}
```

### Aggregation Support

The `get_orders` function supports **aggregation** using the `.count` suffix on field names.

**Syntax:** `"field.count"`

**Behavior:**
- Groups orders by the specified field
- Sorts groups by count
- Secondary sorts pick the best representative order from each group
- Returns one order per group

**Example Fields:**
- `cuisine.count` - Group by cuisine, sort by order frequency
- `store_id.count` - Group by restaurant, sort by order frequency

### Defaults
- `user`: Uses currently logged-in user if not specified
- `sort_type`: Defaults to `[{ key: "orderDate", order: "desc" }]` if not specified (most recent orders first)
- `order`: "asc" if not specified in a sort spec
- `limit`: Returns all matching orders if not specified

### Returns
```typescript
{
  orders: Array<{
    id: string;
    userId: string;
    storeId: string;
    storeName: string;
    cuisine: string;
    deliveryFee: number;           // In cents
    subtotal: number;              // In cents
    total: number;                 // In cents
    status: string;
    orderDate: string;             // ISO date string
    items: Array<{
      id: string;
      menuItemId: string;
      name: string;
      quantity: number;
      price: number;               // In cents
    }>;
  }>
}
```

**Note:** The aggregation metadata is NOT returned - only the orders themselves with their items.

### Examples

**Get most frequently ordered cuisine (aggregation):**
```json
{
  "function": "get_orders",
  "args": {
    "sort_type": [
      { "key": "cuisine.count", "order": "desc" },
      { "key": "delivery_fee", "order": "asc" }
    ],
    "limit": 1
  }
}
```

**Explanation:**
- Groups orders by `cuisine`
- Sorts cuisines by order count (descending = most frequent first)
- Within each cuisine group, picks the order with lowest `delivery_fee`
- Returns only the top 1 (most frequent cuisine's cheapest order)

**Get top 3 most ordered cuisines:**
```json
{
  "function": "get_orders",
  "args": {
    "sort_type": [
      { "key": "cuisine.count", "order": "desc" }
    ],
    "limit": 3
  }
}
```

Returns 3 orders - one representative from each of the top 3 most ordered cuisines.

**Filter by restaurant:**
```json
{
  "function": "get_orders",
  "args": {
    "restaurant_id": "123",
    "sort_type": [
      { "key": "orderDate", "order": "desc" }
    ],
    "limit": 10
  }
}
```
Returns the 10 most recent orders from restaurant "123".

**Get recent orders (uses default sort by orderDate desc):**
```json
{
  "function": "get_orders",
  "args": {
    "limit": 10
  }
}
```
Returns the 10 most recent orders (default sort by orderDate descending).

**Regular sorting (no aggregation) - recent delivered orders:**
```json
{
  "function": "get_orders",
  "args": {
    "sort_type": [
      { "key": "orderDate", "order": "desc" }
    ],
    "limit": 10,
    "filters": {
      "status": "delivered"
    }
  }
}
```

**Get specific user's orders by email:**
```json
{
  "function": "get_orders",
  "args": {
    "user": "john.doe@example.com",
    "sort_type": [
      { "key": "total", "order": "desc" }
    ],
    "limit": 5
  }
}
```

**Date range filtering:**
```json
{
  "function": "get_orders",
  "args": {
    "filters": {
      "status": "delivered",
      "date_from": "2024-01-01",
      "date_to": "2024-12-31"
    },
    "sort_type": [
      { "key": "orderDate", "order": "desc" }
    ]
  }
}
```

---

## Complete Example: Find Cheapest Restaurant by Frequent Cuisine

This example demonstrates composing multiple functions with JSONPath references:

```json
[
  {
    "function": "get_orders",
    "args": {
      "sort_type": [
        { "key": "cuisine.count", "order": "desc" },
        { "key": "delivery_fee", "order": "asc" }
      ],
      "limit": 1
    }
  },
  {
    "function": "get_restaurants",
    "args": {
      "filters": {
        "cuisines": ["$[0].orders[0].cuisine"]
      },
      "sort_type": [
        { "key": "minDeliveryFee", "order": "asc" }
      ],
      "limit": 1
    }
  }
]
```

**Execution Flow:**
1. First function finds the most frequently ordered cuisine
2. Result stored at `$[0]`: `{ orders: [{ cuisine: "vegetarian", ... }] }`
3. Second function uses `$[0].orders[0].cuisine` (resolves to `"vegetarian"`)
4. Finds cheapest restaurant serving vegetarian food

**Final Result Structure:**
```json
[
  {
    "orders": [
      {
        "id": "ord_123",
        "cuisine": "vegetarian",
        "deliveryFee": 299,
        ...
      }
    ]
  },
  {
    "restaurants": [
      {
        "id": "rest_456",
        "name": "Veggie Palace",
        "cuisine": "vegetarian",
        "minDeliveryFee": 199,
        "distance": 1.2,
        ...
      }
    ]
  }
]
```

---

## Common Patterns

### 1. Chaining Multiple Functions
Use JSONPath to pass data between functions in a sequence.

### 2. Aggregation with Selection
Use `.count` to aggregate, then use secondary sorts to pick the best representative.

### 3. Multi-Level Sorting
Specify multiple sort criteria - later criteria only apply when earlier ones are tied.

### 4. Filtering + Sorting + Limiting
Combine filters to narrow results, sort to order them, and limit to get top N.

---

## get_carts

Gets user's shopping carts with restaurant information and cart items.

### Arguments
```typescript
{
  limit?: number;                  // Optional: Number of carts to return
  user?: string;                   // Optional: User email. If not provided, uses logged-in user
  filters?: {
    restaurant_names?: string[];   // Optional: Array of restaurant names (matches any)
  };
}
```

### Defaults
- `limit`: If not provided, returns all carts
- `user`: Uses currently logged-in user if not specified
- `filters`: No filtering applied if not provided

### Returns
```typescript
{
  carts: Array<{
    storeId: string;
    storeName: string;
    storeCategory: string;          // Always "restaurant" for current implementation
    storeLogo?: string;
    items: Array<{
      id: string;                   // Menu item ID
      itemName: string;
      price: string;                // Formatted as "$X.XX"
      image: string;
      quantity: number;
      customizations?: string | null;
      appliedModifications?: Array<{
        modificationId: string;
        modificationDescription: string;
        appliedOptions: Array<{
          optionId: string;
          optionName: string;
          price: number;            // In dollars
          quantity: number;
        }>;
      }>;
    }>;
  }>
}
```

Returns `null` if user is not found. Returns empty array `{ carts: [] }` if no carts exist.

### Examples

**Get all carts for logged-in user:**
```json
{
  "function": "get_carts",
  "args": {}
}
```

**Filter carts by restaurant name:**
```json
{
  "function": "get_carts",
  "args": {
    "limit": 1,
    "filters": {
      "restaurant_names": ["Desserts Cellar"]
    }
  }
}
```

**Get carts for specific user:**
```json
{
  "function": "get_carts",
  "args": {
    "user": "john.doe@example.com",
    "filters": {
      "restaurant_names": ["Pizza Palace", "Burger King"]
    }
  }
}
```

**Using JSONPath to filter by restaurant from previous result:**
```json
[
  {
    "function": "get_orders",
    "args": {
      "sort_type": [{ "key": "orderDate", "order": "desc" }],
      "limit": 1
    }
  },
  {
    "function": "get_carts",
    "args": {
      "filters": {
        "restaurant_names": ["$[0].orders[0].restaurantName"]
      }
    }
  }
]
```

**Explanation:**
- First function gets the most recent order
- Second function retrieves carts matching that order's restaurant name
- Useful for checking if user has an active cart from their last ordered restaurant

### Notes
- Only returns carts that have at least one item
- Applied modifications include customizations and selected options (e.g., size, toppings)
- Cart items include full menu item details (name, price, image) from the database
- Useful for validating cart state before checkout or checking for abandoned carts

---

## get_menu_categories

Gets menu categories for a specific restaurant with optional filtering.

### Arguments
```typescript
{
  restaurant_id: string;    // Required: Restaurant ID to fetch categories for
  keyword?: string;         // Optional: Keyword to filter category names (partial match, case-insensitive)
  limit?: number;           // Optional: Number of categories to return
}
```

### Defaults
- `limit`: Returns all matching categories if not specified
- Categories are ordered by `display_order` ascending (as defined in database)

### Returns
```typescript
{
  categories: Array<{
    id: string;
    name: string;
    sortOrder: number;
  }>
}
```

Returns `null` if user is not found. Returns empty array `{ categories: [] }` if no categories exist.

### Examples

**Get all categories for a restaurant:**
```json
{
  "function": "get_menu_categories",
  "args": {
    "restaurant_id": "123"
  }
}
```

**Filter categories by keyword:**
```json
{
  "function": "get_menu_categories",
  "args": {
    "restaurant_id": "123",
    "keyword": "appetizer",
    "limit": 5
  }
}
```

**Using JSONPath for restaurant_id:**
```json
[
  {
    "function": "get_restaurants",
    "args": {
      "name": "Pizza Palace",
      "limit": 1
    }
  },
  {
    "function": "get_menu_categories",
    "args": {
      "restaurant_id": "$[0].restaurants[0].id"
    }
  }
]
```

**Explanation:**
- First function finds "Pizza Palace" restaurant
- Second function retrieves all menu categories for that restaurant
- Useful for validating menu structure or finding specific category sections

### Notes
- Only returns categories that have available menu items in the restaurant
- Categories are ordered by their display_order field (as defined in the database)
- Keyword filter is case-insensitive and matches partial category names

---

## get_date_N_days_from_today

Calculates a date N days from today and returns it in DD/MM format.

### Arguments
```typescript
{
  days: number;    // Required: Number of days from today (positive for future, negative for past)
}
```

### Returns
```typescript
{
  date: string;    // Date in DD/MM format (e.g., "29/11")
}
```

### Examples

**Get tomorrow's date:**
```json
{
  "function": "get_date_N_days_from_today",
  "args": {
    "days": 1
  }
}
```

**Get date 7 days from today:**
```json
{
  "function": "get_date_N_days_from_today",
  "args": {
    "days": 7
  }
}
```

**Get yesterday's date:**
```json
{
  "function": "get_date_N_days_from_today",
  "args": {
    "days": -1
  }
}
```

**Get date 30 days ago:**
```json
{
  "function": "get_date_N_days_from_today",
  "args": {
    "days": -30
  }
}
```

### Notes
- Positive `days` values return future dates
- Negative `days` values return past dates
- Date calculation handles month and year boundaries automatically
- Format is always DD/MM (day padded with leading zero, month padded with leading zero)
- Useful for date-based filtering and validation in assertions

---

## get_time_slot

Finds the 20-minute delivery time slot for a given time. Rounds down to the nearest 20-minute interval.

### Arguments
```typescript
{
  time: string;    // Required: Time in format "H:MM AM/PM" or "HH:MM AM/PM"
}
```

### Returns
```typescript
{
  slot: string;    // Time slot in format "H:MM AM/PM-H:MM AM/PM"
}
```

### Examples

**Get slot for 3:15 PM:**
```json
{
  "function": "get_time_slot",
  "args": {
    "time": "3:15 PM"
  }
}
```
Returns: `{ "slot": "3:00 PM-3:20 PM" }`

**Get slot for 10:45 AM:**
```json
{
  "function": "get_time_slot",
  "args": {
    "time": "10:45 AM"
  }
}
```
Returns: `{ "slot": "10:40 AM-11:00 AM" }`

**Get slot for 9:00 AM:**
```json
{
  "function": "get_time_slot",
  "args": {
    "time": "9:00 AM"
  }
}
```
Returns: `{ "slot": "9:00 AM-9:20 AM" }`

**Get slot for 11:59 PM:**
```json
{
  "function": "get_time_slot",
  "args": {
    "time": "11:59 PM"
  }
}
```
Returns: `{ "slot": "11:40 PM-12:00 AM" }`

### Notes
- Time slots are 20 minutes long, matching the schedule delivery modal
- Rounds DOWN to the nearest 20-minute interval (0, 20, 40 minutes past the hour)
- Handles AM/PM conversion and midnight boundary correctly
- Accepts both single and double-digit hours (e.g., "3:15 PM" or "03:15 PM")
- Useful for validating scheduled delivery times in assertions

