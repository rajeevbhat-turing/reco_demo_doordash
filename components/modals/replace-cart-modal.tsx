"use client"

import React from "react"

interface ReplaceCartModalProps {
  isOpen: boolean
  onCancel: () => void
  onReplace: () => void
  sourceType: "restaurant" | "store"
}

export default function ReplaceCartModal({
  isOpen,
  onCancel,
  onReplace,
  sourceType
}: ReplaceCartModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">
            Replace Cart Items?
          </h2>
          
          <p className="text-gray-600 mb-2">
            Your cart already contains items from another {sourceType}.
          </p>
          
          <p className="text-gray-600 mb-6">
            Would you like to replace them?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={onReplace}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
            >
              Replace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 