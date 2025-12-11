# DashDoor Delivery Partner Portal

A simulated delivery partner dashboard for viewing orders, earnings, ratings, and managing account settings.

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

---

## Overview

The Delivery Partner Portal is a standalone feature within the DashDoor application that provides delivery drivers with a dashboard to:

- View their delivery history and order details
- Track earnings with weekly breakdowns
- Monitor customer ratings and feedback
- Manage their account settings

### Design Principles

- **Isolation**: Completely separate from the main consumer app
- **Consistent Branding**: Uses `#4561ED` as the primary color
- **Reusable Patterns**: Follows existing codebase patterns while maintaining separation
- **Static Simulation**: Displays pre-seeded data (no real-time order acceptance)

---

## Features

### Authentication
- **Sign In**: Email/password authentication with OTP simulation
- **Sign Up**: Full registration with name, email, phone (with country code), and password
- **Protected Routes**: Automatic redirect to sign-in for unauthenticated users

### Dashboard
- Welcome banner with driver name
- Statistics cards:
  - Lifetime Deliveries
  - Average Rating
  - Acceptance Rate
  - On-Time Rate
- Quick action navigation cards

### Orders
- Order history with filtering (All, Completed, Cancelled)
- Detailed order cards showing:
  - Restaurant info with logo
  - Customer address (masked for privacy)
  - Items count and distance
  - Earnings breakdown (base pay + tips)
  - Status and timestamp
- Pagination support

### Earnings
- Current week highlight card
- Lifetime statistics
- Earnings breakdown (Base Pay, Tips, Bonuses)
- Weekly history with detailed breakdowns
- Hours worked tracking

### Ratings
- Overall rating summary with star visualization
- Rating distribution chart (5-star to 1-star)
- Recent reviews list with customer feedback
- Letter avatars for customer names
- Pagination support

### Account Management
- Profile editing (name, email, phone)
- Phone number validation with country code selection
- Driver statistics display
- Privacy settings section
- Account deletion with 2-step verification

---

## Architecture

### Directory Structure

```
app/
├── delivery/
│   ├── layout.tsx              # Main layout with header/sidebar
│   ├── page.tsx                # Index redirect handler
│   ├── sign-in/
│   │   └── page.tsx            # Sign-in page
│   ├── sign-up/
│   │   └── page.tsx            # Sign-up page
│   ├── dashboard/
│   │   └── page.tsx            # Main dashboard
│   ├── orders/
│   │   └── page.tsx            # Orders list
│   ├── earnings/
│   │   └── page.tsx            # Earnings overview
│   ├── ratings/
│   │   └── page.tsx            # Ratings & reviews
│   └── account/
│       ├── page.tsx            # Account management
│       └── delete/
│           └── page.tsx        # Account deletion flow

├── api/
│   └── delivery/
│       ├── auth/
│       │   └── login/
│       │       └── route.ts    # Login API
│       ├── orders/
│       │   └── route.ts        # Orders API
│       ├── earnings/
│       │   └── route.ts        # Earnings API
│       └── ratings/
│           └── route.ts        # Ratings API

components/
└── delivery/
    ├── header.tsx              # Delivery portal header
    ├── sidebar.tsx             # Navigation sidebar
    ├── account-popup.tsx       # Account dropdown menu
    ├── letter-avatar.tsx       # Name initials avatar
    └── authentication/
        ├── sign-in.tsx         # Sign-in form component
        └── sign-up.tsx         # Sign-up form component

lib/
├── delivery-db.ts              # Delivery database connection
├── api/
│   └── delivery-auth.ts        # Client-side auth helper
└── types/
    └── delivery-types.ts       # TypeScript type definitions

store/
└── delivery-partner-store.ts   # Zustand state management

data/
└── db/
    ├── delivery.db             # SQLite database file
    └── schema/
        ├── delivery_schema.sql # Database schema
        └── delivery_seed.sql   # Sample data
```

---

## Database Schema

### Entity Relationship Diagram

```
delivery_countries (1) ──────< (N) delivery_partners
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            delivery_orders    delivery_earnings  delivery_payout_methods
                    │
                    ▼
            delivery_ratings
```

### Tables

#### `delivery_countries`
Stores country information for phone number selection.

| Column    | Type    | Description           |
|-----------|---------|----------------------|
| id        | INTEGER | Primary key          |
| code      | TEXT    | Country code (e.g., "US") |
| name      | TEXT    | Full name (e.g., "United States") |
| dial_code | TEXT    | Phone dial code (e.g., "+1") |

#### `delivery_partners`
Main table for delivery driver accounts.

| Column             | Type    | Description                    |
|--------------------|---------|--------------------------------|
| id                 | INTEGER | Primary key                    |
| email              | TEXT    | Unique email address           |
| password           | TEXT    | Password (plain text for demo) |
| name               | TEXT    | Full name                      |
| phone_number       | TEXT    | Phone number                   |
| country_id         | INTEGER | Foreign key to countries       |
| avatar             | TEXT    | Avatar URL (nullable)          |
| lifetime_deliveries| INTEGER | Total completed deliveries     |
| average_rating     | REAL    | Average customer rating (0-5)  |
| acceptance_rate    | REAL    | Order acceptance rate (0-100)  |
| completion_rate    | REAL    | Order completion rate (0-100)  |
| on_time_rate       | REAL    | On-time delivery rate (0-100)  |
| created_at         | TEXT    | Account creation timestamp     |

#### `delivery_orders`
Historical delivery orders.

| Column           | Type    | Description                     |
|------------------|---------|--------------------------------|
| id               | INTEGER | Primary key                    |
| partner_id       | INTEGER | Foreign key to partners        |
| store_name       | TEXT    | Restaurant name                |
| store_logo       | TEXT    | Restaurant logo URL            |
| store_address    | TEXT    | Restaurant address             |
| customer_name    | TEXT    | Customer name (masked)         |
| customer_address | TEXT    | Delivery address               |
| items_count      | INTEGER | Number of items                |
| distance_miles   | REAL    | Delivery distance              |
| base_pay         | INTEGER | Base pay in cents              |
| tip_amount       | INTEGER | Tip amount in cents            |
| total_earnings   | INTEGER | Total earnings in cents        |
| status           | TEXT    | 'completed' or 'cancelled'     |
| order_date       | TEXT    | Order timestamp                |
| completed_at     | TEXT    | Completion timestamp           |

#### `delivery_ratings`
Customer ratings and feedback.

| Column        | Type    | Description                |
|---------------|---------|---------------------------|
| id            | INTEGER | Primary key               |
| partner_id    | INTEGER | Foreign key to partners   |
| order_id      | INTEGER | Foreign key to orders     |
| rating        | INTEGER | Star rating (1-5)         |
| feedback      | TEXT    | Customer feedback text    |
| customer_name | TEXT    | Customer name             |
| created_at    | TEXT    | Rating timestamp          |

#### `delivery_earnings`
Weekly earnings summaries.

| Column           | Type    | Description                |
|------------------|---------|---------------------------|
| id               | INTEGER | Primary key               |
| partner_id       | INTEGER | Foreign key to partners   |
| week_start       | TEXT    | Week start date           |
| week_end         | TEXT    | Week end date             |
| total_deliveries | INTEGER | Deliveries that week      |
| base_pay         | INTEGER | Total base pay (cents)    |
| tips             | INTEGER | Total tips (cents)        |
| bonuses          | INTEGER | Bonus earnings (cents)    |
| total_earnings   | INTEGER | Grand total (cents)       |
| hours_worked     | REAL    | Hours worked              |

#### `delivery_payout_methods`
Payment methods for receiving earnings.

| Column      | Type    | Description                        |
|-------------|---------|-----------------------------------|
| id          | INTEGER | Primary key                       |
| partner_id  | INTEGER | Foreign key to partners           |
| method_type | TEXT    | 'bank_account' or 'debit_card'    |
| bank_name   | TEXT    | Bank name                         |
| last_four   | TEXT    | Last 4 digits                     |
| is_default  | INTEGER | Default payment method flag       |
| created_at  | TEXT    | Creation timestamp                |

---

## Routes & Pages

### Public Routes

| Route               | Description                |
|--------------------|---------------------------|
| `/delivery/sign-in` | Login page               |
| `/delivery/sign-up` | Registration page        |

### Protected Routes

| Route                    | Description                     |
|-------------------------|--------------------------------|
| `/delivery`             | Redirects to dashboard         |
| `/delivery/dashboard`   | Main dashboard                 |
| `/delivery/orders`      | Order history                  |
| `/delivery/earnings`    | Earnings overview              |
| `/delivery/ratings`     | Ratings and reviews            |
| `/delivery/account`     | Account management             |
| `/delivery/account/delete` | Account deletion flow       |

### Route Protection Logic

```typescript
// In app/delivery/layout.tsx
const publicPaths = ['/delivery/sign-in', '/delivery/sign-up'];
const isPublicPath = publicPaths.includes(pathname);

if (!isAuthenticated && !isPublicPath) {
  router.replace('/delivery/sign-in');
}
```

---

## Components

### Header (`components/delivery/header.tsx`)

The delivery portal header includes:
- **Logo**: "DashDoor Driver" branding with blue accent
- **Mobile Menu Toggle**: Hamburger menu for responsive design
- **User Section**: 
  - Letter avatar with user initials
  - User name display
  - Dropdown chevron
  - Account popup on click

### Sidebar (`components/delivery/sidebar.tsx`)

Navigation sidebar with links:
- Home (dashboard)
- Orders
- Earnings
- Ratings

Active states use the `#4561ED` brand color.

### Account Popup (`components/delivery/account-popup.tsx`)

Dropdown menu showing:
- Profile section with avatar and name
- View Profile link
- Account link
- Language settings
- Sign Out button

### Letter Avatar (`components/delivery/letter-avatar.tsx`)

Generates avatars from names:
- Extracts initials (first letter of first and last name)
- Uses deterministic color based on name hash
- Supports 5 sizes: `xs`, `sm`, `md`, `lg`, `xl`

```typescript
// Usage
<LetterAvatar name="John Doe" size="md" />
// Renders: JD with consistent background color
```

### Authentication Components

#### Sign In (`components/delivery/authentication/sign-in.tsx`)
- Email input with validation
- Password input with toggle visibility
- OTP verification simulation
- Error handling and loading states

#### Sign Up (`components/delivery/authentication/sign-up.tsx`)
- Full name input
- Email input with validation
- Phone number with country code selector
- Password input with requirements
- Terms acceptance

---

## API Endpoints

### Authentication

#### `POST /api/delivery/auth/login`

Authenticates a delivery partner.

**Request Body:**
```json
{
  "email": "marcus.johnson@email.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "partner": {
    "id": 1,
    "email": "marcus.johnson@email.com",
    "name": "Marcus Johnson",
    "phoneNumber": "5551234567",
    "country": {
      "id": 1,
      "code": "US",
      "name": "United States",
      "dialCode": "+1"
    },
    "lifetimeDeliveries": 45,
    "averageRating": 4.88,
    "acceptanceRate": 94.5,
    "completionRate": 98.2,
    "onTimeRate": 96.8
  }
}
```

### Orders

#### `GET /api/delivery/orders`

Fetches orders for a partner.

**Query Parameters:**
| Parameter  | Type    | Description              |
|------------|---------|-------------------------|
| partnerId  | number  | Required. Partner ID    |
| status     | string  | Filter: 'completed', 'cancelled', or 'all' |
| limit      | number  | Results per page (default: 10) |
| offset     | number  | Pagination offset       |

**Response:**
```json
{
  "orders": [...],
  "total": 45,
  "stats": {
    "totalOrders": 45,
    "completedOrders": 44,
    "cancelledOrders": 1,
    "totalEarnings": 42750
  }
}
```

### Earnings

#### `GET /api/delivery/earnings`

Fetches earnings data for a partner.

**Query Parameters:**
| Parameter | Type   | Description           |
|-----------|--------|----------------------|
| partnerId | number | Required. Partner ID |
| limit     | number | Number of weeks      |

**Response:**
```json
{
  "earnings": [...],
  "currentWeek": {
    "weekStart": "2024-12-09",
    "totalDeliveries": 8,
    "totalEarnings": 8000
  },
  "lifetime": {
    "totalEarnings": 28525,
    "totalDeliveries": 30,
    "totalTips": 15150,
    "totalBonuses": 2000
  }
}
```

### Ratings

#### `GET /api/delivery/ratings`

Fetches ratings for a partner.

**Query Parameters:**
| Parameter | Type   | Description           |
|-----------|--------|----------------------|
| partnerId | number | Required. Partner ID |
| limit     | number | Results per page     |
| offset    | number | Pagination offset    |

**Response:**
```json
{
  "ratings": [...],
  "total": 16,
  "summary": {
    "averageRating": 4.88,
    "totalRatings": 16,
    "distribution": {
      "5": 14,
      "4": 2,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

---

## State Management

### Zustand Store (`store/delivery-partner-store.ts`)

The delivery portal uses a separate Zustand store with localStorage persistence.

**Store Key:** `delivery-partner-store`

**State Structure:**
```typescript
interface DeliveryPartnerStore {
  partners: DeliveryPartner[];
  currentPartner: DeliveryPartner | null;
  
  // Actions
  addPartner: (partner: DeliveryPartner) => void;
  setCurrentPartner: (partner: DeliveryPartner | null) => void;
  updatePartner: (id: number, updates: Partial<DeliveryPartner>) => void;
  login: (email: string, password: string) => DeliveryPartner | null;
  logout: () => void;
  isAuthenticated: () => boolean;
}
```

**Usage:**
```typescript
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

// In component
const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());
const logout = useDeliveryPartnerStore(state => state.logout);
```

### Separation from Main App

The delivery portal maintains complete isolation:

| Aspect | Main App | Delivery Portal |
|--------|----------|-----------------|
| Store Key | `user-store` | `delivery-partner-store` |
| Database | `dashdoor.db` | `delivery.db` |
| Routes | `/`, `/home`, `/consumer/*` | `/delivery/*` |
| Layout | `MainLayout` | Custom delivery layout |

---

## Setup & Configuration

### Environment Variables

Add to your `.env` file:

```env
# Main database (existing)
LIBSQL_URL=file:data/db/dashdoor.db

# Delivery database (new)
DELIVERY_LIBSQL_URL=file:data/db/delivery.db
```

### Database Initialization

1. **Create the database with schema:**
```bash
sqlite3 data/db/delivery.db < data/db/schema/delivery_schema.sql
```

2. **Seed with sample data:**
```bash
sqlite3 data/db/delivery.db < data/db/schema/delivery_seed.sql
```

3. **Combined command:**
```bash
rm -f data/db/delivery.db && \
sqlite3 data/db/delivery.db < data/db/schema/delivery_schema.sql && \
sqlite3 data/db/delivery.db < data/db/schema/delivery_seed.sql
```

### Verifying Setup

After setup, you can verify the data:

```bash
# Check partners
sqlite3 data/db/delivery.db "SELECT id, name, email FROM delivery_partners;"

# Check order count
sqlite3 data/db/delivery.db "SELECT COUNT(*) FROM delivery_orders;"

# Check ratings
sqlite3 data/db/delivery.db "SELECT partner_id, AVG(rating) FROM delivery_ratings GROUP BY partner_id;"
```

---

## Sample Data

### Test Accounts

| Email | Password | Name | Deliveries | Rating |
|-------|----------|------|------------|--------|
| marcus.johnson@email.com | password123 | Marcus Johnson | 45 | 4.88 |
| sarah.chen@email.com | password123 | Sarah Chen | 32 | 4.75 |
| david.martinez@email.com | password123 | David Martinez | 52 | 4.94 |
| emily.williams@email.com | password123 | Emily Williams | 18 | 4.60 |
| james.thompson@email.com | password123 | James Thompson | 38 | 4.82 |

### Data Consistency

The sample data is designed to be internally consistent:

1. **Partner stats match orders:**
   - `lifetime_deliveries` = actual order count per partner
   - `average_rating` = calculated from ratings table

2. **Order earnings are accurate:**
   - `base_pay + tip_amount = total_earnings`

3. **Weekly earnings match orders:**
   - `total_deliveries` matches orders in that date range
   - `base_pay + tips + bonuses = total_earnings`

4. **Ratings reference real orders:**
   - Each rating has a valid `order_id`
   - Customer names match between orders and ratings

### Restaurant Data

Orders use real restaurants from the main `dashdoor.db`:

| Restaurant | Location | Logo URL |
|------------|----------|----------|
| Portland Grill | Boston, MA | Cloudinary |
| Urban Grill | Boston, MA | Cloudinary |
| Talia's Kitchen | Anaheim, CA | Cloudinary |
| Seafood Market | Boston, MA | Cloudinary |
| Cedar Kitchen | Brooklyn, NY | Cloudinary |
| Burgers Pantry | Los Angeles, CA | Cloudinary |
| Skyline Kitchen | Chicago, IL | Cloudinary |
| And more... | | |

---

## UI/UX Design

### Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Primary | `#4561ED` | Buttons, active states, accents |
| Primary Light | `#4561ED/10` | Hover backgrounds, highlights |
| Text Primary | `#191919` | Headings, body text |
| Text Secondary | `#767676` | Secondary text, labels |
| Background | `#F7F7F7` | Page backgrounds |
| Card Background | `#FFFFFF` | Cards, popups |
| Success | `#22C55E` | Positive indicators |
| Warning | `#F59E0B` | Warnings |
| Error | `#EF4444` | Errors, destructive actions |

### Typography

- **Headings**: Bold, `#191919`
- **Body**: Regular, `#191919` or `#767676`
- **Labels**: Semi-bold, smaller size

### Component Patterns

- **Cards**: White background, subtle shadow, rounded corners
- **Buttons**: Rounded full, primary uses `#4561ED`
- **Inputs**: Gray background, focus ring with primary color
- **Avatars**: Letter-based with consistent colors per name

---

## Troubleshooting

### Common Issues

#### 1. "Database not found" error
**Solution:** Ensure `DELIVERY_LIBSQL_URL` is set in `.env` and the database file exists.

```bash
# Check if database exists
ls -la data/db/delivery.db

# If not, create it
sqlite3 data/db/delivery.db < data/db/schema/delivery_schema.sql
sqlite3 data/db/delivery.db < data/db/schema/delivery_seed.sql
```

#### 2. Login not working
**Solution:** 
1. Check if database has data: `sqlite3 data/db/delivery.db "SELECT * FROM delivery_partners;"`
2. Restart the Next.js dev server after adding environment variables
3. Clear browser localStorage and try again

#### 3. Redirecting to main app instead of delivery portal
**Solution:** The `conditional-main-layout.tsx` should exclude `/delivery` paths. Verify it exists and is properly configured.

#### 4. Images not loading
**Solution:** Restaurant logos use Cloudinary URLs. Ensure you have internet connectivity.

---

## Future Enhancements

Potential features for future development:

1. **Real-time Order Acceptance**: WebSocket integration for live orders
2. **Navigation Integration**: Turn-by-turn directions
3. **Earnings Analytics**: Charts and graphs for earnings trends
4. **Document Upload**: Driver's license, insurance verification
5. **Schedule Management**: Set availability hours
6. **Support Chat**: In-app customer support
7. **Push Notifications**: Order alerts, promotions
8. **Multi-language Support**: Internationalization

---

## Contributing

When adding features to the delivery portal:

1. **Maintain Isolation**: Don't modify main app components
2. **Use Delivery Store**: All state through `delivery-partner-store`
3. **Follow Color Scheme**: Use `#4561ED` as primary
4. **Add Types**: Update `delivery-types.ts` for new data structures
5. **Document Changes**: Update this README

---

## License

This feature is part of the DashDoor application and follows the same licensing terms.

