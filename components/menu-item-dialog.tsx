"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ThumbsUp, ChevronLeft, ChevronRight, ChevronRightIcon } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useReplaceCart } from "@/context/replace-cart-context"

// Types for the menu item options
interface MenuItemOption {
  id: string
  title: string
  subtitle: string
  details: string[]
  price: string
  popular?: boolean
  popularity?: string
}

interface CustomizationOption {
  id: string
  name: string
  calories?: string
  price?: number // Changed to number for easier calculation
  selected?: boolean
}

interface CustomizationSection {
  id: string
  title: string
  type: "radio" | "checkbox"
  required: boolean
  maxSelections?: number
  options: CustomizationOption[]
  description?: string
}

interface MenuItemDialogProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    restaurantId: string
    name: string
    price: string
    image: string
    description?: string
    rating?: number
    ratingCount?: number
    calories?: string
  } | null
}

export default function MenuItemDialog({ isOpen, onClose, item }: MenuItemDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({})
  const [customizationPrices, setCustomizationPrices] = useState<Record<string, number>>({})
  const dialogRef = useRef<HTMLDivElement>(null)
  const { addItemWithConflictCheck } = useReplaceCart()

  // Track required selections
  const [requiredSelectionsCount, setRequiredSelectionsCount] = useState(0)
  const [requiredSectionsMet, setRequiredSectionsMet] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose()
        }
      }

      document.addEventListener("keydown", handleEscapeKey)

      return () => {
        document.body.style.overflow = "auto"
        document.removeEventListener("keydown", handleEscapeKey)
      }
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  useEffect(() => {
    // Initialize selected customizations
    if (isOpen && item) {
      const initialCustomizations: Record<string, string[]> = {}
      const initialPrices: Record<string, number> = {}
      
      customizationSections.forEach((section) => {
        if (section.required && section.type === "radio") {
          // Pre-select the first option for required radio sections
          const defaultOption = section.options[0]?.id
          if (defaultOption) {
            initialCustomizations[section.id] = [defaultOption]
            // Store the price if it exists
            const option = section.options.find(opt => opt.id === defaultOption)
            if (option?.price) {
              initialPrices[defaultOption] = option.price
            }
          }
        } else {
          initialCustomizations[section.id] = []
        }
      })
      
      setSelectedCustomizations(initialCustomizations)
      setCustomizationPrices(initialPrices)

      // Count required sections
      const requiredCount = customizationSections.filter((section) => section.required).length
      setRequiredSelectionsCount(requiredCount)

      // Initialize required sections tracking
      const initialRequiredSections: Record<string, boolean> = {}
      customizationSections.forEach((section) => {
        if (section.required) {
          initialRequiredSections[section.id] = section.type === "radio" ? true : false
        }
      })
      setRequiredSectionsMet(initialRequiredSections)
    }
  }, [isOpen, item])

  if (!isOpen || !item) return null

  // Parse base price (remove currency symbol and convert to number)
  const basePrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0

  // Calculate total price including customizations
  const calculateTotalPrice = () => {
    let total = basePrice
    
    // Add selected recommended option price if applicable
    if (selectedOption) {
      const option = recommendedOptions.find(opt => opt.id === selectedOption)
      if (option) {
        const optionPrice = parseFloat(option.price.replace(/[^0-9.]/g, '')) || 0
        total = optionPrice // Use the option price as the new base
      }
    }
  
    // Add customization prices
    Object.values(customizationPrices).forEach(price => {
      total += price
    })
    
    return total.toFixed(2)
  }

  const recommendedOptions: MenuItemOption[] = [
    {
      id: "1",
      title: "#1 · Popular Choice",
      subtitle: "Regular portion with standard selections",
      details: ["Regular size", "Standard selections"],
      price: `$${basePrice.toFixed(2)}`,
      popular: true,
      popularity: "10+",
    },
    {
      id: "2",
      title: "#2 · Value Combo",
      subtitle: "Large size with beverage",
      details: ["Large size", "Includes beverage"],
      price: `$${(basePrice + 2.5).toFixed(2)}`,
    },
  ];

  const customizationSections: CustomizationSection[] = [
    {
      id: "size",
      title: "Choose Size",
      type: "radio",
      required: true,
      options: [
        { id: "small", name: "Small", price: 0 },
        { id: "medium", name: "Medium", price: 1.0 },
        { id: "large", name: "Large", price: 2.0 },
      ],
      description: "• Select 1",
    },
    {
      id: "add-ons",
      title: "Optional Add-ons",
      type: "checkbox",
      required: false,
      maxSelections: 3,
      options: [
        { id: "extra-portion", name: "Extra Portion", price: 1.5 },
        { id: "flavor-boost", name: "Flavor Boost", price: 0.5 },
        { id: "garnish", name: "Garnish", price: 0.5 },
        { id: "custom-topping", name: "Custom Topping", price: 1.0 },
      ],
      description: "(Optional) • Select up to 3",
    },
    {
      id: "sides",
      title: "Side Items",
      type: "checkbox",
      required: false,
      maxSelections: 2,
      options: [
        { id: "snack", name: "Snack Item", price: 2.5 },
        { id: "light-salad", name: "Light Salad", price: 3.0 },
        { id: "fruit", name: "Fruit Portion", price: 3.0 },
        { id: "bread-roll", name: "Bread Roll", price: 2.0 },
      ],
      description: "(Optional) • Select up to 2",
    },
    {
      id: "drinks",
      title: "Add a Beverage",
      type: "radio",
      required: false,
      options: [
        { id: "none", name: "No Drink", price: 0 },
        { id: "soda", name: "Soda", price: 2.0 },
        { id: "tea", name: "Tea", price: 2.0 },
        { id: "coffee", name: "Coffee", price: 2.5 },
        { id: "water", name: "Water", price: 1.5 },
        { id: "juice", name: "Juice", price: 3.0 },
      ],
      description: "(Optional) • Select 1",
    },
    {
      id: "preferences",
      title: "Special Preferences",
      type: "checkbox",
      required: false,
      options: [
        { id: "low-sugar", name: "Low Sugar", price: 0 },
        { id: "gluten-free", name: "Gluten-Free", price: 1.0 },
        { id: "vegan", name: "Vegan Option", price: 0 },
      ],
      description: "(Optional)",
    },
  ];
  

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId === selectedOption ? null : optionId)
  }

  const handleCustomizationSelect = (sectionId: string, optionId: string) => {
    const section = customizationSections.find((s) => s.id === sectionId)
  
    if (!section) return
  
    setSelectedCustomizations((prev) => {
      const updatedSelections = { ...prev }
      const currentSelections = updatedSelections[sectionId] || []
  
      if (section.type === "radio") {
        // Radio button logic remains the same
        updatedSelections[sectionId] = [optionId]
        
        // Remove all prices from this section first
        setCustomizationPrices((prevPrices) => {
          const updatedPrices = { ...prevPrices }
          section.options.forEach(opt => {
            if (updatedPrices[opt.id]) {
              delete updatedPrices[opt.id]
            }
          })
  
          // Add the new price if it exists
          const selectedOption = section.options.find(opt => opt.id === optionId)
          if (selectedOption?.price !== undefined) {
            updatedPrices[optionId] = selectedOption.price
          }
          return updatedPrices
        })
  
        // Mark this required section as met
        if (section.required) {
          setRequiredSectionsMet((prev) => ({
            ...prev,
            [sectionId]: true,
          }))
        }
      } else {
        // Checkbox logic - simplified
        if (currentSelections.includes(optionId)) {
          // Deselect
          updatedSelections[sectionId] = currentSelections.filter(id => id !== optionId)
        } else {
          // Check max selections
          if (section.maxSelections && currentSelections.length >= section.maxSelections) {
            return prev // Don't make any changes if max selections reached
          }
          // Select
          updatedSelections[sectionId] = [...currentSelections, optionId]
        }
  
        // Update prices
        setCustomizationPrices((prevPrices) => {
          const updatedPrices = { ...prevPrices }
          const selectedOption = section.options.find(opt => opt.id === optionId)
          
          if (currentSelections.includes(optionId)) {
            // Remove price if deselected
            delete updatedPrices[optionId]
          } else if (selectedOption?.price !== undefined) {
            // Add price if selected
            updatedPrices[optionId] = selectedOption.price
          }
          return updatedPrices
        })
  
        // For required checkbox sections
        if (section.required) {
          setRequiredSectionsMet((prev) => ({
            ...prev,
            [sectionId]: updatedSelections[sectionId].length > 0,
          }))
        }
      }
  
      return updatedSelections
    })
  }

  const isOptionSelected = (sectionId: string, optionId: string) => {
    return selectedCustomizations[sectionId]?.includes(optionId) || false
  }

  const allRequiredSectionsMet = Object.values(requiredSectionsMet).every((met) => met)

  const handleAddToCart = () => {
    if (!item || !allRequiredSectionsMet) return
  
    // Get selected customizations for display
    const customizationText: string[] = []
    let totalPrice = basePrice
  
    // Include selected recommended option if any
    if (selectedOption) {
      const option = recommendedOptions.find(opt => opt.id === selectedOption)
      if (option) {
        customizationText.push(option.title)
        totalPrice = parseFloat(option.price.replace(/[^0-9.]/g, '')) || basePrice
      }
    }
  
    // Add all selected customizations
    customizationSections.forEach(section => {
      const selectedIds = selectedCustomizations[section.id] || []
      selectedIds.forEach(id => {
        const option = section.options.find(opt => opt.id === id)
        if (option) {
          customizationText.push(option.name)
          if (option.price) {
            totalPrice += option.price
          }
        }
      })
    })
  
    // Add the item to cart with customizations using conflict detection
    const cartItem = {
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      restaurantId: item.restaurantId,
      itemName: item.name, // Use itemName instead of name
      price: totalPrice.toFixed(2),
      image: item.image,
      customizations: customizationText.join(" · "),
    }
    
    addItemWithConflictCheck(cartItem, "restaurant")
  
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={dialogRef} className="relative bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-auto">
        <button onClick={onClose} className="absolute top-4 left-4 z-10 p-1" aria-label="Close dialog">
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 pt-14 pb-20">
          <h2 className="text-2xl font-bold">{item.name}</h2>
          {item.rating && item.ratingCount && (
            <div className="flex items-center mt-1 mb-2">
              <ThumbsUp className="h-5 w-5 mr-1 text-gray-700" />
              <span className="text-gray-700">
                {Math.round(item.rating * 100)}% ({item.ratingCount})
              </span>
            </div>
          )}
          {item.calories && <div className="text-gray-500">({item.calories})</div>}

          <div className="mt-4 relative">
            <div className="w-full h-64 relative rounded-lg overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg?height=256&width=400&query=burger+meal"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Recommended Options */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your recommended options</h3>
              <div className="flex space-x-2">
                <button className="p-1 rounded-full border border-gray-200">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-1 rounded-full border border-gray-200">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {recommendedOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer ${selectedOption === option.id ? "border-red-500" : "border-gray-200"
                    }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{option.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{option.subtitle}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{option.price}</span>
                      <div
                        className={`ml-3 w-5 h-5 rounded-full border ${selectedOption === option.id ? "border-red-500 bg-red-500" : "border-gray-300"
                          }`}
                      >
                        {selectedOption === option.id && (
                          <div className="flex items-center justify-center h-full">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Sections */}
          {customizationSections.map((section) => (
            <div key={section.id} className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                {section.description && (
                  <div className="text-sm">
                    {section.required && <span className="text-amber-500 mr-1">⚠</span>}
                    <span className={section.required ? "text-amber-700" : "text-gray-500"}>{section.description}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {section.options.map((option) => (
                  <div
                    key={`${section.id}-${option.id}`}
                    className="flex items-center justify-between py-2 cursor-pointer"
                    onClick={() => handleCustomizationSelect(section.id, option.id)}
                  >
                    <div className="flex items-center">
                      {section.type === "radio" ? (
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${isOptionSelected(section.id, option.id) ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          {isOptionSelected(section.id, option.id) && (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 border flex items-center justify-center rounded ${
                            isOptionSelected(section.id, option.id) ? "border-red-500 bg-red-500" : "border-gray-300"
                          }`}
                        >
                          {isOptionSelected(section.id, option.id) && <div className="text-white text-xs">✓</div>}
                        </div>
                      )}
                      <span className="ml-3">{option.name}</span>
                    </div>
                    {option.price ? (
                      <span className="text-gray-700">
                        {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'Included'}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 z-10 max-w-xl mx-auto">
          <button
            className={`w-full py-3 ${allRequiredSectionsMet ? "bg-red-600" : "bg-gray-300"
              } text-white font-medium rounded-lg`}
            disabled={!allRequiredSectionsMet}
            onClick={handleAddToCart}
          >
            {allRequiredSectionsMet
              ? `Add to cart - $${calculateTotalPrice()}`
              : `Make ${requiredSelectionsCount} required selections - $${calculateTotalPrice()}`}
          </button>
        </div>
      </div>
    </div>
  )
}