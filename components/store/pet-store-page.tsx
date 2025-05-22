"use client"

import type React from "react"
import { useState } from "react"
import GenericStorePage from "@/components/store/generic-store-page"
import type { Store } from "@/constants/store"
import type { PetStore, StoreConfig, ProductSection } from "@/types/store"
import { cartConfig } from "@/data/cart-config"
import { petProductData, petProductCategories } from "@/data/pet-data";

interface PetStorePageProps {
  onBackClick: () => void
  storeData: Store
  productData?: ProductSection[]
}

export default function PetStorePage({ onBackClick, storeData, productData = petProductData }: PetStorePageProps) {
  // Convert Store to PetStore
  const petStore: PetStore = {
    id: storeData.id,
    name: storeData.name,
    image: storeData.image,
    openTime: storeData.openTime,
    deliveryTime: storeData.deliveryTime,
    discount: storeData.discount,
    isDashPass: storeData.isDashPass,
    isNearYou: storeData.isNearYou,
    tags: storeData.tags,
    storeType: "pets"
  }

  // Define pet-specific configuration
  const petConfig: StoreConfig = {
    showRating: false,
    showPricing: false,
    showDeliveryInfo: true,
    categoryFilters: petProductCategories,
    cartConfig: {
      freeDeliveryThreshold: cartConfig.freeDeliveryThreshold,
      serviceFeePercentage: cartConfig.serviceFeePercentage,
      minServiceFee: cartConfig.minServiceFee
    },
    uiConfig: {
      noResultsMessage: {
        title: "No pet products found",
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
      storeData={petStore}
      productData={productData}
      storeConfig={petConfig}
    />
  )
}