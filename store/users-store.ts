'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { initialUsersData } from '@/constants/users-data';
import { User } from '@/types/user-types';

interface UsersStore {
  // State
  users: User[];
  
  // Actions
  getUser: (userId: string) => User | null;
  getAllUsers: () => User[];
  addUser: (user: Omit<User, 'id'>) => string; // Returns the new user ID
  updateUser: (userId: string, updates: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (userId: string) => void;
  restoreUser: (userId: string) => void;
  restrictUser: (userId: string) => void;
  unrestrictUser: (userId: string) => void;
  addReviewToUser: (userId: string, reviewId: string) => void;
  removeReviewFromUser: (userId: string, reviewId: string) => void;
  getActiveUsers: () => User[]; // Users that are not deleted
  getRestrictedUsers: () => User[]; // Users that are restricted
}

export const useUsersStore = create<UsersStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        users: initialUsersData,

        // Actions
        getUser: (userId: string) => {
          const state = get();
          return state.users.find(user => user.id === userId) || null;
        },

        getAllUsers: () => {
          const state = get();
          return state.users;
        },

        addUser: (user: Omit<User, 'id'>) => {
          const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newUser: User = {
            ...user,
            id: newUserId,
          };

          set((state) => ({
            users: [...state.users, newUser],
          }));

          return newUserId;
        },

        updateUser: (userId: string, updates: Partial<Omit<User, 'id'>>) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, ...updates } : user
            ),
          }));
        },

        deleteUser: (userId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, is_deleted: true } : user
            ),
          }));
        },

        restoreUser: (userId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, is_deleted: false } : user
            ),
          }));
        },

        restrictUser: (userId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, is_restricted: true } : user
            ),
          }));
        },

        unrestrictUser: (userId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, is_restricted: false } : user
            ),
          }));
        },

        addReviewToUser: (userId: string, reviewId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId && !user.reviews.includes(reviewId)
                ? { ...user, reviews: [...user.reviews, reviewId] }
                : user
            ),
          }));
        },

        removeReviewFromUser: (userId: string, reviewId: string) => {
          set((state) => ({
            users: state.users.map(user =>
              user.id === userId
                ? { ...user, reviews: user.reviews.filter(id => id !== reviewId) }
                : user
            ),
          }));
        },

        getActiveUsers: () => {
          const state = get();
          return state.users.filter(user => !user.is_deleted);
        },

        getRestrictedUsers: () => {
          const state = get();
          return state.users.filter(user => user.is_restricted);
        },
      }),
      {
        name: "users-store",
        partialize: (state) => ({
          users: state.users,
        }),
      }
    ),
    {
      name: "users-store",
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

