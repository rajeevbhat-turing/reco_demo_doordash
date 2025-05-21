"use client"

import type React from "react"
import { useState } from "react"
import { 
  HeartIcon as HeartOutline, 
  List 
} from "lucide-react"
import { HeartIcon as HeartFilled } from "lucide-react"
import GenericStorePage from "@/components/store/generic-store-page"
import { groceryData } from "@/data/grocery-data"
import type { StoreInfo } from "@/data/store-data"
import { cartConfig } from "@/data/cart-config"
import { uiConfig } from "@/data/ui-config"
import type { GroceryStore, StoreConfig } from "@/types/store"

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
      productData={groceryData}
      storeConfig={groceryConfig}
    />
  )
}