'use client';

import { useState, useEffect } from 'react';
import { X, Home, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { Address } from '@/lib/types/user-types';
import AddressesModal from './addresses-modal';
import AddAddressModal from './add-address-modal';
import AddressReviewErrorModal from './address-review-error-modal';
import AddressTypeModal from './address-type-modal';
import AddressDetailsModal from './address-details-modal';
import ChooseAddressLabelModal from './choose-address-label-modal';
import ChooseLabelModal from './choose-label-modal';

interface OutsideDeliveryAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OutsideDeliveryAreaModal({
  isOpen,
  onClose,
}: OutsideDeliveryAreaModalProps) {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);
  const tempAddress = useUserStore(state => state.getTempAddress());
  const { getAddresses, addAddress, updateAddress, setDefaultAddress } = useUserStore();

  // Address modal states
  const [showAddressesModal, setShowAddressesModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showChooseLabelModal, setShowChooseLabelModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showReviewErrorModal, setShowReviewErrorModal] = useState(false);
  const [pendingAddressData, setPendingAddressData] = useState<Omit<Address, 'id'> | null>(null);
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false);
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false);
  const [tempAddressData, setTempAddressData] = useState<Omit<Address, 'id'> | null>(null);

  const addresses = getAddresses();

  // Get current delivery address
  const currentAddress =
    currentUser?.addresses?.find(addr => addr.default) ||
    currentUser?.addresses?.[0] ||
    tempAddress;

  // Initialize selectedAddressId with current address when addresses modal opens
  useEffect(() => {
    if (showAddressesModal && currentAddress && 'id' in currentAddress) {
      setSelectedAddressId(currentAddress.id);
    }
  }, [showAddressesModal, currentAddress]);

  // Format address string
  const formatAddress = () => {
    if (!currentAddress) return 'No address selected';
    const parts = [
      currentAddress.street,
      currentAddress.city,
      currentAddress.state,
      currentAddress.zipCode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleFindStoresNearby = () => {
    router.push('/home');
  };

  const handleChangeAddress = () => {
    onClose(); // Hide outside delivery area modal
    setShowAddressesModal(true); // Show addresses modal
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setDefaultAddress(addressId);
    setShowAddressesModal(false);
    // After selecting address, the page should refresh or re-check delivery area
    // For now, just close the modal
  };

  const handleSelectSearchAddress = (address: Address) => {
    const { id, ...addressWithoutId } = address;
    setTempAddressData(addressWithoutId);
    setShowAddressesModal(false);
    setShowAddressTypeModal(true);
  };

  const handleAddressTypeNext = (addressType: Address['addressType']) => {
    if (tempAddressData) {
      const addressWithType = { ...tempAddressData, addressType };
      setTempAddressData(addressWithType);
      setShowAddressTypeModal(false);
      setShowAddressDetailsModal(true);
    }
  };

  const handleSaveAddressDetails = (addressData: any) => {
    if (tempAddressData) {
      const newAddress = addAddress({
        ...tempAddressData,
        ...addressData,
        addressType: addressData.addressType || tempAddressData.addressType || 'house',
      });
      setSelectedAddressId(newAddress.id);
      setTempAddressData(null);
    } else if (selectedAddressId) {
      updateAddress(selectedAddressId, addressData);
    }
    setShowAddressDetailsModal(false);
  };

  const handleManualEntry = () => {
    setShowAddressesModal(false);
    setShowAddAddressModal(true);
  };

  const handleEditAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressesModal(false);
    setShowAddressDetailsModal(true);
  };

  const handleAddAddress = (addressData: Omit<Address, 'id'>) => {
    setPendingAddressData(addressData);
    setShowAddAddressModal(false);
    setShowReviewErrorModal(true);
  };

  const handleReviewAddress = () => {
    if (pendingAddressData) {
      setShowReviewErrorModal(false);
      setShowAddressTypeModal(true);
    }
  };

  const handleEnterNewAddress = () => {
    setPendingAddressData(null);
    setShowReviewErrorModal(false);
    setShowAddAddressModal(true);
  };

  return (
    <>
      {/* Outside Delivery Area Modal */}
      {isOpen && !showAddressesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="px-4 pt-14">
              {/* Title */}
              <h2 className="text-3xl font-bold text-[#191919ff]">
                Your address is outside of this store&apos;s delivery area
              </h2>
              <p className="text-base font-medium text-[#606060ff] mb-4">
                Change your address or view nearby stores
              </p>

              {/* Delivery Address Section */}
              <div className="mb-6">
                <button
                  onClick={handleChangeAddress}
                  className="w-[calc(100%+32px)] hover:bg-gray-100 transition-colors -ml-4 px-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 py-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Home className="w-6 h-6 text-[#191919ff] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-[#191919ff] text-left">
                          Change delivery address
                        </p>
                        <p className="text-sm font-medium text-[#606060ff] text-left truncate">
                          {formatAddress()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#191919ff] flex-shrink-0 ml-2" />
                  </div>
                </button>
              </div>

              {/* Action Button */}
              <div className="border-t border-gray-200 p-4 -ml-4 w-[calc(100%+32px)] flex items-center justify-end">
                <button
                  onClick={handleFindStoresNearby}
                  className="py-2 px-3 bg-red-600 text-white font-bold text-base rounded-[28px] hover:bg-red-700 transition-colors"
                >
                  Find stores nearby
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Modals */}
      <AddressesModal
        isOpen={showAddressesModal}
        onClose={() => setShowAddressesModal(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={handleSelectAddress}
        onEditAddress={handleEditAddress}
        onManualEntry={handleManualEntry}
        onSelectSearchAddress={handleSelectSearchAddress}
        onAddLabel={() => setShowLabelModal(true)}
      />

      <ChooseAddressLabelModal
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        addresses={addresses}
        onSelectAddress={(_addressId: string) => {
          setShowLabelModal(false);
          setShowChooseLabelModal(true);
        }}
        onSelectSearchAddress={address => {
          const { id, ...addressWithoutId } = address;
          setTempAddressData(addressWithoutId);
          setShowLabelModal(false);
          setShowAddressTypeModal(true);
        }}
      />

      <ChooseLabelModal
        isOpen={showChooseLabelModal}
        onClose={() => setShowChooseLabelModal(false)}
        onSave={(_label: string) => {
          // Handle label save if needed
          setShowChooseLabelModal(false);
        }}
      />

      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onContinue={handleAddAddress}
        initialData={pendingAddressData || undefined}
      />

      <AddressReviewErrorModal
        isOpen={showReviewErrorModal}
        onClose={() => {
          setShowReviewErrorModal(false);
          setPendingAddressData(null);
        }}
        onReviewAddress={handleReviewAddress}
        onEnterNewAddress={handleEnterNewAddress}
      />

      <AddressTypeModal
        isOpen={showAddressTypeModal}
        onClose={() => {
          setShowAddressTypeModal(false);
          setTempAddressData(null);
        }}
        addressData={
          tempAddressData ||
          pendingAddressData || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            lat: 0,
            lng: 0,
            addressType: 'house',
          }
        }
        onNext={handleAddressTypeNext}
        onBack={() => {
          setShowAddressTypeModal(false);
          if (pendingAddressData) {
            setShowReviewErrorModal(true);
          } else {
            setShowAddressesModal(true);
          }
        }}
      />

      <AddressDetailsModal
        isOpen={showAddressDetailsModal}
        onClose={() => {
          setShowAddressDetailsModal(false);
          setTempAddressData(null);
        }}
        address={
          selectedAddressId
            ? addresses.find(a => a.id === selectedAddressId)
            : tempAddressData || undefined
        }
        onSave={handleSaveAddressDetails}
        hideAddressType={!!selectedAddressId}
      />
    </>
  );
}
