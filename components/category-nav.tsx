"use client"

import Image from "next/image"
import {categories} from "@/data/category-data";

interface CategoryNavProps {
  selectedCategory: string | null
  onCategorySelect: (categoryName: string) => void
}

// Default categories
// const defaultCategories = [
//   { id: 0, name: "All", icon: "/placeholder.svg?height=40&width=40", color: "bg-gray-100" },
//   { id: 1, name: "Deals", icon: "/placeholder.svg?height=40&width=40", color: "bg-red-100" },
//   { id: 2, name: "Produce", icon: "/placeholder.svg?height=40&width=40", color: "bg-green-100" },
//   { id: 3, name: "Meat", icon: "/placeholder.svg?height=40&width=40", color: "bg-red-100" },
//   { id: 4, name: "Seafood", icon: "/placeholder.svg?height=40&width=40", color: "bg-orange-100" },
//   { id: 5, name: "Dairy & Eggs", icon: "/placeholder.svg?height=40&width=40", color: "bg-blue-100" },
//   { id: 6, name: "Deli", icon: "/placeholder.svg?height=40&width=40", color: "bg-red-100" },
//   { id: 7, name: "Alcohol", icon: "/placeholder.svg?height=40&width=40", color: "bg-red-100" },
//   { id: 8, name: "Prepared Food", icon: "/placeholder.svg?height=40&width=40", color: "bg-orange-100" },
// ]

export default function CategoryNav({ selectedCategory, onCategorySelect }: CategoryNavProps) {
  return (
    <div className="overflow-x-auto no-scrollbar border-b mb-4">
      <div className="flex p-4 space-x-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className="flex flex-col items-center min-w-[80px] sm:min-w-[90px]"
            onClick={() => onCategorySelect(category.name)}
          >
            <div className="w-[72px] h-[72px] flex items-center justify-center mb-2">
              <div className="relative w-full h-full">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  sizes="72px"
                  className={`object-contain transition-all duration-200 ${
                    selectedCategory === category.name ? "opacity-75 filter blur-[0.5px]" : ""
                  }`}
                />
              </div>
            </div>
            <span
              className={`text-xs font-medium text-center transition-colors ${
                selectedCategory === category.name ? "font-bold text-red-600" : ""
              }`}
            >
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
