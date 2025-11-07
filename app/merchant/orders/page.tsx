import MerchantLayout from "@/components/merchant/MerchantLayout"

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white">
        <option>All channels</option>
        <option>DashDoor</option>
        <option>Pickup</option>
      </select>
      <select className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white">
        <option>Last 7 days</option>
        <option>Today</option>
        <option>This month</option>
      </select>
      <select className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white">
        <option>Status: All</option>
        <option>Delivered</option>
        <option>Picked Up</option>
        <option>Cancelled</option>
      </select>
    </div>
  )
}

export default function MerchantOrdersPage() {
  return (
    <MerchantLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Orders</h1>
        <button className="rounded-md bg-red-600 text-white text-sm px-4 py-2">Request a Delivery</button>
      </div>

      <p className="text-sm text-gray-600 mb-4">Track all your orders from every channel in real-time.</p>

      <div className="flex items-center gap-3 mb-3 text-sm">
        <button className="px-3 py-1.5 rounded-full bg-gray-900 text-white">Active</button>
        <button className="px-3 py-1.5 rounded-full border border-gray-300">Scheduled</button>
        <button className="px-3 py-1.5 rounded-full border border-gray-300">History</button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <FilterBar />
      </div>

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
            <tr className="border-t">
              <td className="px-3 py-2">#123456</td>
              <td className="px-3 py-2"><span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-2 py-0.5">Delivered</span></td>
              <td className="px-3 py-2">9:55 PM</td>
              <td className="px-3 py-2">John</td>
              <td className="px-3 py-2">Alex</td>
              <td className="px-3 py-2">DashDoor</td>
              <td className="px-3 py-2 text-right">$25.46</td>
            </tr>
            <tr className="border-t bg-gray-50/40">
              <td className="px-3 py-2">#123457</td>
              <td className="px-3 py-2"><span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5">Picked Up</span></td>
              <td className="px-3 py-2">9:12 PM</td>
              <td className="px-3 py-2">Sofia</td>
              <td className="px-3 py-2">Mia</td>
              <td className="px-3 py-2">Pickup</td>
              <td className="px-3 py-2 text-right">$18.20</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MerchantLayout>
  )
}


