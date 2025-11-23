'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMerchantPersistedState } from "@/lib/hooks/useMerchantPersistedState"

export default function StoreCommunicationsPage() {
  const [storeDeactivationEnabled, setStoreDeactivationEnabled] = useMerchantPersistedState(
    'settings',
    'store-communications',
    'storeDeactivationEnabled',
    false
  )
  const [storeDeactivationEmail, setStoreDeactivationEmail] = useMerchantPersistedState(
    'settings',
    'store-communications',
    'storeDeactivationEmail',
    'vkuchekulla@dashdoor.com'
  )
  const [storePerformanceSummaryEnabled, setStorePerformanceSummaryEnabled] = useMerchantPersistedState(
    'settings',
    'store-communications',
    'storePerformanceSummaryEnabled',
    true
  )
  const [dailyWeeklyAlertsEmail, setDailyWeeklyAlertsEmail] = useMerchantPersistedState(
    'settings',
    'store-communications',
    'dailyWeeklyAlertsEmail',
    'vkuchekulla@dashdoor.com'
  )

  const [isStoreDeactivationModalOpen, setIsStoreDeactivationModalOpen] = useState(false)
  const [isDailyWeeklyModalOpen, setIsDailyWeeklyModalOpen] = useState(false)
  const [tempStoreDeactivationEmail, setTempStoreDeactivationEmail] = useState(storeDeactivationEmail)
  const [tempDailyWeeklyEmail, setTempDailyWeeklyEmail] = useState(dailyWeeklyAlertsEmail)

  const handleSaveStoreDeactivationEmail = () => {
    setStoreDeactivationEmail(tempStoreDeactivationEmail)
    setIsStoreDeactivationModalOpen(false)
  }

  const handleSaveDailyWeeklyEmail = () => {
    setDailyWeeklyAlertsEmail(tempDailyWeeklyEmail)
    setIsDailyWeeklyModalOpen(false)
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store communications</h1>
          <p className="text-sm text-gray-600">
            Manage your preferences around communications about your store
          </p>
        </div>

        {/* Important alerts section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Important alerts</h2>
          
          {/* Store deactivations */}
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">Store deactivations</h3>
              <p className="text-sm text-gray-600 mb-3">
                Manage recipients of email alerts when your store is temporarily deactivated
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">{storeDeactivationEmail}</span>
                <button
                  onClick={() => {
                    setTempStoreDeactivationEmail(storeDeactivationEmail)
                    setIsStoreDeactivationModalOpen(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={storeDeactivationEnabled}
                onChange={(e) => setStoreDeactivationEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 transition-colors ${
                storeDeactivationEnabled ? 'bg-gray-900' : 'bg-gray-200'
              } peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>
        </div>

        {/* Performance reporting section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance reporting</h2>
          
          {/* Store performance summary */}
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">Store performance summary</h3>
              <p className="text-sm text-gray-600">
                Learn about your store's performance and operational efficiency
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={storePerformanceSummaryEnabled}
                onChange={(e) => setStorePerformanceSummaryEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 transition-colors ${
                storePerformanceSummaryEnabled ? 'bg-gray-900' : 'bg-gray-200'
              } peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
          </div>

          {/* Daily & weekly alerts */}
          <div className="flex items-start justify-between py-4">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">Daily & weekly alerts</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-900">
                  {dailyWeeklyAlertsEmail.length > 20 
                    ? `${dailyWeeklyAlertsEmail.substring(0, 20)}...` 
                    : dailyWeeklyAlertsEmail}
                </span>
                <button
                  onClick={() => {
                    setTempDailyWeeklyEmail(dailyWeeklyAlertsEmail)
                    setIsDailyWeeklyModalOpen(true)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Store Deactivation Email Modal */}
        <Dialog open={isStoreDeactivationModalOpen} onOpenChange={setIsStoreDeactivationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit email address</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="store-deactivation-email" className="text-sm font-medium text-gray-900 mb-2 block">
                  Email address
                </Label>
                <Input
                  id="store-deactivation-email"
                  type="email"
                  value={tempStoreDeactivationEmail}
                  onChange={(e) => setTempStoreDeactivationEmail(e.target.value)}
                  className="w-full"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setIsStoreDeactivationModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStoreDeactivationEmail}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Daily & Weekly Alerts Email Modal */}
        <Dialog open={isDailyWeeklyModalOpen} onOpenChange={setIsDailyWeeklyModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit email address</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="daily-weekly-email" className="text-sm font-medium text-gray-900 mb-2 block">
                  Email address
                </Label>
                <Input
                  id="daily-weekly-email"
                  type="email"
                  value={tempDailyWeeklyEmail}
                  onChange={(e) => setTempDailyWeeklyEmail(e.target.value)}
                  className="w-full"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setIsDailyWeeklyModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDailyWeeklyEmail}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Save
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MerchantLayout>
  )
}

