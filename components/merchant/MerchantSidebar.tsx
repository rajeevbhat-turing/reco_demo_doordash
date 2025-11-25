"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Home, BarChart2, FileText, Users, Star, MessageSquare, Receipt, Target, Utensils, Clock, DollarSign, Truck, Settings, UserCog, PlusSquare, CreditCard, Building2, Mail, Plug, TrendingUp, Package, CheckCircle } from "lucide-react"
import { DashDoorLogoMark, DashDoorWordMark } from "@/components/common/Icons"
import StoreSelector from "./StoreSelector"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useAllRestaurants } from "@/lib/hooks/use-restaurants"

function NavItem({ href, label, active, icon: Icon, highlightRed, highlightOrange, disabled }: { href: string; label: string; active: boolean; icon: React.ComponentType<any>; highlightRed?: boolean; highlightOrange?: boolean; disabled?: boolean }) {
  const activeClass = highlightOrange && active 
    ? "bg-orange-50 text-orange-900 border-l-2 border-orange-600" 
    : highlightRed && active 
    ? "bg-red-50 text-red-700 border-l-2 border-red-600" 
    : active 
    ? "bg-gray-100 text-gray-900" 
    : "text-gray-700"
  
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : ""
  
  if (disabled || href === "#") {
    return (
      <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${activeClass} ${disabledClass}`}>
        <Icon className="h-4 w-4 mr-2" />
        <span>{label}</span>
      </div>
    )
  }
  
  return (
    <Link href={href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${activeClass}`}>
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
    </Link>
  )
}

export default function MerchantSidebar() {
  const pathname = usePathname()
  const { currentStoreId: contextStoreId } = useCurrentStore()
  const { data: restaurants, isLoading: isLoadingRestaurants } = useAllRestaurants()
  
  // Auto-expand based on current pathname
  const [settingsExpanded, setSettingsExpanded] = useState(pathname?.startsWith("/merchant/settings") || false)
  const [customersExpanded, setCustomersExpanded] = useState(pathname?.startsWith("/merchant/customers") || false)
  const [financialsExpanded, setFinancialsExpanded] = useState(pathname?.startsWith("/merchant/financials") || false)
  const [menuExpanded, setMenuExpanded] = useState(pathname?.startsWith("/merchant/menu") || false)
  const [marketingExpanded, setMarketingExpanded] = useState(pathname?.startsWith("/merchant/marketing") || false)
  const [insightsExpanded, setInsightsExpanded] = useState(pathname?.startsWith("/merchant/insights") || false)
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false)
  
  // Extract store ID from URL if we're on /merchant/store/[id] route
  // This ensures the sidebar shows the correct store even if context hasn't updated yet
  const urlStoreId = useMemo(() => {
    if (pathname?.startsWith('/merchant/store/')) {
      const match = pathname.match(/\/merchant\/store\/([^\/]+)/)
      return match ? match[1] : null
    }
    return null
  }, [pathname])
  
  // Use URL store ID as source of truth if available, otherwise use context
  const effectiveStoreId = urlStoreId || contextStoreId
  
  // Find the current store - prioritize URL param, then context
  const currentStore = useMemo(() => {
    if (!restaurants) return null
    
    // First try to find by URL store ID
    if (urlStoreId) {
      const store = restaurants.find(r => r.id === urlStoreId)
      if (store) return store
    }
    
    // Then try context store ID
    if (contextStoreId) {
      const store = restaurants.find(r => r.id === contextStoreId)
      if (store) return store
    }
    
    // Fallback to first restaurant
    return restaurants[0] || null
  }, [restaurants, urlStoreId, contextStoreId])
  const isSettingsPage = pathname?.startsWith("/merchant/settings") || false
  const isCustomersPage = pathname?.startsWith("/merchant/customers") || false
  const isFinancialsPage = pathname?.startsWith("/merchant/financials") || false
  const isMenuPage = pathname?.startsWith("/merchant/menu") || false
  const isMarketingPage = pathname?.startsWith("/merchant/marketing") || false
  const isInsightsPage = pathname?.startsWith("/merchant/insights") || false

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] border-r border-gray-200 bg-white overflow-y-auto">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center mb-4">
            <DashDoorLogoMark />
            <div className="ml-1">
              <DashDoorWordMark />
            </div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Merchant</div>
          <button
            onClick={() => setIsStoreSelectorOpen(true)}
            className="w-full flex items-end justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
            disabled={isLoadingRestaurants || !currentStore}
          >
            <div className="flex items-end gap-2">
              <div className="text-sm font-medium">
                {isLoadingRestaurants ? 'Loading...' : currentStore?.name || 'No store selected'}
              </div>
              <div className="text-xs text-gray-500 mb-0.5">Store</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 mb-0.5" />
          </button>
        </div>

      <nav className="px-2 space-y-6">
        <div>
          <NavItem href="/merchant" label="Home" icon={Home} active={pathname === "/merchant"} />
          
          {/* Insights Section */}
          <div>
            <button
              onClick={() => setInsightsExpanded(!insightsExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isInsightsPage ? "bg-red-50 text-red-700" : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Insights</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${insightsExpanded ? '' : 'rotate-[-90deg]'}`} />
              </div>
            </button>
            {insightsExpanded && (
              <div className="mt-1 ml-2 space-y-1">
                <NavItem 
                  href="/merchant/insights/optimization-score" 
                  label="Optimization score" 
                  icon={TrendingUp} 
                  active={pathname === "/merchant/insights/optimization-score"}
                  highlightRed={pathname === "/merchant/insights/optimization-score"}
                />
                <NavItem 
                  href="/merchant/insights/sales" 
                  label="Sales" 
                  icon={BarChart2} 
                  active={pathname === "/merchant/insights/sales"}
                  highlightRed={pathname === "/merchant/insights/sales"}
                />
                <NavItem 
                  href="/merchant/insights/product-mix" 
                  label="Product mix" 
                  icon={Package} 
                  active={pathname === "/merchant/insights/product-mix"}
                  highlightRed={pathname === "/merchant/insights/product-mix"}
                />
                <NavItem 
                  href="/merchant/insights/operations-quality" 
                  label="Operations quality" 
                  icon={CheckCircle} 
                  active={pathname === "/merchant/insights/operations-quality"}
                  highlightRed={pathname === "/merchant/insights/operations-quality"}
                />
              </div>
            )}
          </div>
          
          <NavItem href="/merchant/reports" label="Reports" icon={FileText} active={pathname?.startsWith("/merchant/reports") || false} />
          
          {/* Customers Section */}
          <div>
            <button
              onClick={() => setCustomersExpanded(!customersExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isCustomersPage ? "bg-gray-100 text-gray-900" : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>Customers</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${customersExpanded ? '' : 'rotate-[-90deg]'}`} />
              </div>
            </button>
            {customersExpanded && (
              <div className="mt-1 ml-2 space-y-1">
                <NavItem 
                  href="/merchant/customers/insights" 
                  label="Customer Insights" 
                  icon={Users} 
                  active={pathname === "/merchant/customers/insights"}
                  highlightRed={pathname === "/merchant/customers/insights"}
                />
                <NavItem 
                  href="/merchant/customers/ratings-reviews" 
                  label="Ratings & Reviews" 
                  icon={Star} 
                  active={pathname === "/merchant/customers/ratings-reviews"}
                  highlightRed={pathname === "/merchant/customers/ratings-reviews"}
                />
              </div>
            )}
          </div>
          <NavItem href="/merchant/orders" label="Orders" icon={Receipt} active={pathname?.startsWith("/merchant/orders") || false} />
          
          {/* Marketing Section */}
          <div>
            <button
              onClick={() => setMarketingExpanded(!marketingExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isMarketingPage ? "bg-red-50 text-red-700" : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span>Marketing</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${marketingExpanded ? '' : 'rotate-[-90deg]'}`} />
              </div>
            </button>
            {marketingExpanded && (
              <div className="mt-1 ml-2 space-y-1">
                <NavItem 
                  href="/merchant/marketing/run-campaign" 
                  label="Run a campaign" 
                  icon={Target} 
                  active={pathname === "/merchant/marketing/run-campaign"}
                  highlightRed={pathname === "/merchant/marketing/run-campaign"}
                />
                <NavItem 
                  href="/merchant/marketing/campaigns" 
                  label="Campaigns" 
                  icon={Target} 
                  active={pathname === "/merchant/marketing/campaigns" || pathname?.startsWith("/merchant/marketing/campaigns/")}
                  highlightRed={pathname === "/merchant/marketing/campaigns" || pathname?.startsWith("/merchant/marketing/campaigns/")}
                />
                <NavItem 
                  href="/merchant/marketing/loyalty" 
                  label="Loyalty" 
                  icon={Star} 
                  active={pathname === "/merchant/marketing/loyalty"}
                  highlightRed={pathname === "/merchant/marketing/loyalty"}
                />
              </div>
            )}
          </div>
          
          {/* Menu Section */}
          <div>
            <button
              onClick={() => setMenuExpanded(!menuExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isMenuPage ? "bg-red-50 text-red-700" : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Utensils className="h-4 w-4 mr-2" />
                <span>Menu</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${menuExpanded ? '' : 'rotate-[-90deg]'}`} />
              </div>
            </button>
            {menuExpanded && (
              <div className="mt-1 ml-2 space-y-1">
                <NavItem 
                  href="/merchant/menu" 
                  label="Menu Manager" 
                  icon={Utensils} 
                  active={pathname === "/merchant/menu"}
                  highlightRed={pathname === "/merchant/menu"}
                />
                <NavItem 
                  href="/merchant/menu/pricing" 
                  label="Pricing" 
                  icon={DollarSign} 
                  active={pathname === "/merchant/menu/pricing"}
                  highlightRed={pathname === "/merchant/menu/pricing"}
                />
              </div>
            )}
          </div>
          
          <NavItem 
            href="/merchant/store-availability" 
            label="Store Availability" 
            icon={Clock} 
            active={pathname === "/merchant/store-availability"}
            highlightRed={pathname === "/merchant/store-availability"}
          />
          
          {/* Financials Section */}
          <div>
            <button
              onClick={() => setFinancialsExpanded(!financialsExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isFinancialsPage ? "bg-orange-50 text-orange-900" : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Financials</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${financialsExpanded ? '' : 'rotate-[-90deg]'}`} />
              </div>
            </button>
            {financialsExpanded && (
              <div className="mt-1 ml-2 space-y-1">
                <NavItem 
                  href="/merchant/financials/transactions" 
                  label="Transactions" 
                  icon={FileText} 
                  active={pathname === "/merchant/financials/transactions"}
                  highlightOrange={pathname === "/merchant/financials/transactions"}
                />
                <NavItem 
                  href="/merchant/financials/payouts" 
                  label="Payouts" 
                  icon={DollarSign} 
                  active={pathname === "/merchant/financials/payouts"}
                  highlightOrange={pathname === "/merchant/financials/payouts"}
                />
                <NavItem 
                  href="/merchant/financials/statements" 
                  label="Statements" 
                  icon={FileText} 
                  active={pathname === "/merchant/financials/statements"}
                  highlightOrange={pathname === "/merchant/financials/statements"}
                />
              </div>
            )}
          </div>
          <NavItem 
            href="/merchant/request-delivery" 
            label="Request a Delivery" 
            icon={Truck} 
            active={pathname === "/merchant/request-delivery"}
            highlightRed={pathname === "/merchant/request-delivery"}
          />
          
          {/* Settings with expandable submenu */}
          <div>
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${
                isSettingsPage ? "bg-gray-100 text-gray-900" : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
                <ChevronDown className={`h-3 w-3 ml-1.5 transition-transform ${settingsExpanded ? '' : 'rotate-[-90deg]'}`} />
              </div>
            </button>
                {settingsExpanded && (
                  <div className="mt-1 ml-2 space-y-1">
                    <NavItem 
                      href="/merchant/settings/account" 
                      label="Account settings" 
                      icon={UserCog} 
                      active={pathname === "/merchant/settings/account"}
                      highlightRed={pathname === "/merchant/settings/account"}
                    />
                    <NavItem 
                      href="/merchant/settings/pricing" 
                      label="Pricing plans" 
                      icon={DollarSign} 
                      active={pathname === "/merchant/settings/pricing"}
                      highlightRed={pathname === "/merchant/settings/pricing"}
                    />
                    <NavItem 
                      href="/merchant/settings/store" 
                      label="Store settings" 
                      icon={Building2} 
                      active={pathname === "/merchant/settings/store"}
                      highlightRed={pathname === "/merchant/settings/store"}
                    />
                    <NavItem href="/merchant/users" label="Manage Users" icon={Users} active={pathname?.startsWith("/merchant/users") || false} />
                    <NavItem 
                      href="/merchant/settings/store-communications" 
                      label="Store communications" 
                      icon={Mail} 
                      active={pathname === "/merchant/settings/store-communications"}
                      highlightRed={pathname === "/merchant/settings/store-communications"}
                    />
                    <NavItem 
                      href="/merchant/settings/bank-account" 
                      label="Bank account" 
                      icon={CreditCard} 
                      active={pathname === "/merchant/settings/bank-account"}
                      highlightOrange={pathname === "/merchant/settings/bank-account"}
                    />
                    <NavItem href="#" label="Integrations" icon={Plug} active={false} disabled={true} />
                  </div>
                )}
          </div>
          
          <NavItem href="#" label="Add Solutions" icon={PlusSquare} active={false} disabled={true} />
        </div>

        <div className="px-2">
          <div className="rounded-md bg-rose-50 text-rose-700 p-3 text-sm cursor-pointer">Refer a restaurant, get $1,000 →</div>
        </div>

        <div className="px-3 pb-4 mt-auto">
          <button className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Report an Issue</button>
          <div className="mt-3 text-sm text-gray-600">Kyle McCarney ▾</div>
        </div>
      </nav>
      </aside>

      {/* Store Selector */}
      <StoreSelector
        isOpen={isStoreSelectorOpen}
        onClose={() => setIsStoreSelectorOpen(false)}
        restaurants={restaurants || []}
        isLoading={isLoadingRestaurants}
      />
    </>
  )
}


