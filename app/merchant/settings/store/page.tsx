'use client'
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Edit, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import EditStoreNameModal from "@/components/merchant/EditStoreNameModal"
import EditStoreAddressModal from "@/components/merchant/EditStoreAddressModal"
import EditPhoneNumberModal from "@/components/merchant/EditPhoneNumberModal"
import EditWebsiteModal from "@/components/merchant/EditWebsiteModal"
import EditDescriptionModal from "@/components/merchant/EditDescriptionModal"
import { useMerchantPersistedState } from "@/lib/hooks/useMerchantPersistedState"
import { useMerchantSettingsStore } from "@/store/merchant-settings-store"

export default function StoreSettingsPage() {
  const { store, updateStoreSettings } = useMerchantSettingsStore()
  
  const [storeName, setStoreName] = useMerchantPersistedState('settings', 'store', 'storeName', store.storeName)
  const [address, setAddress] = useMerchantPersistedState('settings', 'store', 'address', store.address)
  const [phoneNumber, setPhoneNumber] = useMerchantPersistedState('settings', 'store', 'phoneNumber', store.phoneNumber)
  const [website, setWebsite] = useMerchantPersistedState('settings', 'store', 'website', store.website)
  const [description, setDescription] = useMerchantPersistedState('settings', 'store', 'description', store.description)

  const [isStoreNameModalOpen, setIsStoreNameModalOpen] = useMerchantPersistedState('settings', 'modals', 'isStoreNameOpen', false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useMerchantPersistedState('settings', 'modals', 'isAddressOpen', false)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useMerchantPersistedState('settings', 'modals', 'isPhoneOpen', false)
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useMerchantPersistedState('settings', 'modals', 'isWebsiteOpen', false)
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useMerchantPersistedState('settings', 'modals', 'isDescriptionOpen', false)

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

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Address</Label>
              <div className="text-base text-gray-900">{address}</div>
            </div>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
          </div>
        </div>

        {/* Phone number */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Phone number</Label>
              {phoneNumber ? (
                <div className="text-base text-gray-900">{phoneNumber}</div>
              ) : (
                <p className="text-sm text-gray-500">
                  This phone number is used to send or confirm orders and verify your store is open
                </p>
              )}
            </div>
            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className={`text-sm flex items-center gap-1 ${
                phoneNumber 
                  ? "text-blue-600 hover:text-blue-700" 
                  : "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              }`}
            >
              {phoneNumber ? (
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

        {/* Website */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Website</Label>
              <div className="text-base text-gray-900">{website}</div>
              <p className="text-sm text-gray-500 mt-1">Highlight your website on your DashDoor store page</p>
            </div>
            <button
              onClick={() => setIsWebsiteModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Description</Label>
              <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
            </div>
            <button
              onClick={() => setIsDescriptionModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-4"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
          </div>
        </div>

        {/* Modals */}
        <EditStoreNameModal
          isOpen={isStoreNameModalOpen}
          onClose={() => setIsStoreNameModalOpen(false)}
          currentName={storeName}
          onSave={(name) => {
            setStoreName(name)
            updateStoreSettings({ storeName: name })
            setIsStoreNameModalOpen(false)
          }}
        />

        <EditStoreAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          currentAddress={address}
          onSave={(addr) => {
            setAddress(addr)
            updateStoreSettings({ address: addr })
            setIsAddressModalOpen(false)
          }}
        />

        <EditPhoneNumberModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
          currentPhone={phoneNumber}
          onSave={(phone) => {
            setPhoneNumber(phone)
            updateStoreSettings({ phoneNumber: phone })
            setIsPhoneModalOpen(false)
          }}
        />

        <EditWebsiteModal
          isOpen={isWebsiteModalOpen}
          onClose={() => setIsWebsiteModalOpen(false)}
          currentWebsite={website}
          onSave={(url) => {
            setWebsite(url)
            updateStoreSettings({ website: url })
            setIsWebsiteModalOpen(false)
          }}
        />

        <EditDescriptionModal
          isOpen={isDescriptionModalOpen}
          onClose={() => setIsDescriptionModalOpen(false)}
          currentDescription={description}
          onSave={(desc) => {
            setDescription(desc)
            updateStoreSettings({ description: desc })
            setIsDescriptionModalOpen(false)
          }}
        />
      </div>
    </MerchantLayout>
  )
}

