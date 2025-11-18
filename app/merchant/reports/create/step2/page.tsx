'use client'
import { useState, useEffect } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { useRouter, useSearchParams } from "next/navigation"
import { BarChart2, Sparkles, Calendar, Check } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function CreateReportStep2Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportType = searchParams.get("type") || "financial"

  const [reportFrequency, setReportFrequency] = useState<"one-time" | "recurring">("one-time")
  const [dateRangeType, setDateRangeType] = useState<"payout-date" | "date-range">("date-range")
  const [startDate, setStartDate] = useState("04/10/2025")
  const [endDate, setEndDate] = useState("04/16/2025")
  const [includedData, setIncludedData] = useState({
    transactionsOverview: true,
    transactionsBreakdown: true,
    errorCharges: true,
    payouts: true
  })

  const reportTypeNames: Record<string, string> = {
    financial: "Financial",
    operations: "Operations",
    sales: "Sales",
    marketing: "Marketing"
  }

  const handleToggleData = (key: keyof typeof includedData) => {
    setIncludedData(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <MerchantLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Report builder</h1>
            </div>
            <div className="text-sm text-gray-500">Step 2 of 2</div>
          </div>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Main Content */}
          <div className="lg:col-span-2">
            <div className="border-2 border-red-600 rounded-lg p-6 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Customize your {reportTypeNames[reportType]} report
              </h2>

              {/* Information Banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  Introducing new metrics in your financial reports. Now you can view a more detailed breakdown of your marketing spend and specific fees.{" "}
                  <a href="#" className="text-blue-600 hover:underline">Learn more</a>.
                </div>
              </div>

              {/* Choose a time range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a time range</h3>
                
                {/* Frequency Toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setReportFrequency("one-time")}
                    className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-colors ${
                      reportFrequency === "one-time"
                        ? "border-gray-900 bg-white text-gray-900"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    One-time report
                  </button>
                  <button
                    onClick={() => setReportFrequency("recurring")}
                    className={`px-4 py-2 text-sm font-medium rounded-md border-2 transition-colors ${
                      reportFrequency === "recurring"
                        ? "border-gray-900 bg-white text-gray-900"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Recurring report
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  We'll notify you via email when your report is ready. This can take a few minutes for smaller reports, and up to a few hours for reports with large amounts of data.
                </p>

                {/* Date Range Options */}
                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={dateRangeType === "payout-date"}
                      onChange={() => setDateRangeType("payout-date")}
                      className="w-4 h-4 text-gray-900"
                    />
                    <span className="text-sm text-gray-700">By payout date</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={dateRangeType === "date-range"}
                      onChange={() => setDateRangeType("date-range")}
                      className="w-4 h-4 text-gray-900"
                    />
                    <span className="text-sm text-gray-700">By date range</span>
                  </label>
                </div>

                {/* Date Inputs */}
                {dateRangeType === "date-range" && (
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select start date
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select end date
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Each day starts at 12:00 AM and ends at 11:59 PM in the local time zone of selected stores. You may select a time frame within the last 2 years.
                </p>
              </div>

              {/* Choose information to include */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose information to include</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You will receive a separate CSV file for each category of information.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-5 bg-white sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your report summary</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Channels</div>
                  <div className="text-gray-900 font-medium">Marketplace, Drive On-Demand</div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-1">Stores</div>
                  <div className="text-gray-900 font-medium">1 store</div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-1">Time range</div>
                  <div className="text-gray-900 font-medium">Apr 10-16, 2025</div>
                </div>
                
                <div>
                  <div className="text-gray-500 mb-2">Included data</div>
                  <div className="space-y-2">
                    {includedData.transactionsOverview && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Transactions overview</span>
                      </div>
                    )}
                    {includedData.transactionsBreakdown && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Transactions breakdown</span>
                      </div>
                    )}
                    {includedData.errorCharges && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Error charges and adjustments</span>
                      </div>
                    )}
                    {includedData.payouts && (
                      <div className="flex items-center gap-2 text-gray-900">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Payouts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

