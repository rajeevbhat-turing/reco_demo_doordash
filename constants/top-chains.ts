import { restaurants } from './restaurants';

// Extract unique chain/restaurant names from restaurants data
export const topChains = restaurants.map((r) => r.name);

