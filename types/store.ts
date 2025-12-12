// Generic store data interfaces

// Base store interface for all store categories
export interface BaseStore {
  id: string;
  name: string;
  image: string; // Unified property (called "logo" in grocery, "image" in retail)
  deliveryTime: string; // Common across all store types
  isDashPass?: boolean; // Optional but common across most store types
  storeType: StoreCategory; // Category identifier
}

// Store category type
export type StoreCategory = 'restaurant' | 'flowers';

// Restaurant-specific store interface
export interface RestaurantStore extends BaseStore {
  storeType: 'restaurant';
  rating: number;
  reviews: number;
  distance: string;
  priceRange: string;
  cuisine: string;
  banner?: string;
  dashPass?: boolean;
}

// Union type for all store types
export type Store = RestaurantStore;

// Helper type for store configuration
export interface StoreConfig {
  productSections?: string[];
  showRating?: boolean;
  showPricing?: boolean;
  showDeliveryInfo?: boolean;
  cartConfig?: {
    serviceFeePercentage: number;
    minServiceFee: number;
  };
  uiConfig?: {
    noResultsMessage: {
      title: string;
      description: string;
      buttonText: string;
    };
    defaultLocation: string;
    dashPassBannerText: string;
  };
}

// Product section and product interfaces - same across store types
export interface Product {
  id: number;
  name: string;
  price: number | string;
  quantity?: string;
  image: string;
  description?: string;
  category?: string;
}

export interface ProductSection {
  id: number | string;
  title: string;
  products: Product[];
}
