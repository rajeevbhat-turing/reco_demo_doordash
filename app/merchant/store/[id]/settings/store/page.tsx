'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Edit, Plus, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import EditStoreNameModal from '@/components/merchant/EditStoreNameModal';
import EditWebsiteModal from '@/components/merchant/EditWebsiteModal';
import EditDescriptionModal from '@/components/merchant/EditDescriptionModal';
import { useMerchantPersistedState } from '@/lib/hooks/useMerchantPersistedState';
import { useMerchantSettingsStore } from '@/store/merchant-settings-store';

export default function StoreSettingsPage() {
  const params = useParams();
  const storeId = params.id as string;
  const { store, updateStoreSettings } = useMerchantSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [storeDataLoaded, setStoreDataLoaded] = useState(false);

  // Fetch store data from API on mount
  useEffect(() => {
    async function fetchStoreData() {
      if (!storeId || storeDataLoaded) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/merchant/restaurants/${storeId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const storeData = result.data;
          // Build full address string
          const fullAddress = [storeData.street, storeData.city, storeData.state, storeData.zipCode]
            .filter(Boolean)
            .join(', ');

          // Update store settings with API data
          updateStoreSettings({
            storeName: storeData.name || store.storeName,
            address: fullAddress || store.address,
            phoneNumber: storeData.phone || store.phoneNumber,
            website: store.website, // Not in API, keep existing
            description: store.description, // Not in API, keep existing
          });
          setStoreDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to fetch store data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreData();
  }, [storeId, storeDataLoaded, store, updateStoreSettings]);

  const [storeName, setStoreName] = useMerchantPersistedState(
    'settings',
    'store',
    'storeName',
    store.storeName
  );
  const [address, setAddress] = useMerchantPersistedState(
    'settings',
    'store',
    'address',
    store.address
  );
  const [phoneNumber, setPhoneNumber] = useMerchantPersistedState(
    'settings',
    'store',
    'phoneNumber',
    store.phoneNumber
  );
  const [website, setWebsite] = useMerchantPersistedState(
    'settings',
    'store',
    'website',
    store.website
  );
  const [description, setDescription] = useMerchantPersistedState(
    'settings',
    'store',
    'description',
    store.description
  );

  const [isStoreNameModalOpen, setIsStoreNameModalOpen] = useMerchantPersistedState(
    'settings',
    'modals',
    'isStoreNameOpen',
    false
  );
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useMerchantPersistedState(
    'settings',
    'modals',
    'isWebsiteOpen',
    false
  );
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useMerchantPersistedState(
    'settings',
    'modals',
    'isDescriptionOpen',
    false
  );

  // Sync local state when store settings change
  useEffect(() => {
    if (store.storeName !== storeName) setStoreName(store.storeName);
    if (store.address !== address) setAddress(store.address);
    if (store.phoneNumber !== phoneNumber) setPhoneNumber(store.phoneNumber);
    if (store.website !== website) setWebsite(store.website);
    if (store.description !== description) setDescription(store.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  if (isLoading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store settings</h1>
        </div>

        {/* Store name */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Store name</Label>
              <div className="text-base text-gray-900">{storeName}</div>
            </div>
            <button
              onClick={() => setIsStoreNameModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
          </div>
        </div>

        {/* Address (read-only) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Address</Label>
              <div className="text-base text-gray-900">
                {address || <span className="text-gray-400">No address set</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Phone number (read-only) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Phone number</Label>
              <div className="text-base text-gray-900">
                {phoneNumber || <span className="text-gray-400">No phone number set</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Website */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Website</Label>
              <div className="text-base text-gray-900">
                {website || <span className="text-gray-400">No website added</span>}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Highlight your website on your DashDoor store page
              </p>
            </div>
            <button
              onClick={() => setIsWebsiteModalOpen(true)}
              className={`text-sm flex items-center gap-1 ${
                website
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md'
              }`}
            >
              {website ? (
                <>
                  <Edit className="h-3 w-3" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Description</Label>
              {description ? (
                <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
              ) : (
                <p className="text-sm text-gray-400">No description added</p>
              )}
            </div>
            <button
              onClick={() => setIsDescriptionModalOpen(true)}
              className={`text-sm flex items-center gap-1 ml-4 ${
                description
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md'
              }`}
            >
              {description ? (
                <>
                  <Edit className="h-3 w-3" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modals */}
        <EditStoreNameModal
          isOpen={isStoreNameModalOpen}
          onClose={() => setIsStoreNameModalOpen(false)}
          currentName={storeName}
          onSave={name => {
            setStoreName(name);
            updateStoreSettings({ storeName: name });
            setIsStoreNameModalOpen(false);
          }}
        />

        <EditWebsiteModal
          isOpen={isWebsiteModalOpen}
          onClose={() => setIsWebsiteModalOpen(false)}
          currentWebsite={website}
          onSave={url => {
            setWebsite(url);
            updateStoreSettings({ website: url });
            setIsWebsiteModalOpen(false);
          }}
        />

        <EditDescriptionModal
          isOpen={isDescriptionModalOpen}
          onClose={() => setIsDescriptionModalOpen(false)}
          currentDescription={description}
          onSave={desc => {
            setDescription(desc);
            updateStoreSettings({ description: desc });
            setIsDescriptionModalOpen(false);
          }}
        />
      </div>
    </MerchantLayout>
  );
}
