"use client"
import type React from "react"
import MerchantSidebar from "./MerchantSidebar"
import { CurrentStoreProvider } from "@/lib/hooks/useCurrentStore"

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrentStoreProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Left navigation */}
        <MerchantSidebar />

        {/* Main area */}
        <div className="ml-[240px] px-6 py-6">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </CurrentStoreProvider>
  )
}


