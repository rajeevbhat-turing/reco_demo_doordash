import Image from "next/image"
import { Info, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// Default products (fallback)
const defaultProducts = Array(6).fill(null).map((_, index) => ({
  id: index,
  price: "$3.99",
  name: `Grocery Item ${index + 1}`,
  image: "/placeholder.svg?height=128&width=128"
}));

interface Product {
  id: number;
  price: string;
  name: string;
  image: string;
}

interface GroceryEssentialsData {
  title: string;
  storeName: string;
  deliveryTime: string;
  showInStorePrice: boolean;
  products: Product[];
}

interface GroceryEssentialsProps {
  data?: GroceryEssentialsData;
}

export default function GroceryEssentials({ data }: GroceryEssentialsProps) {
  // Use provided data or fall back to defaults
  const title = data?.title || "Grocery Essentials";
  const storeName = data?.storeName || "Spudshed Fresh Food Market";
  const deliveryTime = data?.deliveryTime || "43 min";
  const showInStorePrice = data?.showInStorePrice ?? true;
  const products = data?.products || defaultProducts;

  return (
    <div className="py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span>From {storeName}</span>
          {deliveryTime && (
            <>
              <span>•</span>
              <span>{deliveryTime}</span>
            </>
          )}
          {showInStorePrice && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                In-store prices
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative h-32 w-full">
              <Image 
                src={product.image} 
                alt={product.name} 
                width={128} 
                height={128} 
                className="object-contain" 
              />
            </div>
            <div className="p-3">
              <div className="font-bold text-sm">{product.price}</div>
              <div className="text-sm text-gray-700 line-clamp-2">{product.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}