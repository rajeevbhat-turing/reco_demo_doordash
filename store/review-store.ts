'use client';

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { UserReview } from '@/types/review-types';

/**
 * Review Store - Tracks only session-specific changes
 * - New reviews created in this session
 * - Helpful rating toggles (which users rated which reviews as helpful)
 * - Approval status changes (if any)
 * - Deleted review IDs
 */
interface ReviewStore {
  newReviews: UserReview[]; // New reviews created in this session
  helpfulChanges: Record<string, string[]>; // reviewId -> userIds who toggled helpful
  approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>; // reviewId -> new approval status
  deletedReviewIds: string[]; // Review IDs that have been deleted in this session

  // Actions
  addReview: (review: Omit<UserReview, 'id' | 'timestamp' | 'approvalStatus'>) => void;
  toggleHelpfulRating: (reviewId: string, userId: string, currentHelpfulBy?: string[]) => void;
  updateReviewApproval: (reviewId: string, status: 'approved' | 'rejected' | 'pending') => void;
  deleteReview: (reviewId: string) => void; // Delete a review (adds to deletedReviewIds)
  clearAllChanges: () => void; // Clear all session changes

  // Helper methods to check for changes
  hasHelpfulChange: (reviewId: string, userId: string) => boolean;
  getNewReview: (reviewId: string) => UserReview | null;
  getNewReviewForVendor: (vendorId: string, userId: string) => UserReview | null;
  isReviewDeleted: (reviewId: string) => boolean; // Check if a review is deleted
}

export const useReviewStore = create<ReviewStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        newReviews: [],
        helpfulChanges: {},
        approvalChanges: {},
        deletedReviewIds: [],

        // Add a new review
        addReview: (review: Omit<UserReview, 'id' | 'timestamp' | 'approvalStatus'>) => {
          const newReview: UserReview = {
            ...review,
            id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            approvalStatus: 'pending'
          };

          set((state) => ({
            newReviews: [...state.newReviews, newReview]
          }));
        },

        // Toggle helpful rating
        toggleHelpfulRating: (reviewId: string, userId: string, currentHelpfulBy?: string[]) => {
          set((state) => {
            // Use provided current state or get from store changes
            const baseHelpful = currentHelpfulBy || state.helpfulChanges[reviewId] || [];
            const isRatedHelpful = baseHelpful.includes(userId);

            const newHelpfulChanges = {
              ...state.helpfulChanges,
              [reviewId]: isRatedHelpful
                ? baseHelpful.filter(id => id !== userId)
                : [...baseHelpful, userId]
            };

            return {
              helpfulChanges: newHelpfulChanges
            };
          });
        },

        // Update review approval status
        updateReviewApproval: (reviewId: string, status: 'approved' | 'rejected' | 'pending') => {
          set((state) => ({
            approvalChanges: {
              ...state.approvalChanges,
              [reviewId]: status
            }
          }));
        },

        // Delete a review (can be from API or newly created)
        deleteReview: (reviewId: string) => {
          set((state) => {
            // Remove from newReviews if it's a newly created review
            const updatedNewReviews = state.newReviews.filter(review => review.id !== reviewId);
            
            // Add to deletedReviewIds if not already there
            const updatedDeletedIds = state.deletedReviewIds.includes(reviewId)
              ? state.deletedReviewIds
              : [...state.deletedReviewIds, reviewId];

            return {
              newReviews: updatedNewReviews,
              deletedReviewIds: updatedDeletedIds
            };
          });
        },

        // Clear all session changes
        clearAllChanges: () => {
          set({
            newReviews: [],
            helpfulChanges: {},
            approvalChanges: {},
            deletedReviewIds: []
          });
        },

        // Check if a user has toggled helpful for a review
        hasHelpfulChange: (reviewId: string, userId: string) => {
          const state = get();
          return state.helpfulChanges[reviewId]?.includes(userId) || false;
        },

        // Get a new review by ID
        getNewReview: (reviewId: string) => {
          const state = get();
          return state.newReviews.find(review => review.id === reviewId) || null;
        },

        // Get a user's new review for a specific vendor
        getNewReviewForVendor: (vendorId: string, userId: string) => {
          const state = get();
          return state.newReviews.find(
            review => review.vendorId === vendorId && review.userId === userId
          ) || null;
        },

        // Check if a review is deleted
        isReviewDeleted: (reviewId: string) => {
          const state = get();
          return state.deletedReviewIds.includes(reviewId);
        },
      }),
      {
        name: "review-store",
        partialize: (state) => ({
          newReviews: state.newReviews,
          helpfulChanges: state.helpfulChanges,
          approvalChanges: state.approvalChanges,
          deletedReviewIds: state.deletedReviewIds,
        }),
      }
    ),
    {
      name: "review-store",
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
