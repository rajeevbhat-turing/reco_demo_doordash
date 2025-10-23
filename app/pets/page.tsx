"use client"

import { useState, useEffect } from "react"
import StoreGrid from "@/components/store/store-grid"
import ProductDisplay from "@/components/product/product-display"
import AllStores from "@/components/all-stores"
import CartSidebar from "@/components/cart-sidebar"
import { useCartStore } from "@/store/cart-store"
import { useAppStore } from "@/store/app-store"
import {
  getFilterOptions,
  getAllPetStores,
  getPetUiConfig,
  getFeaturedPetStores,
  getFeaturedPetDealsStore,
  getFeaturedPetDeals,
  getPetProductSections,
  getEnrichedPetProducts,
  getPetCategories,
  filterProductsByCategory
} from "@/app/pets/data/pet-response-mapper"
import { allPetStores } from "@/data/pet-data"
import { getDefaultRating } from "@/utils/rating-utils"

export default function Pets() {
  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [currentStoreData, setCurrentStoreData] = useState<any>(null)
  const cartStore = useCartStore();
  const { clearCurrentStore } = useAppStore()
  
  // Set the category to pets when component mounts
  useEffect(() => {
    cartStore.setCategory("pets")
    
    // Get the first pet store to use as default store data
    const allStores = getAllPetStores()
    if (allStores.length > 0) {
      setCurrentStoreData(allStores[0])
    }

    clearCurrentStore();
  }, [])
  
  // Function to check if an image URL is valid (not placeholder/empty)
  const hasValidImage = (imageUrl: string | undefined): boolean => {
    if (!imageUrl || imageUrl.trim() === '') return false;
    if (imageUrl.includes('placeholder.svg')) return false;
    if (imageUrl.includes('placeholder.png')) return false;
    return true;
  };
  
  // Get the data from our pet response mapper
  const allPetStores = getAllPetStores();
  const uiConfig = getPetUiConfig();
  const featuredPetStoreIds = getFeaturedPetStores();
  const productSections = getPetProductSections();
  
  // Use all stores (no filtering)
  const filteredStores = allPetStores;
  
  // Filter featured stores with valid images and convert to proper format
  const featuredStores = allPetStores
    .filter(store => hasValidImage(store.image))
    .slice(0, 8)
    .map(store => ({
      id: store.id,
      name: store.name,
      rating: store.rating,
      numRatings: store.ratingCount,
      distance: store.distance,
      time: store.time,
      delivery: "$0 delivery fee",
      image: store.image,
      open: true,
      openTime: "",
      inStorePrice: true,
      discount: "",
      isSnap: false,
      isDashPass: store.isDashPass,
    }));
  
  // Filter fastest stores with valid images (delivery time under 25 min)
  const fastestStores = allPetStores
    .filter(store => {
      const timeString = store.time || "";
      const minutes = parseInt(timeString.match(/\d+/)?.[0] || "100");
      return minutes < 25 && hasValidImage(store.image);
    })
    .slice(0, 8)
    .map(store => ({
      id: store.id,
      name: store.name,
      rating: store.rating,
      numRatings: store.ratingCount,
      distance: store.distance,
      time: store.time,
      delivery: "$0 delivery fee",
      image: store.image,
      open: true,
      openTime: "",
      inStorePrice: true,
      discount: "",
      isSnap: false,
      isDashPass: store.isDashPass,
    }));

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-4 pt-16">
        {/* All Stores Section */}
        {filteredStores.length > 0 ? (
          <AllStores 
            title={uiConfig.allStoresTitle} 
            stores={filteredStores} 
            variant="all" 
            storeType="pets"
            showSeeAll={false}
          />
        ) : (
          <div className="py-10 text-center">
            <p className="text-lg text-gray-500">No stores match your filters</p>
          </div>
        )}

        {/* Pricing and Fees Link */}
        <div className="mt-4 text-sm text-gray-600">
          <a href="#" className="hover:underline">
            Pricing and Fees
          </a>
        </div>

        {/* Pet Stores Near You Section */}
        {featuredStores.length > 0 && (
          <StoreGrid 
            title={uiConfig.nearbyTitle} 
            stores={featuredStores} 
            variant="favorites" 
            storeType="pets"
          />
        )}

        {/* Fastest Near You Section */}
        {fastestStores.length > 0 && (
          <StoreGrid 
            title="Fastest Near You" 
            stores={fastestStores} 
            variant="fastest" 
            storeType="pets"
          />
        )}

        {/* Product Sections */}
        {productSections.length > 0 && productSections.map((section, index) => (
          <ProductDisplay
            key={`section-${section.id || index}`}
            title={section.title}
            storeName={section.storeName}
            storeImage={section.storeImage}
            time={section.time}
            products={section.products}
            variant="carousel"
            isSnapEligible={section.isSnapEligible}
            storeId={allPetStores.length > 0 ? allPetStores[0].id : (section.id || index).toString()}
            category="pets"
          />
        ))}
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      {/* Floating Cart Button */}
      {cartStore.items.length > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full px-6 py-3 flex items-center shadow-lg z-40"
        >
          <span className="font-medium mr-2">View Cart • {cartStore.getTotalItems()} items</span>
          <span>{cartStore.getTotalPrice()}</span>
        </button>
      )}
    </>
  )
}