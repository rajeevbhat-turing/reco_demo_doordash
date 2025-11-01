'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { initialReviewData } from '@/constants/review-data';
import { UserReview } from '@/types/review-types';

interface ReviewStore {
  // State
  reviews: UserReview[];
  
  // Actions
  addReview: (review: Omit<UserReview, 'id' | 'timestamp' | 'approvalStatus'>) => void;
  updateReviewApproval: (reviewId: string, status: 'approved' | 'rejected') => void;
  getVendorReviews: (vendorId: string) => UserReview[];
  getApprovedReviews: (vendorId: string) => UserReview[];
  getPendingReviews: (vendorId: string) => UserReview[];
  calculateAverageRating: (vendorId: string) => number;
  deleteReview: (reviewId: string) => void;
  clearAllReviews: () => void;
  getUserReviewCount: (userId: string) => number;
  getReview: (reviewId: string) => UserReview | null;
  getReviewsByVendor: (vendorId: string) => UserReview[];
}

export const useReviewStore = create<ReviewStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        reviews: initialReviewData,

        // Actions
        addReview: (review: Omit<UserReview, 'id' | 'timestamp' | 'approvalStatus'>) => {
          const newReview: UserReview = {
            ...review,
            id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            approvalStatus: 'pending'
          };

          set((state) => ({
            reviews: [...state.reviews, newReview]
          }));
        },

        updateReviewApproval: (reviewId: string, status: 'approved' | 'rejected') => {
          set((state) => ({
            reviews: state.reviews.map(review =>
              review.id === reviewId ? { ...review, approvalStatus: status } : review
            )
          }));
        },

        getVendorReviews: (vendorId: string) => {
          const state = get();
          return state.reviews.filter(review => review.vendorId === vendorId);
        },

        getApprovedReviews: (vendorId: string) => {
          const state = get();
          return state.reviews.filter(
            review => review.vendorId === vendorId && review.approvalStatus === 'approved'
          );
        },

        getPendingReviews: (vendorId: string) => {
          const state = get();
          return state.reviews.filter(
            review => review.vendorId === vendorId && review.approvalStatus === 'pending'
          );
        },

        calculateAverageRating: (vendorId: string) => {
          const state = get();
          const approvedReviews = state.reviews.filter(
            review => review.vendorId === vendorId && review.approvalStatus === 'approved'
          );

          if (approvedReviews.length === 0) return 0;

          const average = approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length;
          return Math.round(average * 10) / 10; // Round to 1 decimal place
        },

        deleteReview: (reviewId: string) => {
          set((state) => ({
            reviews: state.reviews.filter(review => review.id !== reviewId)
          }));
        },

        clearAllReviews: () => {
          set({ reviews: [] });
        },

        // Counts total reviews by a specific user across all vendors
        getUserReviewCount: (userId: string) => {
          const state = get();
          return state.reviews.filter(review => review.userId === userId).length;
        },

        // Get a single review by ID
        getReview: (reviewId: string) => {
          const state = get();
          return state.reviews.find(review => review.id === reviewId) || null;
        },

        // Get all reviews for a vendor (approved and pending)
        getReviewsByVendor: (vendorId: string) => {
          const state = get();
          return state.reviews.filter(review => review.vendorId === vendorId);
        },
      }),
      {
        name: "review-store",
        partialize: (state) => ({
          reviews: state.reviews,
        }),
      }
    ),
    {
      name: "review-store",
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
