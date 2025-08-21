import Image from "next/image"
import { Heart, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Store {
  name: string
  image: string
  openTime?: string
  time?: string
  closed: boolean
  delivery: string
  inStorePrice: boolean
  discount: string
}

interface StoresNearYouProps {
  stores: Store[]
}

export default function StoresNearYou({ stores }: StoresNearYouProps) {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4">Stores Near You</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stores.map((store, index) => (
          <div key={`${store.name}-${index}`} className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <Image src={store.image || "/placeholder.svg"} alt={store.name} fill className="object-cover" />
              </div>

              <div className="flex-1">
                {store.openTime && <div className="text-sm text-blue-600 font-medium mb-1">{store.openTime}</div>}
                <div className="flex justify-between">
                  <h3 className="font-medium">{store.name}</h3>
                  <Button variant="ghost" size="icon" className="rounded-full -mr-2 -mt-2">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                {store.closed ? (
                  <div className="text-sm text-gray-500">Closed</div>
                ) : (
                  <div className="text-sm text-gray-500">{store.time}</div>
                )}

                <div className="text-sm text-gray-500">{store.delivery}</div>

                {store.inStorePrice && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Info className="h-3 w-3" />
                    In-store prices
                  </div>
                )}


              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
