'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface ScheduleOption {
  day: string;
  date: string;
  fullDate: Date;
}

interface TimeOption {
  time: string;
  selected: boolean;
}

interface ScheduleDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedDate: string, selectedTime: string) => void;
}

export default function ScheduleDropdown({ isOpen, onClose, onSave }: ScheduleDropdownProps) {
  const [selectedDay, setSelectedDay] = useState<string>('Today');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [dateOptions, setDateOptions] = useState<ScheduleOption[]>([]);
  const [timeOptions, setTimeOptions] = useState<TimeOption[]>([]);

  // Generate date options (Today, Tomorrow, and next 3 days)
  useEffect(() => {
    const today = new Date();
    const options: ScheduleOption[] = [];

    // Today
    options.push({
      day: 'Today',
      date: `May ${today.getDate()}`,
      fullDate: new Date(today),
    });

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    options.push({
      day: 'Tomorrow',
      date: `May ${tomorrow.getDate()}`,
      fullDate: new Date(tomorrow),
    });

    // Next 3 days
    for (let i = 2; i < 5; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + i);

      const dayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' });
      options.push({
        day: dayName,
        date: `May ${nextDay.getDate()}`,
        fullDate: new Date(nextDay),
      });
    }

    setDateOptions(options);
  }, []);

  // Generate time options based on selected day
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const times: TimeOption[] = [];
    const isToday = selectedDay === 'Today';

    // Start from current hour if today, otherwise start from restaurant opening time (e.g., 11 AM)
    const startHour = isToday ? currentHour : 11;
    const endHour = 23; // Restaurant closing time (11 PM)

    for (let hour = startHour; hour <= endHour; hour++) {
      // For today, only show future times
      const minuteIntervals = [0, 10, 20, 30, 40, 50];

      for (const minute of minuteIntervals) {
        if (isToday && hour === currentHour && minute <= currentMinute) {
          continue; // Skip past times for today
        }

        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeString = `${formattedHour}:${formattedMinute} ${period}`;

        times.push({
          time: timeString,
          selected: false,
        });
      }
    }

    // If no times available for today, show tomorrow's times
    if (times.length === 0 && isToday) {
      setSelectedDay('Tomorrow');
      return;
    }

    // Select the first available time by default
    if (times.length > 0) {
      times[0].selected = true;
      setSelectedTime(times[0].time);
    }

    setTimeOptions(times);
  }, [selectedDay]);

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const updatedTimes = timeOptions.map(option => ({
      ...option,
      selected: option.time === time,
    }));
    setTimeOptions(updatedTimes);
  };

  const handleReset = () => {
    setSelectedDay('Today');
    if (timeOptions.length > 0) {
      setSelectedTime(timeOptions[0].time);
      const updatedTimes = timeOptions.map((option, index) => ({
        ...option,
        selected: index === 0,
      }));
      setTimeOptions(updatedTimes);
    }
  };

  const handleSave = () => {
    onSave(selectedDay, selectedTime);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Schedule</h2>
          <p className="text-gray-600 mb-6">Schedule your order up to 2 days later</p>

          {/* Date selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {dateOptions.slice(0, 3).map(option => (
              <button
                key={option.day}
                className={`border rounded-lg p-4 flex flex-col items-center justify-center ${
                  selectedDay === option.day ? 'border-black' : 'border-gray-200'
                }`}
                onClick={() => handleDaySelect(option.day)}
              >
                <div className="flex justify-between w-full">
                  <span className="text-lg font-medium">{option.day}</span>
                  {selectedDay === option.day && <Check className="h-5 w-5" />}
                </div>
                <div className="text-gray-500 text-left w-full mt-1">{option.date}</div>
              </button>
            ))}
          </div>

          {/* Time selection */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {timeOptions.map((option, index) => (
              <div key={index} className="border-b border-gray-100 py-2">
                <button
                  className="flex items-center w-full"
                  onClick={() => handleTimeSelect(option.time)}
                >
                  <div
                    className={`w-6 h-6 rounded-full border ${
                      option.selected ? 'border-black bg-black' : 'border-gray-300'
                    } flex items-center justify-center mr-3`}
                  >
                    {option.selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <span className="text-lg">{option.time}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              className="px-6 py-2 text-gray-900 font-medium rounded-full"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-full"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
