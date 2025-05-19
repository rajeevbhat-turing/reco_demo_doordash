import { foodCategories } from "@/constants/food-categories"
import Image from "next/image"
import Link from "next/link"

export default function FoodExplorer() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {foodCategories.map((category) => (
        <Link
          key={category.name}
          href={`/category/${category.name.toLowerCase().replace(" ", "-")}`}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="p-4">
            <div className="text-sm font-medium mb-2">{category.name}</div>
            <div className="relative h-24 w-full">
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt={category.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
