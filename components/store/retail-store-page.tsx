"use client"

import type React from "react"
import { useState } from "react"
import GenericStorePage from "@/components/store/generic-store-page"
import type { Store as ConstantsStore } from "@/constants/store"
import type { StoreConfig, ProductSection, Store } from "@/types/store"
import {cartConfig} from "@/data/cart-config";

interface RetailStorePageProps {
  onBackClick: () => void
  storeData: ConstantsStore
  productData: ProductSection[]
  storeType?: "retail" | "convenience"
}

export default function RetailStorePage({ onBackClick, storeData, productData, storeType = "retail" }: RetailStorePageProps) {
  // Convert Store to the format expected by GenericStorePage
  const retailStore: Store = {
    id: storeData.id,
    name: storeData.name,
    image: storeData.image,
    openTime: storeData.openTime,
    deliveryTime: storeData.deliveryTime,
    discount: storeData.discount,
    isDashPass: storeData.isDashPass,
    isNearYou: storeData.isNearYou,
    tags: storeData.tags,
    storeType: storeType
  } as Store

  // Define retail-specific configuration
  const retailConfig: StoreConfig = {
    showRating: false,
    showPricing: false,
    showDeliveryInfo: false,
    cartConfig: {
      freeDeliveryThreshold: cartConfig.freeDeliveryThreshold,
      serviceFeePercentage: cartConfig.serviceFeePercentage,
      minServiceFee: cartConfig.minServiceFee
    },
    uiConfig: {
      noResultsMessage: {
        title: "No products found",
        description: "Try adjusting your search or filter to find what you're looking for.",
        buttonText: "Clear all filters"
      },
      defaultLocation: "Current Location",
      dashPassBannerText: "Save with DashPass. Unlimited $0 delivery fees on eligible orders."
    }
  }

  return (
    <GenericStorePage
      onBackClick={onBackClick}
      storeData={retailStore}
      productData={productData}
      storeConfig={retailConfig}
      category={storeType === "convenience" ? "convenience" : "retail"}
    />
  )
}
