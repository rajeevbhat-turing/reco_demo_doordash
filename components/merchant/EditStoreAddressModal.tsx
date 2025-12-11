'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditStoreAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSave: (address: string) => void;
}

export default function EditStoreAddressModal({
  isOpen,
  onClose,
  currentAddress,
  onSave,
}: EditStoreAddressModalProps) {
  const [address, setAddress] = useState(currentAddress);
  const [latitude, setLatitude] = useState('47.615523976273835');
  const [longitude, setLongitude] = useState('-122.20412006601691');

  useEffect(() => {
    if (isOpen) {
      setAddress(currentAddress);
    }
  }, [isOpen, currentAddress]);

  const handleSave = () => {
    onSave(address);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit store address</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Address Input */}
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-900 mb-2 block">
              Address
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full pl-9"
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Latitude</Label>
              <div className="text-sm text-gray-900">{latitude}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Longitude</Label>
              <div className="text-sm text-gray-900">{longitude}</div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-600">
            Drag the map to fine-tune your store's location. We'll use this information to assist
            Dashers and customers when they pick up orders.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
