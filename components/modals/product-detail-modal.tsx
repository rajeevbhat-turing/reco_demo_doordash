"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/types"
import { useCartStore } from "@/store/cart-store"
import Modal from "@/components/ui/modal"
import { getProductNutrition } from "@/data/modal-data"
import { parseCurrency } from "@/lib/utils"

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
  storeId?: string
  category?: "grocery" | "retail" | "convenience" | "pets" | "restaurant"
  storeName?: string
}

const fallbackDescription = "The price shown is an estimate. It will be updated after the order is completed at the store";

export default function ProductDetailModal({ product, onClose, storeId, category = "grocery", storeName }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isNutritionOpen, setIsNutritionOpen] = useState(false)
  const { addItem, findCart } = useCartStore()

  // Set quantity based on cart or reset to 1 when product changes
  useEffect(() => {
    if (!product) return
    
    // Check if product is already in cart
    if (storeId && category) {
      const cart = findCart(storeId, category)
      const cartItem = cart?.items.find((item) => item.id === product.id)
      
      if (cartItem) {
        // Use cart quantity if product exists in cart
        setQuantity(cartItem.quantity)
      } else {
        // Reset to 1 if product is not in cart
        setQuantity(1)
      }
    } else {
      // Reset to 1 if store info is not available
      setQuantity(1)
    }
    
    setIsNutritionOpen(false) // Also reset nutrition panel
  }, [product?.id, storeId, category, findCart])

  if (!product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      const cartItem = {
        id: product.id,
        itemName: product.name,
        price: product.price,
        image: product.image,
      }
      
      // Add to cart - will automatically find or create cart for this store
      addItem(cartItem, category, storeName, storeId)
    }
    onClose()
  }

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  // Get nutrition info for this product
  const nutritionInfo = getProductNutrition(typeof product.id === 'string' ? parseInt(product.id) : product.id)

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-4xl">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Product image */}
        <div className="md:w-1/2">
          <div className="rounded-lg overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={500}
              height={500}
              className="w-full object-cover"
            />
          </div>
        </div>

        {/* Product details */}
        <div className="md:w-1/2">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-bold mb-2">${parseCurrency(product.price).toFixed(2)}/bch</p>
          <p className="text-gray-600 mb-4">Approx 0.4 lb per bunch • ${(parseCurrency(product.price) * 2.5).toFixed(2)}/lb</p>
          <p className="text-gray-600 mb-4">
            {(product as any).description ?? fallbackDescription}
          </p>
          <div className="inline-block bg-gray-100 px-3 py-1 rounded-md mb-6">SNAP</div>

          {/* Nutrition information - only show for restaurants */}
          {category === "restaurant" && (
            <div className="border-t border-b py-4">
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setIsNutritionOpen(!isNutritionOpen)}
              >
                <span className="font-bold text-lg">Nutrition Information</span>
                {isNutritionOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              </button>
              {isNutritionOpen && (
                <div className="mt-4">
                  <p className="text-gray-600">
                    Serving size: {nutritionInfo.servingSize}
                    <br />
                    Calories: {nutritionInfo.calories}
                    <br />
                    Total Fat: {nutritionInfo.totalFat}
                    <br />
                    Sodium: {nutritionInfo.sodium}
                    <br />
                    Total Carbohydrates: {nutritionInfo.totalCarbs}
                    <br />
                    Sugars: {nutritionInfo.sugars}
                    <br />
                    Protein: {nutritionInfo.protein}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar with quantity and add to cart */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
        <div className="flex items-center border rounded-md">
          <button className="p-2 hover:bg-gray-100 rounded-l-md" onClick={decrementQuantity} disabled={quantity <= 1}>
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="w-12 text-center border-none focus:outline-none"
            min="1"
          />
          <button className="p-2 hover:bg-gray-100 rounded-r-md" onClick={incrementQuantity}>
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full"
          onClick={handleAddToCart}
        >
          Add to cart - ${(parseCurrency(product.price) * quantity).toFixed(2)}
        </button>
      </div>
    </Modal>
  )
}
