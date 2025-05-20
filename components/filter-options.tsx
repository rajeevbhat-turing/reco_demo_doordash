"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { ChevronDown, Tag, DollarSign } from "lucide-react"
import ScheduleDropdown from "./schedule-dropdown"

export interface FilterState {
  underThirtyMins: boolean
  schedule: boolean
  scheduledTime: string | null
  deals: boolean
  pickup: boolean
  overRating: number | null
  price: string[] | null
  dashPass: boolean
}

export interface FilterOptionsRef {
  resetFilters: () => void
}

interface FilterOptionsProps {
  isGrocery?: boolean
  onFilterChange?: (filters: FilterState) => void
  onReset?: () => void
  filters?: FilterState
}

const FilterOptions = forwardRef<FilterOptionsRef, FilterOptionsProps>(
  ({ isGrocery = false, onFilterChange, onReset, filters: externalFilters }, ref) => {
    const [filters, setFilters] = useState<FilterState>({
      underThirtyMins: false,
      schedule: false,
      scheduledTime: null,
      deals: false,
      pickup: false,
      overRating: null,
      price: null,
      dashPass: false,
    })

    // Update internal state when external filters change
    useEffect(() => {
      if (externalFilters) {
        setFilters(externalFilters)
        setSelectedRating(externalFilters.overRating)
        setSelectedPrices(externalFilters.price || [])
      }
    }, [externalFilters])

    const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false)
    const [priceDropdownOpen, setPriceDropdownOpen] = useState(false)
    const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false)
    const [selectedRating, setSelectedRating] = useState<number | null>(null)
    const [selectedPrices, setSelectedPrices] = useState<string[]>([])

    const ratingButtonRef = useRef<HTMLButtonElement>(null)
    const priceButtonRef = useRef<HTMLButtonElement>(null)
    const ratingDropdownRef = useRef<HTMLDivElement>(null)
    const priceDropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // For rating dropdown
        if (
          ratingDropdownOpen &&
          ratingDropdownRef.current &&
          !ratingDropdownRef.current.contains(event.target as Node) &&
          ratingButtonRef.current &&
          !ratingButtonRef.current.contains(event.target as Node)
        ) {
          setRatingDropdownOpen(false)
        }

        // For price dropdown
        if (
          priceDropdownOpen &&
          priceDropdownRef.current &&
          !priceDropdownRef.current.contains(event.target as Node) &&
          priceButtonRef.current &&
          !priceButtonRef.current.contains(event.target as Node)
        ) {
          setPriceDropdownOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [ratingDropdownOpen, priceDropdownOpen])

    const toggleFilter = (filterName: keyof FilterState, value?: any) => {
      const newFilters = {
        ...filters,
        [filterName]: value !== undefined ? value : !filters[filterName],
      }
      setFilters(newFilters)
      if (onFilterChange) {
        onFilterChange(newFilters)
      }
    }

    const handleRatingSelect = (rating: number) => {
      setSelectedRating(rating)
    }

    const handlePriceToggle = (price: string) => {
      let newPrices: string[]

      if (selectedPrices.includes(price)) {
        newPrices = selectedPrices.filter((p) => p !== price)
      } else {
        newPrices = [...selectedPrices, price]
      }

      setSelectedPrices(newPrices)
    }

    const applyRatingFilter = () => {
      toggleFilter("overRating", selectedRating)
      setRatingDropdownOpen(false)
    }

    const applyPriceFilter = () => {
      toggleFilter("price", selectedPrices.length > 0 ? selectedPrices : null)
      setPriceDropdownOpen(false)
    }

    const resetRatingFilter = () => {
      setSelectedRating(null)
      toggleFilter("overRating", null)
      setRatingDropdownOpen(false)
    }

    const resetPriceFilter = () => {
      setSelectedPrices([])
      toggleFilter("price", null)
      setPriceDropdownOpen(false)
    }

    const handleScheduleSelect = (selectedDate: string, selectedTime: string) => {
      const scheduledTime = `${selectedDate}, ${selectedTime}`
      toggleFilter("schedule", true)
      toggleFilter("scheduledTime", scheduledTime)
    }

    const getPriceLabel = () => {
      if (filters.price && filters.price.length > 0) {
        if (filters.price.length === 1) return filters.price[0]
        if (filters.price.length === 2) return `${filters.price[0]}, ${filters.price[1]}`
        return `${filters.price[0]}, ${filters.price[1]}...`
      }
      return "Price"
    }

    const getRatingLabel = () => {
      if (filters.overRating) {
        return `Over ${filters.overRating}★`
      }
      return "Over 4.5★"
    }

    const getScheduleLabel = () => {
      if (filters.scheduledTime) {
        return "Scheduled"
      }
      return "Schedule"
    }

    // Complete reset function that resets all internal state
    const resetAllFilters = () => {
      const resetState = {
        underThirtyMins: false,
        schedule: false,
        scheduledTime: null,
        deals: false,
        pickup: false,
        overRating: null,
        price: null,
        dashPass: false,
      }

      setFilters(resetState)
      setSelectedRating(null)
      setSelectedPrices([])
      setRatingDropdownOpen(false)
      setPriceDropdownOpen(false)

      // Don't call onFilterChange here - this was causing the infinite loop
      // Instead, let the parent component handle its own state

      if (onReset) {
        onReset()
      }
    }

    // Expose the reset function to parent components
    useImperativeHandle(ref, () => ({
      resetFilters: resetAllFilters,
    }))

    return (
      <div className="relative">
        <div className="flex gap-2 py-2 overflow-x-auto">
          <button
            className={`rounded-full h-9 px-4 text-xs font-semibold ${
              filters.underThirtyMins ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
            onClick={() => toggleFilter("underThirtyMins")}
          >
            Under 30 min
          </button>

          {!isGrocery && (
            <button
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.schedule ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={() => setScheduleDropdownOpen(true)}
            >
              {getScheduleLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          )}

          {!isGrocery && (
            <button
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.deals ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={() => toggleFilter("deals")}
            >
              <Tag className="h-4 w-4 mr-1" />
              Deals
            </button>
          )}

          {!isGrocery && (
            <button
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.pickup ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
              onClick={() => toggleFilter("pickup")}
            >
              Pickup
            </button>
          )}

          <div className="relative">
            <button
              ref={ratingButtonRef}
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.overRating ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={(e) => {
                e.stopPropagation()
                setRatingDropdownOpen(!ratingDropdownOpen)
                setPriceDropdownOpen(false)
              }}
            >
              {getRatingLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {ratingDropdownOpen && (
              <div
                ref={ratingDropdownRef}
                className="fixed z-50 mt-2 w-[400px] bg-white rounded-lg shadow-lg p-6"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                <h3 className="text-xl font-bold mb-6">Ratings</h3>
                <div className="mb-6">
                  <div className="font-medium mb-4">{selectedRating ? `Over ${selectedRating}` : "Over 4.5"}</div>
                  <div className="relative flex items-center justify-between mb-2">
                    <div className="absolute w-full h-[2px] bg-gray-300"></div>
                    {[4.5, 4.6, 4.7, 4.8, 4.9].map((rating) => (
                      <button
                        key={rating}
                        className={`relative z-10 w-6 h-6 rounded-full ${
                          selectedRating === rating ? "bg-black" : "bg-gray-300"
                        } flex items-center justify-center`}
                        onClick={() => handleRatingSelect(rating)}
                      >
                        {selectedRating === rating && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>4.5</span>
                    <span>4.6</span>
                    <span>4.7</span>
                    <span>4.8</span>
                    <span>4.9</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="text-gray-900 font-medium" onClick={resetRatingFilter}>
                    Cancel
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                    onClick={applyRatingFilter}
                  >
                    View Results
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              ref={priceButtonRef}
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.price && filters.price.length > 0
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={(e) => {
                e.stopPropagation()
                setPriceDropdownOpen(!priceDropdownOpen)
                setRatingDropdownOpen(false)
              }}
            >
              {getPriceLabel()}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>

            {priceDropdownOpen && (
              <div
                ref={priceDropdownRef}
                className="fixed z-50 mt-2 w-[400px] bg-white rounded-lg shadow-lg p-6"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                <h3 className="text-xl font-bold mb-6">Price</h3>
                <div className="flex gap-3 mb-6">
                  {["$", "$$", "$$$", "$$$$"].map((price) => (
                    <button
                      key={price}
                      className={`px-6 py-2 rounded-full text-sm font-medium ${
                        selectedPrices.includes(price)
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                      onClick={() => handlePriceToggle(price)}
                    >
                      {price}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button className="text-gray-900 font-medium" onClick={resetPriceFilter}>
                    Reset
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                    onClick={applyPriceFilter}
                  >
                    View Results
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isGrocery && (
            <button
              className={`rounded-full h-9 px-4 text-xs font-semibold ${
                filters.dashPass ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } flex items-center gap-1`}
              onClick={() => toggleFilter("dashPass")}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              DashPass
            </button>
          )}
        </div>

        {/* Schedule Dropdown */}
        <ScheduleDropdown
          isOpen={scheduleDropdownOpen}
          onClose={() => setScheduleDropdownOpen(false)}
          onSave={handleScheduleSelect}
        />
      </div>
    )
  },
)

FilterOptions.displayName = "FilterOptions"

export default FilterOptions
