"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  Bell,
  ShoppingCart,
  Star,
  Clock,
  ChevronDown,
  List,
  HeartIcon as HeartOutline,
  ChevronLeft,
} from "lucide-react"
import { HeartIcon as HeartFilled } from "lucide-react"
import Image from "next/image"
import CategoryNav from "@/components/category-nav"
import ProductDisplay from "@/components/product/product-display"
import type { ProductSection as ProductSectionType, Product } from "@/types"
import type { Store, StoreConfig } from "@/types/store"
import ShopListModal from "@/components/modals/shop-list-modal"
import ConvenienceCartSidebar from "@/components/convenience-cart-sidebar"
import { useCart } from "@/context/cart-context"
import ProductDetailModal from "@/components/modals/product-detail-modal"
import { groceryCategories } from "@/data/grocery-category-data"
import { petCategories } from "@/data/pet-data"
import {retailCategories} from "@/constants/store";

interface GenericStorePageProps {
  onBackClick: () => void
  storeData: Store
  productData: ProductSectionType[]
  storeConfig: StoreConfig
}

export default function GenericStorePage({
  onBackClick,
  storeData,
  productData,
  storeConfig
}: GenericStorePageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<ProductSectionType[]>(productData)
  const [isShopListModalOpen, setIsShopListModalOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { totalItems } = useCart()

  const cartConfig = storeConfig.cartConfig || {
    freeDeliveryThreshold: 35,
    serviceFeePercentage: 0.10,
    minServiceFee: 2,
  }

  const uiConfig = storeConfig.uiConfig || {
    noResultsMessage: {
      title: "No results found",
      description: "Try adjusting your search or filter to find what you're looking for.",
      buttonText: "Clear all filters"
    },
    defaultLocation: "Current Location",
    dashPassBannerText: "Save with DashPass. Unlimited $0 delivery fees on eligible orders."
  }

  // Determine which categories to use based on store type
  const getCategories = () => {
    if ('storeType' in storeData) {
      switch (storeData.storeType) {
        case 'pets':
          return petCategories;
        case 'grocery':
          return groceryCategories;
        case 'retail':
          return retailCategories;
        // Add more cases for other store types as needed
        default:
          return groceryCategories; // Default to grocery categories
      }
    }
    return groceryCategories; // Default to grocery categories
  }

  // Enhanced filtering that handles both search and category filtering
  useEffect(() => {
    if (!searchTerm && !selectedCategory) {
      setFilteredData(productData)
      return
    }

    const filtered = productData.map((section) => {
      // Filter products by both search term and category
      const filteredProducts = section.products.filter((product) => {
        // First filter by search term
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Then filter by category
        const matchesCategory = !selectedCategory || 
          selectedCategory === "All" || 
          // Match by product.category field if it exists
          (product.category && (
            // If category is an array of strings (for pet products)
            (Array.isArray(product.category) && product.category.some(cat => 
              cat.toLowerCase() === selectedCategory.toLowerCase()
            )) ||
            // If category is a string (legacy format)
            (typeof product.category === 'string' && 
              product.category.toLowerCase() === selectedCategory.toLowerCase())
          )) ||
          // Match by section title as fallback
          section.title === selectedCategory;
        
        // Product should match both search and category filters
        return matchesSearch && matchesCategory;
      });

      return { ...section, products: filteredProducts };
    }).filter((section) => section.products.length > 0); // Only keep sections with products

    setFilteredData(filtered);
  }, [searchTerm, selectedCategory, productData]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName)
  }

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  // Close product detail modal
  const closeProductModal = () => {
    setSelectedProduct(null)
  }

  return (
    <div className="max-w-screen-2xl mx-auto bg-white flex overflow-hidden mt-16 relative">
      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-x-hidden relative">

        {/* Store Header */}
        <div className="p-4 pb-0">
          {/* Store Layout */}
          <div className="mb-4">
            {/* Store Image - Larger now */}
            <div className="mb-3">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-green-700 flex items-center justify-center">
                <Image
                  src={storeData.image || "/placeholder.svg"}
                  alt={storeData.name}
                  width={112}
                  height={112}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Title and Search in same row */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">{storeData.name}</h1>

              {/* Search bar - right of title */}
              <div className="relative w-1/2 lg:w-1/3">
                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <Search className="w-5 h-5 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder={`Search ${storeData.name}`}
                    className="bg-transparent border-none outline-none flex-1 text-gray-800 placeholder-gray-500"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => setSearchTerm("")}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className="flex items-center text-sm text-gray-700 flex-wrap gap-y-1">
              {storeData.isDashPass && (
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-sm mr-2 flex items-center">
                  <Image
                    src="/placeholder.svg?height=16&width=16"
                    alt="DashPass"
                    width={16}
                    height={16}
                    className="mr-1"
                  />
                  DashPass
                </span>
              )}
              {'rating' in storeData && storeConfig.showRating !== false && (
                <>
                  <div className="flex items-center mr-2">
                    <Star className="w-4 h-4 fill-current text-yellow-500 mr-1" />
                    <span>{storeData.rating}</span>
                    <span className="text-gray-500 ml-1">
                      ({('reviewCount' in storeData ? storeData.reviewCount : ('reviews' in storeData ? storeData.reviews : 0))}+)
                    </span>
                  </div>
                  <span className="mr-2">•</span>
                </>
              )}
              {'distance' in storeData && (
                <>
                  <span className="mr-2">{storeData.distance}</span>
                  <span className="mr-2">•</span>
                </>
              )}
              {('priceLevel' in storeData && storeConfig.showPricing !== false) && (
                <span className="mr-2">{storeData.priceLevel}</span>
              )}
              {('priceRange' in storeData && storeConfig.showPricing !== false) && (
                <span className="mr-2">{storeData.priceRange}</span>
              )}
              <a href="#" className="text-gray-700 underline">
                Pricing & Fees
              </a>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="border rounded-lg px-4 py-2">
              <span className="text-sm">Delivered by {storeData.deliveryTime}</span>
            </div>
            {'expressTime' in storeData && storeConfig.showDeliveryInfo !== false && (
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-medium">Express</span>
                <span className="ml-2">{storeData.expressTime}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="border rounded-full px-4 py-2 flex items-center bg-gray-100"
                onClick={() => setIsShopListModalOpen(true)}
              >
                <List className="w-4 h-4 mr-2" />
                Shop your list
              </button>
              <button
                className={`border rounded-full px-4 py-2 flex items-center ${isSaved ? "text-red-600" : ""}`}
                onClick={() => setIsSaved(!isSaved)}
              >
                {isSaved ? (
                  <HeartFilled className="w-4 h-4 mr-2 fill-red-600" />
                ) : (
                  <HeartOutline className="w-4 h-4 mr-2" />
                )}
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <CategoryNav
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          categories={getCategories()}
        />

        {/* Search Results Summary */}
        {(searchTerm || selectedCategory) && (
          <div className="px-4 py-2 bg-gray-50">
            <p className="text-sm text-gray-700">
              {filteredData.reduce((total, section) => total + section.products.length, 0)} results
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory && selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}

        {/* Promo Banner - Only shown for stores with cart functionality */}
        {storeConfig.cartConfig && (
          <div className="p-4 bg-blue-50 mx-4 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-teal-700 font-medium">
                  $0 delivery fee on orders over ${storeConfig.cartConfig.freeDeliveryThreshold}. On eligible orders.{" "}
                  {storeConfig.cartConfig.serviceFeePercentage * 100}% service fee applies (${storeConfig.cartConfig.minServiceFee} min). Terms
                  apply.
                </p>
              </div>
              <Image src="/placeholder.svg?height=40&width=40" alt="Promo" width={40} height={40} className="ml-2" />
            </div>
          </div>
        )}

        {/* Product Sections */}
        <main className="pb-20 w-full overflow-x-hidden ml-4 pr-4 lg:pr-8">
          {filteredData.length > 0 ? (
            filteredData.map((section) => (
              <div className="lg:pr-4" key={`${section.id}-${section.title}`}>
                <ProductDisplay
                  title={section.title}
                  products={section.products}
                  onProductClick={handleProductClick}
                  variant="section"
                  category={'storeType' in storeData ? storeData.storeType : 'grocery'}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="No results"
                width={120}
                height={120}
                className="mb-4 opacity-50"
              />
              <h3 className="text-xl font-medium mb-2">{uiConfig.noResultsMessage.title}</h3>
              <p className="text-gray-500 mb-4">{uiConfig.noResultsMessage.description}</p>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-full"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory(null)
                }}
              >
                {uiConfig.noResultsMessage.buttonText}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Cart Sidebar - Only shown for stores with cart functionality */}
      {storeConfig.cartConfig && (
        <div className="hidden lg:block w-80 border-l p-4 flex-shrink-0 z-10">
          <ConvenienceCartSidebar
            storeData={storeData}
            cartConfig={storeConfig.cartConfig}
            uiConfig={storeConfig.uiConfig}
          />
        </div>
      )}

      {/* Shop List Modal */}
      <ShopListModal isOpen={isShopListModalOpen} onClose={() => setIsShopListModalOpen(false)} />

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} onClose={closeProductModal} />
    </div>
  )
}