'use client'
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { AlertCircle, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function StatusHistoryPage() {
  const statusHistory = [
    {
      startDate: "4/27/2025 7:07 AM",
      endDate: "4/27/2025 8:40 PM",
      orderingChannel: "All channels",
      pastStatus: "Deactivated",
      reason: "Tablet is off",
      description: `We've detected that your DoorDash Tablet is not able to receive orders. To avoid any issues with new orders, we've paused your store on DoorDash for the rest of the day. This pause will be ended once we detect that you are able to receive orders again, or naturally expire at the end of the day. To ensure that you are able to receive orders, please check that all of the following conditions are true: 1) Your tablet is turned on 2) Your tablet has battery life remaining, or is plugged in (recommended) 3) Your tablet is connected to the DoorDash network (recommended) or a reliable alternative internet connection 4) You are logged in to the DoorDash Order Manager App, the App is open (NOT closed or minimized), and the Orders page is active Once all of these conditions are met, you will be reactivated automatically within a minute, without needing to take any manual action in the Merchant Portal. Please note that your Tablet might take up to 20 minutes to display the correct status, but you will be able to start receiving orders again right away. For more information about these temporary deactivations, please visit this article: https://help.doordash.com/merchants/s/article/Why-did-my-store-get-automatically-temporarily-deactivated?language=en_us if you need guidance on how to troubleshoot Tablet issues, please visit this article: https://help.doordash.com/merchants/s/article/How-do-I-troubleshoot-my-Tablet?language=en_us`
    },
    {
      startDate: "4/26/2025 12:01 AM",
      endDate: "4/26/2025 11:25 PM",
      orderingChannel: "All channels",
      pastStatus: "Deactivated",
      reason: "Tablet is off",
      description: `We've detected that your DoorDash Tablet is not able to receive orders. To avoid any issues with new orders, we've paused your store on DoorDash for the rest of the day. This pause will be ended once we detect that you are able to receive orders again, or naturally expire at the end of the day. To ensure that you are able to receive orders, please check that all of the following conditions are true: 1) Your tablet is turned on 2) Your tablet has battery life remaining, or is plugged in (recommended) 3) Your tablet is connected to the DoorDash network (recommended) or a reliable alternative internet connection 4) You are logged in to the DoorDash Order Manager App, the App is open (NOT closed or minimized), and the Orders page is active Once all of these conditions are met, you will be reactivated automatically within a minute, without needing to take any manual action in the Merchant Portal. Please note that your Tablet might take up to 20 minutes to display the correct status, but you will be able to start receiving orders again right away. For more information about these temporary deactivations, please visit this article: https://help.doordash.com/merchants/s/article/Why-did-my-store-get-automatically-temporarily-deactivated?language=en_us if you need guidance on how to troubleshoot Tablet issues, please visit this article: https://help.doordash.com/merchants/s/article/How-do-I-troubleshoot-my-Tablet?language=en_us`
    }
  ]

  return (
    <MerchantLayout>
      <div className="max-w-6xl">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Link href="/merchant/store-availability" className="text-sm text-gray-600 hover:text-gray-900">
            Store availability
          </Link>
          <span className="text-sm text-gray-600 mx-2">/</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status history</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <select className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700">
            <option>Show all availability</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Deactivated</option>
          </select>
          <select className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700">
            <option>Show all time</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <select className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700">
            <option>Show all reasons</option>
            <option>Tablet is off</option>
            <option>Manual pause</option>
            <option>Other</option>
          </select>
        </div>

        {/* Status History Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Start date</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">End date</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Ordering channel</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Past status</th>
                <th className="text-left font-medium px-4 py-3 text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody>
              {statusHistory.map((entry, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="px-4 py-4 text-gray-900">{entry.startDate}</td>
                  <td className="px-4 py-4 text-gray-900">{entry.endDate}</td>
                  <td className="px-4 py-4 text-gray-600">{entry.orderingChannel}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Q</span>
                      </div>
                      <span className="text-gray-700">{entry.pastStatus}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-2xl">
                      <div className="font-medium text-gray-900 mb-2">{entry.reason}</div>
                      <p className="text-sm text-gray-600 leading-relaxed">{entry.description}</p>
                    </div>
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

