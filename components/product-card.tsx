"use client"

import type React from "react"

import Image from "next/image"
import { Plus, Trash2 } from "lucide-react"
import type { Product } from "@/types"
import { useCart } from "@/context/cart-context"
import { useCartStore, CartCategory } from "@/store/cart-store"

interface ProductCardProps {
  product: Product
  onProductClick: (product: Product) => void
  storeId?: string
  category?: CartCategory
}

export default function ProductCard({ 
  product, 
  onProductClick, 
  storeId,
  category = "grocery"
}: ProductCardProps) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart()
  const cartStore = useCartStore()

  // Check if product is in cart from either implementation
  const contextCartItem = items.find((item) => item.id === product.id)
  const storeCartItem = cartStore.items.find((item) => item.id === product.id)
  const quantity = contextCartItem?.quantity || storeCartItem?.quantity || 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the add button
    
    // Add to both cart implementations for compatibility
    addToCart(product, storeId)
    
    // Add to cart store directly
    cartStore.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: category !== "restaurant" ? storeId : undefined,
      restaurantId: category === "restaurant" ? storeId : undefined,
    })
  }

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the remove button
    
    // Remove from both cart implementations for compatibility
    removeFromCart(product.id)
    cartStore.removeItem(product.id)
  }

  return (
    <div className="min-w-[140px] max-w-[140px] flex-shrink-0 cursor-pointer" onClick={() => onProductClick(product)}>
      <div className="relative mb-2">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={140}
          height={140}
          className="rounded-lg object-cover aspect-square"
        />

        {quantity > 0 ? (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-center bg-white rounded-full shadow-md px-2 py-1">
              <button className="p-1 text-gray-700" onClick={handleRemoveFromCart} aria-label="Remove from cart">
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="mx-2 text-sm font-medium">{quantity} ×</span>
              <button className="p-1 text-gray-700" onClick={handleAddToCart} aria-label="Add one more">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5 text-green-600" />
          </button>
        )}
      </div>
      <div>
        <p className="font-medium text-red-600">
          ${typeof product.price === 'number' 
            ? product.price.toFixed(2) 
            : parseFloat(product.price.toString().replace('$', '')).toFixed(2)}
        </p>
        <h3 className="text-sm line-clamp-2 h-10">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.quantity}</p>
      </div>
    </div>
  )
}