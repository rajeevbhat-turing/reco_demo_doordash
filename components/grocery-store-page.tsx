"use client"

import type React from "react"
import { useState } from "react"
import { 
  HeartIcon as HeartOutline, 
  List 
} from "lucide-react"
import { HeartIcon as HeartFilled } from "lucide-react"
import GenericStorePage from "@/components/store/generic-store-page"
import { groceryData, storeSpecificData } from "@/data/grocery-data"
import type { StoreInfo } from "@/data/store-data"
import { cartConfig } from "@/data/cart-config"
import { uiConfig } from "@/data/ui-config"
import type { GroceryStore, StoreConfig, ProductSection } from "@/types/store"

interface GroceryStorePageProps {
  onBackClick: () => void
  storeData: StoreInfo
}

export default function GroceryStorePage({ onBackClick, storeData }: GroceryStorePageProps) {
  // Convert StoreInfo to GroceryStore
  const groceryStore: GroceryStore = {
    id: storeData.id,
    name: storeData.name,
    image: storeData.logo,
    rating: storeData.rating,
    reviewCount: storeData.reviewCount,
    distance: storeData.distance,
    priceLevel: storeData.priceLevel,
    isDashPass: storeData.isDashPass,
    deliveryTime: storeData.deliveryTime,
    expressTime: storeData.expressTime,
    maxOrderLimit: storeData.maxOrderLimit,
    storeType: "grocery"
  }

  // Get store-specific data if available, otherwise use default groceryData
  const getProductData = (): ProductSection[] => {
    try {
      // Check if we have store-specific data for this store
      if (storeSpecificData && storeSpecificData[storeData.id]) {
        // Format store-specific data to match ProductSection type if needed
        const specificData = storeSpecificData[storeData.id];
        
        // Process the data to ensure it matches the expected format
        const formattedData = specificData.map(section => {
          // Handle nested arrays in some store data
          let products = section.products;
          
          // Flatten nested arrays if present
          if (Array.isArray(products) && products.length > 0 && Array.isArray(products[0])) {
            products = products.flat();
          }
          
          // Convert string prices to numbers if needed
          const formattedProducts = products.map(product => {
            try {
              if (product.price && typeof product.price === 'string') {
                // Remove currency symbol, /lb, and other non-numeric characters
                const priceString = product.price.replace(/[$,\/lb\/ea]/g, '');
                const numericPrice = parseFloat(priceString);
                return {
                  ...product,
                  price: isNaN(numericPrice) ? 0 : numericPrice,
                  id: product.id?.toString ? product.id.toString() : product.id
                };
              }
              return {
                ...product,
                price: product.price || 0,
                id: product.id?.toString ? product.id.toString() : product.id
              };
            } catch (err) {
              console.error("Error formatting product:", err);
              return {
                ...product,
                price: 0,
                id: product.id?.toString ? product.id.toString() : product.id || "unknown"
              };
            }
          });
          
          return {
            ...section,
            products: formattedProducts
          };
        });
        
        return formattedData;
      }
      
      // Return default grocery data if no store-specific data exists
      return groceryData;
    } catch (err) {
      console.error("Error loading product data:", err);
      return groceryData; // Fallback to default data in case of any errors
    }
  };

  // Define grocery-specific configuration
  const groceryConfig: StoreConfig = {
    showRating: true,
    showPricing: true,
    showDeliveryInfo: true,
    cartConfig: {
      freeDeliveryThreshold: cartConfig.freeDeliveryThreshold,
      serviceFeePercentage: cartConfig.serviceFeePercentage,
      minServiceFee: cartConfig.minServiceFee
    },
    uiConfig: {
      noResultsMessage: uiConfig.noResultsMessage,
      defaultLocation: uiConfig.defaultLocation,
      dashPassBannerText: uiConfig.dashPassBannerText
    }
  }

  return (
    <GenericStorePage
      onBackClick={onBackClick}
      storeData={groceryStore}
      productData={getProductData()}
      storeConfig={groceryConfig}
      category="grocery"
    />
  )
}