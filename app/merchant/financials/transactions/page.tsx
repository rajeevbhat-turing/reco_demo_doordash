'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ChevronDown, Info } from "lucide-react"

interface Transaction {
  transactionId: string
  date: string
  time: string
  orderId: string
  channel: string
  transactionType: string
  description: string
  subtotal: string
  tax: string
  customerFees: string
  taxCustomerFees: string
  totalTips: string
  commission: string
  merchantFees: string
  taxMerchantFees: string
  errorCharges: string
}

const mockTransactions: Transaction[] = [
  {
    transactionId: "13190595786",
    date: "4/22/2025",
    time: "11:18 PM",
    orderId: "87C36FE2",
    channel: "Marketplace",
    transactionType: "Order",
    description: "",
    subtotal: "$5.00",
    tax: "$0.51",
    customerFees: "$0.30",
    taxCustomerFees: "$0.03",
    totalTips: "$0.00",
    commission: "-$0.30",
    merchantFees: "$0.00",
    taxMerchantFees: "$0.00",
    errorCharges: "$0.00"
  },
  {
    transactionId: "13190580270",
    date: "4/22/2025",
    time: "11:12 PM",
    orderId: "0A5B17C0",
    channel: "Marketplace",
    transactionType: "Order",
    description: "",
    subtotal: "$5.87",
    tax: "$0.60",
    customerFees: "$0.30",
    taxCustomerFees: "$0.03",
    totalTips: "$0.00",
    commission: "-$0.35",
    merchantFees: "$0.00",
    taxMerchantFees: "$0.00",
    errorCharges: "$0.00"
  },
  {
    transactionId: "13187852274",
    date: "4/22/2025",
    time: "5:06 PM",
    orderId: "0FCCB375",
    channel: "Marketplace",
    transactionType: "Order",
    description: "",
    subtotal: "$10.18",
    tax: "$1.03",
    customerFees: "$0.30",
    taxCustomerFees: "$0.04",
    totalTips: "$0.00",
    commission: "-$0.61",
    merchantFees: "$0.00",
    taxMerchantFees: "$0.00",
    errorCharges: "$0.00"
  },
  {
    transactionId: "13165642736",
    date: "4/20/2025",
    time: "4:03 AM",
    orderId: "",
    channel: "",
    transactionType: "Fee",
    description: "Tablet fee",
    subtotal: "$0.00",
    tax: "$0.00",
    customerFees: "$0.00",
    taxCustomerFees: "$0.00",
    totalTips: "$0.00",
    commission: "$0.00",
    merchantFees: "-$6.00",
    taxMerchantFees: "$0.00",
    errorCharges: "$0.00"
  }
]

export default function TransactionsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 7 days")
  const [selectedChannel, setSelectedChannel] = useState("All channels")
  const [selectedTransactionType, setSelectedTransactionType] = useState("All transaction types")

  // Calculate summary values
  const netTotal = "$16.93"
  const sales = "$24.19"
  const commissionAndFees = "-$7.26"
  const subtotal = "$21.05"
  const taxSubtotal = "$2.14"
  const customerFees = "$0.90"
  const taxCustomerFees = "$0.10"
  const marketingSpend = "$0.00"
  const amendments = "$0.00"

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-sm text-gray-600 mb-4">
            All charges from all orders, campaigns, fees, and adjustments associated with your DashDoor account. To track real-time orders, go to{" "}
            <a href="/merchant/orders" className="text-blue-600 hover:underline">Orders</a>.
          </p>
          
          {/* Filters */}
          <div className="flex items-center gap-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <select 
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
            >
              <option>All channels</option>
              <option>Marketplace</option>
              <option>Drive</option>
            </select>
          </div>
        </div>

        {/* Information Banner */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-semibold">Introducing a new metric - marketing spend.</span> To help you better track and understand your marketing efforts, we're unveiling a new metric--marketing spend. This number represents the total you paid to DashDoor to run marketing after marketing credits and third-party contributions have been deducted. You'll also be downloaded reports.
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Net total</div>
            <div className="text-3xl font-bold text-gray-900">{netTotal}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Sales</div>
            <div className="text-3xl font-bold text-gray-900">{sales}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Commission & fees</div>
            <div className="text-3xl font-bold text-red-600">{commissionAndFees}</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Income/Revenue */}
            <div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900">{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax (subtotal)</span>
                  <span className="text-sm font-medium text-gray-900">{taxSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer fees</span>
                  <span className="text-sm font-medium text-gray-900">{customerFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax (customer fees)</span>
                  <span className="text-sm font-medium text-gray-900">{taxCustomerFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600"></span>
                  <span className="text-sm font-medium text-gray-900">$0.00</span>
                </div>
              </div>
            </div>

            {/* Right Column - Commission & Fees */}
            <div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commission</span>
                  <span className="text-sm font-medium text-gray-900">-$1.26</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Merchant fees</span>
                  <span className="text-sm font-medium text-gray-900">-$6.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax (merchant fees)</span>
                  <span className="text-sm font-medium text-gray-900">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amendments Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amendments</span>
            <span className="text-sm font-medium text-gray-900">{amendments}</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-600">Error charges</span>
            <span className="text-sm font-medium text-gray-900">$0.00</span>
          </div>
        </div>

        {/* Summary Panels - Second Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Customer Fees Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2">Customer fees</div>
            <div className="text-lg font-semibold text-gray-900 mb-1">{customerFees}</div>
            <div className="text-xs text-gray-500 mb-2">Tax (customer fees)</div>
            <div className="text-sm font-medium text-gray-900 mb-2">{taxCustomerFees}</div>
            <div className="text-xs text-gray-500 mb-1">Total tips</div>
            <div className="text-sm font-medium text-gray-900">$0.00</div>
          </div>

          {/* Marketing Spend Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2">Marketing spend</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{marketingSpend}</div>
            <div className="text-xs text-gray-500 mb-1">Marketing fees & discounts</div>
            <div className="text-sm font-medium text-gray-900">$0.00</div>
          </div>

          {/* Tax Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Tax (merchant fees)</div>
            <div className="text-sm font-medium text-gray-900">$0.00</div>
          </div>

          {/* Amendments Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2">Amendments</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{amendments}</div>
            <div className="text-xs text-gray-500 mb-1">Error charges</div>
            <div className="text-sm font-medium text-gray-900 mb-1">$0.00</div>
            <div className="text-xs text-gray-500 mb-1">Adjustments</div>
            <div className="text-sm font-medium text-gray-900">$0.00</div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{mockTransactions.length} Transactions</h2>
            <select 
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
            >
              <option>All transaction types</option>
              <option>Order</option>
              <option>Fee</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Transaction ID</th>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Date</th>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Time</th>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Order ID</th>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Channel</th>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Transaction type</th>
                  <th className="text-left font-medium px-3 py-2 text-gray-700">Description</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Subtotal</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Tax</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Customer fees</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Tax (customer fees)</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Total tips</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Commission</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Merchant fees</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Tax (merchant fees)</th>
                  <th className="text-right font-medium px-3 py-2 text-gray-700">Error charges</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900">{transaction.transactionId}</td>
                    <td className="px-3 py-2 text-gray-600">{transaction.date}</td>
                    <td className="px-3 py-2 text-gray-600">{transaction.time}</td>
                    <td className="px-3 py-2 text-gray-600">{transaction.orderId || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">{transaction.channel || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">{transaction.transactionType}</td>
                    <td className="px-3 py-2 text-gray-600">{transaction.description || "-"}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.subtotal}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.tax}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.customerFees}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.taxCustomerFees}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.totalTips}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.commission}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.merchantFees}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.taxMerchantFees}</td>
                    <td className="px-3 py-2 text-right font-medium">{transaction.errorCharges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <span className="text-sm text-gray-600">&lt;</span>
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-900 bg-gray-100 rounded">1</span>
            <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <span className="text-sm text-gray-600">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

