'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface EditDescriptionModalProps {
  isOpen: boolean
  onClose: () => void
  currentDescription: string
  onSave: (description: string) => void
}

export default function EditDescriptionModal({ isOpen, onClose, currentDescription, onSave }: EditDescriptionModalProps) {
  const [description, setDescription] = useState(currentDescription)

  useEffect(() => {
    if (isOpen) {
      setDescription(currentDescription)
    }
  }, [isOpen, currentDescription])

  const handleSave = () => {
    onSave(description)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit description</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-900 mb-2 block">
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter store description..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

