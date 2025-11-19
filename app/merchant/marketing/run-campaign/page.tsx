'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Check, ChevronLeft, ChevronRight, Users } from "lucide-react"

export default function RunCampaignPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"Marketplace" | "Online Ordering">("Marketplace")

  return (
    <MerchantLayout>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Run a campaign</h1>
          <p className="text-sm text-gray-600">
            Boost your sales by running a paid marketing campaign or promotion on DoorDash channels. You only pay if your promotion leads to an order.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("Marketplace")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "Marketplace"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab("Online Ordering")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "Online Ordering"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Online Ordering
          </button>
        </div>

        {/* Buy 1, get 1 free promotion */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-semibold text-gray-900">Buy 1, get 1 free promotion</h2>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  New
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Boost sales by selling more high-margin items like drinks or sides.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Clear out extra inventory quickly while increasing profits.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Use it to introduce new menu items and create buzz for your business.
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors">
                Get started
              </button>
            </div>
            <div className="ml-8 flex-shrink-0">
              <div className="w-48 h-96 bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 mb-2 text-center">
                  For illustrative purposes only. Subject to change.
                </div>
                <div className="bg-white rounded-lg p-3 w-full h-full flex flex-col gap-2">
                  <div className="text-xs font-semibold mb-2">Menu</div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">Mystery item</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-gray-500">1 of 2</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attract new customers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Attract new customers</h2>
          <p className="text-sm text-gray-600 mb-6">
            Attract more customers who have never ordered from you before.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Advertise to new customers */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Advertise to new customers</h3>
              <p className="text-sm text-gray-600 mb-4">
                You could be featured prominently on the DoorDash app and seen by more customers. You only pay for ads when you receive an order.
              </p>
              <button 
                onClick={() => router.push("/merchant/marketing/run-campaign/advertise-new-customers")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Select
              </button>
            </div>

            {/* Lunch Specials */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors relative">
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  New
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Lunch Specials</h3>
              <p className="text-sm text-gray-600 mb-4">
                Attract more customers with a discount when they order from 11 am - 2 pm local time.
              </p>
              <button 
                onClick={() => router.push("/merchant/marketing/run-campaign/lunch-specials")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Select
              </button>
            </div>

            {/* Happy Hour discount */}
            <div className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors relative">
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  New
                </span>
              </div>
              <div className="absolute top-4 right-16">
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Happy Hour discount</h3>
              <p className="text-sm text-gray-600 mb-4">
                Attract more customers with a discount when they order from 2-5 pm local time.
              </p>
              <button 
                onClick={() => router.push("/merchant/marketing/run-campaign/happy-hour")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Select
              </button>
            </div>
          </div>

          {/* Icon at bottom right */}
          <div className="flex justify-end mt-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

