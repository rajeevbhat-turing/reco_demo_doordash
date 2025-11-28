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

---

## Using JSONPath to Reference Previous Results

Expected state functions are executed sequentially, and you can reference results from previous functions using JSONPath syntax.

### JSONPath Format
- Results are stored in an array indexed by execution order
- Use `$[index]` to reference a specific result
- Valid patterns: `$[0]`, `$[1].field`, `$[2].array[0].property`

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
  id: string;
  type: string;              // e.g., "credit_card", "debit_card"
  cardNumber: string;
  lastFour: string;
  cvc: string;
  expiry: string;
  zipCode: string;
  default: boolean;
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

Gets a user's address by address type.

### Arguments
```typescript
{
  type: string;      // Required: Address type ("house", "apartment", "hotel", "office", "other")
  user?: string;     // Optional: User email. If not provided, uses logged-in user
}
```

### Defaults
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
  lat?: number;                    // Optional: Explicit latitude
  lng?: number;                    // Optional: Explicit longitude
  sort_type?: SortSpec[];          // Optional: Multi-level sorting
  limit?: number;                  // Optional: Number of restaurants to return
  filters?: {
    cuisine?: string;              // Optional: Filter by cuisine (partial match)
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
- `order`: "asc" if not specified
- `limit`: Returns all matching restaurants if not specified
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
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    distance: number;              // Distance in miles (always present)
  }>
}
```

### Examples

**Get nearest vegetarian restaurants:**
```json
{
  "function": "get_restaurants",
  "args": {
    "filters": {
      "cuisine": "vegetarian"
    },
    "sort_type": [
      { "key": "distance", "order": "asc" }
    ],
    "limit": 5
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
      "cuisine": "$[0].orders[0].cuisine"
    },
    "sort_type": [
      { "key": "minDeliveryFee", "order": "asc" }
    ]
  }
}
```

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
- `order`: "asc" if not specified
- `limit`: Returns all matching items if not specified

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

**Find cheapest salad or bowl items:**
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
- `order`: "asc" if not specified
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
  }>
}
```

**Note:** The aggregation metadata is NOT returned - only the orders themselves.

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
        "cuisine": "$[0].orders[0].cuisine"
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

