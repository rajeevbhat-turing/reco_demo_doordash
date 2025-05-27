"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { Heart, Gift, HelpCircle, CreditCard, DollarSign, Settings, Globe } from "lucide-react"

interface AccountPopupProps {
  isOpen: boolean
  onClose: () => void
  anchorElement: HTMLElement | null
}

export default function AccountPopup({ isOpen, onClose, anchorElement }: AccountPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Position the popup next to the anchor element
    if (popupRef.current && anchorElement) {
      const anchorRect = anchorElement.getBoundingClientRect()
      popupRef.current.style.top = `${anchorRect.top}px`
      popupRef.current.style.left = `${anchorRect.right + 10}px`
    }
  }, [anchorElement, isOpen])

  if (!isOpen) return null

  return (
    <div
      id="account-popup"
      ref={popupRef}
      className="fixed z-50 translate-y-[-250px] w-[350px] h-[520px] overflow-y-scroll bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <h2 className="text-base font-semibold mb-4">Account</h2>

        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md text-sm font-medium">
            <Heart className="h-5 w-5 text-gray-700" />
            <span>Saved Stores</span>
          </Link>

          <Link href="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md text-sm font-medium">
            <Gift className="h-5 w-5 text-gray-700" />
            <span>My Rewards</span>
          </Link>

          <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.46687 6.49541C2.37427 6.49796 2.28439 6.53297 2.20807 6.58545C2.13174 6.63793 2.07223 6.71138 2.03671 6.79692C2.00118 6.88247 1.99117 6.97647 2.00787 7.06758C2.02456 7.1587 2.06726 7.24303 2.13081 7.31042L11.7467 16.9121C11.7713 16.9344 11.8013 16.95 11.8337 16.9573C11.8661 16.9645 11.8999 16.9633 11.9317 16.9536C11.9634 16.9439 11.9922 16.9262 12.0151 16.9021C12.0379 16.878 12.0541 16.8483 12.0621 16.8161L12.892 12.8931C12.8987 12.8513 12.9206 12.8135 12.9535 12.7869C12.9865 12.7603 13.028 12.7468 13.0703 12.7491L16.4482 12.7382C16.731 12.7476 17.0064 12.6459 17.2153 12.455C17.4242 12.264 17.5501 11.9989 17.566 11.7163C17.5554 11.4719 17.4498 11.2413 17.2718 11.0735C17.0938 10.9058 16.8573 10.814 16.6127 10.8178L12.9668 10.8287C12.9187 10.8301 12.8708 10.8217 12.826 10.804C12.7812 10.7863 12.7405 10.7597 12.7062 10.7259L11.1288 9.14845C11.087 9.10955 11.058 9.05885 11.0458 9.00309C11.0335 8.94732 11.0385 8.88914 11.0601 8.83628C11.0817 8.78342 11.1188 8.73839 11.1666 8.70717C11.2144 8.67595 11.2706 8.66755 11.3277 8.66904H16.7642C17.1656 8.66904 17.5631 8.74811 17.934 8.90174C18.3049 9.05537 18.6419 9.28055 18.9258 9.56443C19.2097 9.8483 19.4349 10.1853 19.5885 10.5562C19.7421 10.9271 19.8212 11.3246 19.8212 11.7261C19.8212 12.1275 19.7421 12.5251 19.5885 12.896C19.4349 13.2669 19.2097 13.6039 18.9258 13.8877C18.6419 14.1716 18.3049 14.3968 17.934 14.5504C17.5631 14.7041 17.1656 14.7831 16.7642 14.7831V14.7921H14.6049C14.5161 14.7921 14.4394 14.854 14.4205 14.9407L14.0309 16.7332C14.0053 16.8508 14.0949 16.9619 14.2152 16.9619H16.9057L16.9062 16.96C17.5453 16.9427 18.1763 16.8084 18.7678 16.5634C19.4031 16.3003 19.9803 15.9146 20.4665 15.4284C20.9526 14.9422 21.3383 14.365 21.6014 13.7298C21.8646 13.0945 22 12.4137 22 11.7261C22 11.0385 21.8646 10.3577 21.6014 9.72241C21.3805 9.18904 21.0732 8.69659 20.6925 8.26457L20.6294 8.19426C20.5764 8.13627 20.5221 8.07943 20.4665 8.02378C19.9803 7.53759 19.4031 7.15192 18.7678 6.88879C18.2044 6.6554 17.6051 6.52248 16.997 6.49541L16.8032 6.49038C16.7902 6.49028 16.7772 6.49023 16.7642 6.49023L2.46687 6.49541Z"
                fill="#00838a"
              ></path>
            </svg>
            <div className="flex items-center justify-between w-full">
              <span>Velocity Frequent Flyer</span>
              <span className="text-xs font-medium bg-red-500 text-white px-2 py-0.5 rounded">New</span>
            </div>
          </div>

          <Link href="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md text-sm font-medium">
            <HelpCircle className="h-5 w-5 text-gray-700" />
            <span>Help</span>
          </Link>

          <Link href="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md text-sm font-medium">
            <CreditCard className="h-5 w-5 text-gray-700" />
            <span>Gift Card</span>
          </Link>

          <Link href="/" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md text-sm font-medium">
            <DollarSign className="h-5 w-5 text-gray-700" />
            <span>Get $1 in Credits</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link href="/account/settings" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md text-sm font-medium">
            <Settings className="h-5 w-5 text-gray-700" />
            <span>Account Settings</span>
          </Link>

          <div className="mt-4 text-sm font-medium">
            <div className="text-sm font-medium">Account</div>
            <div className="text-sm text-gray-600">Alex</div>
          </div>

          <div className="mt-4 text-sm font-medium">
            <div className="text-sm font-medium">Payment</div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm font-medium">Language</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
