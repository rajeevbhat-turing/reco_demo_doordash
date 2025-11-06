import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ArrowRight, Lightbulb, Megaphone, TrendingUp } from "lucide-react"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}

function InsightCard({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <div className="text-sm text-gray-500 mb-1">Tips</div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-gray-600 mb-3">{body}</div>
        <button className="inline-flex items-center rounded-full bg-gray-900 text-white text-xs px-3 py-1.5">{cta}</button>
      </div>
      <div className="text-gray-300">
        <Lightbulb className="h-12 w-12" />
      </div>
    </div>
  )
}

export default function MerchantHomePage() {
  return (
    <MerchantLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-2 text-sm text-gray-600">Welcome back, Kyle</div>
          <h1 className="text-2xl font-extrabold mb-4">Today’s overview</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="Sales" value="$0.00" />
            <Stat label="Orders" value="0" />
            <Stat label="Average ticket size" value="$0.00" />
          </div>

          {/* Insights filter tabs */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Insights and actions</h2>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-2 py-1 rounded-full bg-gray-900 text-white">All</button>
              <button className="px-2 py-1 rounded-full border border-gray-300">Growth</button>
              <button className="px-2 py-1 rounded-full border border-gray-300">Tips</button>
              <button className="px-2 py-1 rounded-full border border-gray-300">Announcements</button>
            </div>
          </div>

          <div className="space-y-4">
            <InsightCard title="Manage your business, right from your phone" body="Get the Business Manager app to track your orders, resolve issues, get support and more." cta="Download the app" />

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
              <div>
                <div className="text-sm text-gray-500 mb-1">Announcements</div>
                <div className="font-semibold mb-1">New! See how DashDoor can help grow your business</div>
                <button className="inline-flex items-center rounded-full border border-gray-300 text-xs px-3 py-1.5">View solutions center</button>
              </div>
              <div className="text-gray-300"><Megaphone className="h-12 w-12" /></div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
              <div>
                <div className="text-sm text-gray-500 mb-1">Growth</div>
                <div className="font-semibold mb-1">You missed Most Loved for April</div>
                <button className="inline-flex items-center rounded-full border border-gray-300 text-xs px-3 py-1.5">View performance</button>
              </div>
              <div className="text-gray-300"><TrendingUp className="h-12 w-12" /></div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Sales</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
            <div className="text-2xl font-bold mb-2">$35.62</div>
            {/* tiny sparkline placeholder */}
            <div className="h-16 w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              <div><div className="text-gray-500">Orders</div><div className="font-medium">6</div></div>
              <div><div className="text-gray-500">Avg ticket size</div><div className="font-medium">$5.93</div></div>
              <div></div>
            </div>
            <button className="mt-3 w-full rounded-md border border-gray-300 text-sm py-2">View sales insights</button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
            <div className="font-semibold mb-2">Operations</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Avoidable cancellations rate</span><span>0.0%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Average wait</span><span>0 mins</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Missing & incorrect rate</span><span>0.0%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Downtime</span><span>0.0%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Ratings</span><span>0 / 5</span></div>
            </div>
            <button className="mt-3 w-full rounded-md border border-gray-300 text-sm py-2">View operations insights</button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="font-semibold mb-2">Customers</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">New</span><span>0</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Occasional</span><span>0</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Returning</span><span>0</span></div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}


