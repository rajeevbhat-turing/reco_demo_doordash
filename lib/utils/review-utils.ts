import { UserReview } from '@/types/review-types';

/**
 * Utility functions for merging API reviews with session-specific changes
 *
 * Architecture: localStorage (store changes) > Database (API data)
 */

/**
 * Merge API reviews with session-specific changes from store
 * Priority: Store changes override API data
 * Deleted reviews are filtered out
 */
export function mergeReviewsWithChanges(
  apiReviews: UserReview[],
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): UserReview[] {
  const { newReviews, helpfulChanges, approvalChanges, deletedReviewIds } = storeReviewChanges;

  // Create a Set for fast lookup of deleted review IDs
  const deletedIdsSet = new Set(deletedReviewIds);

  // Create a map of API reviews by ID for easy lookup
  const apiReviewsMap = new Map<string, UserReview>();
  apiReviews.forEach(review => {
    apiReviewsMap.set(review.id, review);
  });

  // Filter out deleted reviews and apply session-specific changes to API reviews
  const mergedReviews: UserReview[] = apiReviews
    .filter(review => !deletedIdsSet.has(review.id)) // Filter out deleted reviews
    .map(review => {
      const updatedReview = { ...review };

      // Apply helpful rating changes (if any)
      // helpfulChanges contains the final state after toggles in this session
      if (helpfulChanges[review.id]) {
        updatedReview.ratedHelpfulBy = helpfulChanges[review.id];
      }

      // Apply approval status changes (if any)
      if (approvalChanges[review.id]) {
        updatedReview.approvalStatus = approvalChanges[review.id];
      }

      return updatedReview;
    });

  // Add new reviews created in this session
  // Filter out any that might already exist in API or are deleted (shouldn't happen, but safety check)
  const newReviewIds = new Set(apiReviews.map(r => r.id));
  const uniqueNewReviews = newReviews.filter(
    review => !newReviewIds.has(review.id) && !deletedIdsSet.has(review.id)
  );

  // Combine merged API reviews with new session reviews
  return [...mergedReviews, ...uniqueNewReviews];
}

/**
 * Get reviews for a vendor, merging API data with store changes
 */
export function getMergedVendorReviews(
  apiReviews: UserReview[],
  vendorId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): UserReview[] {
  const merged = mergeReviewsWithChanges(apiReviews, storeReviewChanges);
  return merged.filter(review => review.vendorId === vendorId);
}

/**
 * Get approved reviews for a vendor, merging API data with store changes
 * Returns reviews sorted by timestamp in descending order (newest first)
 */
export function getMergedApprovedReviews(
  apiReviews: UserReview[],
  vendorId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): UserReview[] {
  const merged = mergeReviewsWithChanges(apiReviews, storeReviewChanges);
  return merged
    .filter(review => review.vendorId === vendorId && review.approvalStatus === 'approved')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get pending reviews for a vendor, merging API data with store changes
 */
export function getMergedPendingReviews(
  apiReviews: UserReview[],
  vendorId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): UserReview[] {
  const merged = mergeReviewsWithChanges(apiReviews, storeReviewChanges);
  return merged.filter(
    review => review.vendorId === vendorId && review.approvalStatus === 'pending'
  );
}

/**
 * Calculate average rating from merged reviews
 */
export function calculateMergedAverageRating(
  apiReviews: UserReview[],
  vendorId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): number {
  const approvedReviews = getMergedApprovedReviews(apiReviews, vendorId, storeReviewChanges);

  if (approvedReviews.length === 0) return 0;

  const average =
    approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
}

/**
 * Get user review count from merged reviews
 */
export function getMergedUserReviewCount(
  apiReviews: UserReview[],
  userId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): number {
  const merged = mergeReviewsWithChanges(apiReviews, storeReviewChanges);
  return merged.filter(review => review.userId === userId).length;
}

/**
 * Get a single review by ID, merging API data with store changes
 */
export function getMergedReview(
  apiReviews: UserReview[],
  reviewId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): UserReview | null {
  const merged = mergeReviewsWithChanges(apiReviews, storeReviewChanges);
  return merged.find(review => review.id === reviewId) || null;
}

/**
 * Get user's review for a specific vendor, merging API data with store changes
 */
export function getMergedUserReviewForVendor(
  apiReviews: UserReview[],
  vendorId: string,
  userId: string,
  storeReviewChanges: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  }
): UserReview | null {
  const merged = mergeReviewsWithChanges(apiReviews, storeReviewChanges);
  return merged.find(review => review.vendorId === vendorId && review.userId === userId) || null;
}
