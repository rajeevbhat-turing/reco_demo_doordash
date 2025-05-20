import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GroceryStore {
  id: string;
  name: string;
  rating: string;
  numRatings: string;
  distance: string;
  time: string;
  image: string;
}

interface GroceryFavoritesProps {
  stores?: GroceryStore[];
}

// Default data (fallback)
const defaultFavorites: GroceryStore[] = [
  {
    id: "1",
    name: "Sprouts Farmers Market",
    rating: "4.8",
    numRatings: "8.9k+",
    distance: "1.1 mi",
    time: "50 min",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/71af112e-089d-4f65-ad70-d8675ae55265.jpg"
  },
  {
    id: "2",
    name: "Target",
    rating: "4.8",
    numRatings: "3k+",
    distance: "0.4 mi",
    time: "31 min",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png"
  },
  {
    id: "3",
    name: "Safeway",
    rating: "4.7",
    numRatings: "4k+",
    distance: "0.5 mi",
    time: "36 min",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png"
  }
];

export default function GroceryFavorites({ stores = defaultFavorites }: GroceryFavoritesProps) {
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Grocery Favorites</h2>
        <div className="flex items-center gap-2">
          <a href="#" className="text-sm font-medium">
            See All
          </a>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="rounded-full bg-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full bg-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div key={store.id} className="relative group">
            <div className="w-full rounded-lg overflow-hidden bg-gray-100">
              <div style={{ width: '100%', paddingBottom: '75%', position: 'relative' }}>
                <div className="absolute inset-0">
                  <img 
                    src={store.image} 
                    alt={store.name}
                    className="w-full h-full object-cover" 
                  />
                  {/* Subtle overlay gradient for better visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 rounded-full bg-white opacity-80 hover:opacity-100"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <div className="mt-2">
              <div className="font-medium">{store.name}</div>
              <div className="flex items-center text-sm text-gray-500">
                <span>★ {store.rating}</span>
                <span className="mx-1">•</span>
                <span>{store.distance}</span>
                <span className="mx-1">•</span>
                <span>{store.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}