"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, CheckCircle } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useOrdersStore } from "@/store/orders-store"

interface OrderConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  total: number
  tipAmount?: number
  scheduledTime?: string
  deliveryTime?: string
  storeName?: string
  storeId?: string
  category?: string
}

export default function OrderConfirmationModal({ 
  isOpen, 
  onClose, 
  orderId, 
  total,
  tipAmount = 0,
  scheduledTime,
  deliveryTime,
  storeName,
  storeId,
  category
}: OrderConfirmationModalProps) {
  const router = useRouter()
  const { items, clearCart, currentCategory, currentStoreId, currentRestaurantId, recordOrderCompletion } = useCartStore()
  const { addOrder } = useOrdersStore()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleClose = () => {
    console.log('[ORDER] 🚀 Order completion starting...', {
      orderId,
      tipAmount,
      total,
      storeName: storeName || "Store",
      category: category || currentCategory,
      itemsCount: items.length,
      items: items.map(item => item.itemName)
    })

    // Record order completion in cart store for verifiers
    recordOrderCompletion({
      orderId,
      tipAmount,
      orderTotal: total,
      storeName: storeName || "Store",
      category: category || currentCategory,
      items
    })
    console.log('[ORDER] ✅ Recorded order completion in cart store')

    // Add order to orders store
    const orderData = {
      orderId,
      storeName: storeName || "Store",
      storeId: storeId || currentStoreId || currentRestaurantId || "unknown",
      category: category || currentCategory,
      items,
      total,
      deliveryTime,
      scheduledTime
    };
    console.log('[ORDER] 📦 Adding order to orders store with data:', orderData);
    addOrder(orderData);
    console.log('[ORDER] ✅ Added order to orders store')

    // Clear the cart
    clearCart()
    console.log('[ORDER] ✅ Cart cleared')

    // Close modal
    onClose()

    // Navigate to home page
    router.push("/")
    console.log('[ORDER] ✅ Order completion finished - navigating home')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 p-1" 
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-gray-400" />
        </button>

        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h2>

          {/* Order Details */}
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Your order has been placed successfully
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono font-bold text-lg">{orderId}</p>
            </div>
            <p className="text-lg font-semibold">
              Total: ${total.toFixed(2)}
            </p>
          </div>

          {/* Estimated Delivery Time */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              {scheduledTime ? "Scheduled Delivery Time" : "Estimated Delivery Time"}
            </p>
            <p className="text-blue-900 font-bold">
              {scheduledTime || deliveryTime || "45-60 minutes"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 mt-4">
            You will receive SMS and email updates about your order status
          </p>
        </div>
      </div>
    </div>
  )
} 