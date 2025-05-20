"use client"

import { useRef, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { foodCategorySvgs } from "@/constants/food-category-svgs"

interface FoodCategoriesProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
}

export default function FoodCategories({ selectedCategory, onCategorySelect }: FoodCategoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedCategory && containerRef.current) {
      const selectedElement = containerRef.current.querySelector(`[data-category="${selectedCategory}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [selectedCategory])

  return (
    <div className="relative mt-4">
      <div ref={containerRef} className="flex overflow-x-auto py-4 scrollbar-hide -mx-4 px-4 space-x-8">
        {foodCategorySvgs.map((category) => (
          <button
            key={category.id}
            data-category={category.name}
            className={`category-icon flex-shrink-0`}
            onClick={() => onCategorySelect(selectedCategory === category.name ? null : category.name)}
          >
            <div
              className={`w-16 h-16 relative rounded-full bg-white`}
            >
              <div className="w-full h-full">{category.svg}</div>
            </div>
            <span
              className={`mt-1 text-sm ${
                selectedCategory === category.name ? "text-red-600" : ""
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
