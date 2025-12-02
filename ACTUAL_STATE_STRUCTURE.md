# Actual State Structure Documentation

This document outlines the structure of the actual application state as defined in `lib/verifier/utils/state-accessor.ts`. The actual state is an aggregation of data from multiple Zustand stores, combined into a single `AppState` object for verification purposes.

---

## Table of Contents

1. [AppState Overview](#appstate-overview)
2. [Carts State](#carts-state)
3. [User State](#user-state)
4. [App State](#app-state)
5. [Orders State](#orders-state)
6. [Deals State](#deals-state)
7. [Reviews State](#reviews-state)
8. [State Sources](#state-sources)

---

## AppState Overview

The actual state is accessed via the `getStates()` function in `lib/verifier/utils/state-accessor.ts`, which returns:

```typescript
interface States {
  actual_state: AppState;
  expected_states: any[];
}
```

### AppState Interface

```typescript
interface AppState {
  carts: Cart[];
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    tempAddress: Address | null;
  };
  app: {
    searchResults: SearchResult[];
    currentStore: Record<string, any>;
    currentCategory: string | null;
    visitedStores: string[];
  };
  orders: Order[];
  deals: {
    appliedDeals: Array<{
      dealId: string;
      cartId: string;
      appliedAt: number;
      freeItemIds?: string[];
    }>;
  };
  reviews: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  };
  timestamp: number;
}
```

---

## Carts State

### `carts: Cart[]`

An array of shopping carts, one per store/vendor the user is ordering from.

```typescript
interface Cart {
  storeId: string;              // Vendor ID (restaurant or store)
  storeName: string;            // Vendor name
  storeCategory: CartCategory;  // Type of store
  items: CartItem[];            // Items in this cart
  selectedCard?: any;           // Selected payment method
  isReorder?: boolean;          // Flag for reorder carts
}

type CartCategory = "restaurant"; // Only using restaurants at the moment
```

### CartItem Interface

```typescript
interface CartItem {
  id: number | string;
  itemName: string;
  price: number | string;
  image: string;
  quantity: number;
  customizations?: string;
  appliedModifications?: AppliedModification[];
  menuCategoryId?: string;      // Menu category ID (captured when adding to cart)
  menuCategoryName?: string;    // Menu category name (captured when adding to cart)
}
```

### AppliedModification Interface

```typescript
interface AppliedModification {
  modificationId: string;
  modificationDescription: string;
  appliedOptions: AppliedModificationOption[];
}

interface AppliedModificationOption {
  optionId: string;
  optionName: string;
  price: number;
  quantity: number;
}
```

**Source Store**: `useCartStore` from `store/cart-store.ts`

**Access Path**: `actual_state.carts`

**Example**:
```json
{
  "carts": [
    {
      "storeId": "starbucks-299-fremont",
      "storeName": "Starbucks",
      "storeCategory": "restaurant",
      "items": [
        {
          "id": "123",
          "itemName": "Cappuccino",
          "price": "4.95",
          "image": "/images/cappuccino.jpg",
          "quantity": 2,
          "menuCategoryId": "5",
          "menuCategoryName": "Beverages"
        }
      ]
    }
  ]
}
```

---

## User State

### `user: { currentUser, isAuthenticated, tempAddress }`

Contains user authentication and profile information.

```typescript
user: {
  currentUser: User | null;
  isAuthenticated: boolean;
  tempAddress: Address | null;
}
```

### User Interface

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  country: Country;
  isRestricted?: boolean;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  defaultAddress?: Address;
  defaultPaymentMethod?: PaymentMethod;
}
```

### Country Interface

```typescript
interface Country {
  id: string;
  code: string;      // e.g., "US"
  name: string;      // e.g., "United States"
  dialCode: string;  // e.g., "+1"
}
```

### Address Interface

```typescript
interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  addressType: 'house' | 'apartment' | 'hotel' | 'office' | 'other';
  isDefault: boolean;
  
  // Type-specific fields
  gateCode?: string;
  apartmentSuite?: string;
  entryCode?: string;
  roomSuite?: string;
  hotelName?: string;
  suiteFloor?: string;
  businessName?: string;
  buildingName?: string;
  
  // Delivery preferences
  deliveryPreference?: 'door' | 'location';
  meetLocation?: string;
  deliveryInstructions?: string;
  personalLabel?: string;
}
```

### PaymentMethod Interface

```typescript
interface PaymentMethod {
  id: string;
  type: string;        // e.g., "Visa", "Mastercard"
  cardNumber: string;
  lastFour: string;
  cvc: string;
  expiry: string;
  zipCode: string;
  isDefault: boolean;
}
```

**Source Store**: `useUserStore` from `store/user-store.ts`

**Access Paths**:
- `actual_state.user.currentUser` - Current logged-in user (or null)
- `actual_state.user.isAuthenticated` - Boolean indicating if user is logged in
- `actual_state.user.tempAddress` - Temporary address being edited (or null)

**Example**:
```json
{
  "user": {
    "currentUser": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "1234567890",
      "country": {
        "id": "1",
        "code": "US",
        "name": "United States",
        "dialCode": "+1"
      }
    },
    "isAuthenticated": true,
    "tempAddress": null
  }
}
```

---

## App State

### `app: { searchResults, currentStore, currentCategory, visitedStores }`

Contains application-level UI state.

```typescript
app: {
  searchResults: SearchResult[];
  currentStore: Record<string, any>;
  currentCategory: string | null;
  visitedStores: string[];
}
```

### SearchResult Interface

```typescript
interface SearchResult {
  id: string;
  name: string;
  type: 'restaurant' | 'item' | 'category';
  category?: string;
  restaurantName?: string;
  restaurantId?: string;
  image?: string;
  price?: string;
  rating?: number;
  description?: string;
}
```

**Source Store**: `useAppStore` from `store/app-store.ts`

**Access Paths**:
- `actual_state.app.searchResults` - Array of current search results
- `actual_state.app.currentStore` - Currently viewed store/restaurant details
- `actual_state.app.currentCategory` - Currently selected category filter
- `actual_state.app.visitedStores` - Array of store IDs the user has visited

**Example**:
```json
{
  "app": {
    "searchResults": [
      {
        "id": "item-123",
        "name": "Cappuccino",
        "type": "item",
        "restaurantName": "Starbucks",
        "restaurantId": "starbucks-299-fremont",
        "price": "$4.95"
      }
    ],
    "currentStore": {
      "id": "starbucks-299-fremont",
      "name": "Starbucks"
    },
    "currentCategory": "restaurant",
    "visitedStores": ["starbucks-299-fremont", "mcdonalds-market-st"]
  }
}
```

---

## Orders State

### `orders: Order[]`

Array of user's order history.

```typescript
interface Order {
  id: string;
  
  // Store/Restaurant info
  storeId?: string;
  storeName?: string;
  restaurantId?: string;  // Old field name (backward compatibility)
  restaurantName?: string; // Old field name (backward compatibility)
  storeCategory?: string;
  
  // Order items
  items?: OrderItem[];
  
  // Payment info
  paymentCard?: PaymentCard;
  
  // Delivery info
  deliveryAddress?: DeliveryAddress | null;
  deliveryOption?: DeliveryOption;
  phoneNumber?: PhoneNumber;
  
  // Pricing
  tipAmount?: number;
  subtotal?: number;
  serviceFee?: number;
  deliveryFee?: number;
  discount?: number;
  total?: number;
  totalAmount?: number; // Old field name (backward compatibility)
  
  // Deal/Promotion info
  appliedDeal?: {
    id: string;
    title: string;
    promoCode?: string;
    discountType?: string;
    discountValue?: number;
  } | null;
  
  // Order metadata
  orderDate: string;
  status: string;
  orderType?: 'Personal' | 'Business';
  
  // Optional features
  rating?: number;
  reviewDate?: string;
  reviewText?: string;
  tags?: string[];
  isDashPass?: boolean;
  isGroupOrder?: boolean;
}
```

### OrderItem Interface

```typescript
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  menuCategoryId?: string;      // Menu category ID (NEW orders only)
  menuCategoryName?: string;    // Menu category name (NEW orders only)
  modifications?: OrderModification[];
}
```

### OrderModification Interface

```typescript
interface OrderModification {
  modificationId: string;
  modificationDescription: string;
  isRequired: boolean;
  options: OrderModificationOption[];
}

interface OrderModificationOption {
  optionId: string;
  optionName: string;
  optionDescription?: string;
  price: number;
  quantity: number;
  isCounter: boolean;
}
```

**Source Store**: `useOrdersStore` from `store/orders-store.ts`

**Access Path**: `actual_state.orders`

**Example**:
```json
{
  "orders": [
    {
      "id": "order-456",
      "storeId": "starbucks-299-fremont",
      "storeName": "Starbucks",
      "storeCategory": "restaurant",
      "items": [
        {
          "id": "123",
          "name": "Cappuccino",
          "quantity": 2,
          "price": 4.95,
          "menuCategoryId": "5",
          "menuCategoryName": "Beverages"
        }
      ],
      "subtotal": 9.90,
      "serviceFee": 1.49,
      "deliveryFee": 3.99,
      "total": 15.38,
      "orderDate": "Wed, Apr 23",
      "status": "Delivered"
    }
  ]
}
```

---

## Deals State

### `deals: { appliedDeals }`

Tracks deals that have been applied to carts.

```typescript
deals: {
  appliedDeals: Array<{
    dealId: string;
    cartId: string;
    appliedAt: number;
    freeItemIds?: string[];
  }>;
}
```

### AppliedDeal Interface

```typescript
interface AppliedDeal {
  dealId: string;      // ID of the deal
  cartId: string;      // Cart ID (format: "storeId-category")
  appliedAt: number;   // Timestamp when deal was applied
  freeItemIds?: string[]; // IDs of items that are free with this deal
}
```

**Source Store**: `useDealsStore` from `store/deals-store.ts`

**Access Path**: `actual_state.deals.appliedDeals`

**Example**:
```json
{
  "deals": {
    "appliedDeals": [
      {
        "dealId": "deal-free-coffee",
        "cartId": "starbucks-299-fremont-restaurant",
        "appliedAt": 1704067200000,
        "freeItemIds": ["123"]
      }
    ]
  }
}
```

---

## Reviews State

### `reviews: { newReviews, helpfulChanges, approvalChanges, deletedReviewIds }`

Tracks user-created reviews and review interactions.

```typescript
reviews: {
  newReviews: UserReview[];
  helpfulChanges: Record<string, string[]>;
  approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
  deletedReviewIds: string[];
}
```

### UserReview Interface

```typescript
interface UserReview {
  id: string;
  storeId: string;
  storeCategory: string;
  userId: string;
  rating: number;
  content: string;
  timestamp: string;
  orderId?: string;
  approvalStatus: 'approved' | 'rejected' | 'pending';
  photos?: string[];
  likedItemIds?: string[];
  helpfulCount?: number;
}
```

**Source Store**: `useReviewStore` from `store/review-store.ts`

**Access Paths**:
- `actual_state.reviews.newReviews` - Array of newly created reviews
- `actual_state.reviews.helpfulChanges` - Map of review IDs to user IDs who marked them helpful
- `actual_state.reviews.approvalChanges` - Map of review IDs to their approval status changes
- `actual_state.reviews.deletedReviewIds` - Array of review IDs that have been deleted

**Example**:
```json
{
  "reviews": {
    "newReviews": [
      {
        "id": "review-789",
        "storeId": "starbucks-299-fremont",
        "storeCategory": "restaurant",
        "userId": "user-123",
        "rating": 5,
        "content": "Great coffee!",
        "timestamp": "2024-01-01T12:00:00Z",
        "approvalStatus": "approved"
      }
    ],
    "helpfulChanges": {
      "review-456": ["user-123", "user-789"]
    },
    "approvalChanges": {
      "review-999": "approved"
    },
    "deletedReviewIds": ["review-111"]
  }
}
```

---

## Timestamp

### `timestamp: number`

The timestamp (in milliseconds) when the state was captured.

**Example**: `1704067200000`

---

## State Sources

The actual state is built by aggregating data from multiple Zustand stores:

| State Property | Source Store | Location |
|---------------|--------------|----------|
| `carts` | `useCartStore` | `store/cart-store.ts` |
| `user.currentUser` | `useUserStore` | `store/user-store.ts` |
| `user.isAuthenticated` | `useUserStore.isAuthenticated()` | `store/user-store.ts` |
| `user.tempAddress` | `useUserStore.getTempAddress()` | `store/user-store.ts` |
| `app.searchResults` | `useAppStore` | `store/app-store.ts` |
| `app.currentStore` | `useAppStore` | `store/app-store.ts` |
| `app.currentCategory` | `useAppStore` | `store/app-store.ts` |
| `app.visitedStores` | `useAppStore` | `store/app-store.ts` |
| `orders` | `useOrdersStore` | `store/orders-store.ts` |
| `deals.appliedDeals` | `useDealsStore` | `store/deals-store.ts` |
| `reviews.newReviews` | `useReviewStore` | `store/review-store.ts` |
| `reviews.helpfulChanges` | `useReviewStore` | `store/review-store.ts` |
| `reviews.approvalChanges` | `useReviewStore` | `store/review-store.ts` |
| `reviews.deletedReviewIds` | `useReviewStore` | `store/review-store.ts` |
| `timestamp` | `Date.now()` | Generated at capture time |

---

## State Access

The actual state is accessed via the `getStates()` function:

```typescript
import { getStates } from '@/lib/verifier/utils/state-accessor';

const { actual_state, expected_states } = await getStates(expected_state_functions);
```

This function:
1. Reads the current state from all Zustand stores
2. Aggregates them into a single `AppState` object
3. Executes expected state functions with JSONPath resolution
4. Returns both actual and expected states for comparison

---

## JSONPath Access

The actual state can be queried using JSONPath expressions:

| JSONPath | Description | Example Result |
|----------|-------------|----------------|
| `$.carts` | All carts | Array of Cart objects |
| `$.carts[0]` | First cart | Single Cart object |
| `$.carts[*].items` | Items from all carts | Array of CartItem arrays |
| `$.user.currentUser.email` | User's email | "john@example.com" |
| `$.orders[0].total` | Total of first order | 15.38 |
| `$.deals.appliedDeals[*].dealId` | All applied deal IDs | Array of strings |
| `$.reviews.newReviews[?(@.rating>4)]` | Reviews with rating > 4 | Filtered array |

---

## Notes

- **State Aggregation**: The actual state is a read-only snapshot combining multiple stores
- **Menu Categories**: Only present in NEW order items created after the feature was implemented
- **Backward Compatibility**: Many fields support both old and new naming conventions
- **Persistence**: Individual stores persist to localStorage; the aggregated state is ephemeral
- **Timestamp**: Useful for tracking when state changes occurred during verification
