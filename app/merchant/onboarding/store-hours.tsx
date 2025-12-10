'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, Plus } from 'lucide-react';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';
import { useMerchantStoresStore } from '@/store/merchant-stores-store';

export default function StoreHoursStep() {
  const router = useRouter();
  const saveOnboardingStoreHours = useMerchantAuthStore(state => state.saveOnboardingStoreHours);
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);
  const updateStoreHours = useMerchantStoresStore(state => state.updateStoreHours);
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const [allDaysOpen, setAllDaysOpen] = useState('08:00 AM');
  const [allDaysClose, setAllDaysClose] = useState('10:00 PM');
  const [error, setError] = useState('');

  // Convert 12-hour time to 24-hour minutes for comparison
  const timeToMinutes = (time12: string): number => {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'AM' && hours === 12) hours = 0;
    else if (period === 'PM' && hours !== 12) hours += 12;

    return hours * 60 + minutes;
  };

  // Validate that closing time is after opening time
  const isValidTimeRange = useMemo(() => {
    const openMinutes = timeToMinutes(allDaysOpen);
    const closeMinutes = timeToMinutes(allDaysClose);
    return closeMinutes > openMinutes;
  }, [allDaysOpen, allDaysClose]);

  const handleBack = () => {
    router.push('/merchant/onboarding?step=order-protocol');
  };

  const handleNext = () => {
    // Validate time range
    if (!isValidTimeRange) {
      setError('Closing time must be after opening time');
      return;
    }

    setError('');

    // Save to merchant auth store
    saveOnboardingStoreHours({
      applyToAllDays,
      allDaysOpen,
      allDaysClose,
    });

    // Also save to merchant-stores-store for the primary store
    if (currentMerchant?.primaryStoreId) {
      updateStoreHours(currentMerchant.primaryStoreId, {
        open: allDaysOpen,
        close: allDaysClose,
      });
    }

    router.push('/merchant/onboarding?step=menu');
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
        options.push({ value: time24, label: time12 });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

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
        We will accept your last order 20 mins before you close, so that you have enough time to
        prepare the food. You can always change this later.
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
            onChange={e => setApplyToAllDays(e.target.checked)}
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
                onChange={e => {
                  const newOpen = e.target.value;
                  setAllDaysOpen(newOpen);
                  // Clear error if new time range is valid
                  if (error) {
                    const openMinutes = timeToMinutes(newOpen);
                    const closeMinutes = timeToMinutes(allDaysClose);
                    if (closeMinutes > openMinutes) {
                      setError('');
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-8"
              >
                {timeOptions.map(option => (
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
                onChange={e => {
                  const newClose = e.target.value;
                  setAllDaysClose(newClose);
                  // Clear error if new time range is valid
                  if (error) {
                    const openMinutes = timeToMinutes(allDaysOpen);
                    const closeMinutes = timeToMinutes(newClose);
                    if (closeMinutes > openMinutes) {
                      setError('');
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-8"
              >
                {timeOptions.map(option => (
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

      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-[#b71000]">
          <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
            <span className="text-white text-[10px] font-bold">!</span>
          </div>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        Next
      </button>
    </div>
  );
}
