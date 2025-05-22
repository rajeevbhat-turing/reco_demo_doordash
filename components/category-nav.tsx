"use client"

import Image from "next/image"
import { Category } from "@/types"

interface CategoryNavProps {
  selectedCategory: string | null
  onCategorySelect: (categoryName: string) => void
  categories: any[] // Use any to accommodate different category structures
}

export default function CategoryNav({ selectedCategory, onCategorySelect, categories }: CategoryNavProps) {
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
                  src={category.image || category.icon || "/placeholder.svg"}
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