# Order Flow and Authentication Guide

## Overview

This document explains:
1. How orders are placed (customer vs merchant)
2. How orders are stored in the database
3. How orders are retrieved (customer vs merchant portal)
4. Authentication in the merchant portal
5. Current implementation details

---

## 1. Order Placement Flow

### Customer Order Placement (`/store/[id]` → `/checkout`)

**Flow:**
1. Customer browses store at `/store/[id]` (e.g., `/store/80`)
2. Adds items to cart (stored in Zustand `cart-store`)
3. Proceeds to checkout at `/checkout`
4. On "Place Order" click:
   - Order data is prepared with `storeId` from cart
   - Order is saved to database via `POST /api/orders`
   - Order is also added to local Zustand `orders-store` for immediate UI update

**Key Code Locations:**
- **Checkout Page**: `app/checkout/page.tsx` (line ~434-601)
- **Order Creation**: `app/api/orders/route.ts` (POST handler, line ~329-557)

**Order Data Structure:**
```typescript
{
  storeId: string,        // From cart (e.g., "80")
  userId: string | null, // Current user ID or null for guests
  items: [...],          // Cart items
  subtotal: number,
  total: number,
  status: 'pending',     // Initial status
  orderDate: ISO string,
  // ... other fields
}
```

**Database Storage:**
- `orders` table: `store_id` stored as INTEGER
- `order_items` table: Links orders to menu items
- Order status starts as `'pending'` (not `'Confirmed'`)

---

## 2. Order Retrieval

### Customer Orders (`/orders`)

**Endpoint:** `GET /api/orders?userId={userId}`

**Flow:**
1. User visits `/orders`
2. `useOrders()` hook fetches orders for current user
3. Query: `SELECT * FROM orders WHERE user_id = ?`
4. Returns only orders placed by that user

**Key Code:**
- **Page**: `app/orders/page.tsx`
- **Hook**: `lib/hooks/use-orders.ts`
- **API**: `app/api/orders/route.ts` (GET handler, userId branch)

**Authentication:**
- Requires user to be logged in (`userId` must exist)
- Uses `useUserStore` to get current user ID
- If not logged in, shows empty state or store orders

---

### Merchant Portal Orders (`/merchant/store/[id]/orders`)

**Endpoint:** `GET /api/orders?storeId={storeId}`

**Flow:**
1. Merchant visits `/merchant/store/78/orders`
2. URL param `78` is converted to numeric store ID
3. `useMerchantOrders()` hook fetches ALL orders for that store
4. Query: `SELECT * FROM orders WHERE store_id = ?`
5. Returns ALL orders for the store, regardless of which user placed them

**Key Code:**
- **Page**: `app/merchant/store/[id]/orders/page.tsx`
- **Hook**: `lib/hooks/use-merchant-orders.ts`
- **API**: `app/api/orders/route.ts` (GET handler, storeId branch)

**Store ID Resolution:**
```typescript
// URL param: "78" (string)
// Restaurant lookup: Find restaurant with id === "78"
// Database query: Convert to integer 78
// SQL: WHERE store_id = 78
```

**Important:** 
- Merchant portal shows **ALL orders** for the store
- No user filtering
- No authentication required (for now)

---

## 3. Authentication in Merchant Portal

### Current Implementation: **NO AUTHENTICATION REQUIRED**

**Status:** Merchant portal is **open** - anyone can access it without login.

**Evidence:**
- No authentication middleware in merchant routes
- No user checks in merchant pages
- `MerchantLayout` component doesn't check for user
- API endpoints accept `storeId` without user verification

**Code Locations:**
- **Layout**: `components/merchant/MerchantLayout.tsx` - No auth checks
- **Pages**: `app/merchant/store/[id]/*` - No auth guards
- **API**: `app/api/orders/route.ts` - Accepts `storeId` without user verification

**Why This Works:**
- Merchant portal is meant to be accessed by store owners/managers
- For now, it's open for development/testing
- In production, you'd add authentication middleware

---

## 4. Order Status Progression

**Status Flow (30-minute simulation):**
```
0-2 min:   pending      → "Needs action"     (Active)
2-8 min:   confirmed    → "In progress"     (Active)
8-15 min:  preparing    → "In progress"     (Active)
15-20 min: ready        → "Ready for pickup" (Active)
20-25 min: picked_up    → "Picked up"       (Scheduled)
25-30 min: on_the_way   → "On the way"       (Scheduled)
30+ min:   delivered    → "Delivered"        (Completed)
```

**Implementation:**
- Calculated client-side based on `order_date` vs current time
- Updates every second via `setInterval`
- Visual progress bar shows elapsed time

---

## 5. Database Schema

**Orders Table:**
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,           -- Can be NULL (guest orders)
  store_id INTEGER NOT NULL,  -- Restaurant/store ID
  status TEXT NOT NULL,       -- 'pending', 'confirmed', 'delivered', etc.
  order_date TEXT NOT NULL,   -- ISO string
  subtotal INTEGER,           -- In cents
  total INTEGER,              -- In cents
  -- ... other fields
)
```

**Key Points:**
- `store_id` is INTEGER (not string)
- `user_id` can be NULL (guest orders)
- All monetary values stored in cents

---

## 6. Common Issues and Solutions

### Issue: Merchant portal shows no orders

**Possible Causes:**
1. **Store ID Mismatch**: URL param doesn't match database `store_id`
   - **Solution**: Check console logs for store lookup
   - **Debug**: `console.log` shows URL param vs numeric ID

2. **Orders saved with wrong store_id**
   - **Solution**: Check order creation - ensure `storeId` is converted to integer
   - **Debug**: Check `POST /api/orders` logs

3. **Type mismatch**: String vs Integer
   - **Solution**: API now converts `storeId` to integer before query
   - **Fixed**: `parseInt(storeId, 10)` in API route

### Issue: Customer orders not showing

**Possible Causes:**
1. **User not logged in**
   - **Solution**: Check `useUserStore` - is `currentUser` set?
   - **Debug**: Check browser console for userId

2. **Orders not saved with user_id**
   - **Solution**: Guest orders won't show in customer view
   - **Note**: Guest orders only visible in merchant portal

---

## 7. Debugging Tips

### Check Browser Console:
```javascript
// Merchant Portal
🔍 Store lookup: URL param="78", Found restaurant="Miami Grill", Numeric ID="78"
📡 API Response for store 78: { orderCount: 0, orders: [] }
⚠️ No orders returned from API for store 78

// Customer Portal
✅ Syncing orders store with 2 orders from database
```

### Check Network Tab:
- Look for `GET /api/orders?storeId=78` (merchant)
- Look for `GET /api/orders?userId=123` (customer)
- Check response: `{ success: true, data: [...] }`

### Check Database:
```sql
-- Find orders for store 78
SELECT id, store_id, user_id, status, order_date 
FROM orders 
WHERE store_id = 78 
ORDER BY order_date DESC;

-- Find orders for user
SELECT id, store_id, user_id, status, order_date 
FROM orders 
WHERE user_id = 123 
ORDER BY order_date DESC;
```

---

## 8. Summary

| Aspect | Customer Portal | Merchant Portal |
|--------|----------------|-----------------|
| **Route** | `/orders` | `/merchant/store/[id]/orders` |
| **API Endpoint** | `?userId={id}` | `?storeId={id}` |
| **Shows** | User's orders only | All orders for store |
| **Authentication** | Required (user must be logged in) | **Not required** (open access) |
| **Filtering** | By `user_id` | By `store_id` |
| **Data Source** | Database + localStorage fallback | Database only |

**Key Takeaway:**
- **Merchant portal shows ALL orders** for a store, regardless of which user placed them
- **No authentication** is currently required for merchant portal
- Orders are stored with `store_id` as INTEGER in database
- Store ID from URL must match database `store_id` for orders to appear



