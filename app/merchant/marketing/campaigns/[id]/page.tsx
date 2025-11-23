'use client'
import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { X, Info, BarChart2 } from "lucide-react"
import Link from "next/link"
import CampaignPerformanceChart from "@/components/merchant/CampaignPerformanceChart"

interface CampaignDetail {
  id: string
  name: string
  status: "Active" | "Paused" | "Ended"
  startDate: string
  endDate: string | null
  grossSales: string
  marketingSpend: string
  returnOnAdSpend: string
  totalImpressions: number
  avgSpendPerOrder: string
  totalClicks: number
  avgOrderValue: string
  totalOrders: number
  salesData: { date: string; value: number }[]
  ordersData: { date: string; value: number }[]
  impressionsData: { date: string; value: number }[]
}

// Generate mock data for the last 30 days
const generateMockData = (days: number, baseValue: number, variance: number) => {
  const data = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const value = Math.max(0, baseValue + (Math.random() - 0.5) * variance)
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value)
    })
  }
  return data
}

const mockCampaignDetails: Record<string, CampaignDetail> = {
  "interops-biz-admin-mxp-sl-ars-2": {
    id: "interops-biz-admin-mxp-sl-ars-2",
    name: "Interops - biz_admin_MxP_SL - ARS 2",
    status: "Active",
    startDate: "04/14/2025",
    endDate: null,
    grossSales: "$0.00",
    marketingSpend: "$0.00",
    returnOnAdSpend: "N/A",
    totalImpressions: 0,
    avgSpendPerOrder: "--",
    totalClicks: 0,
    avgOrderValue: "--",
    totalOrders: 0,
    salesData: generateMockData(30, 0, 0),
    ordersData: generateMockData(30, 0, 0),
    impressionsData: generateMockData(30, 0, 0)
  },
  "interops-business-admin-sl-mxp-rename": {
    id: "interops-business-admin-sl-mxp-rename",
    name: "Interops Business Admin SL MxP - Rename Xiaochuan",
    status: "Active",
    startDate: "04/10/2025",
    endDate: null,
    grossSales: "$0.00",
    marketingSpend: "$0.00",
    returnOnAdSpend: "N/A",
    totalImpressions: 0,
    avgSpendPerOrder: "--",
    totalClicks: 0,
    avgOrderValue: "--",
    totalOrders: 0,
    salesData: generateMockData(30, 0, 0),
    ordersData: generateMockData(30, 0, 0),
    impressionsData: generateMockData(30, 0, 0)
  }
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 30 days")
  const [showBanner, setShowBanner] = useState(true)
  const [activeTab, setActiveTab] = useState<"Sales" | "Orders" | "Impressions">("Sales")

  const campaign = mockCampaignDetails[campaignId] || mockCampaignDetails["interops-biz-admin-mxp-sl-ars-2"]

  const displayEndDate = campaign.endDate || "Ongoing"
  const statusColor = campaign.status === "Active" ? "bg-green-500" : 
                     campaign.status === "Paused" ? "bg-yellow-500" : 
                     "bg-gray-400"

  // Get chart data based on active tab
  const chartData = useMemo(() => {
    switch (activeTab) {
      case "Sales":
        return campaign.salesData
      case "Orders":
        return campaign.ordersData
      case "Impressions":
        return campaign.impressionsData
      default:
        return campaign.salesData
    }
  }, [activeTab, campaign])

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/merchant/marketing/campaigns" className="text-sm text-gray-600 hover:text-gray-900">
            Campaigns
          </Link>
          <span className="text-sm text-gray-600 mx-2">/</span>
          <span className="text-sm text-gray-900">{campaign.name}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Campaigns / {campaign.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                <span className="text-sm font-medium text-gray-900">{campaign.status}</span>
              </div>
              <span className="text-sm text-gray-600">
                {campaign.startDate} - {displayEndDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/merchant/reports/create")}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              Create report
            </button>
            {campaign.status === "Active" && (
              <button
                onClick={() => {
                  // Handle end campaign
                  if (confirm("Are you sure you want to end this campaign?")) {
                    router.push("/merchant/marketing/campaigns")
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                End campaign
              </button>
            )}
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className="mb-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>

        {/* Informational Banner */}
        {showBanner && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6 flex items-start gap-3 relative">
            <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Introducing a new metric - marketing spend.</span> To help you better track and understand your marketing efforts, we're unveiling a new metric - marketing spend. This number represents the total you paid to <strong>DashDoor</strong> to run marketing after marketing credits and third-party contributions have been deducted. You'll also be able to see a detailed breakdown of this number in your downloaded reports.
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Performance Summary */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {campaign.totalOrders === 0 ? "Your ad hasn't generated any sales yet." : "Campaign Performance"}
          </h2>
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Gross sales</div>
              <div className="text-3xl font-bold text-gray-900">{campaign.grossSales}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Marketing spend</div>
              <div className="text-3xl font-bold text-gray-900">{campaign.marketingSpend}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Return on ad spend</div>
              <div className="text-3xl font-bold text-gray-900">{campaign.returnOnAdSpend}</div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total impressions</div>
                <div className="text-lg font-semibold text-gray-900">{campaign.totalImpressions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Avg spend per order</div>
                <div className="text-lg font-semibold text-gray-900">{campaign.avgSpendPerOrder}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total clicks</div>
                <div className="text-lg font-semibold text-gray-900">{campaign.totalClicks.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Avg order value</div>
                <div className="text-lg font-semibold text-gray-900">{campaign.avgOrderValue}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total orders</div>
                <div className="text-lg font-semibold text-gray-900">{campaign.totalOrders.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign performance</h3>
          
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
              onClick={() => setActiveTab("Impressions")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "Impressions"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Impressions
            </button>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <CampaignPerformanceChart data={chartData} type={activeTab} />
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

