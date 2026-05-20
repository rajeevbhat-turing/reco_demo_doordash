export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  banner: string;
  detailsBanner?: string;
  rating: number | null;
  reviews: string | null;
  distance: string;
  time: string;
  deliveryFee: string;
  isFreeDelivery: boolean;
  minDeliveryFee: number; // in cents
  priceRange: string;
  cuisine: string;
  dashPass: boolean;
  isOpen: boolean;
  openingHours: string;
  openingHour?: number | string | null; // Raw opening hour for client-side calculation
  closingHour?: number | string | null; // Raw closing hour for client-side calculation
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  lat: number;
  lng: number;
  phone: string;
  discount?: string;
  featured?: boolean;
  new?: boolean;
  categories?: string[]; // Array of category IDs for filtering
  section?: string; // Section grouping for UI display
  dietaryPreferences?: string[]; // Array of dietary preferences (e.g., "Vegan", "Vegetarian", "Gluten-free")
}
