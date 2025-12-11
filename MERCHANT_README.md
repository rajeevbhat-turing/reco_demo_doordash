# DashDoor Merchant Portal

A comprehensive merchant-side application for restaurant owners to manage their stores, menus, orders, and view business insights.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Routes & Pages](#routes--pages)
6. [Components](#components)
7. [API Endpoints](#api-endpoints)
8. [State Management](#state-management)
9. [Setup & Configuration](#setup--configuration)
10. [Sample Data](#sample-data)
11. [Troubleshooting](#troubleshooting)
12. [UI/UX Design](#uiux-design)
13. [Future Enhancements](#future-enhancements)
14. [Contributing](#contributing)
15. [License](#license)

---

## Overview

The Merchant Portal is a standalone feature within the DashDoor application that provides restaurant owners and managers with a dashboard to:

- Manage multiple store locations
- Complete onboarding (store hours, menu, pricing, payout)
- View and manage orders in real-time
- Create and edit menu items with modifiers
- Track sales and operational insights
- View customer ratings and reviews
- Manage store availability and settings

### Design Principles

- **Data Isolation**: Completely separate from consumer app data (uses `merchant.db`)
- **Consistent Branding**: Uses DoorDash-inspired red (`#EB1700`) as primary color
- **Store-Scoped Data**: Each store has isolated localStorage data with `merchant.{storeId}.{section}` pattern
- **Multi-Store Support**: Merchants can manage multiple stores from a single account

---

## Features

### Authentication
- **Sign In**: Email/password authentication via API
- **Sign Up**: Full registration with store details
- **Protected Routes**: Layout-level authentication guard with store ownership verification
- **Multi-Store Access**: One merchant can access multiple stores via junction table

### Onboarding Flow
5-step onboarding process:
1. **Order Protocol**: Choose order method (tablet, POS, email)
2. **Store Hours**: Set opening/closing times
3. **Menu Setup**: Create categories and items
4. **Pricing Plan**: Select commission tier (Basic, Plus, Premier)
5. **Payout Setup**: Bank account and business details

### Dashboard
- Today's orders summary
- Sales metrics
- Customer ratings overview

### Orders Management
- **Active Orders**: New and in-progress orders
- **Scheduled Orders**: Orders that are out of delivery or scheduled for pickup
- **Order History**: Delivered, Returned, Abandoned and Cancelled orders.
- Order status updates includes manual updates(pending → confirmed → preparing → ready) and auto-updates(preparing → dasher_assigned → dasher_waiting), (ready → picked_up → on_the_way → dasher_nearby → delivered).
- Order details modal with items, pricing, and customer info
- Search and filters.

### Menu Management
- Category management (create, edit, reorder)
- Menu items with:
  - Name, description, image
  - Pickup and delivery pricing (separate)
  - Stock status with time-based options
- Modifier groups with:
  - Required/optional settings
  - Multiple selection options
  - Per-option pricing

### Insights & Analytics
- **Sales**: Revenue charts, sales by day/hour, average order value
- **Operations Quality**: Rating trends, order timing
- **Customer Insights**: Customer segments, order frequency

### Ratings & Reviews
- Customer reviews with ratings
- Rating distribution chart

### Settings
- **Store Communications**: Notification preferences
- **Bank Account**: Payout details (view and edit)
- **Store Settings**: Name, address, contact info
- **Pricing Plans**: View/change commission tier

---

## Architecture

### Directory Structure

```
app/
├── merchant/
│   ├── layout.tsx              # Main layout with sidebar
│   ├── page.tsx                # Landing/login page
│   ├── auth/
│   │   ├── page.tsx            # Sign-in page
│   │   └── user/
│   │       └── signup/
│   │           └── page.tsx    # Sign-up page
│   ├── onboarding/
│   │   ├── page.tsx            # Onboarding router
│   │   ├── order-method.tsx    # Step 1: Order protocol
│   │   ├── store-hours.tsx     # Step 2: Store hours
│   │   ├── menu.tsx            # Step 3: Menu setup
│   │   ├── pricing.tsx         # Step 4: Pricing plan
│   │   └── payout.tsx          # Step 5: Payout details
│   └── store/
│       └── [id]/
│           ├── layout.tsx      # Auth guard layout
│           ├── page.tsx        # Store dashboard
│           ├── orders/
│           │   └── page.tsx    # Orders management
│           ├── menu/
│           │   ├── page.tsx    # Menu editor
│           │   └── pricing/
│           │       └── page.tsx # Pricing overview
│           ├── insights/
│           │   ├── sales/
│           │   │   └── page.tsx
│           │   └── operations-quality/
│           │       └── page.tsx
│           ├── customers/
│           │   ├── insights/
│           │   │   └── page.tsx
│           │   └── ratings-reviews/
│           │       └── page.tsx
│           ├── financials/
│           │   ├── transactions/
│           │   │   └── page.tsx
│           │   ├── payouts/
│           │   │   └── page.tsx
│           │   └── statements/
│           │       └── page.tsx
│           ├── settings/
│           │   ├── pricing/
│           │   │   └── page.tsx
│           │   ├── store/
│           │   │   └── page.tsx
│           │   ├── store-communications/
│           │   │   └── page.tsx
│           │   └── bank-account/
│           │       └── page.tsx
│           ├── store-availability/
│           │   └── page.tsx
│           └── users/
│               └── page.tsx    # Manage users

├── api/
│   └── merchant/
│       ├── auth/
│       │   └── login/
│       │       └── route.ts    # Login API
│       ├── orders/
│       │   └── route.ts        # Orders CRUD API
│       ├── restaurants/
│       │   ├── route.ts        # Stores list API
│       │   └── [id]/
│       │       ├── route.ts    # Store details API
│       │       ├── menu/
│       │       │   └── route.ts # Menu API
│       │       └── modifiers/
│       │           └── route.ts # Modifiers API
│       └── reviews/
│           └── [storeId]/
│               └── route.ts    # Reviews API

components/
└── merchant/
    ├── MerchantLayout.tsx      # Main layout wrapper
    ├── MerchantSidebar.tsx     # Navigation sidebar
    ├── OnboardingLayout.tsx    # Onboarding flow layout
    ├── OnboardingSidebar.tsx   # Onboarding progress sidebar
    ├── RestaurantSelector.tsx  # Store dropdown
    ├── StoreSelector.tsx       # Alternative store picker
    ├── ItemEditorPanel.tsx     # Menu item side panel
    ├── ItemStatusDropdown.tsx  # Stock status selector
    ├── MenuSettingsDropdown.tsx
    ├── SalesChart.tsx
    ├── SalesOverTimeChart.tsx
    ├── ByDayOfWeekChart.tsx
    ├── ByHourOfDayChart.tsx
    ├── CampaignPerformanceChart.tsx
    ├── menu-manager/
    │   ├── OverviewTab.tsx     # Menu overview
    │   └── ModifiersTab.tsx    # Modifiers management
    ├── modals/
    │   ├── ConfirmModal.tsx
    │   ├── CreateModifierModal.tsx
    │   ├── NewCategoryModal.tsx
    │   ├── NewItemModal.tsx
    │   ├── OrderDetailsModal.tsx
    │   └── Rearrange...Modal.tsx
    └── orders/
        ├── ActiveOrdersTable.tsx
        ├── ScheduledOrdersTable.tsx
        ├── HistoryOrdersTable.tsx
        └── OrdersTableShared.tsx

lib/
├── merchant-db.ts              # Merchant database connection
├── utils/
│   ├── merchant-storage.ts     # Storage key constants
│   ├── store-scoped-storage.ts # Store-scoped localStorage utils
│   └── store-data-loader.ts    # Data seeding utilities
└── hooks/
    ├── use-merchant-metrics.ts   # Sales calculations
    ├── use-merchant-operations.ts # Operations metrics
    └── use-merchant-customers.ts  # Customer analytics

store/
├── merchant-auth-store.ts      # Auth & onboarding state
├── merchant-orders-store.ts    # Orders state
├── merchant-menu-store.ts      # Menu items state
├── merchant-modifiers-store.ts # Modifiers state
├── merchant-stores-store.ts    # Stores list state
└── merchant-settings-store.ts  # Settings state

data/
└── db/
    ├── merchant.db             # SQLite database file
    └── schema/
        ├── merchant_schema.sql # Database schema
        └── merchant_seed.sql   # Sample data
```

---

## Database Schema

### Entity Relationship Diagram

```
merchants (1) ─────────────< (N) merchant_stores >───────────── (N) stores (1)
     │                                                              │
     │                                                    ┌─────────┼─────────┐
     └─────────────────────────────────────────────────── │         │         │
                                                          │         │         │
                                                          ▼         ▼         ▼
                                                     addresses  menu_categories  orders
                                                                     │           │
                                                                     ▼           ▼
                                                                menu_items   order_items
                                                                     │
                                                           ┌─────────┴─────────┐
                                                           ▼                   ▼
                                                 menu_item_modifiers      reviews
                                                           │                   │
                                                           ▼           ┌───────┴───────┐
                                                       modifiers       ▼               ▼
                                                           │     review_photos  review_liked_items
                                                           ▼
                                                   modifier_options
```

### Tables

#### `merchants`
Store owners/operators with authentication and onboarding data.

| Column               | Type    | Description                          |
|----------------------|---------|--------------------------------------|
| id                   | TEXT    | Primary key                          |
| email                | TEXT    | Unique email address                 |
| password             | TEXT    | Password (plain text for demo)       |
| first_name           | TEXT    | First name                           |
| last_name            | TEXT    | Last name                            |
| user_phone           | TEXT    | Phone number                         |
| primary_store_id     | TEXT    | FK to stores                         |
| primary_business_type| TEXT    | Business type                        |
| onboarding_completed | INTEGER | 0/1 flag                             |
| onboarding_step      | INTEGER | Step 0-5                             |
| onboarding_data      | TEXT    | JSON blob with onboarding details    |
| created_at           | TEXT    | Account creation timestamp           |
| updated_at           | TEXT    | Last update timestamp                |

#### `stores`
Restaurant/store locations.

| Column          | Type    | Description                    |
|-----------------|---------|--------------------------------|
| id              | TEXT    | Primary key                    |
| name            | TEXT    | Store name                     |
| email           | TEXT    | Store email                    |
| phone           | TEXT    | Store phone                    |
| business_type   | TEXT    | Restaurant, Cafe, etc.         |
| owner_id        | TEXT    | FK to merchants                |
| created_at      | TEXT    | Store creation timestamp       |
| opening_hour    | TEXT    | Opening time (HH:MM)           |
| closing_hour    | TEXT    | Closing time (HH:MM)           |

#### `addresses`
Store addresses with geolocation.

| Column     | Type    | Description                 |
|------------|---------|----------------------------|
| id         | INTEGER | Primary key (auto)         |
| store_id   | TEXT    | FK to stores               |
| street     | TEXT    | Street address             |
| city       | TEXT    | City                       |
| state      | TEXT    | State/Province             |
| zip_code   | TEXT    | Postal code                |
| latitude   | REAL    | Latitude (-90 to 90)       |
| longitude  | REAL    | Longitude (-180 to 180)    |
| is_primary | INTEGER | 0/1 flag                   |

#### `merchant_stores`
Junction table for merchant-store relationships.

| Column      | Type | Description                        |
|-------------|------|------------------------------------|
| merchant_id | TEXT | FK to merchants                    |
| store_id    | TEXT | FK to stores                       |
| role        | TEXT | 'owner', 'manager', or 'staff'     |
| created_at  | TEXT | Relationship creation timestamp    |

#### `menu_categories`
Menu categories for organizing items.

| Column        | Type    | Description                |
|---------------|---------|----------------------------|
| id            | TEXT    | Primary key                |
| store_id      | TEXT    | FK to stores               |
| name          | TEXT    | Category name              |
| description   | TEXT    | Optional description       |
| display_order | INTEGER | Sort order                 |
| is_active     | INTEGER | 0/1 flag                   |
| created_at    | TEXT    | Creation timestamp         |

#### `menu_items`
Individual menu items with pricing.

| Column         | Type    | Description                              |
|----------------|---------|------------------------------------------|
| id             | TEXT    | Primary key                              |
| store_id       | TEXT    | FK to stores                             |
| category_id    | TEXT    | FK to menu_categories                    |
| name           | TEXT    | Item name                                |
| description    | TEXT    | Optional description                     |
| image          | TEXT    | Image URL                                |
| pickup_price   | INTEGER | Pickup price in cents                    |
| delivery_price | INTEGER | Delivery price in cents                  |
| status         | TEXT    | 'In stock', 'Out of stock - *', etc.     |
| calories       | INTEGER | Calorie count (optional)                 |
| display_order  | INTEGER | Sort order within category               |
| is_available   | INTEGER | 0/1 flag                                 |
| created_at     | TEXT    | Creation timestamp                       |
| updated_at     | TEXT    | Last update timestamp                    |

#### `modifiers`
Modifier groups (e.g., "Choose your sides").

| Column                 | Type    | Description                         |
|------------------------|---------|-------------------------------------|
| id                     | TEXT    | Primary key                         |
| store_id               | TEXT    | FK to stores                        |
| name                   | TEXT    | Modifier group name                 |
| status                 | TEXT    | Stock status                        |
| timing                 | TEXT    | Optional timing note                |
| is_required            | INTEGER | 0/1 - must select                   |
| allow_multiple_options | INTEGER | 0/1 - can select multiple           |
| allow_multiple_same    | INTEGER | 0/1 - can select same option twice  |
| allow_free_options     | INTEGER | 0/1 - has free options              |
| created_at             | TEXT    | Creation timestamp                  |
| updated_at             | TEXT    | Last update timestamp               |

#### `modifier_options`
Individual options within a modifier group.

| Column      | Type    | Description              |
|-------------|---------|--------------------------|
| id          | TEXT    | Primary key              |
| modifier_id | TEXT    | FK to modifiers          |
| name        | TEXT    | Option name              |
| price       | INTEGER | Price in cents (0 = free)|
| is_default  | INTEGER | 0/1 - pre-selected       |
| sort_order  | INTEGER | Display order            |
| created_at  | TEXT    | Creation timestamp       |

#### `orders`
Customer orders with status tracking.

| Column             | Type    | Description                         |
|--------------------|---------|-------------------------------------|
| id                 | TEXT    | Primary key                         |
| store_id           | TEXT    | FK to stores                        |
| customer_name      | TEXT    | Customer name                       |
| customer_id        | TEXT    | Customer user ID                    |
| customer_email     | TEXT    | Customer email                      |
| status             | TEXT    | Order status (see below)            |
| order_date         | TEXT    | Order placement timestamp           |
| scheduled_date     | TEXT    | For scheduled orders                |
| fulfillment_type   | TEXT    | 'pickup' or 'delivery'              |
| channel            | TEXT    | Order source (default: 'DashDoor')  |
| delivery_*         | TEXT    | Delivery address fields             |
| subtotal           | INTEGER | Subtotal in cents                   |
| service_fee        | INTEGER | Service fee in cents                |
| delivery_fee       | INTEGER | Delivery fee in cents               |
| tip_amount         | INTEGER | Tip in cents                        |
| total              | INTEGER | Total in cents                      |
| created_at         | TEXT    | Creation timestamp                  |
| updated_at         | TEXT    | Last update timestamp               |

**Order Statuses:**
- `pending` - New order received
- `confirmed` - Order confirmed by merchant
- `preparing` - Order being prepared
- `dasher_assigned` - Driver assigned
- `dasher_waiting` - Driver waiting at store
- `scheduled` - Future scheduled order
- `ready` - Ready for pickup
- `picked_up` - Picked up by driver/customer
- `on_the_way` - En route to customer
- `dasher_nearby` - Driver approaching
- `delivered` - Successfully delivered
- `cancelled` - Order cancelled
- `returned` - Order returned
- `abandoned` - Order abandoned

#### `order_items`
Items within an order.

| Column       | Type    | Description              |
|--------------|---------|--------------------------|
| id           | TEXT    | Primary key              |
| order_id     | TEXT    | FK to orders             |
| menu_item_id | TEXT    | FK to menu_items         |
| name         | TEXT    | Item name (snapshot)     |
| quantity     | INTEGER | Quantity ordered         |
| price        | INTEGER | Price in cents           |
| image        | TEXT    | Image URL                |
| created_at   | TEXT    | Creation timestamp       |

#### `reviews`
Customer reviews for stores.

| Column          | Type | Description                           |
|-----------------|------|---------------------------------------|
| id              | TEXT | Primary key                           |
| store_id        | TEXT | FK to stores                          |
| customer_id     | TEXT | Customer user ID                      |
| customer_name   | TEXT | Customer name                         |
| rating          | REAL | Rating 1-5                            |
| content         | TEXT | Review text                           |
| timestamp       | TEXT | Review timestamp                      |
| order_id        | TEXT | FK to orders (optional)               |
| approval_status | TEXT | 'pending', 'approved', or 'rejected'  |
| created_at      | TEXT | Creation timestamp                    |

---

## Routes & Pages

### Public Routes

| Route                      | Description              |
|----------------------------|--------------------------|
| `/merchant`                | Landing/login page       |
| `/merchant/auth`           | Sign-in page             |
| `/merchant/auth/user/signup` | Registration page      |

### Protected Routes (require authentication)

| Route                                          | Description                    |
|------------------------------------------------|--------------------------------|
| `/merchant/onboarding`                         | Onboarding flow router         |
| `/merchant/store/[id]`                         | Store dashboard                |
| `/merchant/store/[id]/orders`                  | Orders management              |
| `/merchant/store/[id]/menu`                    | Menu editor                    |
| `/merchant/store/[id]/menu/pricing`            | Pricing overview               |
| `/merchant/store/[id]/insights/sales`          | Sales insights                 |
| `/merchant/store/[id]/insights/operations-quality` | Operations metrics        |
| `/merchant/store/[id]/customers/insights`      | Customer analytics             |
| `/merchant/store/[id]/customers/ratings-reviews` | Reviews management           |
| `/merchant/store/[id]/financials/transactions` | Transaction history            |
| `/merchant/store/[id]/financials/payouts`      | Payout history                 |
| `/merchant/store/[id]/financials/statements`   | Financial statements           |
| `/merchant/store/[id]/settings/pricing`        | Pricing plan settings          |
| `/merchant/store/[id]/settings/store`          | Store information              |
| `/merchant/store/[id]/settings/store-communications` | Notification settings   |
| `/merchant/store/[id]/settings/bank-account`   | Bank account settings          |
| `/merchant/store/[id]/store-availability`      | Store hours management         |
| `/merchant/store/[id]/users`                   | User management                |

### Route Protection Logic

```typescript
// In app/merchant/store/[id]/layout.tsx
useEffect(() => {
  // Check if user is authenticated
  if (!currentMerchant) {
    router.replace('/merchant');
    return;
  }

  // Check if the store belongs to the logged-in user
  const userStoreIds = currentMerchant.storeIds || [];
  const hasAccess = userStoreIds.includes(storeId) || 
                   currentMerchant.primaryStoreId === storeId;

  if (!hasAccess) {
    router.replace(`/merchant/store/${currentMerchant.primaryStoreId}`);
    return;
  }

  setIsAuthorized(true);
}, [currentMerchant, storeId, router]);
```

---

## Components

### MerchantLayout (`components/merchant/MerchantLayout.tsx`)

Main layout wrapper that includes:
- Dynamic sidebar (collapsible)
- Header with store selector
- Content area with proper spacing

### MerchantSidebar (`components/merchant/MerchantSidebar.tsx`)

Navigation sidebar with sections:
- Home (dashboard)
- Insights (Sales, Operations)
- Orders
- Menu
- Store Availability
- Settings (Pricing, Store Communications, Bank Account)

Features:
- Collapsible sections
- Active state highlighting
- Store selector dropdown
- User profile section with logout

### RestaurantSelector (`components/merchant/RestaurantSelector.tsx`)

Store switcher dropdown showing:
- Current store name
- List of accessible stores
- Store address preview
- Quick switch functionality

### ItemEditorPanel (`components/merchant/ItemEditorPanel.tsx`)

Slide-out panel for editing menu items:
- Name and description
- Image upload
- Pricing (pickup/delivery)
- Status/availability
- Calorie information
- Modifier assignment

### Order Tables

- **ActiveOrdersTable**: Current orders with status updates
- **ScheduledOrdersTable**: Future scheduled orders
- **HistoryOrdersTable**: Past completed/cancelled orders

All tables support:
- Search filtering
- Channel filtering
- Click to view details
- Status badge styling

---

## API Endpoints

### Authentication

#### `POST /api/merchant/auth/login`

Authenticates a merchant with email and password.

**Request Body:**
```json
{
  "email": "portland.grill@dashdoor.merchant",
  "password": "merchant@123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "merchant": {
      "id": "merchant-1",
      "email": "portland.grill@dashdoor.merchant",
      "firstName": "John",
      "lastName": "Smith",
      "primaryStoreId": "store-1",
      "primaryStoreName": "Portland Grill",
      "storeIds": ["store-1", "store-4"],
      "onboardingCompleted": true,
      "onboardingStep": 5,
      "onboardingData": { ... }
    },
    "stores": [...]
  }
}
```

### Restaurants/Stores

#### `GET /api/merchant/restaurants`

Fetches stores for a merchant.

**Query Parameters:**
| Parameter  | Type   | Description                    |
|------------|--------|--------------------------------|
| merchantId | string | Required. Merchant ID          |
| all        | string | 'true' to fetch all stores     |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "store-1",
      "name": "Portland Grill",
      "email": "portland.grill@dashdoor.merchant",
      "phone": "17649975265",
      "businessType": "Restaurant",
      "street": "Forcella, 33 N Square",
      "city": "Boston",
      "state": "MA",
      "zipCode": "02113",
      "isOpen": true
    }
  ],
  "meta": { "count": 1 }
}
```

#### `GET /api/merchant/restaurants/[id]`

Fetches details for a specific store.

### Orders

#### `GET /api/merchant/orders`

Fetches orders for a store.

**Query Parameters:**
| Parameter | Type   | Description            |
|-----------|--------|------------------------|
| storeId   | string | Required. Store ID     |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-1",
      "storeId": "store-1",
      "storeName": "Portland Grill",
      "customer": "Kai Hayes",
      "status": "delivered",
      "orderDate": "2024-12-10T14:30:00.000Z",
      "fulfillmentType": "DashDoor delivery",
      "items": [...],
      "subtotal": "$37.00",
      "total": 51.54
    }
  ]
}
```

#### `POST /api/merchant/orders`

Creates a new order.

### Menu

#### `GET /api/merchant/restaurants/[id]/menu`

Fetches menu items and categories for a store.

**Query Parameters:**
| Parameter          | Type   | Description                    |
|--------------------|--------|--------------------------------|
| includeUnavailable | string | 'true' to include out-of-stock |

**Response:**
```json
{
  "success": true,
  "data": {
    "menuItems": [
      {
        "id": "item-1",
        "name": "Toasted Farro Power Bowl",
        "description": "...",
        "pickupPrice": "$17.50",
        "deliveryPrice": "$18.50",
        "status": "In stock",
        "category": "Bowls & Salads",
        "modifications": [...]
      }
    ],
    "categories": [...]
  }
}
```

### Reviews

#### `GET /api/merchant/reviews/[storeId]`

Fetches reviews for a store.

**Query Parameters:**
| Parameter      | Type   | Description                            |
|----------------|--------|----------------------------------------|
| approvalStatus | string | Filter: 'approved', 'pending', 'rejected' |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-1",
      "storeId": "store-1",
      "userName": "Kai Hayes",
      "rating": 5.0,
      "content": "Absolutely incredible food!",
      "timestamp": "2024-12-10T16:30:00.000Z",
      "approvalStatus": "approved",
      "photos": ["..."],
      "likedItems": [...]
    }
  ],
  "meta": { "count": 1, "storeId": "store-1" }
}
```

---

## State Management

### Zustand Stores

The merchant portal uses separate Zustand stores with localStorage persistence.

#### `merchant-auth-store.ts`

**Store Key:** `merchant-auth`

```typescript
interface MerchantAuthStore {
  currentMerchant: MerchantUser | null;
  merchants: MerchantUser[];
  tempStore: TempStoreData | null;
  
  // Actions
  setCurrentMerchant: (merchant: MerchantUser | null) => void;
  signOut: () => void;
  registerMerchant: (merchant: Omit<MerchantUser, 'id'>) => MerchantUser;
  completeOnboarding: () => void;
  saveOnboardingOrderProtocol: (data: OnboardingOrderProtocol) => void;
  saveOnboardingStoreHours: (data: OnboardingStoreHours) => void;
  saveOnboardingMenuCompleted: () => void;
  saveOnboardingPricing: (data: OnboardingPricing) => void;
  saveOnboardingPayout: (data: OnboardingPayout) => void;
  updateBankAccount: (bankAccount: Partial<BankAccount>) => void;
}
```

#### `merchant-orders-store.ts`

**Store Key:** `merchant.{storeId}.orders`

```typescript
interface OrdersStore {
  orders: MerchantOrder[];
  searchQuery: string;
  selectedFilter: string;
  activeTab: 'Active' | 'Scheduled' | 'History';
  
  // Actions
  setOrders: (orders: MerchantOrder[]) => void;
  addOrder: (order: MerchantOrder) => void;
  updateOrder: (orderId: string, updates: Partial<MerchantOrder>) => void;
  deleteOrder: (orderId: string) => void;
}
```

#### `merchant-menu-store.ts`

**Store Key:** `merchant.{storeId}.menu`

Stores menu items and categories for the current store.

#### `merchant-modifiers-store.ts`

**Store Key:** `merchant.{storeId}.modifiers`

Stores modifier groups and options.

### Store-Scoped Storage

Data is stored with store-specific keys:

```
merchant.{storeId}.orders
merchant.{storeId}.menu
merchant.{storeId}.modifiers
merchant.{storeId}.settings
```

This ensures each store's data is isolated in localStorage.

---

## Setup & Configuration

### Environment Variables

Add to your `.env` file:

```env
# Main database (existing)
LIBSQL_URL=file:data/db/dashdoor.db

# Merchant database (required)
MERCHANT_LIBSQL_URL=file:data/db/merchant.db
```

### Database Initialization

1. **Create the database with schema:**
```bash
sqlite3 data/db/merchant.db < data/db/schema/merchant_schema.sql
```

2. **Seed with sample data:**
```bash
sqlite3 data/db/merchant.db < data/db/schema/merchant_seed.sql
```

3. **Combined command:**
```bash
rm -f data/db/merchant.db && \
sqlite3 data/db/merchant.db < data/db/schema/merchant_schema.sql && \
sqlite3 data/db/merchant.db < data/db/schema/merchant_seed.sql
```

### Verifying Setup

After setup, verify the data:

```bash
# Check merchants
sqlite3 data/db/merchant.db "SELECT id, email, onboarding_completed FROM merchants;"

# Check stores
sqlite3 data/db/merchant.db "SELECT id, name, owner_id FROM stores;"

# Check menu items
sqlite3 data/db/merchant.db "SELECT COUNT(*) FROM menu_items;"

# Check orders
sqlite3 data/db/merchant.db "SELECT COUNT(*) FROM orders;"
```

---

## Sample Data

### Test Accounts

| Email                              | Password      | Name          | Stores            | Onboarding |
|------------------------------------|---------------|---------------|-------------------|------------|
| portland.grill@dashdoor.merchant   | merchant@123  | John Smith    | Portland Grill, Seafood Market | Complete |
| talias.kitchen@dashdoor.merchant   | merchant@456  | Talia Rodriguez | Talia's Kitchen | Step 2     |
| urban.grill@dashdoor.merchant      | merchant@789  | Marcus Chen   | Urban Grill, Aiden's Smokehouse | Complete |

### Sample Stores

| Store               | Address                          | Owner          |
|---------------------|----------------------------------|----------------|
| Portland Grill      | Forcella, 33 N Square, Boston    | John Smith     |
| Urban Grill         | 100 Atlantic Ave, Boston         | Marcus Chen    |
| Talia's Kitchen     | 267 S Euclid St, Anaheim         | Talia Rodriguez|
| Seafood Market      | 685 Washington St, Boston        | John Smith     |
| Aiden's Smokehouse  | 239 Meridian St, Boston          | Marcus Chen    |

### Menu Categories & Items

**Portland Grill:**
- Street Tacos
- Bowls & Salads (Toasted Farro Power Bowl, Charred Broccoli Grain Bowl, Citrus Ginger Salmon Bowl)
- Starters (Smoked Salmon Tartine, Charred Shishito Peppers)
- Beverages
- Desserts

**Urban Grill:**
- Burgers (Classic Burger, Bacon Cheeseburger)
- Sides (Truffle Fries)
- Drinks

---

## Troubleshooting

### Common Issues

#### 1. "Database not found" error
**Solution:** Ensure `MERCHANT_LIBSQL_URL` is set in `.env` and the database file exists.

```bash
# Check if database exists
ls -la data/db/merchant.db

# If not, create it
sqlite3 data/db/merchant.db < data/db/schema/merchant_schema.sql
sqlite3 data/db/merchant.db < data/db/schema/merchant_seed.sql
```

#### 2. Login not working
**Solution:**
1. Check database has data: `sqlite3 data/db/merchant.db "SELECT * FROM merchants;"`
2. Restart the Next.js dev server after adding environment variables
3. Clear browser localStorage and try again

#### 3. Store data not loading
**Solution:**
1. Check browser console for API errors
2. Verify store ID exists in database
3. Check localStorage for `merchant.{storeId}.*` keys

#### 4. Redirecting to landing page unexpectedly
**Solution:** The layout guard checks authentication. Ensure:
1. `merchant-auth` exists in localStorage
2. `currentMerchant` is not null
3. `storeIds` or `primaryStoreId` includes the accessed store

### Debugging Tips

1. **Check localStorage:** Open DevTools → Application → Local Storage
   - `merchant-auth` - Authentication state
   - `merchant.{storeId}.orders` - Store orders
   - `merchant.{storeId}.menu` - Store menu

2. **Check API responses:** Network tab → `/api/merchant/*` requests

3. **Verify database:** Use sqlite3 CLI to query tables directly

---

## UI/UX Design

### Color Scheme

| Element           | Color     | Usage                           |
|-------------------|-----------|--------------------------------|
| Primary           | `#EB1700` | Buttons, active states, accents |
| Primary Light     | `#EB1700/10` | Hover backgrounds            |
| Text Primary      | `#191919` | Headings, body text            |
| Text Secondary    | `#767676` | Secondary text, labels          |
| Background        | `#F5F5F5` | Page backgrounds               |
| Card Background   | `#FFFFFF` | Cards, panels                  |
| Success           | `#22C55E` | Positive indicators            |
| Warning           | `#F59E0B` | Warnings, pending states       |
| Error             | `#EF4444` | Errors, cancelled states       |

### Typography

- **Headings**: Bold, `#191919`
- **Body**: Regular, `#191919` or `#767676`
- **Labels**: Semi-bold, smaller size

### Component Patterns

- **Cards**: White background, subtle shadow, rounded corners
- **Buttons**: Rounded, primary uses `#EB1700`
- **Tables**: Clean rows with hover states
- **Modals**: Centered with overlay backdrop
- **Sidebar**: Fixed position, collapsible sections
