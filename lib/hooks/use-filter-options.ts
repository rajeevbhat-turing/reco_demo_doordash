"use client"

import { useState, useEffect, useRef } from "react"
import type { FilterState } from "@/components/filter-options"

interface FilterOption {
  id: string
  name: string
  icon: string
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

interface UseFilterOptionsProps {
  isGrocery?: boolean
  onFilterChange?: (filters: FilterState) => void
  onReset?: () => void
  externalFilters?: FilterState
  filterData?: FilterOption[]
  showPriceFilter?: boolean
  hideCuisineFilter?: boolean
  hideDietaryFilter?: boolean
}

interface UseFilterOptionsReturn {
  // State
  filters: FilterState
  ratingDropdownOpen: boolean
  priceDropdownOpen: boolean
  locationDropdownOpen: boolean
  cuisineDropdownOpen: boolean
  dietaryDropdownOpen: boolean
  selectedRating: number | null
  selectedPrices: string[]
  selectedLocation: string | null
  selectedCuisines: string[]
  selectedDietaryPreferences: string[]
  visibleTimeOptions: TimeOption[]
  selectedDay: string
  selectedTime: string
  dateOptions: ScheduleOption[]
  timeOptions: TimeOption[]
  
  // Refs
  ratingButtonRef: React.RefObject<HTMLButtonElement | null>
  priceButtonRef: React.RefObject<HTMLButtonElement | null>
  locationButtonRef: React.RefObject<HTMLButtonElement | null>
  cuisineButtonRef: React.RefObject<HTMLButtonElement | null>
  dietaryButtonRef: React.RefObject<HTMLButtonElement | null>
  ratingDropdownRef: React.RefObject<HTMLDivElement | null>
  priceDropdownRef: React.RefObject<HTMLDivElement | null>
  locationDropdownRef: React.RefObject<HTMLDivElement | null>
  cuisineDropdownRef: React.RefObject<HTMLDivElement | null>
  dietaryDropdownRef: React.RefObject<HTMLDivElement | null>
  
  // Positioned refs (callback refs that position immediately on mount)
  ratingDropdownPositionedRef: (element: HTMLDivElement | null) => void
  priceDropdownPositionedRef: (element: HTMLDivElement | null) => void
  locationDropdownPositionedRef: (element: HTMLDivElement | null) => void
  cuisineDropdownPositionedRef: (element: HTMLDivElement | null) => void
  dietaryDropdownPositionedRef: (element: HTMLDivElement | null) => void
  
  // Handlers
  toggleFilter: (filterName: keyof FilterState, value?: any) => void
  handleRatingSelect: (rating: number) => void
  expandTimeOptions: () => void
  handlePriceToggle: (price: string) => void
  handleDaySelect: (day: string) => void
  handleTimeSelect: (time: string) => void
  resetRatingFilter: () => void
  resetPriceFilter: () => void
  applyPriceFilter: () => void
  handleLocationSelect: (location: string) => void
  resetLocationFilter: () => void
  applyLocationFilter: () => void
  handleCuisineToggle: (cuisine: string) => void
  resetCuisineFilter: () => void
  applyCuisineFilter: () => void
  handleDietaryToggle: (dietary: string) => void
  resetDietaryFilter: () => void
  applyDietaryFilter: () => void
  applyRatingFilter: () => void
  resetAllFilters: () => void
  
  // Setters
  setRatingDropdownOpen: (open: boolean) => void
  setPriceDropdownOpen: (open: boolean) => void
  setLocationDropdownOpen: (open: boolean) => void
  setCuisineDropdownOpen: (open: boolean) => void
  setDietaryDropdownOpen: (open: boolean) => void
  
  // Labels
  getPriceLabel: () => string
  getLocationLabel: () => string
  getCuisineLabel: () => string
  getDietaryLabel: () => string
  getRatingLabel: () => string
}

export function useFilterOptions({
  isGrocery = false,
  onFilterChange,
  onReset,
  externalFilters,
  filterData = [],
  showPriceFilter = true,
  hideCuisineFilter = false,
  hideDietaryFilter = false,
}: UseFilterOptionsProps): UseFilterOptionsReturn {
  const [filters, setFilters] = useState<FilterState>({
    underThirtyMins: false,
    deals: false,
    overRating: null,
    price: null,
    minPrice: null,
    maxPrice: null,
    dashPass: false,
    location: null,
    cuisine: null,
    dietaryPreferences: null,
  })

  // Dropdown state declarations (must be before useEffects that use them)
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false)
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false)
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [cuisineDropdownOpen, setCuisineDropdownOpen] = useState(false)
  const [dietaryDropdownOpen, setDietaryDropdownOpen] = useState(false)

  // Update internal state when external filters change
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters)
      setSelectedRating(externalFilters.overRating)
      setSelectedPrices(externalFilters.price || [])
      setSelectedLocation(externalFilters.location || null)
      setSelectedCuisines(externalFilters.cuisine || [])
      setSelectedDietaryPreferences(externalFilters.dietaryPreferences || [])
    }
  }, [externalFilters])
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [isTimeOptionsExpanded, setIsTimeOptionsExpanded] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>([])

  const [visibleTimeOptions, setVisibleTimeOptions] = useState<TimeOption[]>([])

  // Schedule state - REMOVED
  const [selectedDay, setSelectedDay] = useState<string>("Today")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [dateOptions, setDateOptions] = useState<ScheduleOption[]>([])
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([])

  const ratingButtonRef = useRef<HTMLButtonElement>(null)
  const priceButtonRef = useRef<HTMLButtonElement>(null)
  const locationButtonRef = useRef<HTMLButtonElement>(null)
  const cuisineButtonRef = useRef<HTMLButtonElement>(null)
  const dietaryButtonRef = useRef<HTMLButtonElement>(null)

  const ratingDropdownRef = useRef<HTMLDivElement>(null)
  const priceDropdownRef = useRef<HTMLDivElement>(null)
  const locationDropdownRef = useRef<HTMLDivElement>(null)
  const cuisineDropdownRef = useRef<HTMLDivElement>(null)
  const dietaryDropdownRef = useRef<HTMLDivElement>(null)

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
    setVisibleTimeOptions(times.slice(0, 6))
  }, [selectedDay])

  // Auto-select rating 1 when dropdown opens (if no filter is currently applied)
  useEffect(() => {
    if (ratingDropdownOpen) {
      // When dropdown opens, if no filter is applied, pre-select rating 1 for display
      if (filters.overRating === null) {
        setSelectedRating(1)
      } else {
        // If a filter is already applied, show that rating
        setSelectedRating(filters.overRating)
      }
    } else {
      // When dropdown closes, reset selectedRating to match the actual filter state
      // This ensures that if user closes without applying, the preview selection is cleared
      setSelectedRating(filters.overRating)
    }
  }, [ratingDropdownOpen, filters.overRating])

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

      // For location dropdown
      if (
        locationDropdownOpen &&
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node) &&
        locationButtonRef.current &&
        !locationButtonRef.current.contains(event.target as Node)
      ) {
        setLocationDropdownOpen(false)
      }

      // For cuisine dropdown
      if (
        cuisineDropdownOpen &&
        cuisineDropdownRef.current &&
        !cuisineDropdownRef.current.contains(event.target as Node) &&
        cuisineButtonRef.current &&
        !cuisineButtonRef.current.contains(event.target as Node)
      ) {
        setCuisineDropdownOpen(false)
      }

      // For dietary dropdown
      if (
        dietaryDropdownOpen &&
        dietaryDropdownRef.current &&
        !dietaryDropdownRef.current.contains(event.target as Node) &&
        dietaryButtonRef.current &&
        !dietaryButtonRef.current.contains(event.target as Node)
      ) {
        setDietaryDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ratingDropdownOpen, priceDropdownOpen, locationDropdownOpen, cuisineDropdownOpen, dietaryDropdownOpen])

  // Close dropdowns when user scrolls (but only if scrolling outside the dropdown)
  useEffect(() => {
    const isElementInsideAnyDropdown = (element: HTMLElement | null): boolean => {
      if (!element) return false

      return !!(
        ratingDropdownRef.current?.contains(element) ||
        priceDropdownRef.current?.contains(element) ||
        locationDropdownRef.current?.contains(element) ||
        cuisineDropdownRef.current?.contains(element) ||
        dietaryDropdownRef.current?.contains(element)
      )
    }

    const closeAllDropdowns = () => {
      // Close all dropdowns when user scrolls
      if (ratingDropdownOpen) {
        setRatingDropdownOpen(false)
      }
      if (priceDropdownOpen) {
        setPriceDropdownOpen(false)
      }
      if (locationDropdownOpen) {
        setLocationDropdownOpen(false)
      }
      if (cuisineDropdownOpen) {
        setCuisineDropdownOpen(false)
      }
      if (dietaryDropdownOpen) {
        setDietaryDropdownOpen(false)
      }
    }

    // Listen to scroll events - only close if scrolling main page (not inside dropdown)
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document | Window

      // If scrolling window or document, it's page scroll - close dropdowns
      if (target === document || target === document.documentElement || target === window || e.target === document || e.target === window) {
        closeAllDropdowns()
        return
      }

      // If scrolling inside a dropdown, don't close (only check for HTMLElement)
      if (target instanceof HTMLElement && isElementInsideAnyDropdown(target)) {
        return
      }

      // FIX: Check if this is horizontal scrolling (carousel/banner) vs vertical scrolling (page)
      // Only close dropdowns on vertical page scrolling, not horizontal carousel scrolling
      if (target instanceof HTMLElement) {
        // Check if the element has overflow-x (horizontal scroll) - likely a carousel/banner
        const style = window.getComputedStyle(target)
        const isHorizontalScroll = style.overflowX === 'auto' || style.overflowX === 'scroll'
        
        // If it's a horizontal scroll container, don't close dropdowns
        if (isHorizontalScroll) {
          return
        }
        
        // Check if scrolling is within a carousel/banner container by checking for common classes/attributes
        let currentElement: HTMLElement | null = target
        while (currentElement && currentElement !== document.body) {
          // Check for common carousel/banner class names or data attributes
          if (
            currentElement.classList.contains('promo-card') ||
            currentElement.classList.contains('carousel') ||
            currentElement.classList.contains('banner') ||
            currentElement.closest('.promo-card, .carousel, .banner')
          ) {
            // This is a carousel/banner scroll - don't close dropdowns
            return
          }
          currentElement = currentElement.parentElement
        }
      }

      // Otherwise, it's page scroll - close dropdowns
      closeAllDropdowns()
    }

    // Listen to wheel events (mouse wheel scrolling)
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement

      // Check all dropdown refs to see if the wheel event is inside any dropdown
      const activeDropdowns = [
        { ref: ratingDropdownRef, isOpen: ratingDropdownOpen },
        { ref: priceDropdownRef, isOpen: priceDropdownOpen },
        { ref: locationDropdownRef, isOpen: locationDropdownOpen },
        { ref: cuisineDropdownRef, isOpen: cuisineDropdownOpen },
        { ref: dietaryDropdownRef, isOpen: dietaryDropdownOpen },
      ]

      // Check if wheel is inside any open dropdown
      const isInsideAnyDropdown = activeDropdowns.some(
        ({ ref, isOpen }) => isOpen && ref.current && ref.current.contains(target)
      )

      if (isInsideAnyDropdown) {
        // User is scrolling inside dropdown - don't close
        return
      }

      // Check if we're currently over a scrollable dropdown element
      // Walk up the DOM tree to find if we're inside a dropdown
      let currentElement: HTMLElement | null = target
      while (currentElement) {
        if (isElementInsideAnyDropdown(currentElement)) {
          // Inside dropdown - don't close
          return
        }
        currentElement = currentElement.parentElement
      }

      // Wheel on main page - close dropdowns
      closeAllDropdowns()
    }

    // Listen to touchmove events (touch scrolling on mobile)
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement

      // Walk up DOM tree to check if inside dropdown
      let currentElement: HTMLElement | null = target
      while (currentElement) {
        if (isElementInsideAnyDropdown(currentElement)) {
          return
        }
        currentElement = currentElement.parentElement
      }

      // Touch on main page - close dropdowns
      closeAllDropdowns()
    }

    // Add scroll listeners directly to dropdown elements to prevent closing when scrolling inside
    const handleDropdownScroll = (e: Event) => {
      // Stop the scroll event from propagating - this prevents page scroll handler from closing dropdown
      e.stopPropagation()
    }

    // Add scroll listeners to open dropdowns
    if (cuisineDropdownOpen && cuisineDropdownRef.current) {
      cuisineDropdownRef.current.addEventListener("scroll", handleDropdownScroll, true)
    }
    if (dietaryDropdownOpen && dietaryDropdownRef.current) {
      dietaryDropdownRef.current.addEventListener("scroll", handleDropdownScroll, true)
    }
    if (ratingDropdownOpen && ratingDropdownRef.current) {
      ratingDropdownRef.current.addEventListener("scroll", handleDropdownScroll, true)
    }
    if (priceDropdownOpen && priceDropdownRef.current) {
      priceDropdownRef.current.addEventListener("scroll", handleDropdownScroll, true)
    }
    if (locationDropdownOpen && locationDropdownRef.current) {
      locationDropdownRef.current.addEventListener("scroll", handleDropdownScroll, true)
    }

    // Add event listeners to catch all types of scrolling
    // Use capture phase to catch early, but we need to check targets carefully
    window.addEventListener("scroll", handleScroll, true)
    document.addEventListener("scroll", handleScroll, true)
    document.addEventListener("wheel", handleWheel, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })

    return () => {
      // Remove dropdown scroll listeners
      if (cuisineDropdownRef.current) {
        cuisineDropdownRef.current.removeEventListener("scroll", handleDropdownScroll, true)
      }
      if (dietaryDropdownRef.current) {
        dietaryDropdownRef.current.removeEventListener("scroll", handleDropdownScroll, true)
      }
      if (ratingDropdownRef.current) {
        ratingDropdownRef.current.removeEventListener("scroll", handleDropdownScroll, true)
      }
      if (priceDropdownRef.current) {
        priceDropdownRef.current.removeEventListener("scroll", handleDropdownScroll, true)
      }
      if (locationDropdownRef.current) {
        locationDropdownRef.current.removeEventListener("scroll", handleDropdownScroll, true)
      }

      window.removeEventListener("scroll", handleScroll, true)
      document.removeEventListener("scroll", handleScroll, true)
      document.removeEventListener("wheel", handleWheel, { passive: true } as any)
      document.removeEventListener("touchmove", handleTouchMove, { passive: true } as any)
    }
  }, [ratingDropdownOpen, priceDropdownOpen, locationDropdownOpen, cuisineDropdownOpen, dietaryDropdownOpen])

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

  const expandTimeOptions = () => {
    setIsTimeOptionsExpanded(true)
    setVisibleTimeOptions(timeOptions)
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

  const applyPriceFilter = () => {
    // Apply the selected price ranges ($, $$, $$$, $$$$)
    toggleFilter("price", selectedPrices.length > 0 ? selectedPrices : null)
    setPriceDropdownOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
  }

  const resetLocationFilter = () => {
    setSelectedLocation(null)
    toggleFilter("location", null)
    setLocationDropdownOpen(false)
  }

  const applyLocationFilter = () => {
    toggleFilter("location", selectedLocation)
    setLocationDropdownOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCuisineToggle = (cuisine: string) => {
    let newCuisines: string[]
    if (selectedCuisines.includes(cuisine)) {
      newCuisines = selectedCuisines.filter((c) => c !== cuisine)
    } else {
      newCuisines = [...selectedCuisines, cuisine]
    }
    setSelectedCuisines(newCuisines)
  }

  const resetCuisineFilter = () => {
    setSelectedCuisines([])
    toggleFilter("cuisine", null)
    setCuisineDropdownOpen(false)
  }

  const applyCuisineFilter = () => {
    toggleFilter("cuisine", selectedCuisines.length > 0 ? selectedCuisines : null)
    setCuisineDropdownOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDietaryToggle = (dietary: string) => {
    let newDietary: string[]
    if (selectedDietaryPreferences.includes(dietary)) {
      newDietary = selectedDietaryPreferences.filter((d) => d !== dietary)
    } else {
      newDietary = [...selectedDietaryPreferences, dietary]
    }
    setSelectedDietaryPreferences(newDietary)
  }

  const resetDietaryFilter = () => {
    setSelectedDietaryPreferences([])
    toggleFilter("dietaryPreferences", null)
    setDietaryDropdownOpen(false)
  }

  const applyDietaryFilter = () => {
    toggleFilter("dietaryPreferences", selectedDietaryPreferences.length > 0 ? selectedDietaryPreferences : null)
    setDietaryDropdownOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getPriceLabel = () => {
    if (filters.price && filters.price.length > 0) {
      if (filters.price.length === 1) return filters.price[0]
      if (filters.price.length === 2) return `${filters.price[0]}, ${filters.price[1]}`
      return `${filters.price[0]}, ${filters.price[1]}...`
    }
    return "Price"
  }

  const getLocationLabel = () => {
    if (filters.location) {
      const locationMap: Record<string, string> = {
        "under-1mi": "Under 1 mi",
        "under-3mi": "Under 3 mi",
        "under-5mi": "Under 5 mi",
      }
      return locationMap[filters.location] || "Location"
    }
    return "Location"
  }

  const getCuisineLabel = () => {
    if (filters.cuisine && filters.cuisine.length > 0) {
      if (filters.cuisine.length === 1) return filters.cuisine[0]
      if (filters.cuisine.length === 2) return `${filters.cuisine[0]}, ${filters.cuisine[1]}`
      return `${filters.cuisine[0]}, ${filters.cuisine[1]}...`
    }
    return "Cuisine"
  }

  const getDietaryLabel = () => {
    if (filters.dietaryPreferences && filters.dietaryPreferences.length > 0) {
      if (filters.dietaryPreferences.length === 1) return filters.dietaryPreferences[0]
      return `${filters.dietaryPreferences.length} selected`
    }
    return "Dietary"
  }

  const getRatingLabel = () => {
    if (filters.overRating) {
      return `Over ${filters.overRating}★`
    }
    return "Over 1★"
  }

  // Complete reset function that resets all internal state
  const resetAllFilters = () => {
    const resetState = {
      underThirtyMins: false,
      deals: false,
      overRating: null,
      price: null, // DEPRECATED
      minPrice: null,
      maxPrice: null,
      dashPass: false,
      location: null,
      cuisine: null,
      dietaryPreferences: null,
    }

    setFilters(resetState)
    setSelectedRating(null)
    setSelectedPrices([])
    setSelectedLocation(null)
    setSelectedCuisines([])
    setSelectedDietaryPreferences([])
    setRatingDropdownOpen(false)
    setPriceDropdownOpen(false)
    setLocationDropdownOpen(false)
    setCuisineDropdownOpen(false)
    setDietaryDropdownOpen(false)

    // Don't call onFilterChange here - this was causing the infinite loop
    // Instead, let the parent component handle its own state

    if (onReset) {
      onReset()
    }
  }

  // Position calculation function - can be called immediately or on scroll/resize
  const adjustDropdownPosition = (
    buttonRef: React.RefObject<HTMLButtonElement | null>,
    dropdownRef: React.RefObject<HTMLDivElement | null>
  ) => {
    if (!buttonRef.current || !dropdownRef.current) return

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const dropdownWidth = 400 // w-[400px]
    const spacing = 8 // mt-2 = 8px

    // Calculate horizontal position: center the dropdown relative to the button
    let left = buttonRect.left + (buttonRect.width / 2) - (dropdownWidth / 2)
    
    // Ensure dropdown doesn't go off the left edge
    if (left < 8) {
      left = 8
    }
    
    // Ensure dropdown doesn't go off the right edge
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8
    }

    // Calculate vertical position: ALWAYS position below the button to prevent overlap with filter bar
    // Minimum spacing ensures dropdown doesn't touch the button
    const minSpacing = 8 // Minimum spacing between button and dropdown
    let top = buttonRect.bottom + minSpacing
    
    // Get actual dropdown height
    let estimatedDropdownHeight = dropdownRef.current.offsetHeight || 0
    
    // If height is 0 (not yet rendered), check CSS max-height
    if (estimatedDropdownHeight === 0) {
      const maxHeight = window.getComputedStyle(dropdownRef.current).maxHeight
      if (maxHeight && maxHeight !== 'none') {
        estimatedDropdownHeight = parseInt(maxHeight, 10)
      } else {
        // Fallback: estimate based on typical content
        estimatedDropdownHeight = 500 // Default max height for scrollable dropdowns
      }
    }
    
    // Ensure dropdown doesn't go off the bottom of the viewport
    // If it would, constrain the height to fit (CSS max-height will handle scrolling)
    const maxBottomPosition = viewportHeight - 8
    if (top + estimatedDropdownHeight > maxBottomPosition) {
      // Keep dropdown below button but constrain to viewport
      // The max-h CSS class will enable scrolling inside the dropdown
      // Don't position above button - always keep it below to avoid overlapping filter bar
    }

    // Apply calculated positions
    dropdownRef.current.style.position = "fixed"
    dropdownRef.current.style.top = `${top}px`
    dropdownRef.current.style.left = `${left}px`
    dropdownRef.current.style.transform = "none" // Remove center transform
    dropdownRef.current.style.marginTop = "0"
    dropdownRef.current.style.marginBottom = "0"
  }

  // Create callback refs that position dropdowns immediately on mount
  const createPositioningRef = (
    buttonRef: React.RefObject<HTMLButtonElement | null>,
    dropdownRef: React.RefObject<HTMLDivElement | null>
  ) => {
    return (element: HTMLDivElement | null) => {
      // Set the ref
      if (dropdownRef) {
        (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = element
      }
      
      // Position immediately when element is mounted
      if (element && buttonRef.current) {
        adjustDropdownPosition(buttonRef, { current: element } as React.RefObject<HTMLDivElement | null>)
      }
    }
  }

  // Create positioned refs for each dropdown
  const ratingDropdownPositionedRef = createPositioningRef(ratingButtonRef, ratingDropdownRef)
  const priceDropdownPositionedRef = createPositioningRef(priceButtonRef, priceDropdownRef)
  const locationDropdownPositionedRef = createPositioningRef(locationButtonRef, locationDropdownRef)
  const cuisineDropdownPositionedRef = createPositioningRef(cuisineButtonRef, cuisineDropdownRef)
  const dietaryDropdownPositionedRef = createPositioningRef(dietaryButtonRef, dietaryDropdownRef)

  // Update positions on scroll and resize (not on initial open)
  useEffect(() => {
    const adjustAllPositions = () => {
      if (ratingDropdownOpen && ratingButtonRef.current && ratingDropdownRef.current) {
        adjustDropdownPosition(ratingButtonRef, ratingDropdownRef)
      }
      if (priceDropdownOpen && priceButtonRef.current && priceDropdownRef.current) {
        adjustDropdownPosition(priceButtonRef, priceDropdownRef)
      }
      if (locationDropdownOpen && locationButtonRef.current && locationDropdownRef.current) {
        adjustDropdownPosition(locationButtonRef, locationDropdownRef)
      }
      if (cuisineDropdownOpen && cuisineButtonRef.current && cuisineDropdownRef.current) {
        adjustDropdownPosition(cuisineButtonRef, cuisineDropdownRef)
      }
      if (dietaryDropdownOpen && dietaryButtonRef.current && dietaryDropdownRef.current) {
        adjustDropdownPosition(dietaryButtonRef, dietaryDropdownRef)
      }
    }

    // Only update positions on scroll and resize, not on initial open
    const handleUpdatePositions = () => {
      adjustAllPositions()
    }

    // Listen for scroll and resize events
    window.addEventListener("scroll", handleUpdatePositions, true) // Use capture phase
    window.addEventListener("resize", handleUpdatePositions)

    return () => {
      window.removeEventListener("scroll", handleUpdatePositions, true)
      window.removeEventListener("resize", handleUpdatePositions)
    }
  }, [
    ratingDropdownOpen,
    priceDropdownOpen,
    locationDropdownOpen,
    cuisineDropdownOpen,
    dietaryDropdownOpen,
    ratingButtonRef,
    ratingDropdownRef,
    priceButtonRef,
    priceDropdownRef,
    locationButtonRef,
    locationDropdownRef,
    cuisineButtonRef,
    cuisineDropdownRef,
    dietaryButtonRef,
    dietaryDropdownRef,
  ])

  const applyRatingFilter = () => {
    toggleFilter("overRating", selectedRating)
    setRatingDropdownOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return {
    // State
    filters,
    ratingDropdownOpen,
    priceDropdownOpen,
    locationDropdownOpen,
    cuisineDropdownOpen,
    dietaryDropdownOpen,
    selectedRating,
    selectedPrices,
    selectedLocation,
    selectedCuisines,
    selectedDietaryPreferences,
    visibleTimeOptions,
    selectedDay,
    selectedTime,
    dateOptions,
    timeOptions,

    // Refs
    ratingButtonRef,
    priceButtonRef,
    locationButtonRef,
    cuisineButtonRef,
    dietaryButtonRef,
    ratingDropdownRef,
    priceDropdownRef,
    locationDropdownRef,
    cuisineDropdownRef,
    dietaryDropdownRef,
    
    // Positioned refs (callback refs that position immediately on mount)
    ratingDropdownPositionedRef,
    priceDropdownPositionedRef,
    locationDropdownPositionedRef,
    cuisineDropdownPositionedRef,
    dietaryDropdownPositionedRef,

    // Handlers
    toggleFilter,
    handleRatingSelect,
    expandTimeOptions,
    handlePriceToggle,
    handleDaySelect,
    handleTimeSelect,
    resetRatingFilter,
    resetPriceFilter,
    applyPriceFilter,
    handleLocationSelect,
    resetLocationFilter,
    applyLocationFilter,
    handleCuisineToggle,
    resetCuisineFilter,
    applyCuisineFilter,
    handleDietaryToggle,
    resetDietaryFilter,
    applyDietaryFilter,
    applyRatingFilter,
    resetAllFilters,

    // Setters
    setRatingDropdownOpen,
    setPriceDropdownOpen,
    setLocationDropdownOpen,
    setCuisineDropdownOpen,
    setDietaryDropdownOpen,

    // Labels
    getPriceLabel,
    getLocationLabel,
    getCuisineLabel,
    getDietaryLabel,
    getRatingLabel,
  }
}

