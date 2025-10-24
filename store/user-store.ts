'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { User } from '@/lib/types/user-types';

interface UserStore {
  // State
  users: User[];
  currentUser: User | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updatedUser: Partial<User>) => void;
  deleteUser: (id: string) => void;
  isAuthenticated: () => boolean;
  clearUsers: () => void;
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
        }],
        currentUser: null,

        // Actions
        setCurrentUser: (user: User | null) => {
          set({ currentUser: user });
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
      }),
      {
        name: "user-store",
        partialize: (state) => ({
          users: state.users,
          currentUser: state.currentUser,
        }),
      }
    ),
    {
      name: "user-store",
    }
  )
);