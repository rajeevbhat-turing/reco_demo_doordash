# Merchant Data Architecture

This document describes the data architecture for the merchant portal, including database, API, and localStorage structure.

## Overview

The merchant portal uses a **hybrid data architecture**:
1. **`merchant.db`** - SQLite database for initial/seed data (read-only)
2. **Zustand stores with localStorage** - For all runtime changes and user data
3. **API layer** - Bridges database and frontend

**Key Principle**: Database is read-only initial data. All application changes happen in client-side stores (localStorage).

---

## Database: `merchant.db`

Located at `data/db/merchant.db`, this SQLite database contains initial seed data.

### Schema Tables

| Table | Description |
|-------|-------------|
| `merchants` | Merchant user accounts (login credentials, onboarding status) |
| `stores` | Store information (name, email, phone, hours) |
| `addresses` | Store addresses with lat/lng |
| `merchant_stores` | Junction table for merchant-store relationships |
| `menu_categories` | Menu categories per store |
| `menu_items` | Menu items with pricing and status |
| `modifiers` | Modifier groups (e.g., "Choose your sides") |
| `modifier_options` | Options within modifiers |
| `menu_item_modifiers` | Links menu items to modifiers |
| `orders` | Order records with customer info and pricing |
| `order_items` | Items within orders |
| `reviews` | Customer reviews with ratings |
| `review_liked_items` | Menu items liked in reviews |
| `review_photos` | Photos attached to reviews |

### Schema Files

- **Schema**: `data/db/schema/merchant_schema.sql`
- **Seed Data**: `data/db/schema/merchant_seed.sql`

---

## API Layer: `/api/merchant/*`

All merchant APIs query `merchant.db` exclusively. User-side APIs (`/api/orders`, `/api/reviews`, etc.) are **never** used in merchant portal.

### Merchant API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/merchant/auth/login` | POST | Merchant login (email/password) |
| `/api/merchant/restaurants` | GET | List all stores or stores by merchant |
| `/api/merchant/restaurants/[id]` | GET | Single store details |
| `/api/merchant/restaurants/[id]/menu` | GET | Menu items and categories |
| `/api/merchant/restaurants/[id]/modifiers` | GET | Modifiers for a store |
| `/api/merchant/orders` | GET/POST | Orders for a store |
| `/api/merchant/reviews/[storeId]` | GET | Reviews for a store |

### Database Connection

```typescript
// lib/merchant-db.ts
import { merchantDb } from '@/lib/merchant-db';

const results = await merchantDb.query('SELECT * FROM stores WHERE id = ?', [storeId]);
```

---

## Zustand Stores (localStorage)

All merchant stores use Zustand with `persist` middleware for automatic localStorage synchronization.

### Global Store Keys

These keys are shared across all stores:

| Key | Description | Store File |
|-----|-------------|------------|
| `merchant-auth` | Current merchant, registered merchants | `merchant-auth-store.ts` |
| `merchant-stores` | Locally created stores | `merchant-stores-store.ts` |

### Store-Specific Keys

These keys follow the pattern `merchant.{storeId}.{section}` for per-store data:

| Pattern | Example | Description |
|---------|---------|-------------|
| `merchant.{storeId}.home` | `merchant.store-1.home` | Home page metrics for store |
| `merchant.{storeId}.orders` | `merchant.store-1.orders` | Orders for store |
| `merchant.{storeId}.menu` | `merchant.store-1.menu` | Menu categories and items |
| `merchant.{storeId}.modifiers` | `merchant.store-1.modifiers` | Modifiers for store |
| `merchant.{storeId}.users` | `merchant.store-1.users` | User management |
| `merchant.{storeId}.settings` | `merchant.store-1.settings` | Store settings |
| `merchant.{storeId}.store-availability` | `merchant.store-1.store-availability` | Store hours |

**Seeding**: When a store is loaded via `initializeStoreData()`, data is seeded to these keys from the API if they don't already exist in localStorage.

### Zustand Store Keys

These are the Zustand persist keys (global, not store-specific):

| Key | Description | Store File |
|-----|-------------|------------|
| `merchant.home` | Home store state | `merchant-home-store.ts` |
| `merchant.orders` | Orders store state | `merchant-orders-store.ts` |
| `merchant.menu` | Menu store state | `merchant-menu-store.ts` |
| `merchant.modifiers` | Modifiers store state | `merchant-modifiers-store.ts` |
| `merchant.users` | Users store state | `merchant-users-store.ts` |
| `merchant.settings` | Settings store state | `merchant-settings-store.ts` |
| `merchant.store-availability` | Availability store state | `merchant-store-availability-store.ts` |

### Key Stores

#### `merchant-auth-store.ts`
```typescript
interface MerchantAuthStore {
  currentMerchant: MerchantUser | null;  // Logged-in merchant
  merchants: MerchantUser[];              // Registered merchants (starts empty)
  tempStore: TempStoreData | null;        // Landing page data
  // Actions: setCurrentMerchant, signOut, registerMerchant, etc.
}
```

#### `merchant-stores-store.ts`
```typescript
interface MerchantStoresStore {
  stores: MerchantStore[];  // Locally created stores
  // Actions: addStore, updateStoreHours, getStoresByOwnerId, getStoreById
}
```

#### `merchant-orders-store.ts`
```typescript
interface MerchantOrdersStore {
  orders: Order[];
  // Actions: addOrder, updateOrderStatus, etc.
}
```

---

## Data Flow

### Authentication Flow

```
1. User visits /merchant/auth (login page)
2. loginMerchant() checks:
   a. merchant-auth-store (localStorage) first
   b. Falls back to /api/merchant/auth/login API
3. On success: setCurrentMerchant() saves to store
4. User redirected to /merchant/store/{primaryStoreId}
```

### Store Data Loading Flow

```
1. User navigates to /merchant/store/[id]
2. Layout guard checks authentication
3. initializeStoreData() runs:
   a. Check merchant-stores-store (local stores) first
   b. If not found, fetch from /api/merchant/* APIs
4. Data seeded to localStorage stores
5. Page renders from localStorage stores
```

### New Store Registration Flow

```
1. Landing page (/merchant) collects store info
2. tempStore saved to merchant-auth-store
3. User signs up at /merchant/auth/user/signup
4. On OTP verification:
   a. registerMerchant() creates merchant in store
   b. addStore() creates store in merchant-stores-store
   c. Navigate to /merchant/onboarding
```

---

## Component-Level Keys

Component-level state uses the pattern: `merchant.{section}.{component}.{field}`

**Examples:**
- `merchant.users.form.role` - User role selection
- `merchant.orders.filters.searchQuery` - Orders search
- `merchant.menu.filters.selectedFilter` - Menu filter
- `merchant.settings.store.storeName` - Store name

---

## Usage Examples

### Using Stores

```typescript
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

function MyComponent() {
  const { orders, addOrder } = useMerchantOrdersStore();
  const { currentMerchant } = useMerchantAuthStore();
  
  // Store automatically persists to localStorage
}
```

### Persisting Component State

```typescript
import { useMerchantPersistedState } from '@/lib/hooks/useMerchantPersistedState';

function ManageUsersPage() {
  const [selectedRole, setSelectedRole] = useMerchantPersistedState(
    'users', 'form', 'role', ''
  );
}
```

---

## Store Structure Examples

### merchant-auth (localStorage key: `merchant-auth`)
```json
{
  "state": {
    "currentMerchant": {
      "id": "merchant-1",
      "email": "portland.grill@dashdoor.merchant",
      "firstName": "John",
      "lastName": "Smith",
      "primaryStoreId": "store-1",
      "storeIds": ["store-1", "store-4"],
      "onboardingCompleted": true
    },
    "merchants": [],
    "tempStore": null
  }
}
```

### merchant.menu
```json
{
  "categories": [
    {
      "id": "cat-1",
      "name": "Street Tacos",
      "items": [...]
    }
  ],
  "expandedCategories": [],
  "showBanner": true
}
```

---

## Best Practices

1. **Never use user-side stores/APIs** in merchant pages
   - ❌ `useOrdersStore` (user-side)
   - ✅ `useMerchantOrdersStore` (merchant-side)

2. **Store-first, API-fallback** for data loading
   - Check localStorage stores first
   - Only call API if data not in store

3. **Database is read-only** from application perspective
   - Initial/seed data only
   - All changes go to localStorage stores

4. **Use TypeScript types** for type safety
   - All stores export TypeScript interfaces

---

## Clearing Data

```typescript
import { clearAllMerchantStorage } from '@/lib/utils/merchant-storage';

// Clear all merchant data
clearAllMerchantStorage();

// Clear specific store
import { removeMerchantStorage, MerchantStorageKeys } from '@/lib/utils/merchant-storage';
removeMerchantStorage(MerchantStorageKeys.MENU);
```
