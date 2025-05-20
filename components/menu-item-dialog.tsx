"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ThumbsUp, ChevronLeft, ChevronRight, ChevronRightIcon } from "lucide-react"

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
  price?: string
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
  const dialogRef = useRef<HTMLDivElement>(null)

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
      customizationSections.forEach((section) => {
        if (section.required && section.type === "radio") {
          // Pre-select the first option for required radio sections
          const defaultOption = section.options[0]?.id
          if (defaultOption) {
            initialCustomizations[section.id] = [defaultOption]
          }
        } else {
          initialCustomizations[section.id] = []
        }
      })
      setSelectedCustomizations(initialCustomizations)

      // Count required sections
      const requiredCount = customizationSections.filter((section) => section.required).length
      setRequiredSelectionsCount(requiredCount)

      // Initialize required sections tracking
      const initialRequiredSections: Record<string, boolean> = {}
      customizationSections.forEach((section) => {
        if (section.required) {
          initialRequiredSections[section.id] = false
        }
      })
      setRequiredSectionsMet(initialRequiredSections)
    }
  }, [isOpen, item])

  if (!isOpen || !item) return null

  // Recommended meal options
  const recommendedOptions: MenuItemOption[] = [
    {
      id: "1",
      title: "#1 · Ordered recently by 10+ others",
      subtitle: "MEDIUM (5328 kJ.) · Fries (1320 kJ.) · Coke® Zero Sugar (10 kJ.)",
      details: ["MEDIUM (5328 kJ.)", "Fries (1320 kJ.)", "Coke® Zero Sugar (10 kJ.)"],
      price: "A$17.80",
      popular: true,
      popularity: "10+",
    },
    {
      id: "2",
      title: "#2 · Ordered recently by others",
      subtitle: "LARGE (5939 kJ.) · Fries (1320 kJ.) · (568 kJ.)",
      details: ["LARGE (5939 kJ.)", "Fries (1320 kJ.)", "(568 kJ.)"],
      price: "A$18.70",
    },
  ]

  // Customization sections
  const customizationSections: CustomizationSection[] = [
    {
      id: "size",
      title: "Select Size",
      type: "radio",
      required: true,
      options: [
        { id: "medium", name: "MEDIUM (5328 kJ.)", selected: true },
        { id: "large", name: "LARGE (5939 kJ.)", price: "+A$0.90" },
      ],
      description: "• Select 1",
    },
    {
      id: "side",
      title: "Side",
      type: "radio",
      required: true,
      options: [{ id: "fries", name: "Fries (1320 kJ.)", selected: true }],
      description: "• Select 1",
    },
    {
      id: "drink",
      title: "Medium Drink",
      type: "radio",
      required: true,
      options: [
        { id: "shamrock-shake", name: "Shamrock Shake (1860 kJ.)", price: "+A$1.85" },
        { id: "biscoff-coffee-frappe", name: "Biscoff® Coffee Frappé (2710 kJ.)", price: "+A$2.00" },
        { id: "biscoff-shake", name: "Biscoff® Shake (2870 kJ.)", price: "+A$2.05" },
        { id: "coke", name: "Coke® (568 kJ.)" },
        { id: "coke-zero", name: "Coke® Zero Sugar (10 kJ.)" },
        { id: "vanilla-coke", name: "Vanilla Coke® (624 kJ.)" },
        { id: "fanta", name: "Fanta® (716 kJ.)" },
        { id: "sprite", name: "Sprite® (555 kJ.)" },
        { id: "fanta-raspberry", name: "Fanta® Raspberry (428 kJ.)" },
        { id: "sparkling-water", name: "Sparkling Water (0 kJ.)" },
        { id: "bottled-water", name: "Bottled Water 600 mL (0 kJ.)" },
        { id: "frozen-sprite-fanta", name: "Frozen Sprite® and Fanta® Flavours (548 kJ.)" },
        { id: "frozen-coke", name: "Frozen Coke® (548 kJ.)" },
        { id: "chocolate-shake", name: "Chocolate Shake (1540 kJ.)", price: "+A$1.05" },
        { id: "strawberry-shake", name: "Strawberry Shake (1530 kJ.)", price: "+A$1.05" },
        { id: "vanilla-shake", name: "Vanilla Shake (1420 kJ.)", price: "+A$1.05" },
        { id: "mccafe-cappuccino", name: "McCafé - Cappuccino (909 kJ.)", price: "-A$0.10" },
        { id: "mccafe-latte", name: "McCafé - Latté (769 kJ.)", price: "-A$0.10" },
        { id: "mccafe-flat-white", name: "McCafé - Flat White (851 kJ.)", price: "-A$0.10" },
        { id: "mccafe-mocha", name: "McCafé - Mocha (1290 kJ.)", price: "+A$0.45" },
        { id: "mccafe-long-black", name: "McCafé - Long Black (2 kJ.)", price: "-A$0.10" },
        { id: "mccafe-flavoured-iced-latte", name: "McCafé Flavoured Iced Latte (1490 kJ.)", price: "+A$1.50" },
        { id: "coffee-frappe", name: "Coffee Frappé (2440 kJ.)", price: "+A$1.00" },
        { id: "chocolate-frappe", name: "Chocolate Frappé (2470 kJ.)", price: "+A$1.00" },
        { id: "salted-caramel-frappe", name: "Salted Caramel Frappé (2250 kJ.)", price: "+A$1.00" },
        { id: "orange-juice", name: "Orange Juice (670 kJ.)", price: "+A$1.05" },
        { id: "mccafe-hot-chocolate", name: "McCafé - Hot Chocolate (1660 kJ.)", price: "+A$0.15" },
        { id: "zoetic-earl-grey", name: "Zoetic Earl Grey Tea (23 kJ.)", price: "-A$0.70" },
        { id: "zoetic-green-tea", name: "Zoetic Green Tea (23 kJ.)", price: "-A$0.70" },
        { id: "zoetic-english-breakfast", name: "Zoetic English Breakfast Tea (23 kJ.)", price: "-A$0.70" },
        { id: "zoetic-peppermint", name: "Zoetic Peppermint Tea (23 kJ.)", price: "-A$0.70" },
        { id: "mccafe-deluxe-iced-coffee", name: "McCafé Deluxe Iced Coffee (1520 kJ.)", price: "+A$2.55" },
        { id: "mccafe-iced-mocha", name: "McCafé - Iced Mocha (1740 kJ.)", price: "+A$1.15" },
        { id: "mccafe-iced-latte", name: "McCafé - Iced Latte (1100 kJ.)", price: "+A$0.45" },
        { id: "mccafe-iced-chai-latte", name: "McCafé - Iced Chai Latte (1420 kJ.)", price: "+A$1.40" },
      ],
      description: "• Select 1",
    },
    {
      id: "flavour",
      title: "Flavour",
      type: "checkbox",
      required: false,
      maxSelections: 1,
      options: [
        { id: "sprite-flavour", name: "Sprite® Flavour" },
        { id: "fanta-orange-flavour", name: "Fanta® Orange Flavour" },
        { id: "fanta-raspberry-flavour", name: "Fanta® Raspberry Flavour" },
        { id: "fanta-blueberry-flavour", name: "Fanta® Blueberry Flavour" },
        { id: "hazelnut-flavour", name: "Hazelnut Flavour (304 kJ.)", price: "+A$1.10" },
        { id: "vanilla-flavour", name: "Vanilla Flavour (304 kJ.)", price: "+A$1.10" },
        { id: "caramel-flavour", name: "Caramel Flavour (304 kJ.)", price: "+A$1.10" },
      ],
      description: "(Optional) • Select up to 1",
    },
    {
      id: "milk",
      title: "Milk",
      type: "checkbox",
      required: false,
      maxSelections: 1,
      options: [
        { id: "full-cream-milk", name: "Full Cream Milk" },
        { id: "skim-milk", name: "Skim Milk" },
        { id: "soy-milk", name: "Soy Milk", price: "+A$0.85" },
        { id: "milklab-oat-milk", name: "MILKLAB Oat Milk", price: "+A$0.95" },
        { id: "milklab-almond-milk", name: "MILKLAB Almond Milk", price: "+A$0.95" },
        { id: "lactose-free-milk", name: "Lactose Free Full Cream Milk", price: "+A$0.95" },
        { id: "no-milk", name: "No Milk" },
      ],
      description: "(Optional) • Select up to 1",
    },
    {
      id: "extra",
      title: "Extra for Double Quarter Pounder",
      type: "checkbox",
      required: false,
      maxSelections: 11,
      options: [
        { id: "extra-mustard", name: "Extra Mustard (327 kJ.)" },
        { id: "extra-ketchup", name: "Extra Ketchup" },
        { id: "extra-slivered-onions", name: "Extra Slivered Onions", price: "+A$0.50" },
        { id: "extra-pickles", name: "Extra Pickles" },
        { id: "extra-sliced-cheese", name: "Extra Sliced Cheese (202 kJ.)", price: "+A$1.50" },
        { id: "extra-salt-pepper", name: "Extra Salt & Pepper" },
        { id: "extra-qtr-lb-beef", name: "Extra Qtr lb Beef Patty", price: "+A$3.80" },
        { id: "extra-mcchicken-sauce", name: "Extra McChicken Sauce (313 kJ.)", price: "+A$0.95" },
        { id: "extra-shredded-lettuce", name: "Extra Shredded Lettuce", price: "+A$0.90" },
        { id: "extra-sliced-tomato", name: "Extra Sliced Tomato", price: "+A$0.95" },
        { id: "extra-rasher-bacon", name: "Extra Rasher Bacon (130 kJ.)", price: "+A$1.85" },
      ],
      description: "(Optional) • Select up to 11",
    },
    {
      id: "remove",
      title: "Remove from Double Quarter Pounder",
      type: "checkbox",
      required: false,
      maxSelections: 8,
      options: [
        { id: "no-quarter-pounder-bun", name: "No Quarter Pounder Bun" },
        { id: "no-mustard", name: "No Mustard (327 kJ.)" },
        { id: "no-ketchup", name: "No Ketchup" },
        { id: "no-slivered-onions", name: "No Slivered Onions" },
        { id: "no-pickles", name: "No Pickles" },
        { id: "no-sliced-cheese", name: "No Sliced Cheese (202 kJ.)" },
        { id: "no-salt-pepper", name: "No Salt & Pepper" },
        { id: "no-qtr-lb-beef", name: "No Qtr lb Beef Patty" },
      ],
      description: "(Optional) • Select up to 8",
    },
    {
      id: "preferences",
      title: "Preferences",
      type: "checkbox",
      required: false,
      options: [{ id: "special-instructions", name: "Add Special Instructions" }],
      description: "(Optional)",
    },
  ]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId === selectedOption ? null : optionId)
  }

  const handleCustomizationSelect = (sectionId: string, optionId: string) => {
    const section = customizationSections.find((s) => s.id === sectionId)

    if (!section) return

    setSelectedCustomizations((prev) => {
      const updatedSelections = { ...prev }

      if (section.type === "radio") {
        // For radio buttons, replace the current selection
        updatedSelections[sectionId] = [optionId]

        // Mark this required section as met
        if (section.required) {
          setRequiredSectionsMet((prev) => ({
            ...prev,
            [sectionId]: true,
          }))
        }
      } else {
        // For checkboxes, toggle the selection
        const currentSelections = updatedSelections[sectionId] || []

        if (currentSelections.includes(optionId)) {
          updatedSelections[sectionId] = currentSelections.filter((id) => id !== optionId)
        } else {
          // Check if we're at the max selections
          if (section.maxSelections && currentSelections.length >= section.maxSelections) {
            // Remove the first item if we're at max
            updatedSelections[sectionId] = [...currentSelections.slice(1), optionId]
          } else {
            updatedSelections[sectionId] = [...currentSelections, optionId]
          }
        }

        // For required checkbox sections, check if any option is selected
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
                  className={`border rounded-lg p-4 cursor-pointer ${
                    selectedOption === option.id ? "border-red-500" : "border-gray-200"
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
                        className={`ml-3 w-5 h-5 rounded-full border ${
                          selectedOption === option.id ? "border-red-500 bg-red-500" : "border-gray-300"
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
                    className="flex items-center justify-between py-2"
                    onClick={() => handleCustomizationSelect(section.id, option.id)}
                  >
                    <div className="flex items-center">
                      {section.type === "radio" ? (
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isOptionSelected(section.id, option.id) ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          {isOptionSelected(section.id, option.id) && (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 border flex items-center justify-center ${
                            isOptionSelected(section.id, option.id) ? "border-red-500 bg-red-500" : "border-gray-300"
                          }`}
                        >
                          {isOptionSelected(section.id, option.id) && <div className="text-white text-xs">✓</div>}
                        </div>
                      )}
                      <span className="ml-3">{option.name}</span>
                    </div>
                    {option.price && <span className="text-gray-700">{option.price}</span>}
                  </div>
                ))}
              </div>

              {/* Special Instructions */}
              {section.id === "preferences" && isOptionSelected(section.id, "special-instructions") && (
                <div className="mt-3 flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>Add Special Instructions</span>
                      <ChevronRightIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 z-10 max-w-xl mx-auto">
          <button
            className="w-full py-3 bg-red-600 text-white font-medium rounded-lg"
            disabled={!allRequiredSectionsMet}
          >
            Make {requiredSelectionsCount} required selections - A$17.80
          </button>
        </div>
      </div>
    </div>
  )
}
