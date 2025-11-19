"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Home, BarChart2, FileText, Users, Star, MessageSquare, Receipt, Target, Utensils, Clock, DollarSign, Truck, Settings, UserCog, PlusSquare, CreditCard, Building2, Mail, Plug } from "lucide-react"
import { DashDoorLogoMark, DashDoorWordMark } from "@/components/common/Icons"
import StoreSelector from "./StoreSelector"

function NavItem({ href, label, active, icon: Icon, highlightRed, highlightOrange }: { href: string; label: string; active: boolean; icon: React.ComponentType<any>; highlightRed?: boolean; highlightOrange?: boolean }) {
  const activeClass = highlightOrange && active 
    ? "bg-orange-50 text-orange-900 border-l-2 border-orange-600" 
    : highlightRed && active 
    ? "bg-red-50 text-red-700 border-l-2 border-red-600" 
    : active 
    ? "bg-gray-100 text-gray-900" 
    : "text-gray-700"
  
  return (
    <Link href={href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${activeClass}`}>
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
    </Link>
  )
}

export default function MerchantSidebar() {
  const pathname = usePathname()
  const [settingsExpanded, setSettingsExpanded] = useState(true) // Settings expanded by default
  const [customersExpanded, setCustomersExpanded] = useState(true) // Customers expanded by default
  const [financialsExpanded, setFinancialsExpanded] = useState(true) // Financials expanded by default
  const [menuExpanded, setMenuExpanded] = useState(true) // Menu expanded by default
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined)
  const isSettingsPage = pathname?.startsWith("/merchant/settings") || false
  const isCustomersPage = pathname?.startsWith("/merchant/customers") || false
  const isFinancialsPage = pathname?.startsWith("/merchant/financials") || false
  const isMenuPage = pathname?.startsWith("/merchant/menu") || false

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
          >
            <div className="flex items-end gap-2">
              <div className="text-sm font-medium">Frosty Bear test NCP 🐻🍯</div>
              <div className="text-xs text-gray-500 mb-0.5">Store</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 mb-0.5" />
          </button>
        </div>

      <nav className="px-2 space-y-6">
        <div>
          <NavItem href="/merchant" label="Home" icon={Home} active={pathname === "/merchant"} />
          <NavItem href="#" label="Insights" icon={BarChart2} active={false} />
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
              </div>
              {customersExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
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
          <NavItem href="#" label="Marketing" icon={Target} active={false} />
          
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
              </div>
              {menuExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
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
          
          <NavItem href="#" label="Store Availability" icon={Clock} active={false} />
          
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
              </div>
              {financialsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
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
                <NavItem href="#" label="Payouts" icon={DollarSign} active={false} />
                <NavItem href="#" label="Statements" icon={FileText} active={false} />
              </div>
            )}
          </div>
          <NavItem href="#" label="Request a Delivery" icon={Truck} active={false} />
          
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
              </div>
              {settingsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {settingsExpanded && (
              <div className="mt-1 ml-2 space-y-1">
                <NavItem href="/merchant/settings/account" label="Account settings" icon={UserCog} active={pathname === "/merchant/settings/account"} />
                <NavItem href="/merchant/settings/pricing" label="Pricing plans" icon={DollarSign} active={pathname === "/merchant/settings/pricing"} />
                <NavItem href="/merchant/settings/store" label="Store settings" icon={Building2} active={pathname === "/merchant/settings/store"} />
                <NavItem href="/merchant/users" label="Manage Users" icon={Users} active={pathname?.startsWith("/merchant/users") || false} />
                <NavItem href="/merchant/settings/communications" label="Store communications" icon={Mail} active={pathname === "/merchant/settings/communications"} />
                <NavItem 
                  href="/merchant/settings/bank-account" 
                  label="Bank account" 
                  icon={CreditCard} 
                  active={pathname === "/merchant/settings/bank-account"}
                  highlightOrange={pathname === "/merchant/settings/bank-account"}
                />
                <NavItem href="/merchant/settings/integrations" label="Integrations" icon={Plug} active={pathname === "/merchant/settings/integrations"} />
              </div>
            )}
          </div>
          
          <NavItem href="#" label="Add Solutions" icon={PlusSquare} active={false} />
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
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
      />
    </>
  )
}


