'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { User, PaymentMethod, Address } from '@/lib/types/user-types';
import { initialUsersData } from '@/constants/users-data';

interface UserStore {
  // State
  users: User[];
  currentUser: User | null;
  changePasswordPhoneVerified: boolean;

  // Actions
  getUser: (userId: string) => User | null;
  getAllUsers: () => User[];
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updatedUser: Partial<User>) => void;
  deleteUser: (id: string) => void;
  restrictUser: (userId: string) => void;
  unrestrictUser: (userId: string) => void;
  addReviewToUser: (userId: string, reviewId: string) => void;
  removeReviewFromUser: (userId: string, reviewId: string) => void;
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
        users: initialUsersData,
        currentUser: null,
        changePasswordPhoneVerified: false,

        // Actions
        getUser: (userId: string) => {
          const state = get();
          return state.users.find(user => user.id === userId) || null;
        },

        getAllUsers: () => {
          const state = get();
          return state.users;
        },

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

        restrictUser: (userId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, is_restricted: true } : user
            ),
            currentUser: state.currentUser?.id === userId
              ? { ...state.currentUser, is_restricted: true }
              : state.currentUser
          }));
        },

        unrestrictUser: (userId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, is_restricted: false } : user
            ),
            currentUser: state.currentUser?.id === userId
              ? { ...state.currentUser, is_restricted: false }
              : state.currentUser
          }));
        },

        addReviewToUser: (userId: string, reviewId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId && !user.reviews.includes(reviewId)
                ? { ...user, reviews: [...user.reviews, reviewId] }
                : user
            ),
            currentUser: state.currentUser?.id === userId && !state.currentUser.reviews.includes(reviewId)
              ? { ...state.currentUser, reviews: [...state.currentUser.reviews, reviewId] }
              : state.currentUser
          }));
        },

        removeReviewFromUser: (userId: string, reviewId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId
                ? { ...user, reviews: user.reviews.filter(id => id !== reviewId) }
                : user
            ),
            currentUser: state.currentUser?.id === userId
              ? { ...state.currentUser, reviews: state.currentUser.reviews.filter(id => id !== reviewId) }
              : state.currentUser
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
            default: true, // Set new address as default
          };
          // Set default: false for all existing addresses
          const updatedAddresses = state.currentUser.addresses.map(addr => ({
            ...addr,
            default: false
          }));
          const updatedUser = {
            ...state.currentUser,
            addresses: [...updatedAddresses, newAddress],
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