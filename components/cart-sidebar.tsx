"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Plus, Minus } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { Users } from "lucide-react"
import { useRestaurants } from "@/lib/hooks/use-restaurants"
import { useRestaurantMenu } from "@/lib/hooks/use-restaurant-menu"
import { useUserStore } from "@/store/user-store"
import { getRestaurantById } from "@/lib/utils/restaurant-utils"
import OtherCarts from "./other-carts"
import MenuItemDialog from "@/components/menu-item-dialog"
import type { MenuItem } from "@/constants/menu-items"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter()
  const { 
    carts,
    findCart,
    getCurrentCategory,
    getCurrentStoreId,
    getCurrentRestaurantId,
    updateQuantity, 
    removeItem, 
    clearCart,  
    addItem, 
    isGroupOrder, 
    groupOrderId,
    getConfig
  } = useCartStore()

  // Get current store info first (before fetching data)
  const currentCategory = getCurrentCategory()
  const currentStoreId = getCurrentStoreId()
  const currentRestaurantId = getCurrentRestaurantId()
  const activeStoreId = currentStoreId || currentRestaurantId
  
  // Find the cart for the current store
  // If no current store is set, use the last cart as the main cart
  let currentCart = activeStoreId ? findCart(activeStoreId, currentCategory) : null
  let otherCarts = carts.filter(cart => cart !== currentCart)
  
  // When no store is active, show the last cart as the main cart
  if (!activeStoreId && carts.length > 0) {
    currentCart = carts[carts.length - 1]
    otherCarts = carts.slice(0, -1)
  }

  // Only fetch restaurants if needed (for restaurant carts or other carts that might be restaurants)
  const currentUser = useUserStore(state => state.currentUser)
  const defaultAddress = currentUser?.addresses.find(a => a.default)
  const hasRestaurantCart = currentCart?.storeCategory === 'restaurant' || 
    otherCarts.some(cart => cart.storeCategory === 'restaurant')
  const shouldFetchRestaurants = hasRestaurantCart && defaultAddress?.lat && defaultAddress?.lng
  
  // Fetch restaurants near user's address (only when needed)
  const { data: restaurants } = useRestaurants(
    shouldFetchRestaurants ? defaultAddress?.lat : undefined,
    shouldFetchRestaurants ? defaultAddress?.lng : undefined,
    10 // 10 mile radius
  )
  
  // Only fetch menu items for restaurant category carts
  const shouldFetchMenu = currentCart?.storeCategory === 'restaurant' && activeStoreId
  const { data: menuData } = useRestaurantMenu(shouldFetchMenu ? activeStoreId : undefined)
  
  const items = currentCart?.items || []
  
  const [restaurant, setRestaurant] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [complementItems, setComplementItems] = useState<any[]>([])
  const complementScrollRef = useRef<HTMLDivElement>(null)
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  // Get category-specific configuration
  const categoryConfig = getConfig()

  // Function to get store information based on category and store ID
  // Note: Only restaurants are supported now
  const getStoreInfo = useCallback((storeId: string, category: string) => {
    // No store info for restaurants - they use restaurant data directly
    return null;
  }, []);

  // Function to fetch complement items - moved outside useEffect for clarity
  const fetchComplementItems = useCallback(
    (currentId: string, cartItemIds: string[]) => {
      if (!currentId) {
        setComplementItems([])
        return
      }

      // Get restaurant data
      const restaurantData = getRestaurantById(restaurants, currentId)
      setRestaurant(restaurantData)

      // Get menu items from the hook data
      const menuItems = menuData?.menuItems || []

      // Verify each item has the correct restaurantId
      const verifiedMenuItems = menuItems.filter((item) => {
        return item.restaurantId === currentId
      })

      // Filter out items already in cart
      const availableItems = verifiedMenuItems.filter((item) => !cartItemIds.includes(String(item.id)))

      if (availableItems.length === 0) {
        setComplementItems([])
        return
      }

      // Prioritize certain types of items
      const prioritizedItems = availableItems.filter(
        (item) =>
          item.popular ||
          item.category?.toLowerCase().includes("dessert") ||
          item.category?.toLowerCase().includes("drink") ||
          item.category?.toLowerCase().includes("side") ||
          item.category?.toLowerCase().includes("beverage") ||
          item.name.toLowerCase().includes("shake") ||
          item.name.toLowerCase().includes("fries") ||
          item.name.toLowerCase().includes("cookie") ||
          item.name.toLowerCase().includes("pie") ||
          item.name.toLowerCase().includes("ice cream") ||
          item.name.toLowerCase().includes("sundae"),
      )

      // Use prioritized items if available, otherwise use any available items
      const itemsToShow = prioritizedItems.length > 0 ? prioritizedItems : availableItems

      // Shuffle and take first 5 items - keep full item data including modifications
      const shuffledItems = itemsToShow
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          image: item.image || "/diverse-food-spread.png",
        }))

      setComplementItems(shuffledItems)
    },
    [restaurants, menuData], // Add restaurants and menuData dependencies
  )

  // Fetch complement items when items change - no useEffect needed
  useMemo(() => {
    if (currentCart && currentCart.storeCategory === 'restaurant' && items.length > 0) {
      const cartItemIds = items.map(item => item.id.toString());
      fetchComplementItems(currentCart.storeId, cartItemIds);
    } else {
      setComplementItems([]);
    }
    return null; // useMemo must return something
  }, [currentCart?.storeId, currentCart?.storeCategory, items.length, fetchComplementItems])

  // Get the display name based on current cart
  const getDisplayName = () => {
    // First, try to get store name from the current cart
    if (currentCart) {
      // Check if storeName is valid (not empty, not a number, not "Unknown Store")
      const storeName = currentCart.storeName;
      if (storeName && storeName.trim() !== '' && storeName !== 'Unknown Store' && !/^\d+$/.test(storeName)) {
        return storeName;
      }
      
      // If storeName is invalid or missing, try to look up from restaurants array
      if (currentCart.storeCategory === 'restaurant' && currentCart.storeId && restaurants) {
        const foundRestaurant = restaurants.find(r => r.id === currentCart.storeId);
        if (foundRestaurant?.name) {
          return foundRestaurant.name;
        }
      }
    }
    
    // Fallback to current page context
    if (currentCategory === 'restaurant' && restaurant) {
      return restaurant.name;
    } else if (currentCategory !== 'restaurant' && store) {
      return store.name;
    }
    
    // Fallback - try to look up restaurant from restaurants array
    if (activeStoreId && restaurants) {
      const foundRestaurant = restaurants.find(r => r.id === activeStoreId);
      if (foundRestaurant?.name) {
        return foundRestaurant.name;
      }
    }
    
    // Last resort fallback - only restaurants are supported now
    if (activeStoreId) {
      return `Store ${activeStoreId}`;
    }
    
    return 'Unknown Store';
  };

  // Navigate to the store page
  const handleNavigateToStore = () => {
    if (!currentCart) return;
    
    const storeId = currentCart.storeId;
    const category = currentCart.storeCategory;
    
    // Only restaurant category is supported now
    if (category === 'restaurant') {
      router.push(`/store/${storeId}`);
      onClose(); // Close the cart sidebar after navigation
    }
  };

  // Helper function to calculate individual item price
  const getItemPrice = (item: any) => {
    // Check if price is already a number
    if (typeof item.price === 'number') {
      return item.price;
    }
    
    // Handle string price (with currency symbol)
    if (typeof item.price === 'string') {
      const cleanPrice = item.price.replace(/[^0-9.]/g, "")
      const price = Number.parseFloat(cleanPrice)
      return isNaN(price) ? 0 : price
    }
    
    // Fallback for undefined or other types
    return 0
  }

  // Calculate subtotal
  const getSubtotal = () => {
    const total = items.reduce((sum, item) => {
      const price = getItemPrice(item)
      return sum + price * item.quantity
    }, 0)
    return total
  }

  // Calculate total for cart display (only subtotal - item prices)
  const getTotal = () => {
    const subtotal = getSubtotal()
    return subtotal.toFixed(2)
  }

  // Check if delivery fee applies (only for non-restaurant categories)
  const shouldShowDeliveryFeeNotice = () => {
    if (!currentCart || items.length === 0) return false;
    return currentCart.storeCategory !== 'restaurant' && ['grocery', 'retail', 'pets', 'convenience'].includes(currentCart.storeCategory);
  };

  const handleAddComplementItem = (item: any) => {
    // Verify the item belongs to the same restaurant as the current cart
    if (currentCart && currentCart.storeCategory === 'restaurant' && item.restaurantId === currentCart.storeId) {
      // Check if item has modifications
      if (item.modifications && item.modifications.length > 0) {
        // Item has modifications - open dialog instead
        setSelectedItem(item)
        setMenuItemDialogOpen(true)
        return
      }

      // No modifications - add directly to cart
      addItem({
        id: item.id,
        itemName: item.name,
        price: item.price,
        image: item.image,
      }, 'restaurant', currentCart.storeName, currentCart.storeId)
    }
  }

  // Handle navigation to checkout
  const handleContinueToCheckout = () => {
    if (currentCart) {
      // Pass cart identifier via query params for multi-tab support
      router.push(`/checkout?category=${currentCart.storeCategory}&storeId=${currentCart.storeId}`)
    } else {
      // Fallback to basic checkout if no cart found
      router.push('/checkout')
    }
    onClose() // Close the cart sidebar
  }

  // Handle removing a cart from other carts section
  const handleRemoveCart = (storeId: string, storeCategory: string) => {
    clearCart(storeId, storeCategory as any)
  }

  const cartClasses = isOpen
    ? "fixed inset-y-0 right-0 z-50 w-full md:w-[550px] bg-white shadow-xl flex flex-col transform translate-x-0 transition-transform duration-300 ease-in-out"
    : "fixed inset-y-0 right-0 z-50 w-full md:w-[550px] bg-white shadow-xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out"

  if (carts.length === 0 && isOpen) {
    return (
      <div className={cartClasses}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">Your cart</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-gray-500">Your cart is empty</div>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const displayThreshold = categoryConfig.freeDeliveryThreshold

  return (
    <div className={cartClasses}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="overflow-y-auto">
        {isGroupOrder && (
          <div className="px-4 py-2 bg-blue-50 flex items-center">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Group Order Active</p>
              <p className="text-xs text-blue-600">Others can add items to this order</p>
            </div>
          </div>
        )}

         {/* Delivery Fee Notice and Progress Bar - Only for non-restaurant categories */}
         {shouldShowDeliveryFeeNotice() && (
           <div className="p-4 border-b">
             {/* Progress bar */}
             <div className="mb-4">
               <h2 className="text-sm text-gray-600">Your cart from</h2>
               <div 
                 className="flex items-center cursor-pointer hover:opacity-70 transition-opacity"
                 onClick={handleNavigateToStore}
               >
                 <h3 className="font-bold text-lg">{getDisplayName()}</h3>
                 <ChevronRight className="h-5 w-5 ml-1" />
               </div>
             </div>
            <div className="h-1 bg-gray-200 rounded-full mb-4">
              <div
                className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((subtotal / displayThreshold) * 100, 100)}%` }}
                suppressHydrationWarning
              ></div>
            </div>

            {/* Delivery fee notice */}
            {subtotal < displayThreshold ? (
              <div className="flex items-start text-sm mb-4">
                <div className="text-blue-600 mr-2 mt-1 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M12 16H12.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-600" suppressHydrationWarning>
                    Add ${(displayThreshold - subtotal).toFixed(2)} for $0 delivery fee
                  </p>
                  <span className="text-gray-500" suppressHydrationWarning>
                    + service fees ({Math.round(categoryConfig.serviceFeePercentage * 100)}%, min ${categoryConfig.minServiceFee.toFixed(2)})
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start text-sm mb-4">
                <div className="text-green-600 mr-2 mt-1 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-600">
                    $0 delivery fee on orders over $35
                  </p>
                  <span className="text-gray-500" suppressHydrationWarning>
                    + service fees ({Math.round(categoryConfig.serviceFeePercentage * 100)}%, min ${categoryConfig.minServiceFee.toFixed(2)})
                  </span>
                </div>
              </div>
            )}

            {/* Continue button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full mb-3 text-lg" onClick={handleContinueToCheckout}>
              Continue
            </button>
            <p className="text-center text-sm text-gray-600" suppressHydrationWarning>
              ${getTotal()} without tax
            </p>
          </div>
        )}

         {/* For restaurants, show the continue button in the original position */}
         {!shouldShowDeliveryFeeNotice() && (
           <div className="p-4 border-b">
             <div className="mb-4">
               <h2 className="text-sm text-gray-600">Your cart from</h2>
               <div 
                 className="flex items-center cursor-pointer hover:opacity-70 transition-opacity"
                 onClick={handleNavigateToStore}
               >
                 <h3 className="font-bold text-lg">{getDisplayName()}</h3>
                 <ChevronRight className="h-5 w-5 ml-1" />
               </div>
             </div>
            <button className="w-full bg-[#e03a19] text-white py-3 rounded-full font-medium" onClick={handleContinueToCheckout}>
              Continue
            </button>
            <p className="text-center text-sm text-gray-600 mt-2" suppressHydrationWarning>
              ${getTotal()} without tax
            </p>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex">
                <div className="relative h-14 w-14 mr-4 flex-shrink-0">
                  <Image
                    src={item.image?.trim() || "/placeholder.svg"}
                    alt={item.itemName || 'Item Image'}
                    width={96}
                    height={96}
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-medium">{item.itemName}</h4>
                  {item.customizations && (
                    <p className="text-xs text-gray-600 mt-1">{item.customizations}</p>
                  )}
                   <div className="mt-2 flex items-center justify-between">
                     <div className="text-sm">${(getItemPrice(item) * item.quantity).toFixed(2)}</div>
                     <div className="flex items-center bg-gray-100 rounded-full shadow-lg">
                       {item.quantity <= 1 ? (
                         <button
                           className="p-1 bg-white rounded-full"
                           onClick={() => removeItem(item.id)}
                           aria-label="Remove item"
                         >
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                             <path
                               d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                               fill="currentColor"
                             />
                           </svg>
                         </button>
                       ) : (
                         <button
                           className="p-1 bg-white rounded-full"
                           onClick={() => updateQuantity(item.id, item.quantity - 1)}
                           aria-label="Decrease quantity"
                         >
                           <Minus className="h-4 w-4" />
                         </button>
                       )}
                       <span className="mx-3 text-sm">{item.quantity}×</span>
                       <button
                         className="p-1 bg-white rounded-full"
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         aria-label="Add one more"
                       >
                         <Plus className="h-5 w-5" />
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Complement your cart section - only show if we have restaurant cart */}
          {complementItems.length > 0 && currentCart && currentCart.storeCategory === 'restaurant' && (
            <div className="p-4 border-t mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Complement your cart</h3>
                <div className="flex space-x-2">
                  <button 
                    className="p-1 rounded-full border border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      if (complementScrollRef.current) {
                        complementScrollRef.current.scrollBy({
                          left: -200,
                          behavior: 'smooth'
                        })
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1 rounded-full border border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      if (complementScrollRef.current) {
                        complementScrollRef.current.scrollBy({
                          left: 200,
                          behavior: 'smooth'
                        })
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div ref={complementScrollRef} className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar scroll-smooth">
                {complementItems.map((item) => (
                  <div key={item.id} className="flex flex-col items-center min-w-[100px]">
                    <div className="relative w-20 h-20 mb-2">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name || 'Item Image'}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
                        onClick={() => handleAddComplementItem(item)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <h4 className="text-xs text-center line-clamp-2 mb-1">{item.name}</h4>
                    <p className="text-xs font-medium">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
           {/* Other Carts Section - show when no current store is set and there are other carts */}
           {!activeStoreId && otherCarts.length > 0 && (
             <OtherCarts carts={otherCarts} onRemoveCart={handleRemoveCart} onClose={onClose} restaurants={restaurants || []} />
           )}
        </div>
      </div>

      {/* Menu Item Dialog */}
      <MenuItemDialog
        isOpen={menuItemDialogOpen}
        onClose={() => setMenuItemDialogOpen(false)}
        item={selectedItem}
      />
    </div>
  )
}

