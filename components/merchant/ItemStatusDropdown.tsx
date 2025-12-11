'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { ItemStatus } from '@/store/merchant-menu-store';

interface ItemStatusDropdownProps {
  currentStatus: ItemStatus;
  onStatusChange: (status: ItemStatus) => void;
  anchor?: React.ReactNode;
}

const statusOptions: { value: ItemStatus; label: string; icon: 'green' | 'gray' }[] = [
  { value: 'In stock', label: 'In stock', icon: 'green' },
  { value: 'Out of stock - 4 hours', label: '4 hours', icon: 'gray' },
  { value: 'Out of stock - Today', label: 'Today', icon: 'gray' },
  { value: 'Out of stock - 1 week', label: '1 week', icon: 'gray' },
  { value: 'Out of stock - Custom', label: 'Custom', icon: 'gray' },
  { value: 'Out of stock - Indefinitely', label: 'Indefinitely', icon: 'gray' },
];

export default function ItemStatusDropdown({
  currentStatus,
  onStatusChange,
  anchor = null,
}: ItemStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentOption = statusOptions.find(opt => opt.value === currentStatus);
  const isInStock = currentStatus === 'In stock';
  const outOfStockOptions = statusOptions.filter(opt => opt.value !== 'In stock');

  const handleSelect = (status: ItemStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const dropdownMenu = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px]"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        zIndex: 9999,
      }}
    >
      {/* In stock option */}
      <button
        onClick={() => handleSelect('In stock')}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>In stock</span>
        </div>
        {currentStatus === 'In stock' && <Check className="h-4 w-4 text-gray-900" />}
      </button>

      {/* Out of stock section */}
      <div className="border-t border-gray-200">
        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 border border-gray-300"></div>
            <span>Out of stock for:</span>
          </div>
        </div>
        {outOfStockOptions.map(option => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className="w-full flex items-center justify-between px-3 py-2 pl-6 text-sm text-gray-700 hover:bg-gray-50"
          >
            <span>{option.label}</span>
            {currentStatus === option.value && <Check className="h-4 w-4 text-gray-900" />}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900"
      >
        {anchor ? (
          anchor
        ) : (
          <>
            <div
              className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-gray-400'}`}
            ></div>
            <span>{currentOption?.label || currentStatus}</span>
          </>
        )}
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>
      {dropdownMenu}
    </>
  );
}
