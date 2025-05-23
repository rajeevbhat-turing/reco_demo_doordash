import { Product, ProductSection } from './index';

// Extend the base Product interface for pet-specific products
export interface PetProduct extends Omit<Product, 'id'> {
  id: string | number;
  category: string[];
}

// Extend the base ProductSection interface for pet-specific sections
export interface PetProductSection extends Omit<ProductSection, 'products'> {
  storeName: string;
  storeImage: string;
  time: string;
  isSnapEligible: boolean;
  products: PetProduct[];
}

// Interface for pet deals
export interface PetDeal {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
}

// Interface for pet stores
export interface PetStore {
  id: string;
  name: string;
  image: string;
  deliveryTime: string;
}

// Interface for pet UI configuration
export interface PetUiConfig {
  pageTitle: string;
  nearbyTitle: string;
  allStoresTitle: string;
  dealsTitle: string;
  seeAllText: string;
  seeAllDescription: string;
}