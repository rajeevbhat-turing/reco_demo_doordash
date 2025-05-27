"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Store, Activity, Gift, Search, FileText, User, PawPrint, Coffee } from "lucide-react"
import AccountPopup from "./account-popup"

export default function Sidebar() {
  const pathname = usePathname()
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false)
  const accountButtonRef = useRef<HTMLButtonElement>(null)

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountButtonRef.current &&
        !accountButtonRef.current.contains(event.target as Node) &&
        !document.getElementById("account-popup")?.contains(event.target as Node)
      ) {
        setIsAccountPopupOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <aside className="fixed top-16 left-0 w-[220px] border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto bg-white z-40 hidden md:block">
      <nav className="py-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                pathname === "/" ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/grocery"
              className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                pathname.startsWith("/grocery")
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              <span>Grocery</span>
            </Link>
          </li>
          <li>
            <Link
              href="/retail"
              className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                pathname.startsWith("/retail")
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Store className="h-5 w-5 mr-3" />
              <span>Retail</span>
            </Link>
          </li>
          <li>
            <Link
              href="/pets"
              className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                pathname.startsWith("/pets") ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <PawPrint className="h-5 w-5 mr-3" />
              <span>Pets</span>
            </Link>
          </li>
          <li>
            <Link
              href="/convenience"
              className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                pathname.startsWith("/convenience") ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Coffee className="h-5 w-5 mr-3"/>
              <span>Convenience</span>
            </Link>
          </li>
          <li>
            <Link
              href="/browse"
              className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                pathname.startsWith("/browse")
                  ? "bg-red-50 text-red-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Search className="h-5 w-5 mr-3" />
              <span>Browse All</span>
            </Link>
          </li>
        </ul>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/orders"
                className={`flex items-center px-4 py-3 rounded-lg mx-2 ${
                  pathname.startsWith("/orders")
                    ? "bg-red-50 text-red-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText className="h-5 w-5 mr-3" />
                <span>Orders</span>
              </Link>
            </li>
            <li className="relative">
              <button
                ref={accountButtonRef}
                className={`flex items-center px-4 py-3 rounded-lg mx-2 w-full text-left ${
                  pathname.startsWith("/account")
                    ? "bg-red-50 text-red-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Account</span>
              </button>

              {/* Account Popup positioned to the right of the sidebar button */}
              {isAccountPopupOpen && (
                <AccountPopup
                  isOpen={isAccountPopupOpen}
                  onClose={() => setIsAccountPopupOpen(false)}
                  anchorElement={accountButtonRef.current}
                />
              )}
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
