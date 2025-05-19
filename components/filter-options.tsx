import { ChevronDown, Tag, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilterOptionsProps {
  isGrocery?: boolean
}

export default function FilterOptions({ isGrocery = false }: FilterOptionsProps) {
  return (
    <div className="flex gap-2 py-2 overflow-x-auto">
      {!isGrocery && (
        <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
          Schedule
          <ChevronDown className="h-2 w-2" />
        </Button>
      )}

      {!isGrocery && (
        <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
          <Tag className="h-2 w-2" />
          Deals
        </Button>
      )}

      {!isGrocery && (
        <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200">
          Pickup
        </Button>
      )}

      <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
        Over 4.5
        <Star className="h-2 w-2" />
        <ChevronDown className="h-2 w-2" />
      </Button>

      <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
        Price
        <ChevronDown className="h-2 w-2" />
      </Button>

      {!isGrocery && (
        <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
          <DollarSign className="h-2 w-2" />
          DashPass
        </Button>
      )}
    </div>
  )
}
