'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { User } from '@/lib/types/user-types';

export interface PaymentMethod {
  id: string;
  type: string;
  cardNumber: string;
  lastFour: string;
  cvc: string;
  expiry: string;
  zipCode: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface UserStore {
  // State
  users: User[];
  currentUser: User | null;
  changePasswordPhoneVerified: boolean;
  paymentMethods: PaymentMethod[];
  addresses: Address[];
  phoneNumber: PhoneNumber;

  // Actions
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updatedUser: Partial<User>) => void;
  deleteUser: (id: string) => void;
  isAuthenticated: () => boolean;
  clearUsers: () => void;
  setChangePasswordPhoneVerified: (verified: boolean) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  
  // Payment Method Actions
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'type' | 'lastFour'>) => PaymentMethod;
  removePaymentMethod: (id: string) => void;
  getPaymentMethods: () => PaymentMethod[];
  
  // Address Actions
  addAddress: (address: Omit<Address, 'id'>) => Address;
  removeAddress: (id: string) => void;
  getAddresses: () => Address[];
  
  // Phone Number Actions
  setPhoneNumber: (phoneNumber: PhoneNumber) => void;
  getPhoneNumber: () => PhoneNumber;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        users: [{
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '9999999999',
          password: 'password@12345',
          country: {
            dialCode: '+1',
            code: 'US',
            name: 'United States',
          },
          userCountry: 'United States',
          avatar: null,
        }],
        currentUser: null,
        changePasswordPhoneVerified: false,
        paymentMethods: [],
        addresses: [
          {
            id: "default-address",
            street: "548 Market Street",
            city: "San Francisco",
            state: "CA",
            zipCode: "94104"
          },
          {
            id: "address-2",
            street: "47 West 13th Street",
            city: "New York",
            state: "NY",
            zipCode: "10011"
          }
        ],
        phoneNumber: {
          countryCode: "+1 (US)",
          number: "7450946351"
        },

        // Actions
        setCurrentUser: (user: User | null) => {
          set({ 
            currentUser: user,
            changePasswordPhoneVerified: user === null ? false : get().changePasswordPhoneVerified,
          });
        },

        addUser: (user: User) => {
          set((state) => ({
            users: [...state.users, user]
          }));
        },

        updateUser: (id: string, updatedUser: Partial<User>) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === id ? { ...user, ...updatedUser } : user
            ),
            currentUser: state.currentUser?.id === id
              ? { ...state.currentUser, ...updatedUser }
              : state.currentUser
          }));
        },

        deleteUser: (id: string) => {
          set((state) => ({
            users: state.users.filter(user => user.id !== id),
            currentUser: state.currentUser?.id === id ? null : state.currentUser
          }));
        },

        isAuthenticated: () => {
          return get().currentUser !== null;
        },

        clearUsers: () => {
          set({ users: [], currentUser: null });
        },

        setChangePasswordPhoneVerified: (verified: boolean) => {
          set({ changePasswordPhoneVerified: verified });
        },

        changePassword: (oldPassword: string, newPassword: string) => {
          const state = get();
          if (!state.currentUser) return false;
          
          // Check if old password is correct
          if (state.currentUser.password !== oldPassword) {
            return false;
          }
          
          // Update password
          const updatedUser = { ...state.currentUser, password: newPassword };
          set({ 
            currentUser: updatedUser,
            users: state.users.map(user => 
              user.id === state.currentUser!.id ? updatedUser : user
            ),
            changePasswordPhoneVerified: false // Reset after password change
          });
          
          return true;
        },

        // Payment Method Actions
        addPaymentMethod: (method) => {
          const id = Math.random().toString(36).substring(2, 15);
          const lastFour = method.cardNumber.replace(/\s/g, '').slice(-4);
          const newMethod: PaymentMethod = {
            ...method,
            id,
            type: "MasterCard",
            lastFour,
          };
          set((state) => ({
            paymentMethods: [...state.paymentMethods, newMethod],
          }));
          return newMethod;
        },

        removePaymentMethod: (id) => {
          set((state) => ({
            paymentMethods: state.paymentMethods.filter((method) => method.id !== id),
          }));
        },

        getPaymentMethods: () => {
          return get().paymentMethods;
        },
        
        // Address Actions
        addAddress: (address) => {
          const id = Math.random().toString(36).substring(2, 15);
          const newAddress: Address = {
            ...address,
            id,
          };
          set((state) => ({
            addresses: [...state.addresses, newAddress],
          }));
          return newAddress;
        },

        removeAddress: (id) => {
          set((state) => ({
            addresses: state.addresses.filter((address) => address.id !== id),
          }));
        },

        getAddresses: () => {
          return get().addresses;
        },
        
        // Phone Number Actions
        setPhoneNumber: (phoneNumber: PhoneNumber) => {
          set({ phoneNumber });
        },

        getPhoneNumber: () => {
          return get().phoneNumber;
        },
      }),
      {
        name: "user-store",
        partialize: (state) => ({
          users: state.users,
          currentUser: state.currentUser,
          changePasswordPhoneVerified: state.changePasswordPhoneVerified,
          paymentMethods: state.paymentMethods,
        }),
      }
    ),
    {
      name: "user-store",
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);