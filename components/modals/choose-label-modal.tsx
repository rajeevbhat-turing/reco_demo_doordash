"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface ChooseLabelModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (label: string) => void
  currentLabel?: string
}

export default function ChooseLabelModal({ 
  isOpen, 
  onClose,
  onSave,
  currentLabel
}: ChooseLabelModalProps) {
  const labels = ["None", "Home", "Work", "Custom"]
  const standardLabels = ["none", "home", "work"]
  
  // Determine initial selected label and custom text
  const normalizedLabel = currentLabel?.toLowerCase() || "none"
  const isCustomLabel = currentLabel && !standardLabels.includes(normalizedLabel)
  const initialLabel = isCustomLabel ? "Custom" : (currentLabel ? currentLabel.charAt(0).toUpperCase() + currentLabel.slice(1).toLowerCase() : "None")
  const [selectedLabel, setSelectedLabel] = useState(initialLabel)
  const [customLabelText, setCustomLabelText] = useState(isCustomLabel ? currentLabel : "")

  // Reset state when modal opens with new label
  useEffect(() => {
    if (isOpen) {
      const normalized = currentLabel?.toLowerCase() || "none"
      const isCustom = currentLabel && !standardLabels.includes(normalized)
      const label = isCustom ? "Custom" : (currentLabel ? currentLabel.charAt(0).toUpperCase() + currentLabel.slice(1).toLowerCase() : "None")
      setSelectedLabel(label)
      setCustomLabelText(isCustom ? currentLabel : "")
    }
  }, [isOpen, currentLabel])

  if (!isOpen) return null

  const handleSave = () => {
    // If Custom is selected, save the custom text (maintaining case)
    // Otherwise save the selected label in lowercase
    const labelToSave = selectedLabel === "Custom" ? customLabelText : selectedLabel.toLowerCase()
    onSave(labelToSave)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-2xl w-full max-w-sm mx-4">
        <div className="p-6">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label="Close modal"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-6">
            Choose label
          </h2>

          {/* Label Options */}
          <div className="flex gap-3 mb-4">
            {labels.map((label) => (
              <button
                key={label}
                onClick={() => setSelectedLabel(label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedLabel === label
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Privacy Text */}
          <p className={`text-sm text-gray-500 ${selectedLabel === "Custom" ? "mb-4" : "mb-6"}`}>
            Only you can see this
          </p>

          {/* Custom Label Input - Only shown when Custom is selected */}
          {selectedLabel === "Custom" && (
            <div className="mb-6">
              <input
                type="text"
                value={customLabelText}
                onChange={(e) => setCustomLabelText(e.target.value)}
                placeholder="Enter custom label"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                autoFocus
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

