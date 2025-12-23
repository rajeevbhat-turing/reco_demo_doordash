'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SpecialInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (instructions: string, unavailableOption: string) => void;
  initialInstructions?: string;
  initialUnavailableOption?: string;
}

const UNAVAILABLE_OPTIONS = [
  { value: 'merchant_recommendation', label: 'Go with merchant recommendation' },
  { value: 'refund', label: 'Refund this item' },
  { value: 'contact', label: 'Contact me' },
  { value: 'cancel', label: 'Cancel the entire order' },
];

export default function SpecialInstructionsModal({
  isOpen,
  onClose,
  onSave,
  initialInstructions = '',
  initialUnavailableOption = 'merchant_recommendation',
}: SpecialInstructionsModalProps) {
  const [instructions, setInstructions] = useState(initialInstructions);
  const [unavailableOption, setUnavailableOption] = useState(initialUnavailableOption);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const MAX_CHARACTERS = 500;
  const charactersLeft = MAX_CHARACTERS - instructions.length;

  // Reset state when modal opens with new initial values
  useEffect(() => {
    if (isOpen) {
      setInstructions(initialInstructions);
      setUnavailableOption(initialUnavailableOption);
    }
  }, [isOpen, initialInstructions, initialUnavailableOption]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSave = () => {
    onSave(instructions, unavailableOption);
    onClose();
  };

  const getSelectedLabel = () => {
    return UNAVAILABLE_OPTIONS.find(opt => opt.value === unavailableOption)?.label || '';
  };

  const [mounted, setMounted] = useState(false);

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-visible p-6">
          <h2 className="text-2xl font-bold mb-6">User Preferences</h2>

          {/* Special Instructions Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Add Special Instructions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add any special requests (e.g., food allergies, extra spicy, etc.) and the store will do its best to accommodate you.
            </p>
            <div className="relative">
              <textarea
                value={instructions}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARACTERS) {
                    setInstructions(e.target.value);
                  }
                }}
                placeholder=""
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                {charactersLeft} characters left
              </div>
            </div>
          </div>

          {/* If Item is Unavailable Section */}
          <div className="mb-6 relative">
            <h3 className="text-base font-medium mb-3">If item is unavailable</h3>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <span className="text-gray-900">{getSelectedLabel()}</span>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[110]">
                  {UNAVAILABLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setUnavailableOption(option.value);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        unavailableOption === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render outside of parent DOM hierarchy
  return createPortal(modalContent, document.body);
}

