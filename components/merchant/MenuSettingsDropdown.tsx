'use client'

import { useRef, useEffect } from "react"
import { Calendar, Pencil, GripVertical, Building2 } from "lucide-react"

interface MenuSettingsDropdownProps {
  isOpen: boolean
  onClose: () => void
  onRearrangeCategories: () => void
}

export default function MenuSettingsDropdown({
  isOpen,
  onClose,
  onRearrangeCategories,
}: MenuSettingsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div 
        ref={dropdownRef}
        className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50"
      >
        <div className="py-1">
          {/* <button
            onClick={onClose}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4 text-gray-500" />
            Edit Menu Hours
          </button> */}
          {/* <button
            onClick={onClose}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Pencil className="h-4 w-4 text-gray-500" />
            Rename Menu
          </button> */}
          <button
            onClick={() => {
              onClose()
              onRearrangeCategories()
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
            Rearrange Categories
          </button>
          {/* <button
            onClick={onClose}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Building2 className="h-4 w-4 text-gray-500" />
            View Linked Store(s)
          </button> */}
        </div>
      </div>
    </>
  )
}

