"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Home, BarChart2, FileText, Users, Star, MessageSquare, Receipt, Target, Utensils, Clock, DollarSign, Truck, Settings, UserCog, PlusSquare, CreditCard, Building2, Mail, Plug, TrendingUp, Package, CheckCircle } from "lucide-react"
import { DashDoorLogoMark, DashDoorWordMark } from "@/components/common/Icons"
import StoreSelector from "./StoreSelector"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useAllRestaurants } from "@/lib/hooks/use-restaurants"
import { useUserStore } from "@/store/user-store"

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
  
  // Get current user for displaying name
  const currentUser = useUserStore(state => state.currentUser)
  
  // Format user name: FirstName L. (first name + first letter of last name)
  const userDisplayName = useMemo(() => {
    if (!currentUser?.name) return 'User'
    const nameParts = currentUser.name.trim().split(/\s+/)
    if (nameParts.length === 1) return nameParts[0]
    const firstName = nameParts[0]
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  }, [currentUser?.name])

  // Auto-expand based on current pathname
  const [settingsExpanded, setSettingsExpanded] = useState(pathname?.startsWith("/merchant/settings") || false)
  const [customersExpanded, setCustomersExpanded] = useState((pathname?.startsWith("/merchant/store/") && pathname?.includes("/customers")) || pathname?.startsWith("/merchant/customers") || false)
  const [financialsExpanded, setFinancialsExpanded] = useState(pathname?.startsWith("/merchant/financials") || false)
  const [menuExpanded, setMenuExpanded] = useState((pathname?.startsWith("/merchant/store/") && pathname?.includes("/menu")) || pathname?.startsWith("/merchant/menu") || false)
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
  const isSettingsPage = (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings")) || pathname?.startsWith("/merchant/settings") || false
  const isCustomersPage = (pathname?.startsWith("/merchant/store/") && pathname?.includes("/customers")) || pathname?.startsWith("/merchant/customers") || false
  const isFinancialsPage = (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials")) || pathname?.startsWith("/merchant/financials") || false
  const isMenuPage = pathname?.startsWith("/merchant/store/") && pathname?.includes("/menu") || pathname?.startsWith("/merchant/menu") || false
  const isOrdersPage = pathname?.startsWith("/merchant/store/") && pathname?.includes("/orders") || pathname?.startsWith("/merchant/orders") || false
  const isMarketingPage = (pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing")) || pathname?.startsWith("/merchant/marketing") || false
  const isInsightsPage = (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights")) || pathname?.startsWith("/merchant/insights") || false
  
  // Build menu URLs with store ID
  const menuManagerUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/menu` : '/merchant/menu'
  const menuPricingUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/menu/pricing` : '/merchant/menu/pricing'
  // Build orders URL with store ID
  const ordersUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/orders` : '/merchant/orders'
  // Build customer URLs with store ID
  const customersInsightsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/customers/insights` : '/merchant/customers/insights'
  const customersRatingsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/customers/ratings-reviews` : '/merchant/customers/ratings-reviews'
  // Build financials URLs with store ID
  const financialsTransactionsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/financials/transactions` : '/merchant/financials/transactions'
  const financialsPayoutsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/financials/payouts` : '/merchant/financials/payouts'
  const financialsStatementsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/financials/statements` : '/merchant/financials/statements'
  // Build insights URLs with store ID
  const insightsOptimizationUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/insights/optimization-score` : '/merchant/insights/optimization-score'
  const insightsSalesUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/insights/sales` : '/merchant/insights/sales'
  const insightsProductMixUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/insights/product-mix` : '/merchant/insights/product-mix'
  const insightsOperationsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/insights/operations-quality` : '/merchant/insights/operations-quality'
  // Build reports URL with store ID
  const reportsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/reports` : '/merchant/reports'
  // Build marketing URLs with store ID
  const marketingRunCampaignUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/marketing/run-campaign` : '/merchant/marketing/run-campaign'
  const marketingCampaignsUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/marketing/campaigns` : '/merchant/marketing/campaigns'
  const marketingLoyaltyUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/marketing/loyalty` : '/merchant/marketing/loyalty'
  // Build settings URLs with store ID
  const settingsAccountUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/settings/account` : '/merchant/settings/account'
  const settingsPricingUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/settings/pricing` : '/merchant/settings/pricing'
  const settingsStoreUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/settings/store` : '/merchant/settings/store'
  const settingsStoreCommUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/settings/store-communications` : '/merchant/settings/store-communications'
  const settingsBankUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/settings/bank-account` : '/merchant/settings/bank-account'
  const usersUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}/users` : '/merchant/users'

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
          <NavItem href={effectiveStoreId ? `/merchant/store/${effectiveStoreId}` : '/merchant'} label="Home" icon={Home} active={pathname === (effectiveStoreId ? `/merchant/store/${effectiveStoreId}` : '/merchant') || pathname === '/merchant'} />
          
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
                  href={insightsOptimizationUrl} 
                  label="Optimization score" 
                  icon={TrendingUp} 
                  active={pathname === insightsOptimizationUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/optimization-score"))}
                  highlightRed={pathname === insightsOptimizationUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/optimization-score"))}
                />
                <NavItem 
                  href={insightsSalesUrl} 
                  label="Sales" 
                  icon={BarChart2} 
                  active={pathname === insightsSalesUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/sales"))}
                  highlightRed={pathname === insightsSalesUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/sales"))}
                />
                <NavItem 
                  href={insightsProductMixUrl} 
                  label="Product mix" 
                  icon={Package} 
                  active={pathname === insightsProductMixUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/product-mix"))}
                  highlightRed={pathname === insightsProductMixUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/product-mix"))}
                />
                <NavItem 
                  href={insightsOperationsUrl} 
                  label="Operations quality" 
                  icon={CheckCircle} 
                  active={pathname === insightsOperationsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/operations-quality"))}
                  highlightRed={pathname === insightsOperationsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/insights/operations-quality"))}
                />
              </div>
            )}
          </div>
          
          <NavItem href={reportsUrl} label="Reports" icon={FileText} active={pathname === reportsUrl || pathname?.startsWith("/merchant/store/") && pathname?.includes("/reports") || pathname?.startsWith("/merchant/reports") || false} />
          
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
                  href={customersInsightsUrl} 
                  label="Customer Insights" 
                  icon={Users} 
                  active={pathname === customersInsightsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.endsWith("/customers/insights"))}
                  highlightRed={pathname === customersInsightsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.endsWith("/customers/insights"))}
                />
                <NavItem 
                  href={customersRatingsUrl} 
                  label="Ratings & Reviews" 
                  icon={Star} 
                  active={pathname === customersRatingsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/customers/ratings-reviews"))}
                  highlightRed={pathname === customersRatingsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/customers/ratings-reviews"))}
                />
              </div>
            )}
          </div>
          <NavItem href={ordersUrl} label="Orders" icon={Receipt} active={isOrdersPage} />
          
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
                  href={marketingRunCampaignUrl} 
                  label="Run a campaign" 
                  icon={Target} 
                  active={pathname === marketingRunCampaignUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing/run-campaign"))}
                  highlightRed={pathname === marketingRunCampaignUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing/run-campaign"))}
                />
                <NavItem 
                  href={marketingCampaignsUrl} 
                  label="Campaigns" 
                  icon={Target} 
                  active={pathname === marketingCampaignsUrl || pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing/campaigns") || pathname?.startsWith("/merchant/marketing/campaigns")}
                  highlightRed={pathname === marketingCampaignsUrl || pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing/campaigns") || pathname?.startsWith("/merchant/marketing/campaigns")}
                />
                <NavItem 
                  href={marketingLoyaltyUrl} 
                  label="Loyalty" 
                  icon={Star} 
                  active={pathname === marketingLoyaltyUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing/loyalty"))}
                  highlightRed={pathname === marketingLoyaltyUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/marketing/loyalty"))}
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
                  href={menuManagerUrl} 
                  label="Menu Manager" 
                  icon={Utensils} 
                  active={pathname === menuManagerUrl || (pathname?.startsWith("/merchant/store/") && pathname?.endsWith("/menu") && !pathname?.includes("/menu/pricing"))}
                  highlightRed={pathname === menuManagerUrl || (pathname?.startsWith("/merchant/store/") && pathname?.endsWith("/menu") && !pathname?.includes("/menu/pricing"))}
                />
                <NavItem 
                  href={menuPricingUrl} 
                  label="Pricing" 
                  icon={DollarSign} 
                  active={pathname === menuPricingUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/menu/pricing"))}
                  highlightRed={pathname === menuPricingUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/menu/pricing"))}
                />
              </div>
            )}
          </div>
          
          <NavItem 
            href={effectiveStoreId ? `/merchant/store/${effectiveStoreId}/store-availability` : '/merchant/store-availability'} 
            label="Store Availability" 
            icon={Clock} 
            active={pathname === (effectiveStoreId ? `/merchant/store/${effectiveStoreId}/store-availability` : '/merchant/store-availability') || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/store-availability"))}
            highlightRed={pathname === (effectiveStoreId ? `/merchant/store/${effectiveStoreId}/store-availability` : '/merchant/store-availability') || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/store-availability"))}
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
                  href={financialsTransactionsUrl} 
                  label="Transactions" 
                  icon={FileText} 
                  active={pathname === financialsTransactionsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials/transactions"))}
                  highlightOrange={pathname === financialsTransactionsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials/transactions"))}
                />
                <NavItem 
                  href={financialsPayoutsUrl} 
                  label="Payouts" 
                  icon={DollarSign} 
                  active={pathname === financialsPayoutsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials/payouts"))}
                  highlightOrange={pathname === financialsPayoutsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials/payouts"))}
                />
                <NavItem 
                  href={financialsStatementsUrl} 
                  label="Statements" 
                  icon={FileText} 
                  active={pathname === financialsStatementsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials/statements"))}
                  highlightOrange={pathname === financialsStatementsUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/financials/statements"))}
                />
              </div>
            )}
          </div>
          <NavItem 
            href={effectiveStoreId ? `/merchant/store/${effectiveStoreId}/request-delivery` : '/merchant/request-delivery'} 
            label="Request a Delivery" 
            icon={Truck} 
            active={pathname === (effectiveStoreId ? `/merchant/store/${effectiveStoreId}/request-delivery` : '/merchant/request-delivery') || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/request-delivery"))}
            highlightRed={pathname === (effectiveStoreId ? `/merchant/store/${effectiveStoreId}/request-delivery` : '/merchant/request-delivery') || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/request-delivery"))}
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
                      href={settingsAccountUrl} 
                      label="Account settings" 
                      icon={UserCog} 
                      active={pathname === settingsAccountUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/account"))}
                      highlightRed={pathname === settingsAccountUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/account"))}
                    />
                    <NavItem 
                      href={settingsPricingUrl} 
                      label="Pricing plans" 
                      icon={DollarSign} 
                      active={pathname === settingsPricingUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/pricing"))}
                      highlightRed={pathname === settingsPricingUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/pricing"))}
                    />
                    <NavItem 
                      href={settingsStoreUrl} 
                      label="Store settings" 
                      icon={Building2} 
                      active={pathname === settingsStoreUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/store"))}
                      highlightRed={pathname === settingsStoreUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/store"))}
                    />
                    <NavItem href={usersUrl} label="Manage Users" icon={Users} active={pathname === usersUrl || pathname?.startsWith("/merchant/store/") && pathname?.includes("/users") || pathname?.startsWith("/merchant/users") || false} />
                    <NavItem 
                      href={settingsStoreCommUrl} 
                      label="Store communications" 
                      icon={Mail} 
                      active={pathname === settingsStoreCommUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/store-communications"))}
                      highlightRed={pathname === settingsStoreCommUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/store-communications"))}
                    />
                    <NavItem 
                      href={settingsBankUrl} 
                      label="Bank account" 
                      icon={CreditCard} 
                      active={pathname === settingsBankUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/bank-account"))}
                      highlightOrange={pathname === settingsBankUrl || (pathname?.startsWith("/merchant/store/") && pathname?.includes("/settings/bank-account"))}
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
          <div className="mt-3 text-sm text-gray-600">{userDisplayName} ▾</div>
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


