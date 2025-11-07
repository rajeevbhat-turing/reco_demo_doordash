"use client"

import { X } from "lucide-react"

interface AddressReviewErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onReviewAddress: () => void
  onEnterNewAddress: () => void
}

export default function AddressReviewErrorModal({
  isOpen,
  onClose,
  onReviewAddress,
  onEnterNewAddress
}: AddressReviewErrorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Content */}
          <div className="mt-6 mb-8">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We can't add this address at the moment
            </h2>
            
            {/* Body Text */}
            <p className="text-gray-900">
              We're currently reviewing the address. Please check for any typos and re-enter your address.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onReviewAddress}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Review address
            </button>
            <button
              onClick={onEnterNewAddress}
              className="w-full py-3 px-6 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Enter new address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

