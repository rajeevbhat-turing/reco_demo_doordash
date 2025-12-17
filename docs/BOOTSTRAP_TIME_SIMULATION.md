# Bootstrap Time Simulation

A testing utility that allows simulating any date/time throughout the application. Useful for testing restaurant open/closed status, scheduled orders, and time-dependent features.

## Quick Start

Open the browser console and run:

```javascript
window.bootstrap({
  date: "2025-02-14T18:30:00Z",  // ISO 8601 format
  user: "john.doe@example.com"   // Optional: auto-login
})
// Page will automatically refresh to apply changes
```

## API Reference

### `window.bootstrap(config)`

Sets simulated time and optionally logs in a user.

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | `string` | ISO 8601 datetime (e.g., `"2025-02-14T18:30:00Z"`) |
| `user` | `string` | Optional. User email to auto-login |

**Time Offset Behavior:** Time continues ticking normally from the simulated point. If you set 6:30 PM, one minute later it will be 6:31 PM.

### `window.clearBootstrap()`

Clears all bootstrap settings and returns to real system time. Page automatically refreshes.

### `window.getBootstrapStatus()`

Returns current bootstrap state for debugging:

```javascript
{
  isBootstrapped: true,
  currentTime: "2025-02-14T18:30:45.123Z",
  timeOffset: "+45 minutes",
  simulatedUser: "john.doe@example.com",
  bootstrapTimestamp: "2025-02-14T18:30:00Z"
}
```

## Use Cases

### Test Restaurant Closed Status

```javascript
// Set time to 11:30 PM (page auto-refreshes)
window.bootstrap({ date: "2025-02-14T23:30:00Z" })
// Restaurants closing at 10 PM will show "CLOSED"
```

### Test Scheduled Order Activation

```javascript
// Order scheduled for 6:00 PM
window.bootstrap({ date: "2025-02-14T17:55:00Z" })  // Order status: "scheduled"
window.bootstrap({ date: "2025-02-14T18:05:00Z" })  // Order status: "pending"
```

### Test Order Timer Progression

```javascript
window.bootstrap({ date: "2025-02-14T12:00:00Z" })  // Place order at noon
window.bootstrap({ date: "2025-02-14T12:45:00Z" })  // Check 45 min later
```

### Test Delivery Time Slots

```javascript
// Test what time slots are available at different times
window.bootstrap({ date: "2025-02-14T09:00:00Z" })  // Morning slots
window.bootstrap({ date: "2025-02-14T20:00:00Z" })  // Evening slots
```

## Persistence

- **Auto-refresh:** Page automatically refreshes when calling `window.bootstrap()` or `window.clearBootstrap()`
- **LocalStorage:** Time offset persists across page refreshes
- **Cookies:** Server-side API routes read the offset from cookies

## Affected Features

| Feature | How it's affected |
|---------|-------------------|
| Restaurant open/closed status | Uses simulated time for hour checks |
| Schedule delivery modal | Time slots generated from simulated time |
| Order status progression | Elapsed time calculated from simulated time |
| Order timers | Countdown based on simulated time |
| Date range filters | "Last 7 days" uses simulated today |
| New order timestamps | Orders created use simulated time |

## Technical Details

### Files

- `store/bootstrap-store.ts` - Zustand store with time offset logic
- `lib/utils/time-utils.ts` - Server-side time utilities
- `components/bootstrap-initializer.tsx` - Exposes window.bootstrap()

### For Developers

**In React components (hooks):**
```typescript
import { useBootstrapStore } from '@/store/bootstrap-store';

const getCurrentTime = useBootstrapStore(state => state.getCurrentTime);
const now = getCurrentTime();
```

**In utility functions (non-React):**
```typescript
import { getCurrentTime } from '@/store/bootstrap-store';

const now = getCurrentTime();
```

**In API routes (server-side):**
```typescript
import { getServerCurrentHour } from '@/lib/utils/time-utils';

const cookieHeader = request.headers.get('cookie');
const currentHour = getServerCurrentHour(cookieHeader);
```

