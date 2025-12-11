'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { DollarSign, CreditCard, AlertCircle, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';

/**
 * Route: /merchant/store/[id]/request-delivery
 *
 * Request Delivery page for a specific store
 */
export default function RequestDeliveryPage() {
  const params = useParams();
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();
  const [storeSet, setStoreSet] = useState(false);

  const storeIdParam = params.id as string;

  // Set the store ID when component mounts or storeIdParam changes
  useEffect(() => {
    if (isLoading || !restaurants || storeSet) return;

    // Try to find restaurant by numeric ID first
    let restaurant = restaurants.find(r => r.id === storeIdParam);

    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants.find(
        r =>
          r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
          r.name === storeIdParam
      );
    }

    if (restaurant) {
      if (contextStoreId !== restaurant.id) {
        setCurrentStoreId(restaurant.id);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true');
      }
      setStoreSet(true);
    } else {
      if (contextStoreId !== '1') {
        setCurrentStoreId('1');
      }
      setStoreSet(true);
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet]);

  // Show loading state while finding store
  if (isLoading) {
    return (
      <MerchantLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </MerchantLayout>
    );
  }
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [aptSuite, setAptSuite] = useState('');
  const [dropoffInstructions, setDropoffInstructions] = useState('');

  return (
    <MerchantLayout>
      <div className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a delivery</h1>
              <p className="text-sm text-gray-600">
                Schedule a Dasher to deliver an order from Frosty Bear test NCP 🐻‍❄️ 🍕 - 575 Bellevue
                Sq, Bellevue, WA 98004, USA
              </p>
            </div>

            {/* Customer Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="first-name"
                    className="text-sm font-medium text-gray-900 mb-2 block"
                  >
                    First name
                  </Label>
                  <Input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="last-name"
                    className="text-sm font-medium text-gray-900 mb-2 block"
                  >
                    Last name
                  </Label>
                  <Input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="business-name"
                    className="text-sm font-medium text-gray-900 mb-2 block"
                  >
                    Business name <span className="text-gray-500 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="business-name"
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="phone-number"
                    className="text-sm font-medium text-gray-900 mb-2 block"
                  >
                    Phone number
                  </Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="(000) 000-0000"
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
                    Email <span className="text-gray-500 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery address</h2>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="customer-address"
                    className="text-sm font-medium text-gray-900 mb-2 block"
                  >
                    Customer's address
                  </Label>
                  <Input
                    id="customer-address"
                    type="text"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="apt-suite"
                    className="text-sm font-medium text-gray-900 mb-2 block"
                  >
                    Apt/Suite <span className="text-gray-500 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="apt-suite"
                    type="text"
                    value={aptSuite}
                    onChange={e => setAptSuite(e.target.value)}
                    className="w-full"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Provide the order subtotal and delivery details to see if this address is within
                  your delivery radius.
                </p>
              </div>
            </div>

            {/* Dropoff Instructions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Label
                htmlFor="dropoff-instructions"
                className="text-sm font-medium text-gray-900 mb-2 block"
              >
                Dropoff instructions <span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <textarea
                id="dropoff-instructions"
                value={dropoffInstructions}
                onChange={e => setDropoffInstructions(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Add any special instructions for the Dasher..."
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              {/* Delivery Fee & Tip */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Delivery fee + driver tip
                  </span>
                </div>
                <p className="text-sm text-gray-600">This is the amount you pay.</p>
              </div>

              {/* Delivery details */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Delivery details</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600">Pickup • ASAP</p>
              </div>

              {/* Payment method */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Payment method</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">No saved cards yet.</p>

                {/* Alert Box */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-800">
                    Click 'Edit' to add a credit card or choose a different payment method.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
