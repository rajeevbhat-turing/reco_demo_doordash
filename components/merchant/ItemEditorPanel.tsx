'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, Upload, ImageIcon } from 'lucide-react';
import { MenuItem } from '@/store/merchant-menu-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ItemStatusDropdown from './ItemStatusDropdown';

const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

interface ItemEditorPanelProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (itemId: string, updates: Partial<MenuItem>) => void;
}

export default function ItemEditorPanel({ item, isOpen, onClose, onUpdate }: ItemEditorPanelProps) {
  const [name, setName] = useState('');
  const [pickupPrice, setPickupPrice] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [itemTaxRate, setItemTaxRate] = useState('10.2');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<MenuItem['status']>('In stock');
  const [nameError, setNameError] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  // Image upload modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setPickupPrice(item.pickupPrice.replace('$', ''));
      setDeliveryPrice(item.deliveryPrice.replace('$', ''));
      setStatus(item.status);
      setCurrentImage(item.image);
      setItemTaxRate(item.taxRate || '10.2');
      setDescription(item.description || '');
      // Reset image modal state
      setShowImageModal(false);
      setImageBase64('');
      setImageError('');
      setIsDragging(false);
    }
  }, [item]);

  // Process image file
  const processImageFile = (file: File) => {
    setImageError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file.');
      return;
    }

    // Validate file size (must be under 1MB)
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be less than 1MB.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
      setImageError('');
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Save the new image
  const handleImageSave = () => {
    if (!imageBase64) {
      setImageError('Please select an image.');
      return;
    }
    setCurrentImage(imageBase64);
    setShowImageModal(false);
    setImageBase64('');
    setImageError('');
  };

  if (!isOpen || !item) return null;

  const statusColors = (state: MenuItem['status']) => {
    const inStock = state === 'In stock';
    return {
      dot: inStock ? 'bg-green-500' : 'bg-amber-500',
      text: inStock ? 'text-green-700' : 'text-amber-700',
      badge: inStock ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200',
    };
  };
  const colors = statusColors(status);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError('');
    onUpdate(item.id, {
      name,
      pickupPrice: `$${pickupPrice}`,
      deliveryPrice: `$${deliveryPrice}`,
      status,
      image: currentImage,
      taxRate: itemTaxRate,
      description,
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Item {item.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${colors.dot}`}
              >
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className={`text-sm font-medium ${colors.text}`}>{status}</span>
            </div>
            {status === 'In stock' && (
              <p className="text-sm text-gray-600 mb-3">
                Customers can view and order this item during store hours.
              </p>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-white">
              <ItemStatusDropdown
                currentStatus={status}
                onStatusChange={next => setStatus(next)}
                anchor={<span className="text-gray-700">Manage status</span>}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="item-name" className="text-sm font-medium text-gray-900 mb-2 block">
              Name <span className="text-red-600">Required</span>
            </Label>
            <Input
              id="item-name"
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (nameError && e.target.value.trim()) {
                  setNameError('');
                }
              }}
              className={`w-full 
                ${
                  nameError
                    ? 'border-red-500 border-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-red-500 focus:ring-red-500'
                    : ''
                }
              `}
            />
            {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="pickup-price"
                className="text-sm font-medium text-gray-900 mb-2 block"
              >
                Pickup Price
              </Label>
              <Input
                id="pickup-price"
                type="text"
                value={pickupPrice}
                onChange={e => setPickupPrice(e.target.value)}
                className="w-full"
                placeholder="5.00"
              />
            </div>
            <div>
              <Label
                htmlFor="delivery-price"
                className="text-sm font-medium text-gray-900 mb-2 block"
              >
                Delivery Price
              </Label>
              <Input
                id="delivery-price"
                type="text"
                value={deliveryPrice}
                onChange={e => setDeliveryPrice(e.target.value)}
                className="w-full"
                placeholder="1.88"
              />
            </div>
            <div>
              <Label
                htmlFor="item-tax-rate"
                className="text-sm font-medium text-gray-900 mb-2 block"
              >
                Item Tax Rate
              </Label>
              <Input
                id="item-tax-rate"
                type="text"
                value={itemTaxRate}
                onChange={e => setItemTaxRate(e.target.value)}
                className="w-full"
                placeholder="10.2"
              />
            </div>
          </div>


          {/* Photo Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-gray-900">Photo</Label>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="w-24 h-24 rounded-md bg-gray-200 overflow-hidden mb-3">
                <img
                  src={currentImage || item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {currentImage?.startsWith('data:') ? 'Custom uploaded image' : 'Menu item photo'}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                This photo is visible on your DashDoor menu.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="item-description"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Description <span className="text-gray-500 font-normal">Optional</span>
            </Label>
            <textarea
              id="item-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Beef broth with rare beef, tripe, brisket, meatball and tendon."
            />
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowImageModal(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Replace photo</h3>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setImageBase64('');
                    setImageError('');
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Upload a new image for <span className="font-semibold">{name}</span>. Image must be less than 1MB.
                </p>

                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-red-500 bg-red-50'
                      : imageBase64
                      ? 'border-green-500 bg-green-50'
                      : imageError
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {imageBase64 ? (
                    <div className="space-y-3">
                      <img
                        src={imageBase64}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-green-600 font-medium">Image selected</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageBase64('');
                          setImageError('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Remove and select another
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                        {isDragging ? (
                          <Upload className="h-8 w-8 text-red-500" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 1MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {imageError && (
                  <p className="text-sm text-red-600 mt-2">{imageError}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setImageBase64('');
                    setImageError('');
                  }}
                  className="px-4 py-2 rounded-[28px] border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageSave}
                  disabled={!imageBase64}
                  className={`px-4 py-2 rounded-[28px] text-sm font-semibold ${
                    imageBase64
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save photo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
