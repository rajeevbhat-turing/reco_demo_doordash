import type React from "react"
import MerchantSidebar from "./MerchantSidebar"

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand accent bars */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-[#EB1700] z-50" />
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-[#EB1700] z-50" />

      {/* Left navigation */}
      <MerchantSidebar />

      {/* Main area */}
      <div className="ml-[240px] px-6 py-6">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}


