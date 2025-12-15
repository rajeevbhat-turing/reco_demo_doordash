'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Lock, ChevronDown, X } from 'lucide-react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';
import type { Restaurant } from '@/constants/restaurants';

interface OnboardingStep {
  number: number;
  label: string;
  step: string;
  completed: boolean;
  locked: boolean;
}

interface OnboardingSidebarProps {
  currentStep: string;
  completedSteps: string[];
}

export default function OnboardingSidebar({ currentStep, completedSteps }: OnboardingSidebarProps) {
  const router = useRouter();
  const { currentStoreId, setCurrentStoreId } = useCurrentStore();
  const { data: allRestaurants = [], isLoading } = useAllRestaurants();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Get current merchant info
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);
  const signOut = useMerchantAuthStore(state => state.signOut);

  // Filter restaurants to only show the merchant's own stores (during onboarding, only the store being created)
  const restaurants = useMemo(() => {
    if (!currentMerchant) return [];
    
    // Get all store IDs that belong to this merchant
    const merchantStoreIds = new Set<string>();
    
    // Add primary store (the one being created during onboarding)
    if (currentMerchant.primaryStoreId) {
      merchantStoreIds.add(currentMerchant.primaryStoreId);
    }
    
    // Add any additional stores the merchant has access to
    if (currentMerchant.storeIds) {
      currentMerchant.storeIds.forEach(id => merchantStoreIds.add(id));
    }
    
    // Filter to only show merchant's own stores
    return allRestaurants.filter(r => merchantStoreIds.has(r.id));
  }, [allRestaurants, currentMerchant]);

  const currentStore = restaurants?.find(r => r.id === currentStoreId) || restaurants?.[0];

  // Display name is the user's full name
  const userDisplayName = currentMerchant
    ? `${currentMerchant.firstName} ${currentMerchant.lastName}`
    : 'Merchant';

  // Handle logout - use replace for immediate redirect
  const handleLogout = () => {
    signOut();
    router.replace('/merchant/auth');
  };

  const filteredRestaurants = useMemo(() => {
    if (!searchValue.trim()) {
      return restaurants;
    }
    const searchLower = searchValue.toLowerCase();
    return restaurants.filter(
      restaurant =>
        restaurant.name.toLowerCase().includes(searchLower) ||
        `${restaurant.street}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`
          .toLowerCase()
          .includes(searchLower)
    );
  }, [searchValue, restaurants]);

  const formatAddress = (restaurant: Restaurant) => {
    return `${restaurant.street}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}, USA`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchValue('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileDropdownOpen]);

  // Note: Menu step is skipped (out of scope)
  const steps: OnboardingStep[] = [
    {
      number: 1,
      label: 'Order method',
      step: 'order-protocol',
      completed: completedSteps.includes('order-protocol'),
      locked: false,
    },
    {
      number: 2,
      label: 'Store hours',
      step: 'hours',
      completed: completedSteps.includes('hours'),
      locked: completedSteps.length < 1,
    },
    {
      number: 3,
      label: 'Pricing plan',
      step: 'pricing',
      completed: completedSteps.includes('pricing'),
      locked: completedSteps.length < 2,
    },
    {
      number: 4,
      label: 'Payout info',
      step: 'payout',
      completed: completedSteps.includes('payout'),
      locked: completedSteps.length < 3,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] border-r border-gray-200 bg-white">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center mb-2">
          <svg
            aria-hidden="true"
            width="32"
            height="18"
            viewBox="0 0 99.5 56.5"
            fill="#2563EB"
            className="mr-2"
          >
            <path d="M95.64,13.38A25.24,25.24,0,0,0,73.27,0H2.43A2.44,2.44,0,0,0,.72,4.16L16.15,19.68a7.26,7.26,0,0,0,5.15,2.14H71.24a6.44,6.44,0,1,1,.13,12.88H36.94a2.44,2.44,0,0,0-1.72,4.16L50.66,54.39a7.25,7.25,0,0,0,5.15,2.14H71.38c20.26,0,35.58-21.66,24.26-43.16" />
          </svg>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Create new store</div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading || !currentStore}
            className="w-full flex items-end justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-end gap-2">
              <div className="text-sm font-medium">
                {isLoading ? 'Loading...' : currentStore?.name || 'No store selected'}
              </div>
              <div className="text-xs text-gray-500 mb-0.5">Store</div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 mb-0.5 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay backdrop */}
              <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setSearchValue('');
                }}
              />

              {/* Dropdown Panel */}
              <div className="absolute left-0 top-full mt-1 w-[400px] max-h-[400px] bg-white z-50 shadow-2xl rounded-lg flex flex-col border border-gray-200">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {currentStore?.name || 'Select a store'}
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setSearchValue('');
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  {/* Search input */}
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Scrollable Restaurants List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    {isLoading ? (
                      <div className="text-sm text-gray-500 py-4">Loading stores...</div>
                    ) : filteredRestaurants.length === 0 ? (
                      <div className="text-sm text-gray-500 py-4">No stores found</div>
                    ) : (
                      <div className="space-y-0">
                        {filteredRestaurants.map(restaurant => {
                          const isSelected = currentStoreId === restaurant.id;
                          return (
                            <button
                              key={restaurant.id}
                              onClick={() => {
                                setCurrentStoreId(restaurant.id);
                                setIsDropdownOpen(false);
                                setSearchValue('');
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                                isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                                    isSelected ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {restaurant.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    {formatAddress(restaurant)}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="px-2 space-y-1 mt-4">
        {steps.map(step => {
          const isActive = currentStep === step.step;
          const isCompleted = step.completed;
          const isLocked = step.locked;

          return (
            <div
              key={step.step}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-red-50 text-red-700'
                  : isCompleted
                    ? 'text-gray-700'
                    : isLocked
                      ? 'text-gray-400'
                      : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-semibold">
                    {step.number}
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isLocked ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                )}
                <span>{step.label}</span>
              </div>
              {isLocked && <Lock className="h-3 w-3 ml-2" />}
            </div>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4" ref={profileDropdownRef}>
        {/* Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-2"
            >
              <svg
                height="20"
                width="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Log out
            </button>
          </div>
        )}
        <div
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium">{userDisplayName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="flex-1 truncate">{userDisplayName}</span>
          <span className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </div>
    </aside>
  );
}
