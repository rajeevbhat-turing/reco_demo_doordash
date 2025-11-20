'use client'
import { useState, useMemo, useEffect } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ArrowRight, Lightbulb, Megaphone, TrendingUp, ChevronRight, Star, Sparkles } from "lucide-react"
import SalesChart from "@/components/merchant/SalesChart"
import { useReviewStore } from "@/store/review-store"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useMerchantHomeStore } from "@/store/merchant-home-store"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}

function InsightCard({ title, body, cta, category }: { title: string; body: string; cta: string; category: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">{category}</div>
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

function OperationsReviewCard() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // For now, we'll use a hardcoded store ID - in production this would come from the merchant context
  // Try multiple store IDs to find reviews
  const storeIds = ["philz-coffee", "il-canto-cafe", "peet's-coffee"]
  const { getApprovedReviews } = useReviewStore()
  
  // Get all reviews from any of the stores
  const allReviews = storeIds.flatMap(storeId => getApprovedReviews(storeId))

  // Get recent reviews that need responses (within 7 days, or show recent ones if none are that recent)
  const recentReviews = useMemo(() => {
    const now = new Date()
    
    // First try to get reviews within 7 days
    const reviewsWithin7Days = allReviews
      .filter(review => {
        const reviewDate = new Date(review.timestamp)
        const daysSinceReview = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceReview <= 7 && review.rating >= 4
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
    
    // If we have reviews within 7 days, use those
    if (reviewsWithin7Days.length > 0) {
      return reviewsWithin7Days
    }
    
    // Otherwise, show the 3 most recent 4+ star reviews (even if older)
    return allReviews
      .filter(review => review.rating >= 4)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
  }, [allReviews])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  const getDaysToRespond = (timestamp: string) => {
    const now = new Date()
    const reviewDate = new Date(timestamp)
    const daysSinceReview = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysLeft = 7 - daysSinceReview
    
    // If review is older than 7 days, show 0 days left (expired)
    if (daysLeft <= 0) {
      return 0
    }
    
    return daysLeft
  }

  // Prevent hydration mismatch - only render after mount
  if (!mounted || recentReviews.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Operations</div>
        <div className="font-semibold text-base">Respond to customer reviews to increase visits before it's too late</div>
      </div>
      <div className="space-y-3">
        {recentReviews.map((review) => {
          const daysLeft = getDaysToRespond(review.timestamp)
          return (
            <div
              key={review.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 mb-1">{review.userName}</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(review.timestamp)} {daysLeft > 0 ? `• ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to respond` : '• Response expired'}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MerchantHomePage() {
  const { currentStoreId, currentStoreData } = useCurrentStore()
  const { metrics } = useMerchantHomeStore()
  const [activeFilter, setActiveFilter] = useState("All")

  // Load store-specific metrics when store changes
  useEffect(() => {
    if (currentStoreData?.home) {
      useMerchantHomeStore.getState().setMetrics(currentStoreData.home.metrics)
    }
  }, [currentStoreId, currentStoreData])

  // Sample sales data for the chart
  const salesData = [800, 1200, 950, 1400, 1100, 1600, 1800, 1500, 1700, 1900, 1600, 2000, 1800, 1900]
  
  // Filter logic
  const showGrowth = activeFilter === "All" || activeFilter === "Growth"
  const showOperations = activeFilter === "All" || activeFilter === "Operations"
  const showTips = activeFilter === "All" || activeFilter === "Tips"
  const showAnnouncements = activeFilter === "All" || activeFilter === "Announcements"

  return (
    <MerchantLayout>
      <div className="grid grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-2 text-sm text-gray-600">Welcome back, Kyle</div>
          <h1 className="text-2xl font-extrabold mb-4">Today's overview</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="Gross sales" value={`$${metrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <Stat label="Total orders" value={metrics.totalOrders.toString()} />
            <Stat label="Average ticket size" value={`$${metrics.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          </div>

          {/* Insights filter tabs */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Insights and actions</h2>
            <div className="flex items-center gap-2 text-xs">
              <button 
                onClick={() => setActiveFilter("All")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "All" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter("Growth")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Growth" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Growth
              </button>
              <button 
                onClick={() => setActiveFilter("Operations")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Operations" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Operations
              </button>
              <button 
                onClick={() => setActiveFilter("Tips")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Tips" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Tips
              </button>
              <button 
                onClick={() => setActiveFilter("Announcements")}
                className={`px-2 py-1 rounded-full ${
                  activeFilter === "Announcements" 
                    ? "bg-gray-900 text-white" 
                    : "border border-gray-300"
                }`}
              >
                Announcements
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {showTips && (
              <InsightCard 
                title="Manage your business, right from your phone" 
                body="Get the Business Manager app to track your orders, resolve issues, get support and more." 
                cta="Download the app"
                category="Tips"
              />
            )}

            {showAnnouncements && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Announcements</div>
                  <div className="font-semibold mb-1">New! See how DashDoor can help grow your business</div>
                  <button className="inline-flex items-center rounded-full border border-gray-300 text-xs px-3 py-1.5">View solutions center</button>
                </div>
                <div className="text-gray-300"><Megaphone className="h-12 w-12" /></div>
              </div>
            )}

            {showGrowth && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Growth</div>
                  <div className="font-semibold mb-1">You missed Most Loved for April</div>
                  <button className="inline-flex items-center rounded-full border border-gray-300 text-xs px-3 py-1.5">View performance</button>
                </div>
                <div className="text-gray-300"><TrendingUp className="h-12 w-12" /></div>
              </div>
            )}

            {showOperations && <OperationsReviewCard />}
          </div>
        </div>

        {/* Right rail */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Gross sales</div>
              <select className="text-xs text-gray-500 border-0 bg-transparent cursor-pointer">
                <option>This month</option>
                <option>Last month</option>
                <option>This year</option>
              </select>
            </div>
            <div className="text-2xl font-bold mb-2">$6,035.64</div>
            <div className="mb-3">
              <SalesChart data={salesData} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              <div><div className="text-gray-500">Total orders</div><div className="font-medium">287</div></div>
              <div><div className="text-gray-500">Avg ticket size</div><div className="font-medium">$21.03</div></div>
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
              <div className="flex justify-between"><span className="text-gray-600">Ratings</span><span>4.6/5</span></div>
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
            <button className="mt-3 w-full rounded-md border border-gray-300 text-sm py-2">View customers insights</button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}


