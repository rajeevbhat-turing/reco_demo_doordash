"use client"

import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  maxWidth?: string
}

export default function Modal({ isOpen, onClose, children, title, maxWidth = "max-w-2xl" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.addEventListener("keydown", handleEscapeKey)
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div ref={dialogRef} className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full ml-auto" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
