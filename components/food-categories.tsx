"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { categories } from "@/constants/food-categories"

interface FoodCategoriesProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
}

export default function FoodCategories({ selectedCategory, onCategorySelect }: FoodCategoriesProps) {
  return (
    <div className="relative mt-4">
      <div className="flex overflow-x-auto py-4 scrollbar-hide -mx-4 px-4 space-x-8">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category-icon flex-shrink-0 `}
            onClick={() => onCategorySelect(selectedCategory === category.name ? null : category.name)}
          >
            <div
              className={`w-16 h-16 relative rounded-full`}
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <span
              className={`mt-1 text-sm ${selectedCategory === category.name ? "text-red-600" : "font-medium"}`}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <button className="bg-white rounded-full p-2 shadow-md">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
