'use client'
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { FolderOpen } from "lucide-react"

export default function LoyaltyPage() {
  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty</h1>
          <p className="text-sm text-gray-600">
            Performance insights since the launch of your loyalty program, reflecting a maximum of 12 months of data. For questions, contact us at{" "}
            <a href="mailto:loyalty@dashdoor.com" className="text-blue-600 hover:underline">
              loyalty@dashdoor.com
            </a>.
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center text-center">
          {/* Illustration */}
          <div className="relative mb-6">
            <FolderOpen className="h-24 w-24 text-orange-500" />
            {/* Bee/Fly illustration - simplified as a small circle with dots */}
            <div className="absolute -top-2 right-4">
              <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
              <div className="absolute top-1 left-1 w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="absolute top-2 right-0.5 w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
            </div>
          </div>

          {/* Main Message */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            This store has not launched a loyalty program.
          </h2>

          {/* Call to Action */}
          <p className="text-sm text-gray-600 max-w-md">
            Build customer loyalty by offering rewards. To get started, contact us at{" "}
            <a href="mailto:loyalty@dashdoor.com" className="text-blue-600 hover:underline">
              loyalty@dashdoor.com
            </a>.
          </p>
        </div>
      </div>
    </MerchantLayout>
  )
}

