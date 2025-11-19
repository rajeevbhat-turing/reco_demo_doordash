'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Info, ChevronLeft, ChevronRight, User, Users, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function PricingPage() {
  const [markupRate, setMarkupRate] = useState(0)
  const [activeTab, setActiveTab] = useState<"Sales" | "Orders" | "Customers">("Sales")

  return (
    <MerchantLayout>
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing</h1>
          <p className="text-sm text-gray-600">
            Review how your menu pricing may affect your business performance and view opportunities to grow your sales.
          </p>
        </div>

        {/* Your current menu markup */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your current menu markup</h2>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-5xl font-bold text-gray-900 mb-3">30%</div>
          <p className="text-sm text-gray-600 mb-4">
            You can boost visibility and conversions by making your DoorDash prices similar to what you offer in-store.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors">
            Edit markup rate
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Preview markup changes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Preview markup changes</h2>
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">If your markup was</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMarkupRate(Math.max(0, markupRate - 1))}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <Input
                type="number"
                value={markupRate}
                onChange={(e) => setMarkupRate(parseInt(e.target.value) || 0)}
                className="w-24 text-center text-lg font-semibold"
                min="0"
                max="100"
              />
              <span className="text-lg font-semibold text-gray-900">%</span>
              <button
                onClick={() => setMarkupRate(Math.min(100, markupRate + 1))}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("Sales")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "Sales"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTab("Orders")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "Orders"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("Customers")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "Customers"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Customers
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              We don't have enough information to give an estimate of your performance with this menu markup at this time.
            </p>
          </div>
        </div>

        {/* Benefits section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Benefits of matching your in-store prices</h2>
          <p className="text-sm text-gray-600 mb-6">
            Reach out to our team for questions at{" "}
            <a href="mailto:menu-pricing@doordash.com" className="text-blue-600 hover:underline">
              menu-pricing@doordash.com
            </a>
          </p>

          <div className="space-y-6">
            {/* Higher visibility */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Higher visibility</h3>
                <p className="text-sm text-gray-600">
                  Restaurants that price the same as in-store may be surfaced higher on the homepage and are more easily discovered by customers.
                </p>
              </div>
            </div>

            {/* More repeat orders */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">More repeat orders</h3>
                <p className="text-sm text-gray-600">
                  Regulars often switch to competitors when they see higher prices on DoorDash than in-store.
                </p>
              </div>
            </div>

            {/* Attract new customers */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Attract new customers</h3>
                <p className="text-sm text-gray-600">
                  We found that customers are more likely to try a new restaurant if the prices are similar to what they see in-store.
                </p>
              </div>
            </div>
          </div>

          {/* Edit markup rate button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors">
              Edit markup rate
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

