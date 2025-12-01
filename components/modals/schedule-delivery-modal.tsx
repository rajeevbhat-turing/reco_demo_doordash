'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X } from 'lucide-react';

interface ScheduleDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTime?: (
    date: string,
    timeType: 'asap' | 'later',
    timeSlot?: string,
    fullDate?: Date,
    timeSlotDisplay?: string
  ) => void;
}

export default function ScheduleDeliveryModal({
  isOpen,
  onClose,
  onSelectTime,
}: ScheduleDeliveryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Generate dates dynamically starting from today
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      let dayLabel;
      if (i === 0) {
        dayLabel = 'TODAY';
      } else if (i === 1) {
        dayLabel = 'TMR';
      } else {
        dayLabel = dayNames[date.getDay()];
      }

      dates.push({
        day: dayLabel,
        date: date.getDate().toString(),
      });
    }

    return dates;
  };

  // Generate time slots in 20-minute increments starting 30 minutes from now (for today)
  const generateTimeSlotsForToday = () => {
    const slots = [];
    const now = new Date();

    // Start 30 minutes from now
    const startTime = new Date(now.getTime() + 30 * 60000);
    // Round to next 20-minute interval
    const minutes = startTime.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 20) * 20;
    startTime.setMinutes(roundedMinutes);
    startTime.setSeconds(0);

    // End at 11 PM (23:00)
    const endTime = new Date(now);
    endTime.setHours(23, 0, 0, 0);

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      const startHours = currentTime.getHours();
      const startMinutes = currentTime.getMinutes();
      const startPeriod = startHours >= 12 ? 'PM' : 'AM';
      const startDisplayHours = startHours % 12 || 12;
      const startDisplayMinutes = startMinutes.toString().padStart(2, '0');

      // Calculate end time (20 minutes later)
      const endTimeSlot = new Date(currentTime.getTime() + 20 * 60000);
      const endHours = endTimeSlot.getHours();
      const endMinutes = endTimeSlot.getMinutes();
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const endDisplayHours = endHours % 12 || 12;
      const endDisplayMinutes = endMinutes.toString().padStart(2, '0');

      slots.push({
        value: `${startHours}:${startDisplayMinutes}`,
        display: `${startDisplayHours}:${startDisplayMinutes} ${startPeriod}-${endDisplayHours}:${endDisplayMinutes} ${endPeriod}`,
      });

      // Add 20 minutes
      currentTime = new Date(currentTime.getTime() + 20 * 60000);
    }

    return slots;
  };

  // Generate time slots for future days (full day from opening to closing)
  const generateTimeSlotsForFutureDay = () => {
    const slots = [];
    const now = new Date();

    // Start at 9 AM (opening time)
    const startTime = new Date(now);
    startTime.setHours(9, 0, 0, 0);

    // End at 11 PM (23:00) (closing time)
    const endTime = new Date(now);
    endTime.setHours(23, 0, 0, 0);

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      const startHours = currentTime.getHours();
      const startMinutes = currentTime.getMinutes();
      const startPeriod = startHours >= 12 ? 'PM' : 'AM';
      const startDisplayHours = startHours % 12 || 12;
      const startDisplayMinutes = startMinutes.toString().padStart(2, '0');

      // Calculate end time (20 minutes later)
      const endTimeSlot = new Date(currentTime.getTime() + 20 * 60000);
      const endHours = endTimeSlot.getHours();
      const endMinutes = endTimeSlot.getMinutes();
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      const endDisplayHours = endHours % 12 || 12;
      const endDisplayMinutes = endMinutes.toString().padStart(2, '0');

      slots.push({
        value: `${startHours}:${startDisplayMinutes}`,
        display: `${startDisplayHours}:${startDisplayMinutes} ${startPeriod}-${endDisplayHours}:${endDisplayMinutes} ${endPeriod}`,
      });

      // Add 20 minutes
      currentTime = new Date(currentTime.getTime() + 20 * 60000);
    }

    return slots;
  };

  const dates = useMemo(() => generateDates(), []);
  const [selectedDate, setSelectedDate] = useState(dates[0].date); // Default to today
  const [selectedTimeType, setSelectedTimeType] = useState<'asap' | 'later'>('asap');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Check if today is selected
  const isToday = selectedDate === dates[0].date;

  // Get appropriate time slots based on whether it's today or a future day
  const timeSlots = useMemo(
    () => (isToday ? generateTimeSlotsForToday() : generateTimeSlotsForFutureDay()),
    [isToday]
  );

  // Get the full date object for the selected date
  const getFullDateForSelectedDate = () => {
    const today = new Date();
    const selectedDateNum = parseInt(selectedDate);
    const todayDateNum = today.getDate();

    const date = new Date(today);
    if (selectedDateNum >= todayDateNum) {
      date.setDate(selectedDateNum);
    } else {
      // Next month
      date.setMonth(today.getMonth() + 1);
      date.setDate(selectedDateNum);
    }

    return date;
  };

  if (!isOpen) return null;

  const handleTimeSlotSelect = (slotValue: string, slotDisplay: string) => {
    setSelectedTimeSlot(slotValue);
    if (onSelectTime) {
      const fullDate = getFullDateForSelectedDate();
      onSelectTime(selectedDate, 'later', slotValue, fullDate, slotDisplay);
    }
    // Don't call onClose() here - the parent handler (handleScheduleTimeSelect) already closes the modal
  };

  const handleAsapSelect = () => {
    if (onSelectTime) {
      const fullDate = getFullDateForSelectedDate();
      onSelectTime(selectedDate, 'asap', '', fullDate);
    }
    // Don't call onClose() here - the parent handler already closes the modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[95vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-6 mt-6">Select a Delivery Date</h2>

        {/* Date Selection */}
        <div className="flex mb-6 bg-gray-100 rounded-full">
          {dates.map(dateObj => (
            <button
              key={dateObj.date}
              onClick={() => {
                setSelectedDate(dateObj.date);
                // Reset time selection when switching dates
                setSelectedTimeType('asap');
                setSelectedTimeSlot('');
              }}
              className={`flex-1 py-1 px-2 rounded-full text-center transition-colors ${
                selectedDate === dateObj.date
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <div className="text-xs font-medium">{dateObj.day}</div>
              <div className="text-md font-bold">{dateObj.date}</div>
            </button>
          ))}
        </div>

        {/* Desired Delivery Time - Only show for today */}
        {isToday && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Desired Delivery Time</h3>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAsapSelect}
                className={`flex-1 py-1 px-4 rounded-full text-sm font-semibold transition-colors ${
                  selectedTimeType === 'asap'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                As soon as possible
              </button>
              <button
                onClick={() => setSelectedTimeType('later')}
                className={`flex-1 py-1 px-4 rounded-full text-sm font-semibold transition-colors ${
                  selectedTimeType === 'later'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Schedule for later
              </button>
            </div>
          </div>
        )}

        {/* Time Slots - Show for today when "Schedule for later" is selected, or always show for future days */}
        {((isToday && selectedTimeType === 'later') || !isToday) && (
          <div className="mb-6">
            {!isToday && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Select a Time</h3>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot.value}
                  onClick={() => handleTimeSlotSelect(slot.value, slot.display)}
                  className={`text-center py-0.5 px-2 rounded-full text-sm font-semibold transition-colors ${
                    selectedTimeSlot === slot.value
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
