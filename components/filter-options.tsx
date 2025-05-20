"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { ChevronDown, Tag, DollarSign, Check } from "lucide-react"

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

interface ScheduleOption {
  day: string
  date: string
  fullDate: Date
}

interface TimeOption {
  time: string
  selected: boolean
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

    // Schedule state
    const [selectedDay, setSelectedDay] = useState<string>("Today")
    const [selectedTime, setSelectedTime] = useState<string>("")
    const [dateOptions, setDateOptions] = useState<ScheduleOption[]>([])
    const [timeOptions, setTimeOptions] = useState<TimeOption[]>([])

    const ratingButtonRef = useRef<HTMLButtonElement>(null)
    const priceButtonRef = useRef<HTMLButtonElement>(null)
    const scheduleButtonRef = useRef<HTMLButtonElement>(null)
    const ratingDropdownRef = useRef<HTMLDivElement>(null)
    const priceDropdownRef = useRef<HTMLDivElement>(null)
    const scheduleDropdownRef = useRef<HTMLDivElement>(null)

    // Generate date options (Today, Tomorrow, and next 3 days)
    useEffect(() => {
      const today = new Date()
      const options: ScheduleOption[] = []

      // Today
      options.push({
        day: "Today",
        date: `May ${today.getDate()}`,
        fullDate: new Date(today),
      })

      // Tomorrow
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      options.push({
        day: "Tomorrow",
        date: `May ${tomorrow.getDate()}`,
        fullDate: new Date(tomorrow),
      })

      // Next 3 days
      for (let i = 2; i < 5; i++) {
        const nextDay = new Date(today)
        nextDay.setDate(nextDay.getDate() + i)

        const dayName = nextDay.toLocaleDateString("en-US", { weekday: "long" })
        options.push({
          day: dayName,
          date: `May ${nextDay.getDate()}`,
          fullDate: new Date(nextDay),
        })
      }

      setDateOptions(options)
    }, [])

    // Generate time options based on selected day
    useEffect(() => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      const times: TimeOption[] = []
      const isToday = selectedDay === "Today"

      // Start from current hour if today, otherwise start from restaurant opening time (e.g., 11 AM)
      const startHour = isToday ? currentHour : 11
      const endHour = 23 // Restaurant closing time (11 PM)

      for (let hour = startHour; hour <= endHour; hour++) {
        // For today, only show future times
        const minuteIntervals = [0, 10, 20, 30, 40, 50]

        for (const minute of minuteIntervals) {
          if (isToday && hour === currentHour && minute <= currentMinute) {
            continue // Skip past times for today
          }

          const formattedHour = hour % 12 === 0 ? 12 : hour % 12
          const period = hour >= 12 ? "PM" : "AM"
          const formattedMinute = minute.toString().padStart(2, "0")
          const timeString = `${formattedHour}:${formattedMinute} ${period}`

          times.push({
            time: timeString,
            selected: false,
          })
        }
      }

      // If no times available for today, show tomorrow's times
      if (times.length === 0 && isToday) {
        setSelectedDay("Tomorrow")
        return
      }

      // Select the first available time by default
      if (times.length > 0) {
        times[0].selected = true
        setSelectedTime(times[0].time)
      }

      setTimeOptions(times)
    }, [selectedDay])

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

        // For schedule dropdown
        if (
          scheduleDropdownOpen &&
          scheduleDropdownRef.current &&
          !scheduleDropdownRef.current.contains(event.target as Node) &&
          scheduleButtonRef.current &&
          !scheduleButtonRef.current.contains(event.target as Node)
        ) {
          setScheduleDropdownOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [ratingDropdownOpen, priceDropdownOpen, scheduleDropdownOpen])

    const toggleFilter = (filterName: keyof FilterState, value?: any) => {
      const newFilters = {
        ...filters,
        [filterName]: value !== undefined ? value : !filters[filterName],
      }
      setFilters(newFilters)
      if (onFilterChange) {
        onFilterChange(newFilters)
      }

      // Scroll to top when a filter is selected
      window.scrollTo({ top: 0, behavior: "smooth" })
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

    const handleDaySelect = (day: string) => {
      setSelectedDay(day)
    }

    const handleTimeSelect = (time: string) => {
      setSelectedTime(time)
      const updatedTimes = timeOptions.map((option) => ({
        ...option,
        selected: option.time === time,
      }))
      setTimeOptions(updatedTimes)
    }

    // Update the applyScheduleFilter function to match the behavior of other filters
    const applyScheduleFilter = () => {
      const scheduledTime = `${selectedDay}, ${selectedTime}`
      toggleFilter("schedule", true)
      toggleFilter("scheduledTime", scheduledTime)
      setScheduleDropdownOpen(false)
      // Scroll to top when a filter is selected
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Update the resetScheduleFilter function to match the behavior of other filters
    const resetScheduleFilter = () => {
      setSelectedDay("Today")
      if (timeOptions.length > 0) {
        setSelectedTime(timeOptions[0].time)
        const updatedTimes = timeOptions.map((option, index) => ({
          ...option,
          selected: index === 0,
        }))
        setTimeOptions(updatedTimes)
      }
      toggleFilter("schedule", false)
      toggleFilter("scheduledTime", null)
      setScheduleDropdownOpen(false)
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
      setScheduleDropdownOpen(false)

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

    // Ensure dropdowns are visible within viewport
    useEffect(() => {
      const adjustDropdownPosition = () => {
        if (ratingDropdownOpen && ratingDropdownRef.current && ratingButtonRef.current) {
          const buttonRect = ratingButtonRef.current.getBoundingClientRect()
          const dropdownRect = ratingDropdownRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight

          // Check if dropdown would go off the bottom of the viewport
          if (buttonRect.bottom + dropdownRect.height > viewportHeight) {
            // Position above the button if it would go off screen
            ratingDropdownRef.current.style.top = "auto"
            ratingDropdownRef.current.style.bottom = "100%"
            ratingDropdownRef.current.style.marginTop = "0"
            ratingDropdownRef.current.style.marginBottom = "8px"
          }
        }

        if (priceDropdownOpen && priceDropdownRef.current && priceButtonRef.current) {
          const buttonRect = priceButtonRef.current.getBoundingClientRect()
          const dropdownRect = priceDropdownRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight

          // Check if dropdown would go off the bottom of the viewport
          if (buttonRect.bottom + dropdownRect.height > viewportHeight) {
            // Position above the button if it would go off screen
            priceDropdownRef.current.style.top = "auto"
            priceDropdownRef.current.style.bottom = "100%"
            priceDropdownRef.current.style.marginTop = "0"
            priceDropdownRef.current.style.marginBottom = "8px"
          }
        }

        if (scheduleDropdownOpen && scheduleDropdownRef.current && scheduleButtonRef.current) {
          const buttonRect = scheduleButtonRef.current.getBoundingClientRect()
          const dropdownRect = scheduleDropdownRef.current.getBoundingClientRect()
          const viewportHeight = window.innerHeight

          // Check if dropdown would go off the bottom of the viewport
          if (buttonRect.bottom + dropdownRect.height > viewportHeight) {
            // Position above the button if it would go off screen
            scheduleDropdownRef.current.style.top = "auto"
            scheduleDropdownRef.current.style.bottom = "100%"
            scheduleDropdownRef.current.style.marginTop = "0"
            scheduleDropdownRef.current.style.marginBottom = "8px"
          }
        }
      }

      if (ratingDropdownOpen || priceDropdownOpen || scheduleDropdownOpen) {
        adjustDropdownPosition()
        window.addEventListener("resize", adjustDropdownPosition)
      }

      return () => {
        window.removeEventListener("resize", adjustDropdownPosition)
      }
    }, [ratingDropdownOpen, priceDropdownOpen, scheduleDropdownOpen])

    const applyRatingFilter = () => {
      toggleFilter("overRating", selectedRating)
      setRatingDropdownOpen(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const applyPriceFilter = () => {
      toggleFilter("price", selectedPrices)
      setPriceDropdownOpen(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
      <div className="sticky top-16 z-40 bg-white py-2 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          <button
            className={`rounded-full h-9 px-4 text-xs font-semibold ${
              filters.underThirtyMins ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
            onClick={() => toggleFilter("underThirtyMins")}
          >
            Under 30 min
          </button>

          {!isGrocery && (
            <div className="relative">
              <button
                ref={scheduleButtonRef}
                className={`rounded-full h-9 px-4 text-xs font-semibold ${
                  filters.schedule ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } flex items-center gap-1`}
                onClick={(e) => {
                  e.stopPropagation()
                  setScheduleDropdownOpen(!scheduleDropdownOpen)
                  setRatingDropdownOpen(false)
                  setPriceDropdownOpen(false)
                }}
              >
                {getScheduleLabel()}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {scheduleDropdownOpen && (
                <div
                  ref={scheduleDropdownRef}
                  className="fixed z-50 mt-2 w-[400px] bg-white rounded-lg shadow-lg p-6"
                  style={{ left: "50%", transform: "translateX(-50%)" }}
                >
                  <h3 className="text-lg font-bold mb-2">Schedule</h3>
                  <p className="text-sm text-gray-600 mb-4">Schedule your order up to 5 days later</p>

                  {/* Date selection - more compact */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {dateOptions.slice(0, 3).map((option) => (
                      <button
                        key={option.day}
                        className={`border rounded-lg p-2 flex flex-col items-start ${
                          selectedDay === option.day ? "border-black" : "border-gray-200"
                        }`}
                        onClick={() => handleDaySelect(option.day)}
                      >
                        <div className="flex justify-between w-full">
                          <span className="text-sm font-medium">{option.day}</span>
                          {selectedDay === option.day && <Check className="h-4 w-4" />}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{option.date}</div>
                      </button>
                    ))}
                  </div>

                  {/* Time selection - more compact */}
                  <div className="space-y-1 max-h-[150px] overflow-y-auto mb-4 border rounded-lg p-2">
                    {timeOptions.slice(0, 6).map((option, index) => (
                      <div key={index} className="py-1">
                        <button className="flex items-center w-full" onClick={() => handleTimeSelect(option.time)}>
                          <div
                            className={`w-4 h-4 rounded-full border ${
                              option.selected ? "border-black bg-black" : "border-gray-300"
                            } flex items-center justify-center mr-2`}
                          >
                            {option.selected && <div className="w-1 h-1 rounded-full bg-white"></div>}
                          </div>
                          <span className="text-sm">{option.time}</span>
                        </button>
                      </div>
                    ))}
                    {timeOptions.length > 6 && (
                      <button className="text-xs text-gray-500 mt-1 w-full text-center">
                        + {timeOptions.length - 6} more times
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between">
                    <button className="text-gray-900 text-sm font-medium" onClick={resetScheduleFilter}>
                      Reset
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-medium"
                      onClick={applyScheduleFilter}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                setScheduleDropdownOpen(false)
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
                setScheduleDropdownOpen(false)
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
      </div>
    )
  },
)

FilterOptions.displayName = "FilterOptions"

export default FilterOptions
