"use client"

import { useState } from "react"
import { ChevronDown, Mail, CreditCard } from "lucide-react"

export default function AccountSettingsPage() {
  const [country, setCountry] = useState("United States")
  const [phoneCountry, setPhoneCountry] = useState("+1 (US)")
  const [receiveUpdates, setReceiveUpdates] = useState(false)

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pt-24">
      {/* Profile Section */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="flex gap-4">
            <button className="text-red-500 font-medium">Change Password</button>
            <button className="text-red-500 font-medium">Manage Account</button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <div className="flex justify-between">
                <input type="text" className="w-full p-3 bg-gray-50 rounded-md" defaultValue="Alex" />
                <div className="text-sm text-gray-500 ml-4 mt-3">Required</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <div className="flex justify-between">
                <input type="text" className="w-full p-3 bg-gray-50 rounded-md" defaultValue="Last" />
                <div className="text-sm text-gray-500 ml-4 mt-3">Required</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 bg-gray-50 rounded-md"
                defaultValue="alex10mail@gmail.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <div className="relative">
                  <select
                    className="w-full p-3 bg-gray-50 rounded-md appearance-none pr-10"
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                  >
                    <option value="+1 (US)">+1 (US)</option>
                    <option value="+44 (UK)">+44 (UK)</option>
                    <option value="+61 (AU)">+61 (AU)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="relative">
                  <input type="tel" className="w-full p-3 bg-gray-50 rounded-md" defaultValue="9823456356" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="#22C55E"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Country</label>
            <div className="relative w-full md:w-1/2">
              <select
                className="w-full p-3 bg-gray-50 rounded-md appearance-none pr-10"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>

          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="receiveUpdates"
              className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
              checked={receiveUpdates}
              onChange={() => setReceiveUpdates(!receiveUpdates)}
            />
            <label htmlFor="receiveUpdates" className="ml-2 text-sm text-gray-700">
              Receive order status updates via text
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg">Save</button>
          </div>
        </div>
      </div>

      {/* Business Profile Section */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Business profile</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">Create a business profile for effortless expensing</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Set a payment method for business orders</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-700" />
              <span className="text-gray-700">Get receipts sent to your work email</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="bg-gray-100 text-gray-700 font-medium py-2 px-6 rounded-lg">Create profile</button>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Privacy</h2>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-2">
            DoorDash protects your privacy and personal information. You can choose to share your information with
            businesses so they can send you promotions and emails.
            <span className="text-red-500 ml-1 font-medium">Learn More</span>
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2">Marketing Choices</h3>
          <p className="text-gray-700">
            Learn about and control personalized ads.
            <span className="text-red-500 ml-1 font-medium">Learn More</span>
          </p>
        </div>
      </div>

      {/* Linked Accounts Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Linked accounts</h2>
        </div>

        <div className="p-6">You are not sharing information with any websites at the moment.</div>
      </div>
    </div>
  )
}
