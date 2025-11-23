'use client'

import { useState, useEffect } from "react"
import { X, Check, ChevronDown, Sparkles } from "lucide-react"
import { MenuItem } from "@/store/merchant-menu-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ItemStatusDropdown from "./ItemStatusDropdown"

interface ItemEditorPanelProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (itemId: string, updates: Partial<MenuItem>) => void
}

export default function ItemEditorPanel({ item, isOpen, onClose, onUpdate }: ItemEditorPanelProps) {
  const [name, setName] = useState("")
  const [pickupPrice, setPickupPrice] = useState("")
  const [deliveryPrice, setDeliveryPrice] = useState("")
  const [itemTaxRate, setItemTaxRate] = useState("10.2")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<MenuItem["status"]>("In stock")
  const [showPricingAlert, setShowPricingAlert] = useState(true)

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name)
      setPickupPrice(item.pickupPrice.replace("$", ""))
      setDeliveryPrice(item.deliveryPrice.replace("$", ""))
      setStatus(item.status)
      setDescription("Beef broth with rare beef, tripe, brisket, meatball and tendon.") // Default description
    }
  }, [item])

  if (!isOpen || !item) return null

  const handleSave = () => {
    onUpdate(item.id, {
      name,
      pickupPrice: `$${pickupPrice}`,
      deliveryPrice: `$${deliveryPrice}`,
      status
    })
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Item {item.name}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">In stock</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Customers can view and order this item during store hours.
            </p>
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white">
              Manage status
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="item-name" className="text-sm font-medium text-gray-900 mb-2 block">
              Name <span className="text-red-600">Required</span>
            </Label>
            <Input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="pickup-price" className="text-sm font-medium text-gray-900 mb-2 block">
                Pickup Price
              </Label>
              <Input
                id="pickup-price"
                type="text"
                value={pickupPrice}
                onChange={(e) => setPickupPrice(e.target.value)}
                className="w-full"
                placeholder="5.00"
              />
            </div>
            <div>
              <Label htmlFor="delivery-price" className="text-sm font-medium text-gray-900 mb-2 block">
                Delivery Price
              </Label>
              <Input
                id="delivery-price"
                type="text"
                value={deliveryPrice}
                onChange={(e) => setDeliveryPrice(e.target.value)}
                className="w-full"
                placeholder="1.88"
              />
            </div>
            <div>
              <Label htmlFor="item-tax-rate" className="text-sm font-medium text-gray-900 mb-2 block">
                Item Tax Rate
              </Label>
              <Input
                id="item-tax-rate"
                type="text"
                value={itemTaxRate}
                onChange={(e) => setItemTaxRate(e.target.value)}
                className="w-full"
                placeholder="10.2"
              />
            </div>
          </div>

          {/* Pricing Alert */}
          {showPricingAlert && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 relative">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Build customer trust and loyalty by offering the same prices for pickup and delivery.
                </p>
              </div>
              <button
                onClick={() => setShowPricingAlert(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Photo Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-gray-900">
                Photo
              </Label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                View photo guidelines
              </a>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-24 h-24 rounded-md bg-gray-200 overflow-hidden mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mb-2">226e97e2-a711-45f8-8737-5345491ad65c.jpg</p>
              <p className="text-sm text-gray-600 mb-3">
                This photo is visible on your DashDoor menu.
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Edit
                </button>
                <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Replace
                </button>
                <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="item-description" className="text-sm font-medium text-gray-900 mb-2 block">
              Description <span className="text-gray-500 font-normal">Optional</span>
            </Label>
            <textarea
              id="item-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Beef broth with rare beef, tripe, brisket, meatball and tendon."
            />
            <button className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Sparkles className="h-4 w-4" />
              Rewrite with AI
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

