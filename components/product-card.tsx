"use client"

import type React from "react"

import Image from "next/image"
import { Plus, Trash2 } from "lucide-react"
import type { Product } from "@/types"
import { useCart } from "@/context/cart-context"

interface ProductCardProps {
  product: Product
  onProductClick: (product: Product) => void
  storeId?: string
}

export default function ProductCard({ product, onProductClick, storeId }: ProductCardProps) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart()

  // Check if product is in cart and get quantity
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the add button
    addToCart(product, storeId)
  }

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the modal when clicking the remove button
    removeFromCart(product.id)
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
