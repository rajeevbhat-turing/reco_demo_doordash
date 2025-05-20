"use client"

import { useState } from "react"
import { Search, MapPin, Bell, ShoppingCart, ChevronDown, CarTaxiFront, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [location, setLocation] = useState("548 Market Street, San Francisco, CA 94104")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="w-full max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-6 flex-1">
          <a href="/" className="text-[#ff3008] font-bold text-2xl tracking-tight flex items-center gap-1">
            DOORDASH
          </a>
          <div className="relative w-full max-w-[600px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search DoorDash"
              className="w-full py-2 pl-10 pr-4 text-sm border-none rounded-full bg-[#f3f3f3] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 ml-4">
          <button className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#f3f3f3] text-sm text-black font-semibold">
            <MapPin className="h-4 w-4" />
            {location.slice(0, 25)}
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="px-4 py-2 rounded-full bg-black text-white text-sm font-semibold">
            Delivery
          </button>
          <button className="px-4 py-2 rounded-full bg-[#f3f3f3] text-black text-sm font-semibold">
            Pickup
          </button>
          <button className="h-8 w-8 rounded-full bg-[#f3f3f3] flex items-center justify-center">
            <Bell className="h-4 w-4 text-black" />
          </button>
          <a href="/cart" className="relative h-8 w-14 rounded-full bg-[#ff3008] text-white text-sm font-semibold flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 text-white mr-1"/>
            0
          </a>
        </div>
      </div>
    </header>
  )
}
