'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Plus, Minus, Info } from "lucide-react"
import Link from "next/link"

interface TimeSlot {
  start: string
  end: string
}

interface DaySchedule {
  day: string
  slots: TimeSlot[]
  closed: boolean
}

export default function EditMenuHoursPage() {
  const [menuHours, setMenuHours] = useState<DaySchedule[]>([
    { day: "Monday", slots: [{ start: "07:00 AM", end: "11:00 AM" }, { start: "01:00 PM", end: "08:00 PM" }], closed: false },
    { day: "Tuesday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
    { day: "Wednesday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
    { day: "Thursday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
    { day: "Friday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
    { day: "Saturday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false },
    { day: "Sunday", slots: [{ start: "07:00 AM", end: "09:00 PM" }], closed: false }
  ])

  const timeOptions = [
    "12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM",
    "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM",
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
    "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
  ]

  const addTimeSlot = (dayIndex: number) => {
    const updated = [...menuHours]
    updated[dayIndex].slots.push({ start: "07:00 AM", end: "09:00 PM" })
    setMenuHours(updated)
  }

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...menuHours]
    if (updated[dayIndex].slots.length > 1) {
      updated[dayIndex].slots.splice(slotIndex, 1)
      setMenuHours(updated)
    }
  }

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    const updated = [...menuHours]
    updated[dayIndex].slots[slotIndex][field] = value
    setMenuHours(updated)
  }

  const toggleClosed = (dayIndex: number) => {
    const updated = [...menuHours]
    updated[dayIndex].closed = !updated[dayIndex].closed
    setMenuHours(updated)
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Link href="/merchant/store-availability" className="text-sm text-gray-600 hover:text-gray-900">
            Store availability
          </Link>
          <span className="text-sm text-gray-600 mx-2">/</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grid Iron Waffle | TEST TEST TEST SSME,</h1>
        </div>

        {/* Open hours card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Open hours for menu</h2>
          <div className="flex items-start gap-2 mb-6">
            <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Hours for the menu "Grid Iron Waffle | TEST TEST TEST SSME,". Hours may be different when shown to customers.
            </p>
          </div>

          {/* Days list */}
          <div className="space-y-4">
            {menuHours.map((schedule, dayIndex) => (
              <div key={schedule.day} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  {/* Day label and closed checkbox */}
                  <div className="w-24 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedule.closed}
                      onChange={() => toggleClosed(dayIndex)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label className="text-sm font-medium text-gray-900 cursor-pointer">
                      {schedule.day}
                    </label>
                  </div>

                  {/* Time slots */}
                  {!schedule.closed && (
                    <div className="flex-1 space-y-2">
                      {schedule.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <select
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-sm text-gray-600">to</span>
                          <select
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-1.5 bg-white text-gray-700"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          {schedule.slots.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                          {slotIndex === schedule.slots.length - 1 && (
                            <button
                              onClick={() => addTimeSlot(dayIndex)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {schedule.closed && (
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">Closed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/merchant/store-availability"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}
