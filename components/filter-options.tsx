import { ChevronDown, Tag, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilterOptionItem {
  id: string;
  title: string;
  type: string;
  customData: {
    filter_id: string;
    allowed_values?: Array<{
      display_name: string;
      query_value: string;
    }>;
    default_values?: Array<{
      display_name: string;
      query_value: string;
    }>;
  };
}

interface FilterOptionsProps {
  isGrocery?: boolean;
  filterData?: FilterOptionItem[];
}

export default function FilterOptions({ isGrocery = false, filterData = [] }: FilterOptionsProps) {
  // If we don't have filterData, use default hardcoded filters
  const hasFilterData = filterData && filterData.length > 0;
  
  // Find specific filters if we have filter data
  const ratingFilter = hasFilterData 
    ? filterData.find(f => f.id.includes('star_rating')) 
    : null;
    
  const priceFilter = hasFilterData 
    ? filterData.find(f => f.id.includes('price_range')) 
    : null;

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
        {ratingFilter?.customData?.default_values?.length 
          ? `Over ${ratingFilter.customData.default_values[0].display_name}` 
          : "Over 4.5"}
        <Star className="h-2 w-2" />
        <ChevronDown className="h-2 w-2" />
      </Button>

      <Button variant="outline" className="rounded-full h-9 text-xs font-semibold bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
        {priceFilter?.title || "Price"}
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