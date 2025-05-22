import Link from "next/link"
import {Home, ShoppingBag, Store, Coffee, Activity, Gift, Search, FileText, User, PawPrint} from "lucide-react"

export default function Sidebar() {
  return (
    <aside className="fixed top-16 left-0 w-[220px] border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto bg-white z-40 hidden md:block">
      <nav className="py-4">
        <ul className="space-y-1">
          <li>
            <Link href="/" className="flex items-center px-4 py-3 active-nav-item rounded-lg mx-2">
              <Home className="h-5 w-5 mr-3"/>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
                href="/grocery"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
            >
              <ShoppingBag className="h-5 w-5 mr-3"/>
              <span>Grocery</span>
            </Link>
          </li>
          <li>
            <Link
                href="/retail"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
            >
              <Store className="h-5 w-5 mr-3"/>
              <span>Retail</span>
            </Link>
          </li>
          <li>
            <Link
                href="/convenience"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
            >
              <Coffee className="h-5 w-5 mr-3"/>
              <span>Convenience</span>
            </Link>
          </li>
          <li>
            <Link
                href="/pets"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
            >
              <PawPrint className="h-5 w-5 mr-3"/>
              <span>Pets</span>
            </Link>
          </li>
          <li>
            <Link
                href="/health"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
            >
              <Activity className="h-5 w-5 mr-3"/>
              <span>Health</span>
            </Link>
          </li>
          <li>
            <Link href="/gifts" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2">
              <Gift className="h-5 w-5 mr-3"/>
              <span>Gifts</span>
            </Link>
          </li>
          <li>
            <Link
                href="/browse"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
            >
              <Search className="h-5 w-5 mr-3"/>
              <span>Browse All</span>
            </Link>
          </li>
        </ul>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <ul className="space-y-1">
            <li>
              <Link
                  href="/orders"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
              >
              <FileText className="h-5 w-5 mr-3" />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg mx-2"
              >
                <User className="h-5 w-5 mr-3" />
                <span>Account</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
