'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Download, ChevronDown, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Report {
  dateCreated: string
  channel: string
  type: string
  viewBy: string
  timeFrame: string
  locations: string
  action: "available" | "expired"
}

const reports: Report[] = [
  {
    dateCreated: "Apr 16, 2025 10:31 AM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Mar 3-5, 2025",
    locations: "2224 stores",
    action: "available"
  },
  {
    dateCreated: "Apr 16, 2025 10:28 AM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Feb 1-Apr 15, 2025",
    locations: "2224 stores",
    action: "available"
  },
  {
    dateCreated: "Apr 15, 2025 4:16 PM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Payout on Apr 11, 2025",
    locations: "1 store",
    action: "available"
  },
  {
    dateCreated: "Apr 15, 2025 4:15 PM",
    channel: "Marketplace",
    type: "Marketing",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  },
  {
    dateCreated: "Apr 15, 2025 4:14 PM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  },
  {
    dateCreated: "Apr 15, 2025 4:13 PM",
    channel: "Marketplace",
    type: "Marketing",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  },
  {
    dateCreated: "Apr 15, 2025 4:12 PM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  },
  {
    dateCreated: "Apr 15, 2025 4:11 PM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  },
  {
    dateCreated: "Apr 15, 2025 4:10 PM",
    channel: "Marketplace",
    type: "Marketing",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  },
  {
    dateCreated: "Apr 15, 2025 4:09 PM",
    channel: "Marketplace",
    type: "Financials",
    viewBy: "-",
    timeFrame: "Mar 1-31, 2025",
    locations: "1 store",
    action: "expired"
  }
]

export default function ReportsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"available" | "scheduled">("available")

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-sm text-gray-600">
              Create and manage the reports that provide access to sales, operations, and financial data for your store on DoorDash.
            </p>
          </div>
          <button
            onClick={() => router.push("/merchant/reports/create")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <BarChart2 className="h-4 w-4" />
            Create report
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "available"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "scheduled"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Scheduled
          </button>
        </div>

        {/* Reports Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-gray-700">
                  <div className="flex items-center gap-1">
                    Date created
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Channel</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Type</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">View by</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Time frame</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Locations</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{report.dateCreated}</td>
                  <td className="px-4 py-3 text-gray-600">{report.channel}</td>
                  <td className="px-4 py-3 text-gray-600">{report.type}</td>
                  <td className="px-4 py-3 text-gray-600">{report.viewBy}</td>
                  <td className="px-4 py-3 text-gray-600">{report.timeFrame}</td>
                  <td className="px-4 py-3 text-gray-600">{report.locations}</td>
                  <td className="px-4 py-3">
                    {report.action === "available" ? (
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-gray-400">Expired</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MerchantLayout>
  )
}

