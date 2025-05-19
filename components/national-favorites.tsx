import Image from "next/image"
import { Heart, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { restaurants } from "@/constants/restaurants"
import Link from "next/link"

export default function NationalFavorites() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">National favourites</h2>
        <Link href="#" className="text-gray-900 font-medium">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.slice(0, 6).map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card border border-gray-200 rounded-lg overflow-hidden">
            <Link href={`/store/${restaurant.id}`} className="block">
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={
                    restaurant.banner || `/placeholder.svg?height=160&width=320&query=${restaurant.name} restaurant`
                  }
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
                <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-gray-500"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{restaurant.name}</h3>
                  {restaurant.dashPass && (
                    <div className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">DashPass</div>
                  )}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-700"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="ml-1">{restaurant.rating}</span>
                  </div>
                  <span className="mx-1">•</span>
                  <span>{restaurant.reviews}</span>
                  <span className="mx-1">•</span>
                  <span>{restaurant.distance}</span>
                  <span className="mx-1">•</span>
                  <span>{restaurant.time}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">{restaurant.deliveryFee}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
