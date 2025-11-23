'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Check, Edit, X, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BankAccountPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentAccountNumber, setCurrentAccountNumber] = useState("0000000000")
  const [currentRoutingNumber, setCurrentRoutingNumber] = useState("000000000")
  const [newAccountNumber, setNewAccountNumber] = useState("0000000000")
  const [newRoutingNumber, setNewRoutingNumber] = useState("000000000")

  const handleSaveChanges = () => {
    // Here you would save the changes to your store/API
    setCurrentAccountNumber(newAccountNumber)
    setCurrentRoutingNumber(newRoutingNumber)
    setIsEditModalOpen(false)
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank account</h1>
          <p className="text-sm text-gray-600">
            Here is where you will find a summary of your banking information.
          </p>
        </div>

        {/* Bank Account Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Bank account information</h2>
            <p className="text-sm text-gray-600">
              DashDoor only uses your bank account information to deposit payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification Status */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Verified</span>
              </div>
              <p className="text-xs text-gray-600">
                Your bank account information has been reviewed and verified.
              </p>
            </div>

            {/* Bank Account Details */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white relative">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute top-4 right-4 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
              >
                Edit
                <Edit className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Bank account</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Account number: </span>
                  <span className="text-gray-900 font-mono">********0000</span>
                </div>
                <div>
                  <span className="text-gray-500">Routing number: </span>
                  <span className="text-gray-900 font-mono">*****0000</span>
                </div>
                <div>
                  <span className="text-gray-500">Bank name: </span>
                  <span className="text-gray-900">BANK</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Business information</h2>
            <p className="text-sm text-gray-600">
              To process payouts, DashDoor and our payments processing partner, Stripe, are required to collect your business information for compliance and tax purposes.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Verified</span>
            </div>
            <p className="text-xs text-gray-600">
              Your business information has been reviewed and verified.
            </p>
          </div>
        </div>

        {/* Error Message */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Something went wrong. There was an error during authentication.
          </p>
        </div>
      </div>

      {/* Edit Bank Account Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Bank account</DialogTitle>
          </DialogHeader>
          
          {/* Information Banner */}
          <div className="flex items-start gap-2 bg-gray-100 rounded-md p-3 mb-6">
            <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              For your security, payouts to your new account will be delayed by 1 business day.
            </p>
          </div>

          <div className="space-y-6">
            {/* Current Bank Account Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Current bank account info</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-account" className="text-sm text-gray-700 mb-2 block">
                    Current account number
                  </Label>
                  <Input
                    id="current-account"
                    type="text"
                    value={currentAccountNumber}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="current-routing" className="text-sm text-gray-700 mb-2 block">
                    Current routing number
                  </Label>
                  <Input
                    id="current-routing"
                    type="text"
                    value={currentRoutingNumber}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* New Bank Account Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">New bank account info</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-account" className="text-sm text-gray-700 mb-2 block">
                    Account number
                  </Label>
                  <Input
                    id="new-account"
                    type="text"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder="0000000000"
                  />
                </div>
                <div>
                  <Label htmlFor="new-routing" className="text-sm text-gray-700 mb-2 block">
                    Routing number
                  </Label>
                  <Input
                    id="new-routing"
                    type="text"
                    value={newRoutingNumber}
                    onChange={(e) => setNewRoutingNumber(e.target.value)}
                    placeholder="000000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Save changes
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  )
}

