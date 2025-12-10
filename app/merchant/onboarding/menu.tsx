'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

export default function MenuStep() {
  const router = useRouter();
  const saveOnboardingMenuCompleted = useMerchantAuthStore(
    state => state.saveOnboardingMenuCompleted
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuMethod, setMenuMethod] = useState<'link' | 'upload'>('link');
  const [menuLink, setMenuLink] = useState('');
  const [menuLinkError, setMenuLinkError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded'>('idle');

  // Validate URL format
  const isValidUrl = useMemo(() => {
    if (!menuLink.trim()) return false;
    // Accept URLs with or without protocol
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    return urlPattern.test(menuLink);
  }, [menuLink]);

  // Validate menu link on blur
  const handleMenuLinkBlur = () => {
    if (menuLink.trim() && !isValidUrl) {
      setMenuLinkError('Please enter a valid URL (e.g., yourwebsite.com/menus)');
    } else {
      setMenuLinkError('');
    }
  };

  // Handle menu link change
  const handleMenuLinkChange = (value: string) => {
    setMenuLink(value);
    // Clear error if URL becomes valid
    if (menuLinkError) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (value.trim() && urlPattern.test(value)) {
        setMenuLinkError('');
      }
    }
  };

  const handleBack = () => {
    router.push('/merchant/onboarding?step=hours');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG, JPG, JPEG, or PDF file');
        return;
      }

      // Validate file size (4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert('File size must be less than 4MB');
        return;
      }

      setUploadedFile(file);
      setUploadStatus('uploading');

      // Simulate upload
      setTimeout(() => {
        setUploadStatus('uploaded');
      }, 1000);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [uploadError, setUploadError] = useState('');

  const handleSave = () => {
    // Validate based on method
    if (menuMethod === 'link') {
      if (!menuLink.trim()) {
        setMenuLinkError('Menu link is required');
        return;
      }
      if (!isValidUrl) {
        setMenuLinkError('Please enter a valid URL (e.g., yourwebsite.com/menus)');
        return;
      }
    } else {
      if (!uploadedFile || uploadStatus !== 'uploaded') {
        setUploadError('Please upload a menu file');
        return;
      }
    }

    // Clear errors
    setMenuLinkError('');
    setUploadError('');

    // Save to merchant auth store
    saveOnboardingMenuCompleted();

    // Navigate to next step
    router.push('/merchant/onboarding?step=pricing');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Let&apos;s build your menu</h1>
      <p className="text-gray-600 mb-8">
        Share your menu with us and we&apos;ll help you build one for DashDoor.
      </p>

      {/* Method selection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-900 mb-3">
          Choose how you&apos;d like to provide your menu
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setMenuMethod('link')}
            className={`px-6 py-3 border-2 rounded-md font-medium transition-colors ${
              menuMethod === 'link'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Menu link
          </button>
          <button
            onClick={() => setMenuMethod('upload')}
            className={`px-6 py-3 border-2 rounded-md font-medium transition-colors ${
              menuMethod === 'upload'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Upload menu
          </button>
        </div>
      </div>

      {/* Menu link input */}
      {menuMethod === 'link' && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-2">Enter menu link</label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="yourwebsite.com/menus"
              value={menuLink}
              onChange={e => handleMenuLinkChange(e.target.value)}
              onBlur={handleMenuLinkBlur}
              className={`flex-1 ${menuLinkError ? 'border-[#b71000] focus:border-[#b71000]' : ''}`}
            />
            <span className="text-sm text-gray-500">Required</span>
          </div>
          {menuLinkError && (
            <div className="flex items-center gap-2 mt-2 text-[#b71000]">
              <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <span className="text-xs font-medium">{menuLinkError}</span>
            </div>
          )}
        </div>
      )}

      {/* File upload */}
      {menuMethod === 'upload' && (
        <div className="mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
                if (validTypes.includes(file.type) && file.size <= 4 * 1024 * 1024) {
                  setUploadedFile(file);
                  setUploadStatus('uploading');
                  setTimeout(() => setUploadStatus('uploaded'), 1000);
                }
              }
            }}
            onDragOver={e => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-900 mb-1">Drag and drop here</p>
            <p className="text-sm text-gray-600 mb-4">or</p>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md text-sm font-medium"
            >
              Choose file
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Supports PNG, JPG, JPEG, or PDF. Maximum file size: 4MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Uploaded file display */}
          {uploadedFile && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">PDF</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                {uploadStatus === 'uploading' && (
                  <p className="text-xs text-gray-500">Uploading...</p>
                )}
                {uploadStatus === 'uploaded' && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Uploaded</span>
                  </div>
                )}
              </div>
              <button onClick={handleRemoveFile} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {uploadError && !uploadedFile && (
            <div className="flex items-center gap-2 mt-4 text-[#b71000]">
              <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <span className="text-xs font-medium">{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Menu requirements */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-900 mb-3">What your menu should include</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-lg">🍽️</span>
            <span>Name of each item</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-lg">💰</span>
            <span>Prices listed with each item</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-lg">📝</span>
            <span>Modifiers to customize items (optional)</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        {menuMethod === 'upload' && uploadStatus === 'uploaded' ? 'Save' : 'Next'}
      </button>
    </div>
  );
}
