# Data Storage Architecture Guide

This document explains how data is stored and managed across the application, focusing on:
1. **Customer Orders** - How orders are stored (database + client-side)
2. **Reviews** - How reviews are stored (database + client-side)
3. **Merchant Store Data** - How merchant-specific data is stored (localStorage + Zustand)
4. **Creating Your Own Merchant Data Storage** - Guide for adding new merchant data types

---

## 1. Customer Orders Storage

### Database Schema
Orders are stored in SQLite database with the following structure:

**`orders` table:**
- `id` - Primary key
- `user_id` - Foreign key to `users` table
- `store_id` - Foreign key to `restaurants` table
- `subtotal`, `service_fee`, `delivery_fee`, `total` - Financial amounts (stored in cents)
- `order_date` - ISO 8601 datetime string
- `status` - Order status
- Other fields: `delivery_type`, `tip_amount`, `phone_number`, etc.

**`order_items` table:**
- Links orders to menu items
- Stores `quantity` for each item
- References `menu_items` table

**Location:** `dashdoor_schema.sql` (lines 231-286)

### API Endpoint
**GET `/api/orders`**
- Fetches orders by `userId` OR `storeId` (for merchant portal)
- Returns complete order data with items, modifications, and restaurant info
- **Location:** `app/api/orders/route.ts`

**Example Query:**
```typescript
// Fetch user orders
GET /api/orders?userId=123

// Fetch merchant orders
GET /api/orders?storeId=456
```

### Client-Side Storage (Zustand)

**Store:** `store/orders-store.ts`

```typescript
interface OrdersStore {
  orders: Order[]
  isInitialized: boolean
  addOrder: (order: Order) => void
  getOrders: () => Order[]
  updateOrderReview: (orderId: string, rating: number, reviewText: string) => void
  initializeOrdersFromDB: (orders: Order[]) => void
}
```

**Features:**
- **Persisted to localStorage** - Survives page refreshes
- **Initialized from database** - Fetches orders via API on first load
- **Add orders** - When customer places new order
- **Update reviews** - When customer reviews an order

**Usage:**
```typescript
import { useOrdersStore } from '@/store/orders-store'

// Get orders
const orders = useOrdersStore(state => state.orders)

// Add order
useOrdersStore.getState().addOrder(newOrder)

// Initialize from database
useOrdersStore.getState().initializeOrdersFromDB(ordersFromAPI)
```

**Hook:** `lib/hooks/use-orders.ts`
- Automatically fetches orders from API when user logs in
- Initializes Zustand store with database data

---

## 2. Reviews Storage

### Database Schema

**`user_reviews` table:**
- `id` - Primary key
- `store_id` - Restaurant being reviewed
- `user_id` - User who wrote review
- `rating` - 0-5 stars (REAL, supports half stars)
- `content` - Review text
- `timestamp` - ISO 8601 datetime
- `order_id` - Optional link to order
- `approval_status` - 'approved', 'rejected', or 'pending'

**Related tables:**
- `review_photos` - Photos attached to reviews
- `review_helpful` - Users who marked review as helpful
- `review_liked_items` - Items liked in review

**Location:** `dashdoor_schema.sql` (lines 291-331)

### API Endpoints

**GET `/api/reviews/[storeId]`**
- Fetches all reviews for a store
- Optional `approvalStatus` query param to filter
- Returns reviews with user info, photos, helpful ratings, and liked items

**GET `/api/reviews`**
- Fetches all reviews (with optional filters)
- Supports pagination via `limit` query param

**Location:** `app/api/reviews/[storeId]/route.ts`

### Client-Side Storage (Zustand)

**Store:** `store/review-store.ts`

```typescript
interface ReviewStore {
  newReviews: UserReview[] // New reviews created in session
  helpfulChanges: Record<string, string[]> // reviewId -> userIds
  approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>
  deletedReviewIds: string[]
  
  addReview: (review: Omit<UserReview, 'id' | 'timestamp' | 'approvalStatus'>) => void
  toggleHelpfulRating: (reviewId: string, userId: string) => void
  updateReviewApproval: (reviewId: string, status: string) => void
  deleteReview: (reviewId: string) => void
}
```

**Features:**
- **Session-only changes** - Tracks changes made in current session
- **Merges with API data** - Uses `mergeReviewsWithChanges()` utility
- **Not persisted** - Changes are temporary until synced to database

**Utility:** `lib/utils/review-utils.ts`
- `mergeReviewsWithChanges()` - Combines API reviews with session changes

---

## 3. Merchant Data Storage

### Architecture Overview

Merchant portal uses a **separate database** and **dedicated API layer**:

| Layer | Location | Purpose |
|-------|----------|---------|
| Database | `data/db/merchant.db` | Initial/seed data (read-only) |
| API | `/api/merchant/*` | Bridges database and frontend |
| Zustand + localStorage | Client-side | Runtime changes and state |

**Key Principle**: Database is read-only initial data. All application changes happen in client-side stores (localStorage).

### Layer 1: Database (`merchant.db`)

**Location:** `data/db/merchant.db`
**Schema:** `data/db/schema/merchant_schema.sql`
**Seed Data:** `data/db/schema/merchant_seed.sql`

**Tables:**
| Table | Description |
|-------|-------------|
| `merchants` | Merchant user accounts, credentials, onboarding status |
| `stores` | Store information (name, email, phone, hours) |
| `addresses` | Store addresses with lat/lng |
| `merchant_stores` | Junction table for merchant-store relationships |
| `menu_categories` | Menu categories per store |
| `menu_items` | Menu items with pricing and status |
| `modifiers` | Modifier groups |
| `modifier_options` | Options within modifiers |
| `menu_item_modifiers` | Links menu items to modifiers |
| `orders` | Order records with customer info and pricing |
| `order_items` | Items within orders |
| `reviews` | Customer reviews with ratings |
| `review_liked_items` | Menu items liked in reviews |
| `review_photos` | Photos attached to reviews |

**Database Connection:** `lib/merchant-db.ts`

Requires environment variable:
```env
MERCHANT_LIBSQL_URL=file:data/db/merchant.db
```

Usage:
```typescript
import { merchantDb } from '@/lib/merchant-db';

const results = await merchantDb.query('SELECT * FROM stores WHERE id = ?', [storeId]);
```

### Layer 2: API Layer (`/api/merchant/*`)

**Important**: Merchant APIs query `merchant.db` exclusively. User-side APIs are **never** used.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/merchant/auth/login` | POST | Merchant login |
| `/api/merchant/restaurants` | GET | List stores |
| `/api/merchant/restaurants/[id]` | GET | Single store |
| `/api/merchant/restaurants/[id]/menu` | GET | Menu items |
| `/api/merchant/restaurants/[id]/modifiers` | GET | Modifiers |
| `/api/merchant/orders` | GET/POST | Orders |
| `/api/merchant/reviews/[storeId]` | GET | Reviews |

### Layer 3: Client-Side Storage (Zustand + localStorage)

#### Global Store Keys

| Key | Description | Store File |
|-----|-------------|------------|
| `merchant-auth` | Current merchant, registered merchants | `merchant-auth-store.ts` |
| `merchant-stores` | Locally created stores | `merchant-stores-store.ts` |

#### Store-Specific Keys (Pattern: `merchant.{storeId}.{section}`)

When a store is loaded, data is seeded to localStorage:

| Pattern | Example | Description |
|---------|---------|-------------|
| `merchant.{storeId}.home` | `merchant.store-1.home` | Home metrics |
| `merchant.{storeId}.orders` | `merchant.store-1.orders` | Orders |
| `merchant.{storeId}.menu` | `merchant.store-1.menu` | Menu items |
| `merchant.{storeId}.modifiers` | `merchant.store-1.modifiers` | Modifiers |
| `merchant.{storeId}.users` | `merchant.store-1.users` | Users |
| `merchant.{storeId}.settings` | `merchant.store-1.settings` | Settings |
| `merchant.{storeId}.store-availability` | `merchant.store-1.store-availability` | Hours |

#### Zustand Store Keys

| Key | Description | Store File |
|-----|-------------|------------|
| `merchant.home` | Home store state | `merchant-home-store.ts` |
| `merchant.orders` | Orders store state | `merchant-orders-store.ts` |
| `merchant.menu` | Menu store state | `merchant-menu-store.ts` |
| `merchant.modifiers` | Modifiers store state | `merchant-modifiers-store.ts` |
| `merchant.users` | Users store state | `merchant-users-store.ts` |
| `merchant.settings` | Settings store state | `merchant-settings-store.ts` |
| `merchant.store-availability` | Availability store state | `merchant-store-availability-store.ts` |

### Data Flow

#### Authentication Flow
```
1. User visits /merchant/auth (login page)
2. loginMerchant() checks:
   a. merchant-auth-store (localStorage) first
   b. Falls back to POST /api/merchant/auth/login
3. On success: setCurrentMerchant() saves to store
4. Redirect to /merchant/store/{primaryStoreId}
```

#### Store Data Loading (Store-First, API-Fallback)
```
1. User navigates to /merchant/store/[id]
2. Layout guard checks authentication
3. initializeStoreData() runs:
   a. Check merchant-stores-store (local stores) first
   b. If not found, fetch from /api/merchant/* APIs
4. Data seeded to localStorage (merchant.{storeId}.{section})
5. Zustand stores hydrate from localStorage
6. Page renders from Zustand stores
```

#### Seeding Logic (`lib/utils/store-data-loader.ts`)
```typescript
const sections = ['home', 'orders', 'menu', 'modifiers', 'users', 'settings', 'store-availability'];

sections.forEach(([key, data]) => {
  const storageKey = `merchant.${storeId}.${key}`;
  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
});
```

### Usage Example
```typescript
import { useMerchantOrdersStore } from '@/store/merchant-orders-store'
import { useMerchantAuthStore } from '@/store/merchant-auth-store'

function MerchantPage() {
  const { orders, addOrder } = useMerchantOrdersStore();
  const { currentMerchant } = useMerchantAuthStore();
  
  // Store automatically persists to localStorage
}
```

---

## 4. Creating Your Own Merchant Data Storage

To add a new type of merchant data (e.g., "Analytics", "Reports", "Inventory"):

### Step 1: Add Database Table (if needed for initial data)

**Update `data/db/schema/merchant_schema.sql`:**

```sql
CREATE TABLE analytics_reports (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date_range TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX idx_analytics_reports_store_id ON analytics_reports(store_id);
```

### Step 2: Add Seed Data (optional)

**Update `data/db/schema/merchant_seed.sql`:**

```sql
INSERT INTO analytics_reports (id, store_id, name, date_range, created_at) VALUES
('report-1', 'store-1', 'Weekly Sales', 'last_7_days', '2024-12-01T10:00:00.000Z');
```

### Step 3: Create API Endpoint

**Create `app/api/merchant/analytics/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { merchantDb } from '@/lib/merchant-db'  // Use merchant-db, NOT db

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')
  
  if (!storeId) {
    return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
  }
  
  const reports = await merchantDb.query(
    'SELECT * FROM analytics_reports WHERE store_id = ?',
    [storeId]
  )
  
  return NextResponse.json({ success: true, data: reports })
}
```

### Step 4: Add Storage Key

**Update `lib/utils/merchant-storage.ts`:**

```typescript
export const MerchantStorageKeys = {
  // ... existing keys
  ANALYTICS: 'merchant.analytics',
} as const
```

### Step 5: Create Zustand Store

**Create `store/merchant-analytics-store.ts`:**

```typescript
'use client'

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { MerchantStorageKeys } from "@/lib/utils/merchant-storage"

interface AnalyticsReport {
  id: string
  name: string
  dateRange: string
  createdAt: string
}

interface AnalyticsStore {
  reports: AnalyticsReport[]
  selectedReportId: string | null
  
  addReport: (report: AnalyticsReport) => void
  deleteReport: (reportId: string) => void
  setSelectedReportId: (id: string | null) => void
}

export const useMerchantAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      reports: [],
      selectedReportId: null,
      
      addReport: (report) => set((state) => ({ 
        reports: [...state.reports, report] 
      })),
      
      deleteReport: (reportId) => set((state) => ({
        reports: state.reports.filter(r => r.id !== reportId)
      })),
      
      setSelectedReportId: (id) => set({ selectedReportId: id })
    }),
    {
      name: MerchantStorageKeys.ANALYTICS
    }
  )
)
```

### Step 6: Update Store Data Loader (if loading from API)

**Update `lib/utils/store-data-loader.ts`:**

```typescript
// Add to sections array in seedLocalStorage function
const sections: Array<[string, any]> = [
  ['home', storeData.home],
  ['orders', storeData.orders],
  // ... existing
  ['analytics', storeData.analytics], // NEW
];

// Add API fetch if needed
const [analyticsResp] = await Promise.all([
  fetchJson<{ success: boolean; data: any[] }>(`/api/merchant/analytics?storeId=${storeId}`),
]);
```

### Step 7: Use in Components

```typescript
'use client'

import { useMerchantAnalyticsStore } from '@/store/merchant-analytics-store'

export default function AnalyticsPage() {
  const reports = useMerchantAnalyticsStore(state => state.reports)
  const addReport = useMerchantAnalyticsStore(state => state.addReport)
  
  return (
    <div>
      {reports.map(report => (
        <div key={report.id}>{report.name}</div>
      ))}
    </div>
  )
}
```

### Important Notes

1. **Always use `merchantDb`** from `lib/merchant-db.ts` for merchant APIs
2. **Never use user-side APIs** (`/api/orders`, `/api/reviews`) in merchant pages
3. **Store-first pattern**: Check Zustand store before calling API
4. **Database is read-only**: All runtime changes go to localStorage

---

## Summary

### Customer Portal (User-Side)

| Aspect | Details |
|--------|---------|
| **Database** | `dashdoor.db` |
| **Orders API** | `/api/orders` |
| **Reviews API** | `/api/reviews/[storeId]` |
| **Orders Store** | `orders-store` (localStorage) |
| **Reviews Store** | `review-store` (session only) |

### Merchant Portal

| Aspect | Details |
|--------|---------|
| **Database** | `merchant.db` (read-only initial data) |
| **API Prefix** | `/api/merchant/*` |
| **Auth Store** | `merchant-auth-store` |
| **Stores Store** | `merchant-stores-store` |
| **Orders Store** | `merchant-orders-store` |
| **Menu Store** | `merchant-menu-store` |
| **Storage Pattern** | `merchant.{storeId}.{section}` |
| **Data Flow** | Store-first, API-fallback |

### Adding New Merchant Data
1. Add database table to `merchant_schema.sql` (if needed)
2. Add seed data to `merchant_seed.sql` (optional)
3. Create API endpoint in `/api/merchant/`
4. Add storage key to `MerchantStorageKeys`
5. Create Zustand store with persistence
6. Update store data loader (if needed)
7. **Remember**: Use `merchantDb`, never `db`

---

## Key Files Reference

### Customer Portal (dashdoor.db)
- **Database Schema:** `dashdoor_schema.sql`
- **Database Connection:** `lib/db.ts`
- **Orders API:** `app/api/orders/route.ts`
- **Reviews API:** `app/api/reviews/[storeId]/route.ts`
- **Orders Store:** `store/orders-store.ts`
- **Review Store:** `store/review-store.ts`

### Merchant Portal (merchant.db)
- **Database Schema:** `data/db/schema/merchant_schema.sql`
- **Database Seed:** `data/db/schema/merchant_seed.sql`
- **Database Connection:** `lib/merchant-db.ts`
- **Auth API:** `app/api/merchant/auth/login/route.ts`
- **Restaurants API:** `app/api/merchant/restaurants/route.ts`
- **Orders API:** `app/api/merchant/orders/route.ts`
- **Reviews API:** `app/api/merchant/reviews/[storeId]/route.ts`
- **Auth Store:** `store/merchant-auth-store.ts`
- **Stores Store:** `store/merchant-stores-store.ts`
- **Orders Store:** `store/merchant-orders-store.ts`
- **Menu Store:** `store/merchant-menu-store.ts`
- **Storage Keys:** `lib/utils/merchant-storage.ts`
- **Store Loader:** `lib/utils/store-data-loader.ts`
- **Current Store Hook:** `lib/hooks/useCurrentStore.tsx`
- **Route Guard:** `app/merchant/store/[id]/layout.tsx`

