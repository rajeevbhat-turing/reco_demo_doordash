import { BaseStore } from './store';

export interface PetStore extends BaseStore {
  storeType: "pets";
  rating?: number;
  reviewCount?: number;
  distance?: string;
  categories?: string[]; // e.g., ["Dog", "Cat", "Small Pets", "Reptiles"]
  services?: string[];   // e.g., ["Grooming", "Veterinary", "Training"]
  tags?: string[];
}

// Sample data structure for pet products
export interface PetProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
  brand?: string;
  category?: string;    // e.g., "Dog", "Cat", "Small Pets"
  subcategory?: string; // e.g., "Food", "Toys", "Beds"
  ageGroup?: string;    // e.g., "Puppy", "Adult", "Senior"
  petSize?: string;     // e.g., "Small", "Medium", "Large"
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  popularFlag?: boolean;
  saleFlag?: boolean;
  originalPrice?: number;
}