// Pet store data mapper - following the same pattern as grocery

import {allPetStores, petProductData} from "@/data/pet-data";

// Filter options for the pets page
export function getFilterOptions() {
  return [
    { id: "1", name: "Delivery", icon: "🚚" },
    { id: "2", name: "Pickup", icon: "🛒" },
    { id: "3", name: "DashPass", icon: "🔵" },
    { id: "4", name: "Under 30 min", icon: "⏱️" },
    { id: "5", name: "Over 4.5", icon: "⭐" },
  ]
}

// Return all pet stores
export function getAllPetStores() {
  return allPetStores;
}

// Get the UI configuration for the pets page
export function getPetUiConfig() {
  return {
    pageTitle: "Pet Supplies",
    nearbyTitle: "Pet Stores Near You",
    allStoresTitle: "All Pet Stores",
    dealsTitle: "Featured Deals",
    seeAllText: "See All Pet Stores",
    seeAllDescription: "View all available pet supply stores in your area"
  };
}

// Featured pet stores for the "Stores Near You" section
export function getFeaturedPetStores() {
  // Return the first 5 store IDs as featured
  return allPetStores.slice(0, 5).map(store => store.id);
}

// Get pet stores by their IDs
export function getPetStoresByIds(storeIds: string[]) {
  return allPetStores.filter(store => storeIds.includes(store.id));
}

// Featured pet store for deals section
export function getFeaturedPetDealsStore() {
  // Use the first store as the featured store
  const featuredStore = allPetStores[0];

  return {
    id: featuredStore?.id || "featured-pet-store",
    name: featuredStore?.name || "Pet Store",
    image: featuredStore?.image || "/store-logos/default-store.svg",
    deliveryTime: featuredStore?.time || "15-30 min"
  };
}

// Featured pet deals
export function getFeaturedPetDeals() {
  // Extract some products from the first product section to use as deals
  const firstSection = petProductData[0];

  if (!firstSection || !firstSection.products || firstSection.products.length < 4) {
    // Fallback deals if we don't have enough products
    return [
      {
        id: 1,
        name: "Dog Food",
        price: 24.99,
        originalPrice: 29.99,
        image: "/placeholder.jpg"
      },
      {
        id: 2,
        name: "Cat Treats",
        price: 12.99,
        originalPrice: 16.99,
        image: "/placeholder.jpg"
      },
      {
        id: 3,
        name: "Fish Tank",
        price: 49.99,
        originalPrice: 69.99,
        image: "/placeholder.jpg"
      },
      {
        id: 4,
        name: "Bird Cage",
        price: 34.99,
        originalPrice: 44.99,
        image: "/placeholder.jpg"
      }
    ];
  }

  // Use the first 4 products from the section
  return firstSection.products.slice(0, 4).map((product, index) => {
    // Calculate an "original" price that's higher than the current price
    const price = typeof product.price === 'string'
      ? parseFloat(product.price.replace('$', ''))
      : product.price;

    const originalPrice = price * 1.2; // 20% higher

    return {
      id: index + 1,
      name: product.name,
      price: price,
      originalPrice: originalPrice,
      image: product.image
    };
  });
}

// Get selected pet product sections
export function getPetProductSections() {
  // Filter out only the sections we want to show on the main page
  // Create a "Best Sellers" section from the first product section
  // and an "Our Picks for You" section from another product section
  
  if (petProductData.length < 2) {
    return petProductData; // Return all if we don't have enough sections
  }
  
  // Create a Best Sellers section using the first section
  const bestSellers = {
    ...petProductData[0],
    title: "Best Sellers"
  };
  
  // Create Our Picks for You section using the second section
  const ourPicks = {
    ...petProductData[1],
    title: "Our Picks for You"
  };
  
  return [bestSellers, ourPicks];
}

// Get pet stores filtered by criteria
export function getFilteredPetStores(filters: string[]) {
  if (filters.length === 0) return allPetStores;

  return allPetStores.filter(store => {
    return filters.every(filter => {
      if (filter === "Over 4.5") {
        return store.tags?.includes("Over 4.5");
      }
      if (filter === "Under 30 min") {
        return store.tags?.includes("Under 30 min");
      }
      return store.tags?.includes(filter);
    });
  });
}
