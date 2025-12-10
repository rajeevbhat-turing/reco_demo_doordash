'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phoneData: { countryCode: string; number: string }) => void;
  initialCountryCode?: string;
  initialNumber?: string;
}

export default function EditPhoneModal({
  isOpen,
  onClose,
  onSave,
  initialCountryCode = '+1 (US)',
  initialNumber = '',
}: EditPhoneModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [number, setNumber] = useState(initialNumber);
  const [error, setError] = useState('');

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

  if (!isOpen) return null;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setNumber(value);
      if (error) setError('');
    }
  };

  const handleContinue = () => {
    if (number.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }
    onSave({ countryCode, number });
    onClose();
  };

  const handleCancel = () => {
    setNumber(initialNumber);
    setCountryCode(initialCountryCode);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      data-testid="edit-phone-modal-backdrop"
    >
      <div ref={dialogRef} className="relative bg-white rounded-2xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-5 left-5 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-6">Edit phone number</h2>

        {/* Form */}
        <div className="space-y-4">
          {/* Country and Phone Number Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-900 mb-2">
                Country
              </label>
              <select
                id="country"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              >
                <option value="+1 (US)">+1 (US)</option>
                <option value="+44 (UK)">+44 (UK)</option>
                <option value="+91 (IN)">+91 (IN)</option>
              </select>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="text"
                value={number}
                onChange={handleNumberChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-6 text-gray-900 font-medium hover:bg-gray-100 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-3 px-6 bg-gray-300 text-gray-900 rounded-full font-medium hover:bg-gray-400 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
