'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Clock, Calendar } from 'lucide-react';

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
  /** Restaurant opening hour (0-23). If provided, time slots will be filtered to restaurant hours. */
  restaurantOpeningHour?: number | string | null;
  /** Restaurant closing hour (0-23). If provided, time slots will be filtered to restaurant hours. */
  restaurantClosingHour?: number | string | null;
  /** Whether the restaurant is currently closed. Shows a helpful message if true. */
  isRestaurantClosed?: boolean;
  /** Restaurant name for display in messages */
  restaurantName?: string;
}

export default function ScheduleDeliveryModal({
  isOpen,
  onClose,
  onSelectTime,
  restaurantOpeningHour,
  restaurantClosingHour,
  isRestaurantClosed = false,
  restaurantName,
}: ScheduleDeliveryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Parse hours to ensure they're numbers (handles integers, integer strings, and ISO date strings)
  // Returns { value, isValid } to distinguish between 0 (midnight) and invalid values
  const parseHourValue = (hourValue: number | string | undefined | null): { value: number; isValid: boolean } => {
    if (hourValue === null || hourValue === undefined) {
      return { value: 0, isValid: false };
    }

    // If it's already a number, validate it's in valid range
    if (typeof hourValue === 'number') {
      // If it's a valid hour (0-23), return it
      if (hourValue >= 0 && hourValue <= 23) {
        return { value: hourValue, isValid: true };
      }
      // Otherwise invalid (values like 2025)
      return { value: 0, isValid: false };
    }

    // If it's a string, try to parse it
    if (typeof hourValue === 'string') {
      // Try parsing as ISO date string (e.g., "2025-11-12T08:44:00-07:30")
      const isoTimeMatch = hourValue.match(/T(\d{2}):/);
      if (isoTimeMatch) {
        const hour = parseInt(isoTimeMatch[1], 10);
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          return { value: hour, isValid: true };
        }
      }

      // Try parsing as simple integer string
      const parsed = parseInt(hourValue, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) {
        return { value: parsed, isValid: true };
      }

      // Try parsing as full Date string
      try {
        const date = new Date(hourValue);
        if (!isNaN(date.getTime())) {
          const hour = date.getHours();
          if (hour >= 0 && hour <= 23) {
            return { value: hour, isValid: true };
          }
        }
      } catch (_e) {
        // Ignore parsing errors
      }
    }

    return { value: 0, isValid: false };
  };
  
  // Parse and validate opening/closing hours, use defaults if invalid
  const parsedOpening = parseHourValue(restaurantOpeningHour);
  const parsedClosing = parseHourValue(restaurantClosingHour);
  
  // Use parsed values if valid, otherwise use sensible defaults
  const openingHour = parsedOpening.isValid ? parsedOpening.value : 9; // Default 9 AM
  const closingHour = parsedClosing.isValid ? parsedClosing.value : 23; // Default 11 PM
  
  // Format hour for display (e.g., 9 -> "9:00 AM", 22 -> "10:00 PM")
  const formatHourDisplay = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };
  
  // Get formatted hours string using validated values
  const formattedHours = `${formatHourDisplay(openingHour)} - ${formatHourDisplay(closingHour)}`;

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

  // Helper to check if an hour is within restaurant operating hours
  const isWithinOperatingHours = (hour: number, opening: number, closing: number): boolean => {
    // Handle overnight hours (e.g., 10 PM to 2 AM: closing=2, opening=22)
    if (closing < opening) {
      return hour >= opening || hour < closing;
    }
    return hour >= opening && hour < closing;
  };

  // Generate time slots in 20-minute increments starting 30 minutes from now (for today)
  const generateTimeSlotsForToday = (opening: number, closing: number) => {
    const slots: { value: string; display: string }[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Determine start time
    let startTime: Date;
    
    // If restaurant is currently closed and will open later today
    if (!isWithinOperatingHours(currentHour, opening, closing) && currentHour < opening) {
      // Start from restaurant opening time
      startTime = new Date(now);
      startTime.setHours(opening, 0, 0, 0);
    } else if (!isWithinOperatingHours(currentHour, opening, closing)) {
      // Restaurant is closed and won't open again today - return empty slots
      return [];
    } else {
      // Restaurant is open - start 30 minutes from now
      startTime = new Date(now.getTime() + 30 * 60000);
      // Round to next 20-minute interval
      const minutes = startTime.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 20) * 20;
      startTime.setMinutes(roundedMinutes);
      startTime.setSeconds(0);
    }

    // Determine end time based on restaurant closing hour
    const endTime = new Date(now);
    // Handle overnight closing (e.g., 2 AM)
    if (closing < opening) {
      // Restaurant closes after midnight - for today, use midnight as end
      endTime.setHours(23, 59, 0, 0);
    } else {
      endTime.setHours(closing, 0, 0, 0);
    }

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
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
  const generateTimeSlotsForFutureDay = (opening: number, closing: number) => {
    const slots: { value: string; display: string }[] = [];
    const now = new Date();

    // Start at restaurant opening time
    const startTime = new Date(now);
    startTime.setHours(opening, 0, 0, 0);

    // End at restaurant closing time
    const endTime = new Date(now);
    // Handle overnight closing (e.g., 2 AM)
    if (closing < opening) {
      // For overnight restaurants, show slots until midnight for future days
      endTime.setHours(23, 59, 0, 0);
    } else {
      endTime.setHours(closing, 0, 0, 0);
    }

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
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
  
  // When restaurant is closed, default to tomorrow if no slots available today
  const getInitialDate = () => {
    if (isRestaurantClosed) {
      // Check if there are slots available today
      const todaySlots = generateTimeSlotsForToday(openingHour, closingHour);
      if (todaySlots.length === 0 && dates.length > 1) {
        return dates[1].date; // Default to tomorrow
      }
    }
    return dates[0].date;
  };
  
  const [selectedDate, setSelectedDate] = useState(() => getInitialDate());
  // When restaurant is closed, default to 'later' to encourage scheduling
  const [selectedTimeType, setSelectedTimeType] = useState<'asap' | 'later'>(isRestaurantClosed ? 'later' : 'asap');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Check if today is selected
  const isToday = selectedDate === dates[0].date;

  // Get appropriate time slots based on whether it's today or a future day
  const timeSlots = useMemo(
    () => (isToday ? generateTimeSlotsForToday(openingHour, closingHour) : generateTimeSlotsForFutureDay(openingHour, closingHour)),
    [isToday, openingHour, closingHour]
  );
  
  // Check if ASAP option should be shown (only if restaurant is currently open)
  const showAsapOption = isToday && !isRestaurantClosed;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      data-testid="schedule-delivery-modal-backdrop"
    >
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
        <h2 className="text-xl font-bold text-gray-900 mb-4 mt-6">Select a Delivery Date</h2>
        
        {/* Restaurant Closed Banner */}
        {isRestaurantClosed && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {restaurantName ? `${restaurantName} is currently closed` : 'This restaurant is currently closed'}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Open hours: {formattedHours}
              </p>
            </div>
          </div>
        )}

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
              data-selected={selectedDate === dateObj.date}
            >
              <div className="text-xs font-medium">{dateObj.day}</div>
              <div className="text-md font-bold">{dateObj.date}</div>
            </button>
          ))}
        </div>

        {/* Desired Delivery Time - Only show for today when restaurant is open */}
        {isToday && showAsapOption && (
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

        {/* Time Slots - Show for today when "Schedule for later" is selected, always show for future days, or when restaurant is closed */}
        {((isToday && (selectedTimeType === 'later' || isRestaurantClosed)) || !isToday) && (
          <div className="mb-6">
            {(!isToday || isRestaurantClosed) && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select a Time
                  </div>
                </h3>
              </div>
            )}
            {timeSlots.length > 0 ? (
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
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No available time slots for this date.</p>
                <p className="text-xs mt-1">Please select another day.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
