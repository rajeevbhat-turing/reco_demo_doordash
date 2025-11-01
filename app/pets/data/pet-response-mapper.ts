// Pet store data mapper - following the same pattern as grocery

import {allPetStores, petProductData} from "@/data/pet-data";

// Filter options for the pets page
export function getFilterOptions() {
  return [
    { id: "1", name: "Delivery", icon: "" },
    { id: "2", name: "Pickup", icon: "" },
    { id: "3", name: "DashPass", icon: "" },
    { id: "4", name: "Under 30 min", icon: "" },
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

// Get selected pet product sections
export function getPetProductSections(categoryFilter?: string) {
  // Filter out only the sections we want to show on the main page
  // Create a "Best Sellers" section from the first product section
  // and an "Our Picks for You" section from another product section
  
  if (petProductData.length < 2) {
    return petProductData; // Return all if we don't have enough sections
  }
  
  // Create a Best Sellers section using the first section
  let bestSellers = {
    ...petProductData[0],
    title: "Best Sellers"
  };
  
  // Create Our Picks for You section using the second section
  let ourPicks = {
    ...petProductData[1],
    title: "Our Picks for You"
  };
  
  // If we have a category filter, apply it to the products
  if (categoryFilter && categoryFilter !== 'All') {
    bestSellers = {
      ...bestSellers,
      products: filterProductsByCategory(bestSellers.products, categoryFilter)
    };
    
    ourPicks = {
      ...ourPicks,
      products: filterProductsByCategory(ourPicks.products, categoryFilter)
    };
  }
  
  return [bestSellers, ourPicks];
}

// Get pet products with enriched category data
export function getEnrichedPetProducts() {
  // Create a deep copy of the product data
  const enrichedData = JSON.parse(JSON.stringify(petProductData));
  
  // Process each section
  enrichedData.forEach((section: any) => {
    // Process each product in the section
    section.products.forEach((product: any) => {
      // If the category is empty, set default empty array
      if (!product.category || (Array.isArray(product.category) && product.category.length === 0) || product.category === "") {
        product.category = [];
      } 
      // If it's a string, convert it to an array
      else if (typeof product.category === 'string') {
        product.category = product.category ? [product.category] : [];
      }
    });
  });
  
  return enrichedData;
}

// Filter pet products by category
export function filterProductsByCategory(products: any[], category: string): any[] {
  if (!category || category === 'All') {
    return products;
  }
  
  return products.filter(product => 
    Array.isArray(product.category) && product.category.includes(category)
  );
}
