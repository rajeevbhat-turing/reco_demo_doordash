'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ChevronDown, MessageSquare, Star } from "lucide-react"

export default function RatingsReviewsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 7 days")

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ratings & reviews</h1>
              <p className="text-sm text-gray-600 mb-4">
                Track your customer ratings and respond to their feedback. Respond to customer feedback within 7 days of receiving it to show your appreciation, and encourage them to come back.
              </p>
              
              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                  {selectedTimeframe}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <MessageSquare className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600">
                You didn't receive any ratings for the selected store(s) and timeframe.
              </p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ratings During This Period */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ratings during this period</h3>
              <p className="text-sm text-gray-600 mb-4">Data between 4/9/2025 - 4/15/2025.</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">NA</div>
              <p className="text-sm text-gray-600 mb-2">Not available due to 0 ratings</p>
              <p className="text-sm text-gray-500">0 ratings</p>
            </div>

            {/* Lifetime Rating */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifetime rating</h3>
              <p className="text-sm text-gray-600 mb-4">
                This is the rating of your store since joining DashDoor and the rating that customers will view in the DashDoor app.
              </p>
              
              {/* Overall Rating */}
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-2">4.8 / 5 stars</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= 4
                          ? "fill-yellow-400 text-yellow-400"
                          : star === 5
                          ? "fill-yellow-200 text-yellow-200"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2">
                {[
                  { stars: 5, percentage: 94.8 },
                  { stars: 4, percentage: 1.86 },
                  { stars: 3, percentage: 1.12 },
                  { stars: 2, percentage: 0.37 },
                  { stars: 1, percentage: 1.86 }
                ].map(({ stars, percentage }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 w-12">{stars} stars</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-700"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-16 text-right">{percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

