'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { uiConfig } from '@/data/ui-config';

interface ShopListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShopListModal({ isOpen, onClose }: ShopListModalProps) {
  const [groceryList, setGroceryList] = useState('');
  const { shopListModalText } = uiConfig;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <h2 className="text-4xl font-bold mb-6">{shopListModalText.title}</h2>

      <p className="text-gray-600 text-xl mb-6">{shopListModalText.description}</p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <p className="text-xl text-gray-600 mb-4">{shopListModalText.exampleText}</p>

        <textarea
          value={groceryList}
          onChange={e => setGroceryList(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-xl"
          placeholder={shopListModalText.placeholder}
          rows={6}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="bg-red-600 hover:bg-red-700 text-white text-xl font-medium rounded-full px-8 py-3"
          onClick={() => {
            // Handle search functionality here
            onClose();
          }}
        >
          {shopListModalText.buttonText}
        </button>
      </div>
    </Modal>
  );
}
