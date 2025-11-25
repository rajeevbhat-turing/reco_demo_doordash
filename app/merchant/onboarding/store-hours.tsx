'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, Plus } from "lucide-react"

export default function StoreHoursStep() {
  const router = useRouter()
  const [applyToAllDays, setApplyToAllDays] = useState(true)
  const [allDaysOpen, setAllDaysOpen] = useState('08:00 AM')
  const [allDaysClose, setAllDaysClose] = useState('10:00 PM')

  const handleBack = () => {
    router.push('/merchant/onboarding?step=order-protocol')
  }

  const handleNext = () => {
    // Save to localStorage
    const completedSteps = JSON.parse(localStorage.getItem('merchant.onboarding.completedSteps') || '[]')
    if (!completedSteps.includes('hours')) {
      completedSteps.push('hours')
      localStorage.setItem('merchant.onboarding.completedSteps', JSON.stringify(completedSteps))
    }
    
    // Save hours
    localStorage.setItem('merchant.onboarding.storeHours', JSON.stringify({
      applyToAllDays,
      allDaysOpen,
      allDaysClose
    }))

    router.push('/merchant/onboarding?step=menu')
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
        options.push({ value: time24, label: time12 })
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Set your store hours for The Draft House
      </h1>
      <p className="text-gray-600 mb-8">
        We will accept your last order 20 mins before you close, so that you have enough time to prepare the food. You can always change this later.
      </p>

      {/* Apply same hours toggle */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="text-sm font-medium text-gray-900">
          Apply same store hours to all days
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={applyToAllDays}
            onChange={(e) => setApplyToAllDays(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
        </label>
      </div>

      {/* Time inputs */}
      {applyToAllDays && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-3">All days</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <select
                value={allDaysOpen}
                onChange={(e) => setAllDaysOpen(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-8"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-gray-600">-</span>
            <div className="relative flex-1">
              <select
                value={allDaysClose}
                onChange={(e) => setAllDaysClose(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-8"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md hover:border-gray-400"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        Next
      </button>
    </div>
  )
}

