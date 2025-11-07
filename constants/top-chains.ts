import { restaurants } from './restaurants';

// Extract unique chain/restaurant names from restaurants data
// Only include restaurants with rating > 4.5
export const topChains = restaurants
  .filter((r) => r.rating !== null && r.rating > 4.5)
  .map((r) => r.name);

