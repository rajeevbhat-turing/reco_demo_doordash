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
  // Current authenticated merchant
  currentMerchant: MerchantUser | null;
  // All registered merchants
  merchants: MerchantUser[];
  // Actions
  setCurrentMerchant: (merchant: MerchantUser | null) => void;
  signOut: () => void;
  getMerchantByEmail: (email: string) => MerchantUser | undefined;
  completeOnboarding: () => void;
  // Onboarding step actions
  saveOnboardingOrderProtocol: (data: OnboardingOrderProtocol) => void;
  saveOnboardingStoreHours: (data: OnboardingStoreHours) => void;
  saveOnboardingMenuCompleted: () => void;
  saveOnboardingPricing: (data: OnboardingPricing) => void;
  saveOnboardingPayout: (data: OnboardingPayout) => void;
}

// Sample merchant users with real store data from database
const sampleMerchants: MerchantUser[] = [
  {
    id: 'merchant-1',
    email: 'portland.grill@dashdoor.merchant',
    password: 'merchant@123',
    firstName: 'John',
    lastName: 'Smith',
    userPhone: '1 (764) 997-5265',
    primaryStoreName: 'Portland Grill',
    primaryStoreAddress: {
      street: 'Forcella, 33 N Square',
      city: 'Boston',
      state: 'MA',
      zipCode: '02113',
    },
    primaryStorePhone: '7649975265',
    primaryBusinessType: 'Restaurant',
    primaryStoreId: '1',
    // This merchant manages Portland Grill and a few other restaurants
    storeIds: ['1', '2', '5', '6'],
    onboardingCompleted: true, // Already onboarded
    onboardingStep: 5, // All steps completed
    onboardingData: {
      orderProtocol: { orderMethod: 'pos', posPartner: 'Toast' },
      storeHours: { applyToAllDays: true, allDaysOpen: '08:00 AM', allDaysClose: '10:00 PM' },
      menuCompleted: true,
      pricing: { selectedPlan: 'premier' },
      payout: {
        bankAccount: { accountNumber: '123456789', financialInstitutionNumber: '001', transitNumber: '12345' },
        company: {
          legalBusinessName: 'Portland Grill Inc.',
          registeredBusinessAddress: '33 N Square, Boston, MA 02113',
          sameAsStoreAddress: true,
          entityType: 'COMPANY',
          businessType: 'LOCAL',
          numberOfLocations: 'TWO_FIVE',
          hasFranchiseeLocations: 'no',
          gstNumber: '123456789',
        },
        representative: {
          firstName: 'John',
          lastName: 'Smith',
          personalAddress: '123 Main St, Boston, MA 02113',
          dateOfBirth: '15/06/1980',
          email: 'john.smith@portlandgrill.com',
          phone: '1 (764) 997-5265',
        },
      },
    },
  },
  {
    id: 'merchant-2',
    email: 'talias.kitchen@dashdoor.merchant',
    password: 'merchant@456',
    firstName: 'Talia',
    lastName: 'Rodriguez',
    userPhone: '1 (692) 349-1437',
    primaryStoreName: "Talia's Kitchen",
    primaryStoreAddress: {
      street: '267 S Euclid St',
      city: 'Anaheim',
      state: 'CA',
      zipCode: '92801',
    },
    primaryStorePhone: '6923491437',
    primaryBusinessType: 'Restaurant',
    primaryStoreId: '3',
    // This merchant manages Talia's Kitchen and a few other restaurants
    storeIds: ['3', '4', '7', '8'],
    onboardingCompleted: false, // Needs to complete onboarding
    onboardingStep: 2, // Completed order-protocol and hours steps
    onboardingData: {
      orderProtocol: { orderMethod: 'tablet' },
      storeHours: { applyToAllDays: true, allDaysOpen: '09:00 AM', allDaysClose: '09:00 PM' },
    },
  },
];

export const useMerchantAuthStore = create<MerchantAuthStore>()(
  persist(
    (set, get) => ({
      currentMerchant: null,
      merchants: sampleMerchants,

      setCurrentMerchant: merchant => set({ currentMerchant: merchant }),

      signOut: () => set({ currentMerchant: null }),

      getMerchantByEmail: email => {
        return get().merchants.find(
          m => m.email.toLowerCase() === email.toLowerCase()
        );
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

      saveOnboardingMenuCompleted: () => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingStep: Math.max(current.onboardingStep, 3),
          onboardingData: { ...current.onboardingData, menuCompleted: true },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },

      saveOnboardingPricing: data => {
        const current = get().currentMerchant;
        if (!current) return;

        const updatedMerchant = {
          ...current,
          onboardingStep: Math.max(current.onboardingStep, 4),
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
          onboardingStep: 5,
          onboardingCompleted: true,
          onboardingData: { ...current.onboardingData, payout: data },
        };
        const updatedMerchants = get().merchants.map(m =>
          m.id === current.id ? updatedMerchant : m
        );

        set({ currentMerchant: updatedMerchant, merchants: updatedMerchants });
      },
    }),
    {
      name: 'merchant-auth',
    }
  )
);

