'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Pencil, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LunchSpecialsPage() {
  const router = useRouter()

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lunch Special discount</h1>
              <p className="text-sm text-gray-600">
                Attract more customers with a discount when they order between 11am - 2pm local time.
              </p>
            </div>

            {/* Stores */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Stores</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">Frosty Bear test NCP</div>
                <div className="text-sm text-gray-700">Mama Carpino's Italian, Caviar Test Store</div>
                <div className="text-sm text-gray-700">DSD test store</div>
                <div className="text-sm text-gray-700">Doyensec test store 3</div>
                <div className="text-sm text-gray-700">Doyensec test store 1</div>
                <div className="text-sm text-gray-700">Botong Test Store1</div>
                <div className="text-sm text-gray-700">2251799825966939 Test</div>
              </div>
            </div>

            {/* Customer incentive */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Customer incentive</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">Discount select items</div>
                <div className="text-lg font-semibold text-gray-900">30% off for select items</div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Items (71)</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {/* Item 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                    <img src="/placeholder.jpg" alt="Waffles" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">Medium Platter of Chocolate Dipped Mini Waffles 30</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Most ordered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">$6.79</span>
                      <span className="text-sm font-semibold text-gray-900">$4.75</span>
                    </div>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                    <img src="/placeholder.jpg" alt="Waffles" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">Small Platter of Chocolate Dipped Mini Waffles 20</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Most ordered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">$4.99</span>
                      <span className="text-sm font-semibold text-gray-900">$3.49</span>
                    </div>
                  </div>
                </div>
                {/* Item 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                    <img src="/placeholder.jpg" alt="Pancakes" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">Apple Pie Pancakes for 10</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">Most ordered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">$9.69</span>
                      <span className="text-sm font-semibold text-gray-900">$6.78</span>
                    </div>
                  </div>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:underline inline-block">
                  Show 68 more
                </a>
              </div>
            </div>

            {/* Target audience */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Target audience</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">All customers</div>
            </div>

            {/* Campaign length */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Campaign length</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">Starts on 04/23/2025, keep it going</div>
            </div>

            {/* Scheduling */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Scheduling</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">Lunch specials period, 11am - 2pm daily</div>
            </div>

            {/* Average weekly budget */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Average weekly budget</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-gray-700">No cap on average weekly budget</div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Preview</h3>
              <p className="text-xs text-gray-500 mb-4">For illustrative purposes only. Subject to change.</p>
              <div className="w-full bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                <div className="w-32 h-56 bg-white rounded-lg p-3 flex flex-col gap-2">
                  <div className="text-xs font-semibold mb-1">Lunch specials</div>
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="text-xs text-gray-600">Frosty Bear</div>
                </div>
              </div>
            </div>

            {/* Sales and cost estimate */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Sales and cost estimate</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. weekly sales</div>
                  <div className="text-lg font-semibold text-gray-900">--</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. return on promo spend</div>
                  <div className="text-lg font-semibold text-gray-900">--</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Est. weekly cost</div>
                  <div className="text-lg font-semibold text-gray-900">--</div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-600">
                  We currently don't have historical estimates for this promotion. To see an estimate, try selecting a different discount amount, store list, or audience.
                </p>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Marketing fee paid to DoorDash</div>
                  <div className="text-lg font-semibold text-gray-900">$0.00</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total cost per order</div>
                  <div className="text-lg font-semibold text-gray-900">$1.37 - $15.00</div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-gray-700">
                  No marketing fee for a limited time. You pay only if your discount leads to an order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}

