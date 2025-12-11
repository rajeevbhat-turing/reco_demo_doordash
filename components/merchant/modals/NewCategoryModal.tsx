'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGlobalContext } from '@/app/global-context';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

// New category creation side panel modal
export default function NewCategoryModal({ isOpen, onClose, onCreate }: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const { setSnackbar } = useGlobalContext();

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setNameError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    onCreate(name.trim());
    setSnackbar({ message: 'New category created', autoHideDuration: 3000 });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 -ml-2" aria-label="Close">
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <p className="text-base text-gray-500 font-medium">Category</p>
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-900">New category</h2>
            <p className="text-sm text-gray-600">Create a new category for your menu.</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 space-y-4 flex-1">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Category details</h3>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">Name</label>
            <Input
              value={name}
              onChange={e => {
                const val = e.target.value;
                setName(val);
                setNameError(val.trim() ? '' : 'Name is required.');
              }}
              placeholder="Category name"
              className={`w-full bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                nameError ? 'border-red-500 border-2 focus:border-red-500 focus:border-2' : ''
              }`}
            />
            {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[28px] border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-[28px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Create category
          </button>
        </div>
      </div>
    </>
  );
}


