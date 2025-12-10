# DashDoor Architecture Diagram

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        React Components                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   Pages      │  │  Components   │  │     UI       │                │  │
│  │  │  (App Router)│  │  (Feature)   │  │  (Radix UI)  │                │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │  │
│  │         │                  │                  │                         │  │
│  │         └──────────────────┴──────────────────┘                         │  │
│  │                           │                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────┐     │  │
│  │  │              TanStack Query (Server State Management)        │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  Server State Management                              │   │     │  │
│  │  │  │  - useQuery() / useMutation()                         │   │     │  │
│  │  │  │  - Manages data from database (via API)               │   │     │  │
│  │  │  │  - Caching & invalidation                             │   │     │  │
│  │  │  │  - Loading & error states                            │   │     │  │
│  │  │  │  - Automatic refetching                               │   │     │  │
│  │  │  │  - Background updates                                 │   │     │  │
│  │  │  │  - Optimistic updates                                 │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  API Client Functions                                │   │     │  │
│  │  │  │  - getRestaurants()                                  │   │     │  │
│  │  │  │  - getMenuItems()                                    │   │     │  │
│  │  │  │  - getCategories()                                   │   │     │  │
│  │  │  │  - getReviews()                                      │   │     │  │
│  │  │  │  - getUsers()                                        │   │     │  │
│  │  │  │  - [Other API endpoints]                             │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  └─────────────────────────────────────────────────────────────┘     │  │
│  │                           │                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────┐     │  │
│  │  │              Zustand (Client State Management)               │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  cart-store.ts                                        │   │     │  │
│  │  │  │  - Multi-category cart (restaurant, grocery, etc.)   │   │     │  │
│  │  │  │  - Category-specific configs                         │   │     │  │
│  │  │  │  - Store/restaurant tracking                          │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  user-store.ts                                        │   │     │  │
│  │  │  │  - User authentication                                │   │     │  │
│  │  │  │  - User profiles & accounts                          │   │     │  │
│  │  │  │  - Payment methods                                    │   │     │  │
│  │  │  │  - Addresses                                           │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  review-store.ts                                     │   │     │  │
│  │  │  │  - Review management                                  │   │     │  │
│  │  │  │  - Helpful ratings                                   │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  app-store.ts                                        │   │     │  │
│  │  │  │  - App-level state                                   │   │     │  │
│  │  │  │  - UI state                                          │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  │  ┌──────────────────────────────────────────────────────┐   │     │  │
│  │  │  │  orders-store.ts                                     │   │     │  │
│  │  │  │  - Order history                                    │   │     │  │
│  │  │  │  - Order management                                 │   │     │  │
│  │  │  └──────────────────────────────────────────────────────┘   │     │  │
│  │  └─────────────────────────────────────────────────────────────┘     │  │
│  │                           │                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────┐     │  │
│  │  │              localStorage Persistence                        │     │  │
│  │  │  - Zustand persist middleware                                │     │  │
│  │  │  - Session-specific changes                                  │     │  │
│  │  │  - Priority over database data                               │     │  │
│  │  │  - Auto-save on state changes                                │     │  │
│  │  └─────────────────────────────────────────────────────────────┘     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ HTTP Requests (TanStack Query)         │
│                                    ↓                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SERVER (Next.js App Router)                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    API Routes (/app/api/)                             │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │ /api/restaurants  │  │  /api/menu-items  │  │ /api/categories  │   │  │
│  │  │  - List           │  │  - By restaurant  │  │  - List          │   │  │
│  │  │  - By ID          │  │  - By category    │  │  - By restaurant │   │  │
│  │  │  - By cuisine     │  │  - By ID          │  │  - Restaurant    │   │  │
│  │  │  - By location    │  │  - With mods      │  │    categories    │   │  │
│  │  │  - Search         │  │                   │  │                   │   │  │
│  │  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘   │  │
│  │           │                    │                     │              │  │
│  │  ┌────────┴────────┐  ┌────────┴─────────┐  ┌────────┴─────────┐   │  │
│  │  │ /api/menu-      │  │  /api/reviews    │  │ /api/category-  │   │  │
│  │  │  categories     │  │  - By store      │  │  configs        │   │  │
│  │  │  - By restaurant│  │  - By user       │  │  - Get fees     │   │  │
│  │  │  - By ID        │  │  - With photos   │  │  - By category  │   │  │
│  │  └──────────────────┘  └───────────────────┘  └───────────────────┘   │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │ /api/modifications│  │  /api/users      │  │ /api/addresses   │   │  │
│  │  │  - By menu item  │  │  - By ID         │  │  - By user       │   │  │
│  │  │  - Options       │  │  - Auth          │  │  - By ID         │   │  │
│  │  └──────────────────┘  └──────────────────┘  └───────────────────┘   │  │
│  │                                                                        │  │
│  │           └────────────────────┴─────────────────────┘              │  │
│  │                              │                                        │  │
│  └──────────────────────────────┼────────────────────────────────────┘  │
│                                   │                                        │
│                                   │ SQL Queries (READ-ONLY)                │
│                                   ↓                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              Database Layer (lib/db.ts)                             │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  Database Connection Class                                   │  │  │
│  │  │  - db.query()      → SELECT multiple rows (read-only)       │  │  │
│  │  │  - db.queryOne()   → SELECT single row (read-only)           │  │  │
│  │  │  - Connection pooling (better-sqlite3)                       │  │  │
│  │  │  - Singleton pattern                                          │  │  │
│  │  │  - Database location config:                                  │  │  │
│  │  │    * File path (local file system)                           │  │  │
│  │  │    * Remote URL (download from remote source)                │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                   │                                        │
│                                   │ SQLite API (better-sqlite3)            │
│                                   ↓                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Database Location:
                                    │ - Local file path (e.g., ./app.db)
                                    │ - Remote URL (e.g., https://.../app.db)
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (SQLite - app.db)                           │
│                        (Location: File path or Remote URL)                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Read-Only Static Data                             │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  RESTAURANTS & MENUS                                         │     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │     │  │
│  │  │  │ restaurants  │  │ menu_categories│ │ menu_items   │    │     │  │
│  │  │  │  - id        │  │  - id        │  │  - id        │    │     │  │
│  │  │  │  - name      │  │  - restaurant│  │  - restaurant│  │    │     │  │
│  │  │  │  - cuisine   │  │  - name      │  │  - category  │  │    │     │  │
│  │  │  │  - location  │  │  - order     │  │  - name      │  │    │     │  │
│  │  │  │  - hours     │  │              │  │  - price     │  │    │     │  │
│  │  │  │  - rating    │  │              │  │  - image     │  │    │     │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘    │     │  │
│  │  │                                                              │     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐                      │     │  │
│  │  │  │ modifications │  │modification_ │                      │     │  │
│  │  │  │  - id        │  │  options     │                      │     │  │
│  │  │  │  - menu_item │  │  - id        │                      │     │  │
│  │  │  │  - desc      │  │  - mod_id    │                      │     │  │
│  │  │  │  - required  │  │  - name      │                      │     │  │
│  │  │  └──────────────┘  │  - price     │                      │     │  │
│  │  │                     └──────────────┘                      │     │  │
│  │  └──────────────────────────────────────────────────────────────┘     │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  CATEGORIES & CONFIGURATIONS                                  │     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │     │  │
│  │  │  │  categories   │  │restaurant_    │  │category_     │    │     │  │
│  │  │  │  - name (PK)  │  │  categories  │  │  configs     │    │     │  │
│  │  │  └──────────────┘  │  - restaurant│  │  - category  │    │     │  │
│  │  │                     │  - category  │  │  - fees      │    │     │  │
│  │  │                     └──────────────┘  └──────────────┘    │     │  │
│  │  └──────────────────────────────────────────────────────────────┘     │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  USERS & AUTHENTICATION                                       │     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │     │  │
│  │  │  │  countries    │  │   users       │  │payment_      │    │     │  │
│  │  │  │  - id        │  │  - id        │  │  methods     │    │     │  │
│  │  │  │  - code      │  │  - name      │  │  - user_id   │    │     │  │
│  │  │  │  - name      │  │  - email     │  │  - type      │    │     │  │
│  │  │  └──────────────┘  │  - phone     │  │  - card      │    │     │  │
│  │  │                     └──────────────┘  └──────────────┘    │     │  │
│  │  │                                                              │     │  │
│  │  │  ┌──────────────┐                                          │     │  │
│  │  │  │  addresses    │                                          │     │  │
│  │  │  │  - id        │                                          │     │  │
│  │  │  │  - user_id   │                                          │     │  │
│  │  │  │  - street    │                                          │     │  │
│  │  │  │  - city      │                                          │     │  │
│  │  │  │  - location  │                                          │     │  │
│  │  │  └──────────────┘                                          │     │  │
│  │  └──────────────────────────────────────────────────────────────┘     │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  CARTS & ORDERS (Reference Only - Actual data in localStorage)│     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │     │  │
│  │  │  │  carts        │  │  orders      │  │ order_items  │    │     │  │
│  │  │  │  - id        │  │  - id        │  │  - order_id  │    │     │  │
│  │  │  │  - user_id   │  │  - user_id   │  │  - item_id   │    │     │  │
│  │  │  │  - store_id  │  │  - store_id  │  │  - quantity  │    │     │  │
│  │  │  └──────────────┘  │  - total     │  └──────────────┘    │     │  │
│  │  │                     │  - status    │                      │     │  │
│  │  │                     └──────────────┘                      │     │  │
│  │  │                                                              │     │  │
│  │  │  Note: Cart and order data stored in localStorage,         │     │  │
│  │  │        database tables exist for reference/schema only     │     │  │
│  │  └──────────────────────────────────────────────────────────────┘     │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐     │  │
│  │  │  REVIEWS                                                      │     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │     │  │
│  │  │  │ user_reviews  │  │review_photos │  │review_helpful│    │     │  │
│  │  │  │  - id        │  │  - review_id │  │  - review_id│    │     │  │
│  │  │  │  - store_id  │  │  - url       │  │  - user_id   │    │     │  │
│  │  │  │  - user_id   │  │              │  │              │    │     │  │
│  │  │  │  - rating    │  │              │  │              │    │     │  │
│  │  │  │  - content   │  │              │  │              │    │     │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘    │     │  │
│  │  └──────────────────────────────────────────────────────────────┘     │  │
│  │                                                                        │  │
│  │  Purpose:                                                              │  │
│  │  - Static restaurant catalog with locations, hours, ratings            │  │
│  │  - Menu structure (menu_categories → menu_items)                       │  │
│  │  - Menu item modifications and options                                 │  │
│  │  - Category configurations (service fees, delivery thresholds)        │  │
│  │  - User accounts, payment methods, addresses (reference data)           │  │
│  │  - Reviews with photos and helpful ratings                             │  │
│  │  - READ-ONLY (no writes from application)                               │  │
│  │  - Cart/Order tables exist for schema reference only                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

1. DATA FETCHING (Read-Only from Database)
   ┌─────────────┐
   │   User      │
   │  (Browser)  │
   └──────┬──────┘
          │
          │ Requests data (e.g., products, stores)
          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │                    React Component                                │
   │  - Client Component ('use client')                                │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ useQuery()
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              TanStack Query                                       │
   │  - Check cache first                                              │
   │  - If not cached, fetch from API                                 │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ HTTP GET request
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              API Route (/app/api/*)                               │
   │  - Parse query parameters                                         │
   │  - Build SQL query                                                │
   │  - Execute read-only query                                       │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ SQL SELECT
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              SQLite Database (app.db)                             │
   │  - Read-only query                                                │
   │  - Return data                                                     │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ JSON Response
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              TanStack Query Cache                                 │
   │  - Cache response                                                 │
   │  - Return to component                                            │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Component re-renders with data
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              Component Display                                    │
   └──────────────────────────────────────────────────────────────────┘

2. STATE CHANGES (Session-Specific in localStorage)
   ┌─────────────┐
   │   User      │
   │  (Browser)  │
   └──────┬──────┘
          │
          │ Interacts (e.g., add to cart, update user)
          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │                    React Component                                │
   │  - Calls Zustand action                                          │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Store action (e.g., addItem())
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              Zustand Store                                        │
   │  - Update state                                                   │
   │  - Trigger persist middleware                                    │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Auto-save
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │              localStorage                                         │
   │  - Store session-specific changes                                 │
   │  - Priority over database data                                   │
   │  - Persist across page reloads                                    │
   └──────────────────────────────────────────────────────────────────┘

3. DATA PRIORITY (localStorage > Database)
   ┌──────────────────────────────────────────────────────────────────┐
   │  Component needs data                                            │
   └──────────────────────┬───────────────────────────────────────────┘
                          │
                          │ Check localStorage first
                          ↓
   ┌──────────────────────────────────────────────────────────────────┐
   │  localStorage                                                     │
   │  - Has session-specific data?                                     │
   │  ┌──────────┐  ┌──────────┐                                     │
   │  │   YES    │  │    NO    │                                     │
   │  └────┬─────┘  └────┬─────┘                                     │
   │       │             │                                             │
   │       │             ↓                                             │
   │       │  ┌──────────────────────┐                                │
   │       │  │  Fetch from API      │                                │
   │       │  │  (Read-only DB)      │                                │
   │       │  └──────────────────────┘                                │
   │       │                                                           │
   │       ↓                                                           │
   │  Use localStorage data (PRIORITY)                                │
   └──────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Directory Structure

```
dashdoor/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes (Server-side)
│   │   ├── products/            # Product endpoints
│   │   │   ├── route.ts         # GET /api/products
│   │   │   └── [id]/            # GET /api/products/[id]
│   │   ├── stores/              # Store endpoints
│   │   │   ├── route.ts         # GET /api/stores
│   │   │   └── [id]/            # GET /api/stores/[id]
│   │   ├── restaurants/         # Restaurant endpoints
│   │   │   ├── route.ts         # GET /api/restaurants
│   │   │   └── [id]/            # GET /api/restaurants/[id]
│   │   ├── categories/          # Category endpoints
│   │   │   ├── route.ts         # GET /api/categories
│   │   │   └── [id]/            # GET /api/categories/[id]
│   │   ├── menu-items/          # Menu item endpoints
│   │   │   └── route.ts         # GET /api/menu-items
│   │   └── reviews/             # Review endpoints
│   │       └── route.ts         # GET /api/reviews
│   │
│   ├── [pages]/                 # Page routes
│   │   ├── page.tsx             # Landing page
│   │   ├── home/                # Home page
│   │   ├── checkout/            # Checkout flow
│   │   ├── grocery/             # Grocery pages
│   │   ├── convenience/         # Convenience store pages
│   │   ├── pets/                # Pet store pages
│   │   ├── retail/              # Retail pages
│   │   ├── search/              # Search pages
│   │   ├── orders/              # Order history
│   │   └── consumer/            # Consumer pages
│   │
│   ├── layout.tsx               # Root layout
│   ├── main-layout.tsx          # Main app layout
│   └── globals.css              # Global styles
│
├── components/                  # React Components
│   ├── ui/                     # Reusable UI (Radix UI)
│   ├── product/                # Product components
│   ├── store/                  # Store components
│   ├── reviews/                # Review components
│   ├── modals/                 # Modal dialogs
│   ├── authentication/         # Auth components
│   ├── header.tsx              # Header component
│   ├── footer.tsx              # Footer component
│   ├── cart-sidebar.tsx        # Cart sidebar
│   ├── search-bar.tsx          # Search component
│   └── layout-wrapper.tsx      # Layout wrapper
│
├── lib/                         # Utility Libraries
│   ├── db.ts                   # Database connection (read-only)
│   ├── api/                    # API client functions
│   │   ├── products.ts         # Product API client
│   │   ├── stores.ts           # Store API client
│   │   ├── restaurants.ts      # Restaurant API client
│   │   ├── categories.ts       # Category API client
│   │   └── reviews.ts          # Review API client
│   ├── hooks/                  # Custom hooks
│   │   └── usePersistedState.ts # Persisted state hook
│   ├── types/                  # Type definitions
│   └── utils/                  # General utilities
│
├── store/                       # Zustand State Stores
│   ├── cart-store.ts           # Cart state (multi-category)
│   ├── user-store.ts           # User & auth state
│   ├── review-store.ts         # Review state
│   ├── app-store.ts            # App-level state
│   └── orders-store.ts         # Order state
│
├── types/                       # TypeScript Types
│   ├── index.ts                # Main types
│   ├── store.ts                # Store types
│   ├── review-types.ts         # Review types
│   ├── pet-types.ts            # Pet store types
│   └── modules.d.ts            # Module declarations
│
├── constants/                   # Application Constants (not data)
│   └── [app-specific constants] # UI configs, feature flags, etc.
│
├── data/                        # Configuration Files (not static data)
│   ├── db/
│       ├── dashdoor.db          # The default DB
│
├── public/                      # Static Assets
│   ├── dashdoor-logo.svg      # Logo
│   └── [images, icons, etc.]   # Other assets
│
├── app.db                       # SQLite database file (read-only)
├── app.db-shm                   # SQLite shared memory
├── app.db-wal                   # SQLite write-ahead log
└── package.json                 # Dependencies
```

---

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    TanStack Query (Server State)                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Server State Management                                              │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  Data from Database (via API)                                 │  │  │
│  │  │  - Restaurants                                                │  │  │
│  │  │  - Menu items                                                 │  │  │
│  │  │  - Categories                                                 │  │  │
│  │  │  - Reviews                                                    │  │  │
│  │  │  - Users (reference data)                                     │  │  │
│  │  │  - Category configs                                           │  │  │
│  │  │                                                               │  │  │
│  │  │  Features:                                                    │  │  │
│  │  │  - Automatic caching                                          │  │  │
│  │  │  - Background refetching                                      │  │  │
│  │  │  - Cache invalidation                                         │  │  │
│  │  │  - Loading & error states                                     │  │  │
│  │  │  - Optimistic updates                                         │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  Query Keys:                                                         │  │
│  │  - ['restaurants']                                                  │  │
│  │  - ['restaurants', id]                                              │  │
│  │  - ['menu-items', restaurantId]                                     │  │
│  │  - ['categories']                                                   │  │
│  │  - ['reviews', storeId]                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                           │                                                  │
│                           │ Fetches from API                                 │
│                           ↓                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    API Routes → Database                               │  │
│  │  - Read-only queries                                                  │  │
│  │  - Returns JSON data                                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Zustand Stores (Client State)                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Cart Store (cart-store.ts)                                          │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  State:                                                       │  │  │
│  │  │  - items: CartItem[]                                         │  │  │
│  │  │  - currentCategory: CartCategory                             │  │  │
│  │  │  - currentStoreId: string | null                             │  │  │
│  │  │  - currentRestaurantId: string | null                        │  │  │
│  │  │  - isGroupOrder: boolean                                     │  │  │
│  │  │  - searchResults: SearchResult[]                             │  │  │
│  │  │                                                               │  │  │
│  │  │  Actions:                                                     │  │  │
│  │  │  - addItem()                                                 │  │  │
│  │  │  - removeItem()                                              │  │  │
│  │  │  - updateQuantity()                                         │  │  │
│  │  │  - clearCart()                                              │  │  │
│  │  │  - setCategory()                                             │  │  │
│  │  │  - setStore()                                                │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  User Store (user-store.ts)                                         │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │  State:                                                       │  │  │
│  │  │  - users: User[]                                              │  │  │
│  │  │  - currentUser: User | null                                  │  │  │
│  │  │  - tempAddress: Address | null                               │  │  │
│  │  │                                                               │  │  │
│  │  │  Actions:                                                     │  │  │
│  │  │  - setCurrentUser()                                           │  │  │
│  │  │  - addUser()                                                 │  │  │
│  │  │  - updateUser()                                              │  │  │
│  │  │  - addPaymentMethod()                                         │  │  │
│  │  │  - addAddress()                                              │  │  │
│  │  │  - isAuthenticated()                                          │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                      │  │
│  │  Review Store (review-store.ts)                                     │  │
│  │  App Store (app-store.ts)                                           │  │
│  │  Orders Store (orders-store.ts)                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                           │                                                  │
│                           │ persist middleware                               │
│                           ↓                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    localStorage Persistence                           │  │
│  │  - Zustand persist middleware                                        │  │
│  │  - Auto-save on state changes                                        │  │
│  │  - Session-specific changes                                          │  │
│  │  - Priority over database data                                       │  │
│  │  - State hydration on mount                                         │  │
│  │  - Version migration support                                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                           │                                                  │
│                           │                                                  │
│                           ↓                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    localStorage (Browser)                              │  │
│  │  Keys:                                                               │  │
│  │  - cart: Cart state (session-specific)                               │  │
│  │  - user: User state (session-specific)                               │  │
│  │  - review: Review state (session-specific)                            │  │
│  │  - app: App state (session-specific)                                  │  │
│  │  - orders: Orders state (session-specific)                           │  │
│  │                                                                        │  │
│  │  Priority:                                                             │  │
│  │  - localStorage data takes priority over database data                │  │
│  │  - Used for session-specific changes                                  │  │
│  │  - Persists across page reloads                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API ROUTES ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Client Request (TanStack Query)                                             │
│  useQuery({ queryKey: ['restaurants'], queryFn: getRestaurants })           │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  API Client Function (lib/api/restaurants.ts)                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  export async function getRestaurants(params?: RestaurantParams) {    │  │
│  │    const queryString = new URLSearchParams(params).toString()        │  │
│  │    const response = await fetch(`/api/restaurants?${queryString}`) │  │
│  │    return response.json()                                            │  │
│  │  }                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP GET request
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  API Route Handler                                                           │
│  app/api/restaurants/route.ts                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  export async function GET(request: NextRequest) {                   │  │
│  │    const searchParams = request.nextUrl.searchParams                 │  │
│  │    const cuisine = searchParams.get('cuisine')                      │  │
│  │    const search = searchParams.get('search')                         │  │
│  │    const location = searchParams.get('location')                     │  │
│  │                                                                      │  │
│  │    // Build query                                                    │  │
│  │    let query = `                                                     │  │
│  │      SELECT r.*,                                                     │  │
│  │             GROUP_CONCAT(c.name) as categories                       │  │
│  │      FROM restaurants r                                              │  │
│  │      LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id  │  │
│  │      LEFT JOIN categories c ON rc.category_name = c.name           │  │
│  │      WHERE 1=1                                                      │  │
│  │    `                                                                 │  │
│  │    const params: any[] = []                                          │  │
│  │                                                                      │  │
│  │    if (cuisine) {                                                   │  │
│  │      query += ' AND r.cuisine = ?'                                  │  │
│  │      params.push(cuisine)                                            │  │
│  │    }                                                                │  │
│  │                                                                      │  │
│  │    if (search) {                                                    │  │
│  │      query += ' AND r.name LIKE ?'                                  │  │
│  │      params.push(`%${search}%`)                                     │  │
│  │    }                                                                │  │
│  │                                                                      │  │
│  │    query += ' GROUP BY r.id'                                        │  │
│  │                                                                      │  │
│  │    // Execute read-only query                                       │  │
│  │    const restaurants = db.query(query, params)                       │  │
│  │                                                                      │  │
│  │    return NextResponse.json({                                        │  │
│  │      success: true,                                                  │  │
│  │      data: restaurants                                               │  │
│  │    });                                                               │  │
│  │  }                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL SELECT (read-only)
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  Database Layer (lib/db.ts)                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Database Connection Class                                           │  │
│  │  - db.query(sql, params)    → Execute SELECT query                   │  │
│  │  - db.queryOne(sql, params) → Execute SELECT query (single row)     │  │
│  │  - Singleton pattern                                                 │  │
│  │  - Connection pooling                                                │  │
│  │  - READ-ONLY operations only                                         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  SQLite Database (app.db)                                                    │
│  - Read-only queries                                                        │
│  - Returns data                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ JSON Response
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  TanStack Query Cache                                                       │
│  - Cache response                                                           │
│  - Return to component                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & User Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  User State (Client-side only - localStorage)                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  Authentication:                                                       │  │
│  │  - Stored in user-store.ts                                             │  │
│  │  - currentUser: User | null                                            │  │
│  │  - isAuthenticated(): boolean                                         │  │
│  │  - Persisted in localStorage via Zustand persist                       │  │
│  │                                                                        │  │
│  │  User Data:                                                            │  │
│  │  - Stored in user-store.ts                                            │  │
│  │  - users: User[]                                                       │  │
│  │  - Each user contains:                                                 │  │
│  │    * Profile info (name, email, avatar)                                │  │
│  │    * Payment methods                                                  │  │
│  │    * Addresses                                                        │  │
│  │    * Orders (stored in orders-store.ts)                               │  │
│  │                                                                        │  │
│  │  Guest State:                                                          │  │
│  │  - tempAddress: Address | null (for non-authenticated users)          │  │
│  │  - Cart persists for guests                                            │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Auth Flow:                                                            │  │
│  │  1. User logs in → setCurrentUser(user)                               │  │
│  │  2. State updated → Saved to localStorage (Zustand persist)           │  │
│  │  3. Cart persists (guest cart can be converted)                        │  │
│  │  4. User data loaded from user-store                                  │  │
│  │                                                                        │  │
│  │  No Server-side Auth:                                                   │  │
│  │  - All auth is client-side only                                        │  │
│  │  - No JWT tokens or sessions                                           │  │
│  │  - No server-side auth validation                                      │  │
│  │  - Simple localStorage-based auth                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛒 Cart & Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CART ARCHITECTURE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Cart State Structure                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  Cart Store (cart-store.ts) = {                                       │  │
│  │    items: CartItem[]                                                   │  │
│  │    currentCategory: CartCategory                                      │  │
│  │    currentStoreId: string | null                                      │  │
│  │    currentRestaurantId: string | null                                 │  │
│  │    isGroupOrder: boolean                                              │  │
│  │    groupOrderId: string | null                                        │  │
│  │    searchResults: SearchResult[]                                      │  │
│  │    currentStore: Store | null                                         │  │
│  │    visitedStores: string[]                                            │  │
│  │  }                                                                     │  │
│  │                                                                        │  │
│  │  CartItem = {                                                         │  │
│  │    id: string | number                                                │  │
│  │    itemName: string                                                   │  │
│  │    price: number | string                                             │  │
│  │    image: string                                                      │  │
│  │    quantity: number                                                   │  │
│  │    customizations?: string                                            │  │
│  │    category: CartCategory                                             │  │
│  │  }                                                                     │  │
│  │                                                                        │  │
│  │  CartCategory = "restaurant" | "grocery" | "retail" | "pets" | "convenience"│  │
│  │                                                                        │  │
│  │  Actions:                                                              │  │
│  │  - addItem()           → Add item to cart                              │  │
│  │  - removeItem()        → Remove item                                  │  │
│  │  - updateQuantity()    → Update item quantity                         │  │
│  │  - clearCart()         → Clear all items                               │  │
│  │  - setCategory()       → Switch category                               │  │
│  │  - setStore()          → Set current store                            │  │
│  │  - setRestaurant()     → Set current restaurant                       │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Category-Specific Configurations:                                           │
│  - Each category has different:                                             │  │
│    * Free delivery threshold                                                │  │
│    * Default delivery fee                                                   │  │
│    * Service fee percentage                                                │  │
│    * Minimum service fee                                                   │  │
│                                                                              │
│  Persistence:                                                                │
│  - Auto-saved to localStorage on every change (Zustand persist)              │
│  - Session-specific (not synced to database)                                 │
│  - Guest cart persists across sessions                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Checkout Flow                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  1. Cart Page (/cart or sidebar)                                      │  │
│  │     → Review items                                                     │  │
│  │     → Select delivery/pickup                                           │  │
│  │     → Calculate fees (category-specific)                               │  │
│  │                                                                        │  │
│  │  2. Checkout Page (/checkout)                                          │  │
│  │     → Select address (from user-store or tempAddress)                  │  │
│  │     → Select delivery option                                           │  │
│  │     → Select payment method (from user-store)                          │  │
│  │     → Review order                                                     │  │
│  │                                                                        │  │
│  │  3. Order Confirmation                                                 │  │
│  │     → Show order details                                               │  │
│  │     → Clear cart                                                       │  │
│  │     → Create order in orders-store.ts                                  │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Root Layout (app/layout.tsx)                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  <html>                                                                 │  │
│  │    <body>                                                               │  │
│  │      <QueryClientProvider>      ← TanStack Query provider              │  │
│  │        <MainLayout>            ← Main app layout                      │  │
│  │          {children}            ← Page content                      │  │
│  │        </MainLayout>                                                   │  │
│  │      </QueryClientProvider>                                             │  │
│  │    </body>                                                              │  │
│  │  </html>                                                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  Main Layout (app/main-layout.tsx)                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  - Handles authentication redirects                                    │  │
│  │  - Conditionally renders Header                                        │  │
│  │  - Wraps children in LayoutWrapper                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  Page Components (app/[page]/page.tsx)                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  - Server Components (default)                                         │  │
│  │    * Can fetch data directly                                           │  │
│  │    * No client-side JavaScript                                         │  │
│  │                                                                        │  │
│  │  - Client Components ('use client')                                   │  │
│  │    * Interactive components                                            │  │
│  │    * Use TanStack Query for data fetching                              │  │
│  │    * Use Zustand stores for state                                     │  │
│  │    * Access localStorage                                               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  Feature Components (components/)                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  - header.tsx           → Navigation, search, user menu               │  │
│  │  - cart-sidebar.tsx     → Cart display                                │  │
│  │  - search-bar.tsx      → Search functionality                        │  │
│  │  - store/               → Store components                           │  │
│  │  - product/             → Product components                         │  │
│  │  - reviews/             → Review components                          │  │
│  │  - modals/              → Modal dialogs                               │  │
│  │  - authentication/      → Auth components                             │  │
│  │  - ui/                  → Reusable UI (Radix UI components)         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Key Technologies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend:
  - Next.js 15 (App Router)      → React framework
  - React 18                      → UI library
  - TypeScript                    → Type safety
  - TailwindCSS                   → Styling
  - Radix UI                      → Component library
  - React Hook Form               → Form management
  - Zod                           → Schema validation

State Management:
  - TanStack Query                → Server state management (database data)
  - useQuery / useMutation        → Server state hooks
  - Query invalidation            → Cache management
  - Zustand                       → Client state management (session data)
  - Zustand persist               → localStorage persistence
  - Custom hooks                  → usePersistedState

Backend/Database:
  - Next.js API Routes            → Server endpoints
  - SQLite                        → Database (better-sqlite3)
  - Database connection class     → DB service layer
  - Singleton Pattern             → DB connection management
  - READ-ONLY operations          → No writes from application

Utilities:
  - date-fns                      → Date utilities
  - lucide-react                  → Icons
  - sonner                        → Toast notifications
  - cmdk                          → Command palette
```

---

## 🔄 Data Persistence Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Read-Only Database (SQLite - app.db)                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Location: SQLite Database (app.db)                                    │  │
│  │                                                                        │  │
│  │  Data:                                                                 │  │
│  │  - Restaurants (restaurants table)                                    │  │
│  │  - Menu categories (menu_categories table)                            │  │
│  │  - Menu items (menu_items table)                                      │  │
│  │  - Modifications (modifications, modification_options tables)        │  │
│  │  - Categories (categories, restaurant_categories tables)             │  │
│  │  - Category configs (category_configs table - fees, thresholds)      │  │
│  │  - Users (users, countries, payment_methods, addresses tables)        │  │
│  │  - Reviews (user_reviews, review_photos, review_helpful tables)      │  │
│  │  - Carts/Orders (tables exist for schema reference only)              │  │
│  │                                                                        │  │
│  │  Location Configuration:                                               │  │
│  │  - Local file path: DB_PATH environment variable or config            │  │
│  │  - Remote URL: DB_URL environment variable or config                  │  │
│  │  - Database file downloaded/cached if remote                          │  │
│  │                                                                        │  │
│  │  Access:                                                               │  │
│  │  - Server-side only (API routes)                                      │  │
│  │  - READ-ONLY operations only                                           │  │
│  │  - Accessed via API endpoints                                         │  │
│  │  - Cached by TanStack Query on client                                 │  │
│  │                                                                        │  │
│  │  Purpose:                                                              │  │
│  │  - ALL static data stored in database (not in code files)             │  │
│  │  - Static restaurant catalog with locations, hours, ratings            │  │
│  │  - Menu structure (menu_categories → menu_items)                       │  │
│  │  - Menu item modifications and options                                 │  │
│  │  - Category configurations (service fees, delivery thresholds)        │  │
│  │  - User accounts, payment methods, addresses (reference data)           │  │
│  │  - Reviews with photos and helpful ratings                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Session-Specific Data (localStorage)                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Location: Browser localStorage                                        │  │
│  │                                                                        │  │
│  │  Data:                                                                 │  │
│  │  - Cart state (Zustand persist)                                        │  │
│  │  - User state (Zustand persist)                                        │  │
│  │  - Review state (Zustand persist)                                      │  │
│  │  - App state (Zustand persist)                                         │  │
│  │  - Orders state (Zustand persist)                                      │  │
│  │                                                                        │  │
│  │  Access:                                                               │  │
│  │  - Client-side only                                                    │  │
│  │  - Auto-saved on state changes (Zustand persist)                      │  │
│  │  - Session-specific changes                                            │  │
│  │  - Priority over database data                                         │  │
│  │                                                                        │  │
│  │  Priority Logic:                                                       │  │
│  │  - When component needs data:                                         │  │
│  │    1. Check localStorage first                                         │  │
│  │    2. If found, use localStorage data (PRIORITY)                        │  │
│  │    3. If not found, fetch from API (database)                          │  │
│  │                                                                        │  │
│  │  Keys:                                                                 │  │
│  │  - Zustand stores use their own keys                                  │  │
│  │  - Each store persists independently                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Database Configuration                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Database Location Configuration                                       │  │
│  │                                                                        │  │
│  │  Options:                                                              │  │
│  │  1. Local File Path:                                                   │  │
│  │     - Configured via environment variable or config file              │  │
│  │     - Example: DB_PATH=./app.db or /path/to/app.db                   │  │
│  │     - Database file exists on local file system                       │  │
│  │                                                                        │  │
│  │  2. Remote URL:                                                        │  │
│  │     - Configured via environment variable or config file              │  │
│  │     - Example: DB_URL=https://example.com/data/app.db                 │  │
│  │     - Database file downloaded from remote source                     │  │
│  │     - Cached locally after initial download                            │  │
│  │                                                                        │  │
│  │  Initialization:                                                       │  │
│  │  - On server startup, check for database file                         │  │
│  │  - If remote URL provided, download database file                      │  │
│  │  - Initialize SQLite connection with database file                    │  │
│  │  - All static data accessed via read-only queries                     │  │
│  │                                                                        │  │
│  │  Note: All static data (restaurants, menus, users, etc.)              │  │
│  │        is stored in the SQLite database, not in code files            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION FEATURES                                │
└─────────────────────────────────────────────────────────────────────────────┘

✅ User Registration & Authentication:
   - Sign up / Sign in
   - Multiple existing accounts tied to different task personas
   - Password reset and account management
   - Guest checkout flow
   - Client-side authentication (localStorage-based)

✅ Restaurant Discovery & Search:
   - Browse restaurants by location, cuisine, rating
   - Search functionality with filters:
     * Price range
     * Delivery time
     * Dietary preferences
   - Restaurant listings with details
   - Filter and sort options

✅ Menu Browsing & Item Selection:
   - View restaurant menus with item details, images, and prices
   - Menu categories and organization
   - Add/remove items to cart
   - Customize orders (modifications, toppings, instructions)
   - Menu item modifications and options
   - Item availability status

✅ Order Placement & Checkout:
   - Cart management (add, remove, update quantities)
   - Address input and validation
   - Payment integration
   - Saved payment information by task persona
   - Input new credit/debit card
   - Order confirmation and summary page
   - Delivery type selection (delivery, pickup)
   - Scheduled delivery options

✅ Order History & Reordering:
   - View past orders
   - One-click reorder functionality
   - Order status tracking
   - Order details and receipts

✅ Ratings & Reviews:
   - Customers can rate restaurants and delivery experience
   - Display aggregated ratings and reviews
   - Review photos
   - Helpful ratings on reviews
   - Review filtering and sorting

✅ Data Management:
   - Read-only database for ALL static data (restaurants, menus, users, etc.)
   - Database location: local file path or remote URL
   - localStorage for session-specific changes
   - Priority system (localStorage > Database)
   - TanStack Query for server state management
   - Zustand for client state management
   - Automatic caching & invalidation

✅ UI/UX Features:
   - Responsive design
   - Loading states
   - Error handling
   - Toast notifications
   - Modal dialogs
   - Search with results
   - Category navigation
   - Cart sidebar
   - Form validation

✅ Developer Features:
   - TypeScript support
   - Zustand DevTools integration
   - TanStack Query DevTools
   - API client functions
   - Type-safe API calls
   - Server Components + Client Components hybrid
```

---

## 📝 Summary

**DashDoor** is a Next.js-based food delivery and e-commerce application with:

1. **Read-Only Database**: SQLite database containing ALL static data (restaurants, menus, users, reviews, etc.)
   - Database location configurable via file path or remote URL
   - All static data stored in database (not in code files)
   - Accessed via API routes with read-only queries
2. **Session-Specific State**: localStorage manages all session-specific changes (cart, user, orders, etc.)
3. **Data Priority**: localStorage data takes priority over database data when both exist
4. **TanStack Query**: Efficient API client with caching, invalidation, and automatic refetching
5. **State Management**: Zustand stores with localStorage persistence for session data
6. **Architecture**: Server Components + Client Components hybrid approach
7. **No Backend Auth**: Simple client-side authentication
8. **No Auto-Sync**: No automatic synchronization - localStorage is the source of truth for session changes

This architecture provides a fast, client-side experience with efficient data fetching from a read-only database (local or remote), while maintaining session-specific state in localStorage with priority over database data. All static data is centralized in the SQLite database, making it easy to update without code changes.
