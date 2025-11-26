'use client'
import MerchantLayout from "@/components/merchant/MerchantLayout"

export default function OptimizationScorePage() {
  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimization score</h1>
          <p className="text-sm text-gray-600">
            Track your store's performance and identify areas for improvement.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Optimization score content coming soon...</p>
        </div>
      </div>
    </MerchantLayout>
  )
}

