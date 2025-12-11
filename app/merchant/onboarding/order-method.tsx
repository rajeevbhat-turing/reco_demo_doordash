'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

export default function OrderMethodStep() {
  const router = useRouter();
  const saveOnboardingOrderProtocol = useMerchantAuthStore(
    state => state.saveOnboardingOrderProtocol
  );
  const [selectedMethod, setSelectedMethod] = useState<'tablet' | 'pos' | 'email'>('pos');
  const [posPartner, setPosPartner] = useState('');
  const [showPosDropdown, setShowPosDropdown] = useState(false);
  const [error, setError] = useState('');

  const posPartners = [
    'Toast',
    'Square',
    'Clover',
    'TouchBistro',
    'Lightspeed',
    'Revel Systems',
    'NCR Aloha',
    'Other',
  ];

  const handleNext = () => {
    // Validate POS partner selection
    if (selectedMethod === 'pos' && !posPartner) {
      setError('Please select a POS partner');
      return;
    }

    setError('');

    // Save to merchant auth store
    saveOnboardingOrderProtocol({
      orderMethod: selectedMethod,
      posPartner: selectedMethod === 'pos' ? posPartner : undefined,
    });

    router.push('/merchant/onboarding?step=hours');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Choose how you want to receive DashDoor orders
      </h1>
      <p className="text-gray-600 mb-8">You can always change this later.</p>

      <div className="space-y-4 mb-8">
        {/* DashDoor Tablet */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
            selectedMethod === 'tablet'
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('tablet')}
        >
          <div className="flex items-start gap-4">
            <input
              type="radio"
              name="orderMethod"
              checked={selectedMethod === 'tablet'}
              onChange={() => setSelectedMethod('tablet')}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DashDoor Tablet</h3>
              <p className="text-sm text-gray-600 mb-3">
                We&apos;ll ship you a DashDoor tablet to your store and send orders directly to the
                tablet.
              </p>
              <p className="text-sm font-medium text-gray-900 mb-1">
                CA$0 for free trial, then CA$3/week
              </p>
              <span className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">
                + Most popular
              </span>
            </div>
          </div>
        </div>

        {/* Point of Sale (POS) */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
            selectedMethod === 'pos'
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('pos')}
        >
          <div className="flex items-start gap-4">
            <input
              type="radio"
              name="orderMethod"
              checked={selectedMethod === 'pos'}
              onChange={() => setSelectedMethod('pos')}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Point of Sale (POS)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Recommended for merchants who use a POS system. Get DashDoor orders directly through
                your POS and automatically sync your menu.
              </p>

              {selectedMethod === 'pos' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose your POS partner
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setShowPosDropdown(!showPosDropdown);
                      }}
                      className={`w-full px-4 py-2 border rounded-md bg-white text-left flex items-center justify-between hover:border-gray-400 ${error && !posPartner ? 'border-[#b71000]' : 'border-gray-300'}`}
                    >
                      <span className={posPartner ? 'text-gray-900' : 'text-gray-500'}>
                        {posPartner || 'Select POS partner'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${showPosDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showPosDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {posPartners.map(partner => (
                          <button
                            key={partner}
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setPosPartner(partner);
                              setShowPosDropdown(false);
                              setError('');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                          >
                            {partner}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {error && !posPartner && (
                    <div className="flex items-center gap-2 mt-2 text-[#b71000]">
                      <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
                        <span className="text-white text-[10px] font-bold">!</span>
                      </div>
                      <span className="text-xs font-medium">{error}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm font-medium text-gray-900">
                CA$0 - POS partner may charge a service fee
              </p>
            </div>
          </div>
        </div>

        {/* Email + phone confirmation */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
            selectedMethod === 'email'
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('email')}
        >
          <div className="flex items-start gap-4">
            <input
              type="radio"
              name="orderMethod"
              checked={selectedMethod === 'email'}
              onChange={() => setSelectedMethod('email')}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email + phone confirmation
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Provide an email to receive DashDoor orders and a phone number to confirm them. This
                is best for merchants who have convenient access to a computer and open phone line.
              </p>
              <p className="text-sm font-medium text-gray-900">CA$0</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
      >
        Next
      </button>
    </div>
  );
}
