"use client"

import MerchantLayout from "@/components/merchant/MerchantLayout"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"

type Order = {
  id: string
  status: "Active" | "Delivered" | "Cancelled"
  time: string
  customer: string
  dasher: string
  channel: "DashDoor" | "Pickup" | "Delivery"
  subtotal: string
}

const initialOrders: Order[] = [
  { id: "#10234", status: "Delivered", time: "9:55 PM", customer: "John Doe", dasher: "Mary N.", channel: "DashDoor", subtotal: "$24.56" },
  { id: "#10235", status: "Active", time: "9:40 PM", customer: "Sara L.", dasher: "Kian R.", channel: "Pickup", subtotal: "$18.20" },
  { id: "#10236", status: "Cancelled", time: "9:22 PM", customer: "Ben A.", dasher: "-", channel: "Delivery", subtotal: "$0.00" },
]

export default function MerchantOrdersPage() {
  const [activeTab, setActiveTab] = useState<"Active" | "Scheduled" | "History">("Active")
  const [channel, setChannel] = useState("All Channels")
  const [orderStatus, setOrderStatus] = useState("All")
  const [fulfillment, setFulfillment] = useState("All")
  const [query, setQuery] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const i = setInterval(() => setLastUpdated((d) => d), 1000)
    return () => clearInterval(i)
  }, [])

  const lastUpdatedText = useMemo(() => {
    if (!mounted) return "Last updated just now"
    const seconds = Math.max(1, Math.round((Date.now() - lastUpdated.getTime()) / 1000))
    return `Last updated ${seconds} second${seconds === 1 ? "" : "s"} ago`
  }, [lastUpdated, mounted])

  const filteredOrders = useMemo(() => {
    let rows = initialOrders
    if (activeTab === "Active") {
      rows = rows.filter((r) => r.status === "Active")
    }
    if (activeTab === "History") {
      rows = rows.filter((r) => r.status !== "Active")
    }
    if (channel !== "All Channels") {
      rows = rows.filter((r) => r.channel === (channel as any))
    }
    if (orderStatus !== "All") {
      rows = rows.filter((r) => r.status === (orderStatus as any))
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter((r) =>
        [r.id, r.customer, r.dasher, r.channel].join(" ").toLowerCase().includes(q)
      )
    }
    return rows
  }, [activeTab, channel, orderStatus, query])

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all your orders from every channel in real-time. For even more transaction details, go to
            {" "}
            <Link href="/merchant/transactions" className="text-[#EB1700] underline">Transactions</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{lastUpdatedText}</span>
          <button className="rounded-full bg-[#EB1700] text-white text-sm px-4 py-2">Request a delivery</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-4">
        {["Active", "Scheduled", "History"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 -mb-px text-sm ${activeTab === tab ? "border-b-2 border-[#EB1700] text-gray-900" : "text-gray-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 mb-4">
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-full shadow-sm border border-gray-300 bg-white text-sm px-3 py-1.5">
          <option>All Channels</option>
          <option>DashDoor</option>
          <option>Pickup</option>
          <option>Delivery</option>
        </select>
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="rounded-full shadow-sm border border-gray-300 bg-white text-sm px-3 py-1.5">
          <option>All</option>
          <option>Active</option>
          <option>Delivered</option>
          <option>Cancelled</option>
          <option>Abandoned</option>
        </select>
        <select value={fulfillment} onChange={(e) => setFulfillment(e.target.value)} className="rounded-full shadow-sm border border-gray-300 bg-white text-sm px-3 py-1.5">
          <option>All</option>
          <option>Ready for Pickup</option>
          <option>Picked Up</option>
          <option>In Progress</option>
        </select>

        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders"
            className="pl-9 pr-3 h-9 w-64 rounded-full border border-gray-300 shadow-sm text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24">
          <div className="mb-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl">🛒</div>
          </div>
          <div className="text-lg font-semibold mb-1">No orders found</div>
          <div className="text-sm text-gray-600 mb-6">Try adjusting your search or filters.</div>
          <div className="text-xs text-gray-500">
            Missing an order? <Link href="#" className="text-[#EB1700] underline">Contact us</Link> and a support teammate will help add it to your account.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left font-medium px-3 py-2">Order ID</th>
                <th className="text-left font-medium px-3 py-2">Status</th>
                <th className="text-left font-medium px-3 py-2">Time</th>
                <th className="text-left font-medium px-3 py-2">Customer</th>
                <th className="text-left font-medium px-3 py-2">Dasher</th>
                <th className="text-left font-medium px-3 py-2">Channel</th>
                <th className="text-right font-medium px-3 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((r, i) => (
                <tr key={r.id} className={`border-t hover:bg-gray-50 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">
                    {r.status === 'Delivered' && <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5">Delivered</span>}
                    {r.status === 'Active' && <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5">Active</span>}
                    {r.status === 'Cancelled' && <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 px-2 py-0.5">Cancelled</span>}
                  </td>
                  <td className="px-3 py-2">{r.time}</td>
                  <td className="px-3 py-2">{r.customer}</td>
                  <td className="px-3 py-2">{r.dasher}</td>
                  <td className="px-3 py-2">{r.channel}</td>
                  <td className="px-3 py-2 text-right">{r.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer help text */}
      <div className="text-[12px] text-gray-500 mt-6">
        Missing an order? <Link href="#" className="text-[#EB1700] underline">Contact us</Link> and a support teammate will help add it to your account.
      </div>
    </MerchantLayout>
  )
}


