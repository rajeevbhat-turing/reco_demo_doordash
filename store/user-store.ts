'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { User, PaymentMethod, Address } from '@/lib/types/user-types';

interface UserStore {
  // State
  users: User[];
  currentUser: User | null;
  changePasswordPhoneVerified: boolean;

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
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id'>>) => void;
  getAddresses: () => Address[];
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
          paymentMethods: [],
          addresses: [
            {
              id: "default-address",
              street: "548 Market Street",
              city: "San Francisco",
              state: "CA",
              zipCode: "94104",
              addressType: "house",
              gateCode: "111",
              deliveryPreference: "door",
              deliveryInstructions: "Please ring the bell and drop off at the door, thank you. Its around the corner on the ground floor"
            },
            {
              id: "address-2",
              street: "47 West 13th Street",
              city: "New York",
              state: "NY",
              zipCode: "10011",
              addressType: "house"
            }
          ],
        }],
        currentUser: null,
        changePasswordPhoneVerified: false,

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
          const state = get();
          if (!state.currentUser) {
            throw new Error('No current user');
          }
          const id = Math.random().toString(36).substring(2, 15);
          const lastFour = method.cardNumber.replace(/\s/g, '').slice(-4);
          const newMethod: PaymentMethod = {
            ...method,
            id,
            type: "MasterCard",
            lastFour,
          };
          const updatedUser = {
            ...state.currentUser,
            paymentMethods: [...(state.currentUser?.paymentMethods || []), newMethod],
          };
          set({
            currentUser: updatedUser,
            users: state.users.map(user =>
              user.id === state.currentUser!.id ? updatedUser : user
            ),
          });
          return newMethod;
        },

        removePaymentMethod: (id) => {
          const state = get();
          if (!state.currentUser) {
            return;
          }
          const updatedUser = {
            ...state.currentUser,
            paymentMethods: state.currentUser.paymentMethods.filter((method) => method.id !== id),
          };
          set({
            currentUser: updatedUser,
            users: state.users.map(user =>
              user.id === state.currentUser!.id ? updatedUser : user
            ),
          });
        },

        getPaymentMethods: () => {
          return get().currentUser?.paymentMethods || [];
        },
        
        // Address Actions
        addAddress: (address) => {
          const state = get();
          if (!state.currentUser) {
            throw new Error('No current user');
          }
          const id = Math.random().toString(36).substring(2, 15);
          const newAddress: Address = {
            ...address,
            id,
          };
          const updatedUser = {
            ...state.currentUser,
            addresses: [...state.currentUser.addresses, newAddress],
          };
          set({
            currentUser: updatedUser,
            users: state.users.map(user =>
              user.id === state.currentUser!.id ? updatedUser : user
            ),
          });
          return newAddress;
        },

        removeAddress: (id) => {
          const state = get();
          if (!state.currentUser) {
            return;
          }
          const updatedUser = {
            ...state.currentUser,
            addresses: state.currentUser.addresses.filter((address) => address.id !== id),
          };
          set({
            currentUser: updatedUser,
            users: state.users.map(user =>
              user.id === state.currentUser!.id ? updatedUser : user
            ),
          });
        },

        updateAddress: (id, updates) => {
          const state = get();
          if (!state.currentUser) {
            return;
          }
          const updatedUser = {
            ...state.currentUser,
            addresses: state.currentUser.addresses.map((address) =>
              address.id === id ? { ...address, ...updates } : address
            ),
          };
          set({
            currentUser: updatedUser,
            users: state.users.map(user =>
              user.id === state.currentUser!.id ? updatedUser : user
            ),
          });
        },

        getAddresses: () => {
          return get().currentUser?.addresses || [];
        },
      }),
      {
        name: "user-store",
        partialize: (state) => ({
          users: state.users,
          currentUser: state.currentUser,
          changePasswordPhoneVerified: state.changePasswordPhoneVerified,
        }),
      }
    ),
    {
      name: "user-store",
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);