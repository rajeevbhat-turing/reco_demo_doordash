"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/types"
import { useCart } from "@/context/cart-context"
import Modal from "@/components/ui/modal"
import { recommendedProducts, getProductNutrition } from "@/data/modal-data"

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isNutritionOpen, setIsNutritionOpen] = useState(false)
  const { addToCart } = useCart()

  if (!product) return null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    onClose()
  }

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  // Get nutrition info for this product
  const nutritionInfo = getProductNutrition(product.id)

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
          <p className="text-2xl font-bold mb-2">${product.price.toFixed(2)}/bch</p>
          <p className="text-gray-600 mb-4">Approx 0.4 lb per bunch • ${(product.price * 2.5).toFixed(2)}/lb</p>
          <p className="text-gray-600 mb-4">
            The price shown is an estimate. It will be updated after the order is completed at the store
          </p>
          <div className="inline-block bg-gray-100 px-3 py-1 rounded-md mb-6">SNAP</div>

          {/* Nutrition information */}
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
        </div>
      </div>

      {/* You May Also Like section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">You May Also Like</h2>
          <div className="flex space-x-2">
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
          {recommendedProducts.map((recProduct) => (
            <div key={recProduct.id} className="min-w-[150px] max-w-[150px]">
              <div className="relative mb-2">
                <Image
                  src={recProduct.image || "/placeholder.svg"}
                  alt={recProduct.name}
                  width={150}
                  height={150}
                  className="rounded-lg object-cover aspect-square"
                />
                <button
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart({
                      id: recProduct.id,
                      name: recProduct.name,
                      price: recProduct.price,
                      image: recProduct.image,
                    })
                  }}
                >
                  <Plus className="w-5 h-5 text-green-600" />
                </button>
              </div>
              <p className="font-medium">${recProduct.price.toFixed(2)}</p>
              <p className="text-sm text-gray-700 truncate">{recProduct.name}</p>
            </div>
          ))}
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
          Add to cart - ${(product.price * quantity).toFixed(2)}
        </button>
      </div>
    </Modal>
  )
}
