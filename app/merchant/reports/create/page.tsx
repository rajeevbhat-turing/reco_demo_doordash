'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { useRouter } from "next/navigation"
import { BarChart2 } from "lucide-react"

interface ReportType {
  id: string
  title: string
  description: string
  channels: string[]
}

const reportTypes: ReportType[] = [
  {
    id: "financial",
    title: "Financial report",
    description: "Transactions, cancelled not paid orders, and payouts",
    channels: ["Marketplace", "Drive", "On-Demand"]
  },
  {
    id: "operations",
    title: "Operations report",
    description: "Order accuracy, cancellation rate, wait time, product mix, and more",
    channels: ["Marketplace", "Drive", "On-Demand"]
  },
  {
    id: "sales",
    title: "Sales report",
    description: "Total sales, total orders, average ticket size, and more",
    channels: ["Marketplace", "Drive", "On-Demand"]
  },
  {
    id: "marketing",
    title: "Marketing report",
    description: "Campaign details and performance",
    channels: ["Marketplace"]
  }
]

export default function CreateReportPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>("financial")

  const handleNext = () => {
    router.push(`/merchant/reports/create/step2?type=${selectedType}`)
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BarChart2 className="h-6 w-6 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Report builder</h1>
          </div>
          <div className="text-sm text-gray-500">Step 1 of 2</div>
        </div>

        {/* Main Content */}
        <div className="border-2 border-red-600 rounded-lg p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a report type</h2>
          <p className="text-sm text-gray-600 mb-6">
            Some reports and data may only be available for certain channels.
          </p>

          {/* Report Type Options */}
          <div className="space-y-3 mb-8">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                  selectedType === type.id
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {type.channels.map((channel, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <input
                      type="radio"
                      checked={selectedType === type.id}
                      onChange={() => setSelectedType(type.id)}
                      className="w-5 h-5 text-gray-900"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

