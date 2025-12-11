# Order Flow and Authentication Guide

## Overview

This document explains:
1. How orders are placed and stored
2. Customer portal vs Merchant portal data separation
3. Authentication in the merchant portal
4. Database architecture

---

## 1. Data Separation: Customer vs Merchant

### Two Separate Databases

| Database | Location | Used By |
|----------|----------|---------|
| `dashdoor.db` | `data/db/dashdoor.db` | Customer portal (user-side) |
| `merchant.db` | `data/db/merchant.db` | Merchant portal only |

**Key Principle**: Merchant portal **never** uses user-side APIs or stores.

### API Separation

| Portal | API Prefix | Database |
|--------|-----------|----------|
| Customer | `/api/orders`, `/api/reviews`, `/api/stores` | `dashdoor.db` |
| Merchant | `/api/merchant/orders`, `/api/merchant/reviews`, `/api/merchant/restaurants` | `merchant.db` |

---

## 2. Customer Order Flow

### Order Placement (`/store/[id]` → `/checkout`)

1. Customer browses store at `/store/[id]`
2. Adds items to cart (stored in `cart-store`)
3. Proceeds to checkout at `/checkout`
4. On "Place Order":
   - Order saved to `dashdoor.db` via `POST /api/orders`
   - Order added to `orders-store` (localStorage)

### Customer Order Retrieval (`/orders`)

- **API**: `GET /api/orders?userId={userId}`
- **Database**: `dashdoor.db`
- **Query**: `SELECT * FROM orders WHERE user_id = ?`
- **Shows**: Only orders placed by that user

**Code Locations:**
- Page: `app/orders/page.tsx`
- Hook: `lib/hooks/use-orders.ts`
- API: `app/api/orders/route.ts`

---

## 3. Merchant Order Flow

### Data Source

Merchant orders come from **two sources**:
1. **`merchant.db`** - Initial/seed order data
2. **`merchant-orders-store`** - Runtime orders (simulated or added)

### Order Retrieval (`/merchant/store/[id]/orders`)

1. Page loads, checks `merchant-orders-store` first
2. If empty, fetches from `/api/merchant/orders?storeId={id}`
3. API queries `merchant.db` and returns orders
4. Orders stored in `merchant-orders-store` (localStorage)

**Key Code:**
- Page: `app/merchant/store/[id]/orders/page.tsx`
- Store: `store/merchant-orders-store.ts`
- API: `app/api/merchant/orders/route.ts`

### Simulated Orders

`useSimulatedOrders` hook generates test orders:
- Uses sample users (hardcoded, not from API)
- Uses menu items from `merchant-menu-store`
- Adds orders to `merchant-orders-store`
- Only runs if menu items exist

---

## 4. Merchant Authentication

### Authentication Flow

```
1. User visits /merchant (landing page) or /merchant/auth (login)
2. Login attempts:
   a. Check merchant-auth-store (localStorage) first
   b. Fall back to POST /api/merchant/auth/login
3. API queries merchant.db for credentials
4. On success: currentMerchant set in store
5. Redirect to /merchant/store/{primaryStoreId}
```

### Route Protection

**Layout Guard**: `app/merchant/store/[id]/layout.tsx`

Checks performed:
1. Is user authenticated? (`currentMerchant !== null`)
   - No → Redirect to `/merchant`
2. Does store belong to user? (`storeIds.includes(storeId) || primaryStoreId === storeId`)
   - No → Redirect to user's primary store
3. Authorized → Render children

```typescript
// Simplified guard logic
if (!currentMerchant) {
  router.replace('/merchant');
  return;
}

const hasAccess = currentMerchant.storeIds.includes(storeId) 
  || currentMerchant.primaryStoreId === storeId;

if (!hasAccess) {
  router.replace(`/merchant/store/${currentMerchant.primaryStoreId}`);
  return;
}
```

### Merchant User Structure

```typescript
interface MerchantUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  primaryStoreId: string;      // Main store
  storeIds: string[];          // All accessible stores
  onboardingCompleted: boolean;
  onboardingStep: number;      // 0-5
}
```

---

## 5. Database Schema

### `merchant.db` - Orders Table

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  customer_name TEXT,
  customer_id TEXT,
  customer_email TEXT,
  status TEXT NOT NULL,          -- pending, confirmed, preparing, etc.
  order_date TEXT NOT NULL,      -- ISO string
  scheduled_date TEXT,           -- For scheduled pickups
  fulfillment_type TEXT NOT NULL, -- 'pickup' or 'delivery'
  channel TEXT NOT NULL,
  delivery_street TEXT,
  delivery_city TEXT,
  delivery_state TEXT,
  delivery_zip_code TEXT,
  delivery_business TEXT,
  delivery_latitude REAL,
  delivery_longitude REAL,
  subtotal INTEGER NOT NULL,     -- In cents
  service_fee INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  tip_amount INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT,
  updated_at TEXT
);
```

### `merchant.db` - Reviews Table

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  rating REAL NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  order_id TEXT,
  approval_status TEXT NOT NULL  -- pending, approved, rejected
);
```

---

## 6. Order Status Flow

**Statuses** (from `lib/utils/order-status.ts`):

```
pending → confirmed → preparing → dasher_assigned → dasher_waiting →
ready → picked_up → on_the_way → dasher_nearby → delivered

Also: scheduled, cancelled, returned, abandoned
```

**Display in Merchant Portal:**
- Active: pending, confirmed, preparing, dasher_assigned, dasher_waiting, ready
- Scheduled: scheduled
- History: picked_up, on_the_way, dasher_nearby, delivered, cancelled, returned, abandoned

---

## 7. Summary

| Aspect | Customer Portal | Merchant Portal |
|--------|----------------|-----------------|
| **Database** | `dashdoor.db` | `merchant.db` |
| **API Prefix** | `/api/*` | `/api/merchant/*` |
| **Orders Store** | `orders-store` | `merchant-orders-store` |
| **Auth Store** | `user-store` | `merchant-auth-store` |
| **Authentication** | User login | Merchant login with store access check |
| **Route Protection** | Optional | Required (layout guard) |
| **Data Flow** | API-first | Store-first, API-fallback |

---

## 8. Debugging

### Checking localStorage (Browser DevTools)

Open DevTools → Application → Local Storage → Select site

**Key localStorage entries to check:**

| Key | What to Look For |
|-----|-----------------|
| `merchant-auth` | `currentMerchant` object, `storeIds`, `primaryStoreId` |
| `merchant-stores` | Locally created stores array |
| `merchant.{storeId}.orders` | Orders seeded for specific store |
| `merchant.{storeId}.menu` | Menu items for specific store |
| `merchant.orders` | Zustand orders store state |
| `merchant.menu` | Zustand menu store state |

**Quick localStorage checks in Console:**
```javascript
// Check merchant auth
JSON.parse(localStorage.getItem('merchant-auth'))

// Check store-specific data (e.g., store-1)
JSON.parse(localStorage.getItem('merchant.store-1.orders'))
JSON.parse(localStorage.getItem('merchant.store-1.menu'))

// Check Zustand stores
JSON.parse(localStorage.getItem('merchant.orders'))
```

---

## 9. Common Issues

### Issue: Merchant portal shows no orders

**Causes:**
1. Store ID mismatch - check URL vs database
2. No orders in `merchant.db` for that store
3. `merchant-orders-store` not populated
4. Store-specific localStorage key not seeded

**Debug:**
```javascript
// Check Zustand store state
console.log(useMerchantOrdersStore.getState().orders);

// Check localStorage directly
JSON.parse(localStorage.getItem('merchant.store-1.orders'))

// Check API response
fetch('/api/merchant/orders?storeId=store-1').then(r => r.json()).then(console.log);
```

### Issue: Redirect loop on merchant pages

**Causes:**
1. User not authenticated
2. Store ID not in user's `storeIds`
3. No `primaryStoreId` set

**Debug:**
```javascript
// Check current merchant in store
console.log(useMerchantAuthStore.getState().currentMerchant);

// Check localStorage directly
JSON.parse(localStorage.getItem('merchant-auth'))
```

### Issue: Reviews not loading

**Causes:**
1. Using wrong API (`/api/reviews/` instead of `/api/merchant/reviews/`)
2. No reviews in `merchant.db` for that store

**Solution:**
- Ensure using `/api/merchant/reviews/{storeId}?approvalStatus=approved`

### Issue: Menu items not showing

**Causes:**
1. Menu not seeded to localStorage
2. Wrong store ID

**Debug:**
```javascript
// Check menu store
console.log(useMerchantMenuStore.getState().categories);

// Check localStorage
JSON.parse(localStorage.getItem('merchant.store-1.menu'))
```

### Clearing merchant data for fresh start

```javascript
// Clear all merchant-related localStorage
Object.keys(localStorage)
  .filter(key => key.startsWith('merchant'))
  .forEach(key => localStorage.removeItem(key));

// Then refresh the page
location.reload();
```
