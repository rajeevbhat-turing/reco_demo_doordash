'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { User, PaymentMethod, Address } from '@/lib/types/user-types';

interface UserStore {
  // State
  users: User[];
  currentUser: User | null;
  changePasswordPhoneVerified: boolean;
  deletedUserIds: string[]; // Track deleted user IDs to filter them out during login
  // Temporary address for non-authenticated users
  // This stores the address entered by users who are not signed in
  tempAddress: Address | null;
  isInitialized: boolean; // Track if store has been initialized from DB

  // Actions
  getUser: (userId: string) => User | null;
  getUserByEmail: (email: string) => User | null;
  getAllUsers: () => User[];
  setCurrentUser: (user: User | null) => void;
  addUser: (
    user: Omit<User, 'paymentMethods' | 'addresses'> & {
      paymentMethods?: PaymentMethod[];
      addresses?: Address[];
    },
    setAsCurrent: boolean
  ) => void;
  fetchUserFromAPI: (userId: string) => Promise<User | null>;
  updateUser: (id: string, updatedUser: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => void;
  restrictUser: (userId: string) => Promise<void>;
  unrestrictUser: (userId: string) => Promise<void>;
  isAuthenticated: () => boolean;
  clearUsers: () => void;
  setChangePasswordPhoneVerified: (verified: boolean) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;

  // Payment Method Actions
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'type' | 'lastFour'>) => PaymentMethod;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  getPaymentMethods: () => PaymentMethod[];
  setPaymentFrequency: (frequency: 'once-a-day' | 'after-each-order') => void;

  // Address Actions
  addAddress: (address: Omit<Address, 'id'>) => Address;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, updates: Partial<Omit<Address, 'id'>>) => void;
  setDefaultAddress: (id: string) => void;
  getAddresses: () => Address[];
  setTempAddress: (address: Address | null) => void;
  getTempAddress: () => Address | null;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        users: [],
        currentUser: null,
        changePasswordPhoneVerified: false,
        deletedUserIds: [],
        tempAddress: null,
        isInitialized: false,

        // Actions
        getUser: (userId: string) => {
          const state = get();
          return state.users.find(user => user.id === userId) || null;
        },

        getUserByEmail: (email: string) => {
          const state = get();
          const deletedIdsSet = new Set(state.deletedUserIds);
          return (
            state.users.find(user => user.email === email && !deletedIdsSet.has(user.id)) || null
          );
        },

        getAllUsers: () => {
          const state = get();
          return state.users;
        },

        setCurrentUser: (user: User | null) => {
          // Clear tempAddress when signing in (existing user)
          set({
            currentUser: user,
            changePasswordPhoneVerified: user === null ? false : get().changePasswordPhoneVerified,
            tempAddress: null, // Clear temp address when signing in
            isInitialized: user !== null ? true : get().isInitialized, // Mark as initialized when user logs in
          });
        },

        addUser: (
          user: Omit<User, 'paymentMethods' | 'addresses'> & {
            paymentMethods?: PaymentMethod[];
            addresses?: Address[];
          },
          setAsCurrent: boolean
        ) => {
          const state = get();
          const tempAddress = state.tempAddress;

          // Initialize addresses array
          let addresses: Address[] = [];

          // If tempAddress exists, add it to the new user's addresses with default flag
          if (tempAddress) {
            const addressWithId: Address = {
              ...tempAddress,
              id: Math.random().toString(36).substring(2, 15),
              default: true, // Set as default
            };
            addresses = [addressWithId];
          }

          // Create user with addresses
          const newUser: User = {
            ...user,
            addresses: addresses,
            paymentMethods: user.paymentMethods || [],
          };

          set(state => ({
            users: [...state.users, newUser],
            tempAddress: null, // Clear temp address after adding it to the user,
            currentUser: setAsCurrent ? newUser : state.currentUser,
          }));
        },

        // Helper function to fetch user from API
        fetchUserFromAPI: async (userId: string): Promise<User | null> => {
          try {
            const response = await fetch(`/api/users/${userId}`);
            const result = await response.json();

            if (result.success && result.data) {
              return result.data as User;
            }
            return null;
          } catch (error) {
            console.error('Failed to fetch user from API:', error);
            return null;
          }
        },

        updateUser: async (id: string, updatedUser: Partial<User>) => {
          const state = get();
          const isCurrentUser = state.currentUser?.id === id;

          if (isCurrentUser && state.currentUser) {
            // Case: ID is current user
            const userExists = state.users.some(u => u.id === id);
            const updatedCurrentUser: User = { ...state.currentUser, ...updatedUser };

            if (userExists) {
              // Update user in users array and current user
              set({
                users: state.users.map(user => (user.id === id ? updatedCurrentUser : user)),
                currentUser: updatedCurrentUser,
              });
            } else {
              // Update current user and add to users array
              set({
                currentUser: updatedCurrentUser,
                users: [...state.users, updatedCurrentUser],
              });
            }
          } else {
            // Case: ID is not current user
            const userExists = state.users.some(u => u.id === id);

            if (userExists) {
              // Update user in users array
              set({
                users: state.users.map(user =>
                  user.id === id ? ({ ...user, ...updatedUser } as User) : user
                ),
              });
            } else {
              // Fetch user from API, update it, and add to users array
              const fetchedUser = await get().fetchUserFromAPI(id);
              if (fetchedUser) {
                const updatedFetchedUser: User = { ...fetchedUser, ...updatedUser };
                set({
                  users: [...state.users, updatedFetchedUser],
                });
              }
            }
          }
        },

        deleteUser: (id: string) => {
          set(state => {
            // Add to deletedUserIds if not already there
            const updatedDeletedIds = state.deletedUserIds.includes(id)
              ? state.deletedUserIds
              : [...state.deletedUserIds, id];

            return {
              users: state.users.filter(user => user.id !== id),
              currentUser: state.currentUser?.id === id ? null : state.currentUser,
              deletedUserIds: updatedDeletedIds,
            };
          });
        },

        restrictUser: async (userId: string) => {
          const state = get();
          const isCurrentUser = state.currentUser?.id === userId;

          if (isCurrentUser && state.currentUser) {
            // Case: ID is current user
            const userExists = state.users.some(u => u.id === userId);
            const updatedCurrentUser: User = { ...state.currentUser, is_restricted: true };

            if (userExists) {
              // Update user in users array and current user
              set({
                users: state.users.map(user => (user.id === userId ? updatedCurrentUser : user)),
                currentUser: updatedCurrentUser,
              });
            } else {
              // Update current user and add to users array
              set({
                currentUser: updatedCurrentUser,
                users: [...state.users, updatedCurrentUser],
              });
            }
          } else {
            // Case: ID is not current user
            const userExists = state.users.some(u => u.id === userId);

            if (userExists) {
              // Update user in users array
              set({
                users: state.users.map(user =>
                  user.id === userId ? ({ ...user, is_restricted: true } as User) : user
                ),
              });
            } else {
              // Fetch user from API, update it, and add to users array
              const fetchedUser = await get().fetchUserFromAPI(userId);
              if (fetchedUser) {
                const updatedFetchedUser: User = { ...fetchedUser, is_restricted: true };
                set({
                  users: [...state.users, updatedFetchedUser],
                });
              }
            }
          }
        },

        unrestrictUser: async (userId: string) => {
          const state = get();
          const isCurrentUser = state.currentUser?.id === userId;

          if (isCurrentUser && state.currentUser) {
            // Case: ID is current user
            const userExists = state.users.some(u => u.id === userId);
            const updatedCurrentUser: User = { ...state.currentUser, is_restricted: false };

            if (userExists) {
              // Update user in users array and current user
              set({
                users: state.users.map(user => (user.id === userId ? updatedCurrentUser : user)),
                currentUser: updatedCurrentUser,
              });
            } else {
              // Update current user and add to users array
              set({
                currentUser: updatedCurrentUser,
                users: [...state.users, updatedCurrentUser],
              });
            }
          } else {
            // Case: ID is not current user
            const userExists = state.users.some(u => u.id === userId);

            if (userExists) {
              // Update user in users array
              set({
                users: state.users.map(user =>
                  user.id === userId ? ({ ...user, is_restricted: false } as User) : user
                ),
              });
            } else {
              // Fetch user from API, update it, and add to users array
              const fetchedUser = await get().fetchUserFromAPI(userId);
              if (fetchedUser) {
                const updatedFetchedUser: User = { ...fetchedUser, is_restricted: false };
                set({
                  users: [...state.users, updatedFetchedUser],
                });
              }
            }
          }
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

          // Validate password strength
          // Import validation function dynamically to avoid circular dependencies
          const hasUppercase = /[A-Z]/.test(newPassword);
          const hasLowercase = /[a-z]/.test(newPassword);
          const hasNumber = /[0-9]/.test(newPassword);
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
          const isLongEnough = newPassword.length >= 10;
          const isNotReused = newPassword !== oldPassword;

          if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar || !isLongEnough || !isNotReused) {
            console.error('Password does not meet security requirements');
            return false;
          }

          // Update password and ensure current user is in users array
          const updatedUser = { ...state.currentUser, password: newPassword };
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser?.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
            changePasswordPhoneVerified: false, // Reset after password change
          });

          return true;
        },

        // Payment Method Actions
        addPaymentMethod: method => {
          const state = get();
          if (!state.currentUser) {
            throw new Error('No current user');
          }
          const id = Math.random().toString(36).substring(2, 15);
          const lastFour = method.cardNumber.replace(/\s/g, '').slice(-4);
          const newMethod: PaymentMethod = {
            ...method,
            id,
            type: 'MasterCard',
            lastFour,
          };
          const updatedUser = {
            ...state.currentUser,
            paymentMethods: [...(state.currentUser?.paymentMethods || []), newMethod],
          };
          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser?.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser!.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
          return newMethod;
        },

        removePaymentMethod: id => {
          const state = get();
          if (!state.currentUser) {
            return;
          }
          const updatedUser = {
            ...state.currentUser,
            paymentMethods: state.currentUser.paymentMethods.filter(method => method.id !== id),
          };
          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser?.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
        },

        getPaymentMethods: () => {
          return get().currentUser?.paymentMethods || [];
        },

        setDefaultPaymentMethod: id => {
          const state = get();
          if (!state.currentUser) {
            return;
          }

          // Set all payment methods to default: false, except the selected one
          const updatedPaymentMethods = state.currentUser.paymentMethods.map(method => ({
            ...method,
            default: method.id === id,
          }));

          const updatedUser = {
            ...state.currentUser,
            paymentMethods: updatedPaymentMethods,
          };

          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser!.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
        },

        setPaymentFrequency: frequency => {
          const state = get();
          if (!state.currentUser) {
            return;
          }

          const updatedUser = {
            ...state.currentUser,
            paymentFrequency: frequency,
          };

          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser!.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
        },

        // Address Actions
        addAddress: address => {
          const state = get();
          if (!state.currentUser) {
            throw new Error('No current user');
          }
          const id = Math.random().toString(36).substring(2, 15);

          // Prepare new address
          let newAddress: Address = {
            ...address,
            id,
            default: true, // Set new address as default
          };

          // If personalLabel is 'none', remove it entirely
          if (newAddress.personalLabel && newAddress.personalLabel.toLowerCase() === 'none') {
            const { personalLabel, ...addressWithoutLabel } = newAddress;
            newAddress = addressWithoutLabel as Address;
          }

          // Set default: false for all existing addresses
          // Also, if the new address has a label other than 'none', remove it from other addresses
          const existingAddresses = state.currentUser.addresses || [];
          const updatedAddresses = existingAddresses.map(addr => {
            const updatedAddr = { ...addr, default: false };

            // Remove matching label from other addresses (case-insensitive comparison)
            if (
              newAddress.personalLabel &&
              newAddress.personalLabel.toLowerCase() !== 'none' &&
              addr.personalLabel &&
              addr.personalLabel.toLowerCase() === newAddress.personalLabel.toLowerCase()
            ) {
              // Remove the personalLabel key entirely
              delete updatedAddr.personalLabel;
            }

            return updatedAddr;
          });

          const updatedUser = {
            ...state.currentUser,
            addresses: [...updatedAddresses, newAddress],
          };
          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser!.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
          return newAddress;
        },

        removeAddress: id => {
          const state = get();
          if (!state.currentUser) {
            return;
          }
          const updatedUser = {
            ...state.currentUser,
            addresses: state.currentUser.addresses.filter(address => address.id !== id),
          };
          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser!.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
        },

        updateAddress: (id, updates) => {
          const state = get();
          if (!state.currentUser) {
            return;
          }

          // If personalLabel is being set to 'none', remove the field entirely
          let processedUpdates = { ...updates };
          if (updates.personalLabel && updates.personalLabel.toLowerCase() === 'none') {
            // Remove personalLabel from updates
            const { personalLabel, ...updatesWithoutLabel } = processedUpdates;
            processedUpdates = updatesWithoutLabel;
          }

          // Apply updates to the target address
          let updatedAddresses = state.currentUser.addresses.map(address => {
            if (address.id === id) {
              const updatedAddress = { ...address, ...processedUpdates };
              // If personalLabel was set to 'none', remove it from the address
              if (updates.personalLabel && updates.personalLabel.toLowerCase() === 'none') {
                const { personalLabel, ...addressWithoutLabel } = updatedAddress;
                return addressWithoutLabel as Address;
              }
              return updatedAddress;
            }
            return address;
          });

          // If updating personalLabel (and it's not 'none'), remove it from other addresses
          if (updates.personalLabel && updates.personalLabel.toLowerCase() !== 'none') {
            // Remove the same label from all other addresses (case-insensitive comparison)
            updatedAddresses = updatedAddresses.map(address => {
              if (
                address.id !== id &&
                address.personalLabel &&
                address.personalLabel.toLowerCase() === updates.personalLabel!.toLowerCase()
              ) {
                // Remove the personalLabel key entirely
                const { personalLabel, ...addressWithoutLabel } = address;
                return addressWithoutLabel as Address;
              }
              return address;
            });
          }

          const updatedUser = {
            ...state.currentUser,
            addresses: updatedAddresses,
          };

          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser!.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
        },

        setDefaultAddress: id => {
          const state = get();
          if (!state.currentUser) {
            return;
          }

          // Set all addresses to default: false, except the selected one
          const updatedAddresses = state.currentUser.addresses.map(address => ({
            ...address,
            default: address.id === id,
          }));

          const updatedUser = {
            ...state.currentUser,
            addresses: updatedAddresses,
          };

          // Ensure current user is in users array
          const userExists = state.users.some(u => u.id === state.currentUser!.id);
          const updatedUsers = userExists
            ? state.users.map(user => (user.id === state.currentUser?.id ? updatedUser : user))
            : [...state.users, updatedUser];

          set({
            currentUser: updatedUser,
            users: updatedUsers,
          });
        },

        getAddresses: () => {
          return get().currentUser?.addresses || [];
        },

        setTempAddress: address => {
          set({ tempAddress: address });
        },

        getTempAddress: () => {
          return get().tempAddress;
        },
      }),
      {
        name: 'user-store',
        partialize: state => ({
          users: state.users,
          currentUser: state.currentUser,
          changePasswordPhoneVerified: state.changePasswordPhoneVerified,
          deletedUserIds: state.deletedUserIds,
          tempAddress: state.tempAddress,
          isInitialized: state.isInitialized,
        }),
      }
    ),
    {
      name: 'user-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
