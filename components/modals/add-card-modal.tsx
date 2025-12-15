'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { validateUSZipCode } from '@/lib/utils/zip-code-validation';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (cardData: {
    cardNumber: string;
    cvc: string;
    expiration: string;
    zipCode: string;
  }) => void;
}

export default function AddCardModal({ isOpen, onClose, onAddCard }: AddCardModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expiration, setExpiration] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState({
    cardNumber: '',
    cvc: '',
    expiration: '',
    zipCode: '',
  });

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

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  // Format expiration (MM / YY)
  const formatExpiration = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + ' / ' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
      if (errors.cardNumber) {
        setErrors({ ...errors, cardNumber: '' });
      }
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvc(value);
      if (errors.cvc) {
        setErrors({ ...errors, cvc: '' });
      }
    }
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiration(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 4) {
      setExpiration(formatted);
      if (errors.expiration) {
        setErrors({ ...errors, expiration: '' });
      }
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 5) {
      setZipCode(value);
      if (errors.zipCode) {
        setErrors({ ...errors, zipCode: '' });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      cvc: '',
      expiration: '',
      zipCode: '',
    };
    let isValid = true;

    // Validate card number (must be 16 digits)
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
      isValid = false;
    }

    // Validate CVC (must be 3 or 4 digits)
    if (cvc.length < 3 || cvc.length > 4) {
      newErrors.cvc = 'CVC must be 3 or 4 digits';
      isValid = false;
    }

    // Validate expiration (must be MM/YY format and valid date)
    const expParts = expiration.split(' / ');
    if (expParts.length !== 2) {
      newErrors.expiration = 'Invalid expiration format';
      isValid = false;
    } else {
      const month = parseInt(expParts[0]);
      const year = parseInt(expParts[1]);
      if (month < 1 || month > 12) {
        newErrors.expiration = 'Invalid month';
        isValid = false;
      }
      // Check if card is expired
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiration = 'Card is expired';
        isValid = false;
      }
    }

    // Validate zip code using comprehensive validation
    const zipValidation = validateUSZipCode(zipCode);
    if (!zipValidation.isValid) {
      newErrors.zipCode = zipValidation.error;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddCard({
        cardNumber,
        cvc,
        expiration,
        zipCode,
      });
      // Reset form
      setCardNumber('');
      setCvc('');
      setExpiration('');
      setZipCode('');
      setErrors({ cardNumber: '', cvc: '', expiration: '', zipCode: '' });
    }
  };

  const handleBack = () => {
    // Reset form
    setCardNumber('');
    setCvc('');
    setExpiration('');
    setZipCode('');
    setErrors({ cardNumber: '', cvc: '', expiration: '', zipCode: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl w-full mx-4 p-4"
        style={{ maxWidth: '622px' }}
      >
        {/* Close button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Add New Card</h2>

        {/* Form */}
        <div className="space-y-6">
          {/* Card Number and CVC Row */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '70% 1fr' }}>
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="XXXX XXXX XXXX XXXX"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
              )}
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-900 mb-2">
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                value={cvc}
                onChange={handleCvcChange}
                placeholder="CVC"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
            </div>
          </div>

          {/* Expiration and Zip Code Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-900 mb-2">
                Expiration
              </label>
              <input
                id="expiration"
                type="text"
                value={expiration}
                onChange={handleExpirationChange}
                placeholder="MM / YY"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.expiration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiration && (
                <p className="text-red-500 text-xs mt-1">{errors.expiration}</p>
              )}
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-900 mb-2">
                Zip Code
              </label>
              <input
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={handleZipCodeChange}
                placeholder="Zip Code"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-6 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
}
