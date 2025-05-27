"use client"

import type React from "react"

import Image from "next/image"
import { Plus, Trash2, Minus } from "lucide-react"
import type { Product } from "@/types"
import { useCart } from "@/context/cart-context"
import { CartCategory } from "@/store/cart-store"

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
  const { items, addToCart, removeFromCart, updateQuantity } = useCart()

  // Check if product is in cart
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  // Helper function to format price
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      // If it's already a string like "$37.80", return as is
      if (price.startsWith('$')) {
        return price
      }
      // If it's a string number like "37.80", format it
      const numPrice = parseFloat(price)
      return isNaN(numPrice) ? price : `$${numPrice.toFixed(2)}`
    }
    // If it's a number, format it normally
    return `$${price.toFixed(2)}`
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the add button
    
    // Use only the context cart
    addToCart(product, storeId)
  }

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the remove button
    
    // Use only the context cart
    removeFromCart(product.id)
  }

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the decrease button
    
    if (quantity > 1) {
      // If quantity is more than 1, just decrease it
      updateQuantity(product.id, quantity - 1)
    } else {
      // If quantity is 1, remove the item completely
      removeFromCart(product.id)
    }
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
              <button className="p-1 text-gray-700" onClick={handleDecreaseQuantity} aria-label="Decrease quantity">
                <Minus className="w-4 h-4" />
              </button>
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
          {formatPrice(product.price)}
        </p>
        <h3 className="text-sm line-clamp-2 h-10">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.quantity}</p>
      </div>
    </div>
  )
}