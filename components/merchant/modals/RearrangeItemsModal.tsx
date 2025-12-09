'use client';

import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { X, GripVertical } from 'lucide-react';
import type { MenuItem } from '@/store/merchant-menu-store';

interface RearrangeItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onSave: (items: MenuItem[]) => void;
}

export default function RearrangeItemsModal({
  isOpen,
  onClose,
  items,
  onSave,
}: RearrangeItemsModalProps) {
  const sorted = useMemo(() => [...items], [items]);
  const [localItems, setLocalItems] = useState<MenuItem[]>(sorted);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalItems(sorted);
    }
  }, [isOpen, sorted]);

  // Handle drag over
  const handleDragOver = (e: DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    setLocalItems(prev => {
      const fromIndex = prev.findIndex(item => item.id === draggingId);
      const toIndex = prev.findIndex(item => item.id === overId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Handle save the order changes
  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">Rearrange Items</h2>
          </div>

          <div className="px-5 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {localItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggingId(item.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={e => handleDragOver(e, item.id)}
                className="flex items-center gap-3 px-3 py-3 rounded-md border border-gray-200 bg-white shadow-sm cursor-move hover:bg-gray-50"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[28px] border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-[28px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

