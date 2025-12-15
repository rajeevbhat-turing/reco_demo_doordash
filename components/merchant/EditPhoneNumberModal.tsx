'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditPhoneNumberModalProps {
  isOpen: boolean
  onClose: () => void
  currentPhone: string
  onSave: (phone: string) => void
}

export default function EditPhoneNumberModal({ isOpen, onClose, currentPhone, onSave }: EditPhoneNumberModalProps) {
  const [phone, setPhone] = useState(currentPhone)

  useEffect(() => {
    if (isOpen) {
      setPhone(currentPhone)
    }
  }, [isOpen, currentPhone])

  const handleSave = () => {
    onSave(phone)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit phone number</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-900 mb-2 block">
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(000) 000-0000"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This phone number is used to send or confirm orders and verify your store is open
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

