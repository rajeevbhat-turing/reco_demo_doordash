'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Onboarding data interfaces
export interface OnboardingOrderProtocol {
  orderMethod: 'tablet' | 'pos' | 'email';
  posPartner?: string;
}

export interface OnboardingStoreHours {
  applyToAllDays: boolean;
  allDaysOpen: string;
  allDaysClose: string;
}

export interface OnboardingPricing {
  selectedPlan: 'basic' | 'plus' | 'premier';
}

export interface OnboardingPayout {
  bankAccount: {
    accountNumber: string;
    financialInstitutionNumber: string;
    transitNumber: string;
  };
  company: {
    legalBusinessName: string;
    registeredBusinessAddress: string;
    sameAsStoreAddress: boolean;
    entityType: string;
    businessType: string;
    numberOfLocations: string;
    hasFranchiseeLocations: string;
    gstNumber: string;
  };
  representative: {
    firstName: string;
    lastName: string;
    personalAddress: string;
    dateOfBirth: string;
    email: string;
    phone: string;
  };
}

export interface OnboardingData {
  orderProtocol?: OnboardingOrderProtocol;
  storeHours?: OnboardingStoreHours;
  menuCompleted?: boolean;
  pricing?: OnboardingPricing;
  payout?: OnboardingPayout;
}

// Temporary store data from landing page
export interface TempStoreData {
  storeName: string;
  storeAddress: string;
  email: string;
  phone: string;
  businessType: string;
  lat?: number;
  lng?: number;
}

// Merchant user interface
export interface MerchantUser {
  id: string;
  email: string;
  password: string;
  // User personal details
  firstName: string;
  lastName: string;
  userPhone: string;
  // Primary store details
  primaryStoreName: string;
  primaryStoreAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  primaryStorePhone: string;
  primaryBusinessType: string;
  primaryStoreId: string;
  // Other stores this merchant has access to
  storeIds: string[];
  // Onboarding status
  onboardingCompleted: boolean;
  // Onboarding step (0-5): 0=not started, 1=order-protocol done, 2=hours done, 3=menu done, 4=pricing done, 5=payout done
  onboardingStep: number;
  // Onboarding data stored during each step
  onboardingData?: OnboardingData;
}

interface MerchantAuthStore {
  // Hydration state - true once localStorage data is loaded
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  // Current authenticated merchant
  currentMerchant: MerchantUser | null;
  // All registered merchants
  merchants: MerchantUser[];
  // Temporary store data from landing page
  tempStore: TempStoreData | null;
  // Actions
  setCurrentMerchant: (merchant: MerchantUser | null) => void;
  signOut: () => void;
  getMerchantByEmail: (email: string) => MerchantUser | undefined;
  registerMerchant: (
    merchant: Omit<MerchantUser, 'id' | 'onboardingCompleted' | 'onboardingStep'>
  ) => MerchantUser;
  completeOnboarding: () => void;
  // Temp store actions
  setTempStore: (data: TempStoreData) => void;
  clearTempStore: () => void;
  // Onboarding step actions
  saveOnboardingOrderProtocol: (data: OnboardingOrderProtocol) => void;
  saveOnboardingStoreHours: (data: OnboardingStoreHours) => void;
  saveOnboardingMenuCompleted: () => void;
  saveOnboardingPricing: (data: OnboardingPricing) => void;
  saveOnboardingPayout: (data: OnboardingPayout) => void;
  // Settings update actions
  updateBankAccount: (bankAccount: Partial<OnboardingPayout['bankAccount']>) => void;
}

// Initial merchants array - empty since data comes from API (merchant.db)
// New merchants registered through signup are stored here
const initialMerchants: MerchantUser[] = [];

export const useMerchantAuthStore = create<MerchantAuthStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      currentMerchant: null,
      merchants: initialMerchants,
      tempStore: null,

      setCurrentMerchant: merchant => set({ currentMerchant: merchant }),

      signOut: () => set({ currentMerchant: null }),

      setTempStore: data => set({ tempStore: data }),

      clearTempStore: () => set({ tempStore: null }),

      getMerchantByEmail: email => {
        return get().merchants.find(m => m.email.toLowerCase() === email.toLowerCase());
      },

      registerMerchant: merchantData => {
        const newMerchant: MerchantUser = {
          ...merchantData,
          id: `merchant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          onboardingCompleted: false,
          onboardingStep: 0,
        };
        set(state => ({
          merchants: [...state.merchants, newMerchant],
          currentMerchant: newMerchant,
        }));
        return newMerchant;
      },

      completeOnboarding: () => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = { ...current, onboardingCompleted: true, onboardingStep: 5 };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({
          currentMerchant: updatedMerchant,
          merchants: updatedMerchants,
        });
      },

      saveOnboardingOrderProtocol: data => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingStep: Math.max(current.onboardingStep, 1),
          onboardingData: { ...current.onboardingData, orderProtocol: data },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },

      saveOnboardingStoreHours: data => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingStep: Math.max(current.onboardingStep, 2),
          onboardingData: { ...current.onboardingData, storeHours: data },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },

      // Note: Menu step is skipped (out of scope), keeping function for future use
      saveOnboardingMenuCompleted: () => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingData: { ...current.onboardingData, menuCompleted: true },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },

      // onboardingStep: 0=not started, 1=order-protocol done, 2=hours done, 3=pricing done, 4=payout done
      // Note: Menu step is skipped (out of scope)
      saveOnboardingPricing: data => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingStep: Math.max(current.onboardingStep, 3),
          onboardingData: { ...current.onboardingData, pricing: data },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },

      saveOnboardingPayout: data => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingStep: 4,
          onboardingCompleted: true,
          onboardingData: { ...current.onboardingData, payout: data },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },

      updateBankAccount: bankAccountUpdates => {
        const current = get().currentMerchant;
        if (!current) return;

        // Get existing payout data or create default structure
        const existingPayout = current.onboardingData?.payout || {
          bankAccount: {
            accountNumber: '',
            financialInstitutionNumber: '',
            transitNumber: '',
          },
          company: {
            legalBusinessName: '',
            registeredBusinessAddress: '',
            sameAsStoreAddress: false,
            entityType: '',
            businessType: '',
            numberOfLocations: '',
            hasFranchiseeLocations: '',
            gstNumber: '',
          },
          representative: {
            firstName: '',
            lastName: '',
            personalAddress: '',
            dateOfBirth: '',
            email: '',
            phone: '',
          },
        };

        // Merge bank account updates
        const updatedPayout = {
          ...existingPayout,
          bankAccount: {
            ...existingPayout.bankAccount,
            ...bankAccountUpdates,
          },
        };

        const updatedMerchant = {
          ...current,
          onboardingData: { ...current.onboardingData, payout: updatedPayout },
        };

        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },
    }),
    {
      name: 'merchant-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
