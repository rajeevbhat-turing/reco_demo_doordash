'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"

export default function PricingPlansPage() {
  const [activeTab, setActiveTab] = useState<"Your plan" | "All plans">("Your plan")

  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing plans</h1>
          <p className="text-sm text-gray-600">
            View your plan and compare it with our other pricing plans.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("Your plan")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "Your plan"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Your plan
          </button>
          <button
            onClick={() => setActiveTab("All plans")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "All plans"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All plans
          </button>
        </div>

        {/* Information Banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-start justify-between">
          <p className="text-sm text-gray-700 flex-1">
            Contact support to change plans. Since you have multiple store locations, you can't change your plan in Merchant Portal. Please contact support for help.
          </p>
          <button className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap">
            Contact support
          </button>
        </div>

        {activeTab === "Your plan" && (
          <>
            {/* Your plan section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your plan</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-700">Delivery commission rate</span>
                  <span className="text-sm font-medium text-gray-900">28%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-700">Pickup commission rate</span>
                  <span className="text-sm font-medium text-gray-900">6%</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-700">Reach high-value customers with DashPass</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">Yes</span>
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">D</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-700">Get 20 orders/month or you pay no commission for your first 6 months</span>
                  <span className="text-sm font-medium text-gray-900">Yes</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Questions about your commission rates? Learn more
                </a>
              </div>
            </div>

            {/* Other rates & fees section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Other rates & fees</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">Alcohol flat fees</span>
                    <p className="text-sm text-gray-600 mt-1">
                      To help accommodate local alcohol regulations, we may collect a variable flat fee on your alcohol sales, depending on your store's location, rather than your usual percentage based commission.{" "}
                      <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 ml-4">Varies</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-700">Weblink orders</span>
                  <span className="text-sm font-medium text-gray-900">16%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "All plans" && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600">All plans comparison will be available here.</p>
          </div>
        )}
      </div>
    </MerchantLayout>
  )
}

