"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Home, BarChart2, FileText, Users, Star, MessageSquare, Receipt, Target, Utensils, Clock, DollarSign, Truck, Settings, UserCog, PlusSquare } from "lucide-react"
import { DashDoorLogoMark, DashDoorWordMark } from "@/components/common/Icons"

function NavItem({ href, label, active, icon: Icon }: { href: string; label: string; active: boolean; icon: React.ComponentType<any> }) {
  return (
    <Link href={href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}>
      <Icon className="h-4 w-4 mr-2" />
      <span>{label}</span>
    </Link>
  )
}

export default function MerchantSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] border-r border-gray-200 bg-white overflow-y-auto">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center mb-4">
          <DashDoorLogoMark />
          <div className="ml-1">
            <DashDoorWordMark />
          </div>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Merchant</div>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer">
          <div>
            <div className="text-sm font-medium">Frosty Bear test NCP 🐻🍯</div>
            <div className="text-xs text-gray-500">Store</div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      <nav className="px-2 space-y-6">
        <div>
          <NavItem href="/merchant" label="Home" icon={Home} active={pathname === "/merchant"} />
          <NavItem href="#" label="Insights" icon={BarChart2} active={false} />
          <NavItem href="#" label="Reports" icon={FileText} active={false} />
          <div className="mt-2 ml-2 space-y-1">
            <NavItem href="#" label="Customer Insights" icon={Users} active={false} />
            <NavItem href="#" label="Ratings & Reviews" icon={Star} active={false} />
          </div>
          <NavItem href="/merchant/orders" label="Orders" icon={Receipt} active={pathname?.startsWith("/merchant/orders") || false} />
          <NavItem href="#" label="Marketing" icon={Target} active={false} />
          <NavItem href="#" label="Menu" icon={Utensils} active={false} />
          <NavItem href="#" label="Store Availability" icon={Clock} active={false} />
          <NavItem href="#" label="Financials" icon={DollarSign} active={false} />
          <div className="mt-2 ml-2 space-y-1">
            <NavItem href="#" label="Transactions" icon={FileText} active={false} />
            <NavItem href="#" label="Payouts" icon={DollarSign} active={false} />
            <NavItem href="#" label="Statements" icon={FileText} active={false} />
          </div>
          <NavItem href="#" label="Request a Delivery" icon={Truck} active={false} />
          <NavItem href="#" label="Settings" icon={Settings} active={false} />
          <div className="mt-2 ml-2 space-y-1">
            <NavItem href="#" label="Store Info" icon={FileText} active={false} />
            <NavItem href="#" label="Users / Roles" icon={UserCog} active={false} />
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
  )
}


