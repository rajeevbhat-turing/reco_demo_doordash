import { ChevronDown, Star } from "lucide-react"

interface CategoryFiltersProps {
  categories: { name: string; href: string }[]
  showRating?: boolean
  showTime?: boolean
  activeFilters: string[]
  onFilterChange: (filter: string) => void
  onReset: () => void
}

export default function CategoryFilters({ 
  categories, 
  showRating = false, 
  showTime = false,
  activeFilters,
  onFilterChange,
  onReset
}: CategoryFiltersProps) {
  const hasActiveFilters = activeFilters.length > 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 flex gap-2 py-4 overflow-x-auto no-scrollbar">
        {categories.map((category) => {
          const isActive = activeFilters.includes(category.name)
          return (
            <button
              key={category.name}
              onClick={() => onFilterChange(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              {category.name}
            </button>
          )
        })}

        {showRating && (
          <button 
            onClick={() => onFilterChange("Over 4.5")}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${activeFilters.includes("Over 4.5") ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
          >
            Over 4.5
            <Star className="h-4 w-4" />
            <ChevronDown className="h-4 w-4" />
          </button>
        )}

        {showTime && (
          <button 
            onClick={() => onFilterChange("Under 30 min")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${activeFilters.includes("Under 30 min") ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
          >
            Under 30 min
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className={'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-900'}        
        >
          Reset
        </button>
      )}
    </div>
  )
}

// Add this to your global CSS file:
/*
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
*/
