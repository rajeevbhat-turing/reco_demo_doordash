import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NearbyStore {
  id: string;
  name: string;
  rating: string;
  numRatings: string;
  distance: string;
  time: string;
  image: string;
  discount?: string;
}

interface FastestNearYouProps {
  stores?: NearbyStore[];
}

// Default data (fallback)
const defaultStores: NearbyStore[] = [
  {
    id: "1",
    name: "Bi-Rite Market",
    rating: "4.7",
    numRatings: "850+",
    distance: "1.2 mi",
    time: "30 min",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/ada746a6-4410-4b60-858c-6ca4e24e47fd.png"
  },
  {
    id: "2",
    name: "Mollie Stone's Markets",
    rating: "4.6",
    numRatings: "200+",
    distance: "1.9 mi",
    time: "35 min",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/35cd6437-4142-46af-be81-4a10e6b3f312.png",
    discount: "25% off, up to $15"
  },
  {
    id: "3",
    name: "Marina Supermarket",
    rating: "4.5",
    numRatings: "200+",
    distance: "2.3 mi",
    time: "40 min",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/store/cover/e8bb850f-6082-4f12-b6eb-3da45a5ffe80.jpg"
  }
];

export default function FastestNearYou({ stores = defaultStores }: FastestNearYouProps) {
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Fastest Near You</h2>
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
            <div className="relative h-44 w-full rounded-lg overflow-hidden">
              <Image 
                src={store.image} 
                alt={store.name} 
                fill
                className="object-cover" 
              />
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
              {store.discount && (
                <div className="text-sm text-[#ff3008] mt-1">{store.discount}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}