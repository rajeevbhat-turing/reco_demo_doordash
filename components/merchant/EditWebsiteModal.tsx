'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditWebsiteModalProps {
  isOpen: boolean
  onClose: () => void
  currentWebsite: string
  onSave: (website: string) => void
}

export default function EditWebsiteModal({ isOpen, onClose, currentWebsite, onSave }: EditWebsiteModalProps) {
  const [website, setWebsite] = useState(currentWebsite)

  useEffect(() => {
    if (isOpen) {
      setWebsite(currentWebsite)
    }
  }, [isOpen, currentWebsite])

  const handleSave = () => {
    onSave(website)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit website</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="website" className="text-sm font-medium text-gray-900 mb-2 block">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full"
              placeholder="http://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Highlight your website on your DashDoor store page
            </p>
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

