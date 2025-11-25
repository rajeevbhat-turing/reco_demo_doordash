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

## 3. Merchant Store Data Storage

### Current Architecture

Merchant data is stored in **two layers**:

#### Layer 1: Initial Data (Constants)
**Location:** `constants/merchant-store-data.ts`

```typescript
export interface StoreMerchantData {
  storeId: string
  storeName: string
  home: { metrics: {...}, lastUpdated: number, selectedDateRange: string }
  orders: { orders: [...], searchQuery: string, ... }
  menu: { categories: [...], ... }
  users: { users: [...] }
  settings: { store: {...}, account: {...} }
  storeAvailability: { storeStatus: string, menuHours: [...], ... }
}

export const merchantStoreData: Record<string, StoreMerchantData> = {
  "philz-coffee": { ... },
  "bombay-cafe": { ... },
  ...
}
```

**Purpose:** Initial/default data for each store. Used to seed localStorage.

#### Layer 2: Runtime Storage (localStorage + Zustand)

**localStorage Keys:** `lib/utils/merchant-storage.ts`

```typescript
export const MerchantStorageKeys = {
  HOME: 'merchant.home',
  ORDERS: 'merchant.orders',
  MENU: 'merchant.menu',
  USERS: 'merchant.users',
  SETTINGS: 'merchant.settings',
  FINANCIALS: 'merchant.financials',
  CUSTOMERS: 'merchant.customers',
  MARKETING: 'merchant.marketing',
  STORE_AVAILABILITY: 'merchant.store-availability',
}
```

**Zustand Stores:** Each section has its own Zustand store with persistence:

- `store/merchant-home-store.ts` - Home metrics
- `store/merchant-orders-store.ts` - Orders list
- `store/merchant-menu-store.ts` - Menu items
- `store/merchant-settings-store.ts` - Settings
- etc.

**Example Store:**
```typescript
export const useMerchantHomeStore = create<HomeStore>()(
  persist(
    (set) => ({
      metrics: { totalSales: 0, totalOrders: 0, ... },
      lastUpdated: Date.now(),
      selectedDateRange: "Last 7 days",
      setMetrics: (metrics) => set({ metrics }),
      ...
    }),
    {
      name: MerchantStorageKeys.HOME // Persists to localStorage
    }
  )
)
```

### Data Flow

1. **Initialization:** `lib/utils/store-data-loader.ts`
   - `initializeStoreData(storeId)` - Seeds localStorage with default data
   - Called when store is selected in `CurrentStoreProvider`

2. **Store Selection:** `lib/hooks/useCurrentStore.tsx`
   - `CurrentStoreProvider` manages current store ID
   - When store changes, loads data into Zustand stores
   - Dispatches `storeDataLoaded` event

3. **Usage:**
   ```typescript
   import { useMerchantHomeStore } from '@/store/merchant-home-store'
   
   const metrics = useMerchantHomeStore(state => state.metrics)
   const setMetrics = useMerchantHomeStore(state => state.setMetrics)
   ```

---

## 4. Creating Your Own Merchant Data Storage

To add a new type of merchant data (e.g., "Analytics", "Reports", "Inventory"):

### Step 1: Define the Data Structure

**Add to `constants/merchant-store-data.ts`:**

```typescript
export interface StoreMerchantData {
  // ... existing fields
  
  // NEW: Analytics data
  analytics: {
    reports: Array<{
      id: string
      name: string
      dateRange: string
      createdAt: string
    }>
    selectedReportId: string | null
  }
}

// Add default data for each store
export const merchantStoreData: Record<string, StoreMerchantData> = {
  "philz-coffee": {
    // ... existing data
    analytics: {
      reports: [],
      selectedReportId: null
    }
  },
  ...
}
```

### Step 2: Add Storage Key

**Update `lib/utils/merchant-storage.ts`:**

```typescript
export const MerchantStorageKeys = {
  // ... existing keys
  ANALYTICS: 'merchant.analytics', // NEW
} as const
```

### Step 3: Create Zustand Store

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

const initialReports: AnalyticsReport[] = []

export const useMerchantAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      reports: initialReports,
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

### Step 4: Update Store Data Loader

**Update `lib/utils/store-data-loader.ts`:**

```typescript
export function initializeStoreData(storeId: string) {
  const storeData = merchantStoreData[storeId]
  if (!storeData) return

  const storageKeys = [
    `merchant.${storeId}.home`,
    `merchant.${storeId}.orders`,
    // ... existing keys
    `merchant.${storeId}.analytics`, // NEW
  ]

  storageKeys.forEach((key, index) => {
    // ... existing initialization logic
    const dataSection = [
      storeData.home,
      storeData.orders,
      // ... existing sections
      storeData.analytics, // NEW
    ][index]
    // ...
  })
}
```

### Step 5: Use in Components

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

---

## 5. Database Integration (Optional)

If you want to persist merchant data to the database instead of localStorage:

### Create Database Table

```sql
CREATE TABLE merchant_analytics_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  date_range TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (store_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

### Create API Endpoint

**Create `app/api/merchant/analytics/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get('storeId')
  
  if (!storeId) {
    return NextResponse.json({ error: 'Store ID required' }, { status: 400 })
  }
  
  const reports = await db.query(
    'SELECT * FROM merchant_analytics_reports WHERE store_id = ?',
    [storeId]
  )
  
  return NextResponse.json({ success: true, data: reports })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { storeId, name, dateRange } = body
  
  const result = await db.query(
    `INSERT INTO merchant_analytics_reports (store_id, name, date_range, created_at)
     VALUES (?, ?, ?, ?)`,
    [storeId, name, dateRange, new Date().toISOString()]
  )
  
  return NextResponse.json({ success: true, id: result.lastInsertRowid })
}
```

### Sync with Zustand Store

```typescript
// In your component or hook
useEffect(() => {
  const fetchReports = async () => {
    const response = await fetch(`/api/merchant/analytics?storeId=${storeId}`)
    const { data } = await response.json()
    useMerchantAnalyticsStore.getState().setReports(data)
  }
  
  fetchReports()
}, [storeId])
```

---

## Summary

### Customer Orders
- **Database:** `orders` and `order_items` tables
- **Client:** Zustand store (`orders-store`) persisted to localStorage
- **API:** `/api/orders` (supports userId and storeId queries)

### Reviews
- **Database:** `user_reviews` table with related tables
- **Client:** Zustand store (`review-store`) for session changes only
- **API:** `/api/reviews/[storeId]` and `/api/reviews`

### Merchant Data
- **Initial Data:** `constants/merchant-store-data.ts` (default values)
- **Runtime:** Zustand stores + localStorage (per store)
- **Keys:** `lib/utils/merchant-storage.ts`
- **Loader:** `lib/utils/store-data-loader.ts` (initializes localStorage)

### Adding New Merchant Data
1. Add to `StoreMerchantData` interface
2. Add storage key to `MerchantStorageKeys`
3. Create Zustand store with persistence
4. Update store data loader
5. (Optional) Create database table and API endpoint

---

## Key Files Reference

- **Database Schema:** `dashdoor_schema.sql`
- **Orders API:** `app/api/orders/route.ts`
- **Reviews API:** `app/api/reviews/[storeId]/route.ts`
- **Merchant Data:** `constants/merchant-store-data.ts`
- **Storage Keys:** `lib/utils/merchant-storage.ts`
- **Store Loader:** `lib/utils/store-data-loader.ts`
- **Current Store Hook:** `lib/hooks/useCurrentStore.tsx`
- **Orders Store:** `store/orders-store.ts`
- **Review Store:** `store/review-store.ts`
- **Merchant Stores:** `store/merchant-*-store.ts`

