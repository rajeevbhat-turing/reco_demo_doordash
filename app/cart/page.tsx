"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { getRestaurantById } from "@/constants/restaurants"

export default function CartPage() {
  const { items, restaurantId, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [restaurant, setRestaurant] = useState(restaurantId ? getRestaurantById(restaurantId) : null)

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 mt-10">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-500 mb-4">Your cart is empty</div>
          <Link href="/">
            <button className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium">
              Browse Restaurants
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 mt-10">
      <div className="flex items-center mb-6">
        <Link href={restaurantId ? `/store/${restaurantId}` : "/"} className="mr-4">
          <button className="p-2 rounded-full border border-gray-200">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      {restaurant && (
        <div className="flex items-center mb-6">
          <div className="relative h-12 w-12 mr-3">
            <Image
              src={restaurant.logo || "/placeholder.svg"}
              alt={restaurant.name}
              width={48}
              height={48}
              className="rounded-full border border-gray-200"
            />
          </div>
          <div>
            <h2 className="font-medium">{restaurant.name}</h2>
            <div className="text-sm text-gray-600">Delivery in {restaurant.time}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex justify-between">
          <h3 className="font-medium">Items</h3>
          <button className="text-red-600 text-sm font-medium flex items-center" onClick={() => clearCart()}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear cart
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex">
              <div className="relative h-16 w-16 mr-3 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="font-medium">{item.price}</div>
                </div>
                <div className="mt-2 flex items-center">
                  <button
                    className="p-1 rounded-full border border-gray-200"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="mx-3">{item.quantity}</span>
                  <button
                    className="p-1 rounded-full border border-gray-200"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button className="ml-4 text-red-600 text-sm" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span>{getTotalPrice()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Delivery Fee</span>
            <span>A$0.00</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Service Fee</span>
            <span>A$5.99</span>
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{getTotalPrice()}</span>
          </div>
        </div>
      </div>

      <button className="w-full bg-red-600 text-white py-3 rounded-full font-medium">Proceed to Checkout</button>
    </div>
  )
}
