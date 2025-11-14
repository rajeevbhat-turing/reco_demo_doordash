'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReviewStore } from '@/store/review-store';
import { UserReview } from '@/types/review-types';
import {
  mergeReviewsWithChanges,
  getMergedVendorReviews,
  getMergedApprovedReviews,
  getMergedPendingReviews,
  calculateMergedAverageRating,
  getMergedUserReviewCount,
  getMergedReview,
} from '@/lib/utils/review-utils';

/**
 * Custom hook to fetch reviews from API and merge with session-specific changes
 * 
 * Architecture: Fetches from API (database) and merges with localStorage (store changes)
 * Priority: localStorage > Database
 */

/**
 * Fetch all reviews with optional filters
 */
export function useReviews(params?: {
  storeId?: string;
  userId?: string;
  approvalStatus?: 'approved' | 'rejected' | 'pending';
  limit?: number;
}) {
  const newReviews = useReviewStore(state => state.newReviews);
  const helpfulChanges = useReviewStore(state => state.helpfulChanges);
  const approvalChanges = useReviewStore(state => state.approvalChanges);
  const deletedReviewIds = useReviewStore(state => state.deletedReviewIds);
  
  const storeReviewChanges = useMemo(() => ({
    newReviews,
    helpfulChanges,
    approvalChanges,
    deletedReviewIds,
  }), [newReviews, helpfulChanges, approvalChanges, deletedReviewIds]);

  const query = useQuery<UserReview[]>({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.storeId) searchParams.set('storeId', params.storeId);
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.approvalStatus) searchParams.set('approvalStatus', params.approvalStatus);
      if (params?.limit) searchParams.set('limit', String(params.limit));

      const response = await fetch(`/api/reviews?${searchParams.toString()}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      return result.data;
    },
  });

  // Merge API data with store changes - memoized
  const mergedData = useMemo(() => {
    return query.data
      ? mergeReviewsWithChanges(query.data, storeReviewChanges)
      : undefined;
  }, [query.data, storeReviewChanges]);

  return {
    ...query,
    data: mergedData,
  };
}

/**
 * Fetch reviews for a specific store
 */
export function useStoreReviews(storeId: string, approvalStatus?: 'approved' | 'rejected' | 'pending') {
  const newReviews = useReviewStore(state => state.newReviews);
  const helpfulChanges = useReviewStore(state => state.helpfulChanges);
  const approvalChanges = useReviewStore(state => state.approvalChanges);
  const deletedReviewIds = useReviewStore(state => state.deletedReviewIds);
  
  const storeReviewChanges = useMemo(() => ({
    newReviews,
    helpfulChanges,
    approvalChanges,
    deletedReviewIds,
  }), [newReviews, helpfulChanges, approvalChanges, deletedReviewIds]);

  const query = useQuery<UserReview[]>({
    queryKey: ['reviews', 'store', storeId, approvalStatus],
    queryFn: async () => {
      const searchParams = approvalStatus ? `?approvalStatus=${approvalStatus}` : '';
      const response = await fetch(`/api/reviews/${storeId}${searchParams}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch store reviews');
      }

      return result.data;
    },
    enabled: !!storeId,
  });

  // Merge API data with store changes - memoized
  const mergedData = useMemo(() => {
    return query.data
      ? mergeReviewsWithChanges(query.data, storeReviewChanges)
      : undefined;
  }, [query.data, storeReviewChanges]);

  // Helper methods that work with merged data - memoized to prevent recalculation
  const vendorReviews = useMemo(() => {
    return query.data
      ? getMergedVendorReviews(query.data, storeId, storeReviewChanges)
      : [];
  }, [query.data, storeId, storeReviewChanges]);

  const approvedReviews = useMemo(() => {
    return query.data
      ? getMergedApprovedReviews(query.data, storeId, storeReviewChanges)
      : [];
  }, [query.data, storeId, storeReviewChanges]);

  const pendingReviews = useMemo(() => {
    return query.data
      ? getMergedPendingReviews(query.data, storeId, storeReviewChanges)
      : [];
  }, [query.data, storeId, storeReviewChanges]);

  const averageRating = useMemo(() => {
    return query.data
      ? calculateMergedAverageRating(query.data, storeId, storeReviewChanges)
      : 0;
  }, [query.data, storeId, storeReviewChanges]);

  return {
    ...query,
    data: mergedData,
    apiData: query.data, // Raw API data before merging
    vendorReviews,
    approvedReviews,
    pendingReviews,
    averageRating,
  };
}

/**
 * Fetch approved reviews for a specific store
 */
export function useStoreApprovedReviews(storeId: string) {
  const newReviews = useReviewStore(state => state.newReviews);
  const helpfulChanges = useReviewStore(state => state.helpfulChanges);
  const approvalChanges = useReviewStore(state => state.approvalChanges);
  const deletedReviewIds = useReviewStore(state => state.deletedReviewIds);
  
  const storeReviewChanges = useMemo(() => ({
    newReviews,
    helpfulChanges,
    approvalChanges,
    deletedReviewIds,
  }), [newReviews, helpfulChanges, approvalChanges, deletedReviewIds]);

  const query = useQuery<UserReview[]>({
    queryKey: ['reviews', 'store', storeId, 'approved'],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/${storeId}/approved`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch approved reviews');
      }

      return result.data;
    },
    enabled: !!storeId,
  });

  // Merge API data with store changes - memoized
  const mergedData = useMemo(() => {
    return query.data
      ? mergeReviewsWithChanges(query.data, storeReviewChanges)
      : undefined;
  }, [query.data, storeReviewChanges]);

  return {
    ...query,
    data: mergedData,
  };
}

/**
 * Fetch reviews by a specific user
 */
export function useUserReviews(userId: string, approvalStatus?: 'approved' | 'rejected' | 'pending') {
  const newReviews = useReviewStore(state => state.newReviews);
  const helpfulChanges = useReviewStore(state => state.helpfulChanges);
  const approvalChanges = useReviewStore(state => state.approvalChanges);
  const deletedReviewIds = useReviewStore(state => state.deletedReviewIds);
  
  const storeReviewChanges = useMemo(() => ({
    newReviews,
    helpfulChanges,
    approvalChanges,
    deletedReviewIds,
  }), [newReviews, helpfulChanges, approvalChanges, deletedReviewIds]);

  const query = useQuery<UserReview[]>({
    queryKey: ['reviews', 'user', userId, approvalStatus],
    queryFn: async () => {
      const searchParams = approvalStatus ? `?approvalStatus=${approvalStatus}` : '';
      const response = await fetch(`/api/reviews/user/${userId}${searchParams}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user reviews');
      }

      return result.data;
    },
    enabled: !!userId,
  });

  // Merge API data with store changes - memoized
  const mergedData = useMemo(() => {
    return query.data
      ? mergeReviewsWithChanges(query.data, storeReviewChanges)
      : undefined;
  }, [query.data, storeReviewChanges]);

  const userReviewCount = useMemo(() => {
    return query.data
      ? getMergedUserReviewCount(query.data, userId, storeReviewChanges)
      : 0;
  }, [query.data, userId, storeReviewChanges]);

  return {
    ...query,
    data: mergedData,
    userReviewCount,
  };
}

/**
 * Fetch a single review by ID
 */
export function useReview(reviewId: string) {
  const newReviews = useReviewStore(state => state.newReviews);
  const helpfulChanges = useReviewStore(state => state.helpfulChanges);
  const approvalChanges = useReviewStore(state => state.approvalChanges);
  const deletedReviewIds = useReviewStore(state => state.deletedReviewIds);
  
  const storeReviewChanges = useMemo(() => ({
    newReviews,
    helpfulChanges,
    approvalChanges,
    deletedReviewIds,
  }), [newReviews, helpfulChanges, approvalChanges, deletedReviewIds]);

  const query = useQuery<UserReview>({
    queryKey: ['reviews', reviewId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/review/${reviewId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch review');
      }

      return result.data;
    },
    enabled: !!reviewId,
  });

  // Merge API data with store changes - memoized
  const mergedData = useMemo(() => {
    return query.data
      ? getMergedReview([query.data], reviewId, storeReviewChanges)
      : undefined;
  }, [query.data, reviewId, storeReviewChanges]);

  return {
    ...query,
    data: mergedData || undefined,
  };
}

