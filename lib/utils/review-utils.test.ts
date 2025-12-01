import {
  mergeReviewsWithChanges,
  getMergedVendorReviews,
  getMergedApprovedReviews,
  getMergedPendingReviews,
  calculateMergedAverageRating,
  getMergedUserReviewCount,
  getMergedReview,
  getMergedUserReviewForVendor,
} from './review-utils';
import type { UserReview } from '@/types/review-types';

describe('review-utils', () => {
  const mockApiReview: UserReview = {
    id: 'review1',
    userId: 'user1',
    userName: 'User One',
    userEmail: 'user1@example.com',
    userAvatar: null,
    vendorId: 'vendor1',
    vendorName: 'Vendor One',
    rating: 4,
    content: 'Great food!',
    approvalStatus: 'approved',
    ratedHelpfulBy: ['user2'],
    timestamp: '2024-01-01T00:00:00Z',
    photos: [],
    likedItems: [],
  };

  const mockApiReview2: UserReview = {
    id: 'review2',
    userId: 'user2',
    userName: 'User Two',
    userEmail: 'user2@example.com',
    userAvatar: null,
    vendorId: 'vendor1',
    vendorName: 'Vendor One',
    rating: 5,
    content: 'Excellent!',
    approvalStatus: 'approved',
    ratedHelpfulBy: [],
    timestamp: '2024-01-02T00:00:00Z',
    photos: [],
    likedItems: [],
  };

  const mockApiReview3: UserReview = {
    id: 'review3',
    userId: 'user3',
    userName: 'User Three',
    userEmail: 'user3@example.com',
    userAvatar: null,
    vendorId: 'vendor1',
    vendorName: 'Vendor One',
    rating: 3,
    content: 'Pending review',
    approvalStatus: 'pending',
    ratedHelpfulBy: [],
    timestamp: '2024-01-03T00:00:00Z',
    photos: [],
    likedItems: [],
  };

  const emptyStoreChanges = {
    newReviews: [],
    helpfulChanges: {},
    approvalChanges: {},
    deletedReviewIds: [],
  };

  describe('mergeReviewsWithChanges', () => {
    it('should return API reviews when no store changes', () => {
      const result = mergeReviewsWithChanges([mockApiReview], emptyStoreChanges);
      expect(result).toEqual([mockApiReview]);
    });

    it('should filter out deleted reviews', () => {
      const storeChanges = {
        ...emptyStoreChanges,
        deletedReviewIds: ['review1'],
      };
      const result = mergeReviewsWithChanges([mockApiReview], storeChanges);
      expect(result.length).toBe(0);
    });

    it('should apply helpful changes', () => {
      const storeChanges = {
        ...emptyStoreChanges,
        helpfulChanges: {
          review1: ['user2', 'user3'],
        },
      };
      const result = mergeReviewsWithChanges([mockApiReview], storeChanges);
      expect(result[0].ratedHelpfulBy).toEqual(['user2', 'user3']);
    });

    it('should apply approval status changes', () => {
      const storeChanges = {
        ...emptyStoreChanges,
        approvalChanges: {
          review3: 'approved' as const,
        },
      };
      const result = mergeReviewsWithChanges([mockApiReview3], storeChanges);
      expect(result[0].approvalStatus).toBe('approved');
    });

    it('should add new reviews', () => {
      const newReview: UserReview = {
        id: 'review4',
        userId: 'user4',
        userName: 'User Four',
        userEmail: 'user4@example.com',
        userAvatar: null,
        vendorId: 'vendor1',
        vendorName: 'Vendor One',
        rating: 5,
        content: 'New review',
        approvalStatus: 'approved',
        ratedHelpfulBy: [],
        timestamp: '2024-01-04T00:00:00Z',
        photos: [],
        likedItems: [],
      };
      const storeChanges = {
        ...emptyStoreChanges,
        newReviews: [newReview],
      };
      const result = mergeReviewsWithChanges([mockApiReview], storeChanges);
      expect(result.length).toBe(2);
      expect(result.some(r => r.id === 'review4')).toBe(true);
    });

    it('should not add duplicate new reviews', () => {
      const newReview: UserReview = {
        ...mockApiReview,
        id: 'review1', // Same ID as existing
      };
      const storeChanges = {
        ...emptyStoreChanges,
        newReviews: [newReview],
      };
      const result = mergeReviewsWithChanges([mockApiReview], storeChanges);
      expect(result.length).toBe(1);
    });
  });

  describe('getMergedVendorReviews', () => {
    it('should filter reviews by vendor ID', () => {
      const apiReviews = [
        mockApiReview, // vendor1
        {
          ...mockApiReview2,
          vendorId: 'vendor2',
        },
      ];
      const result = getMergedVendorReviews(apiReviews, 'vendor1', emptyStoreChanges);
      expect(result.length).toBe(1);
      expect(result[0].vendorId).toBe('vendor1');
    });
  });

  describe('getMergedApprovedReviews', () => {
    it('should return only approved reviews for vendor', () => {
      const apiReviews = [mockApiReview, mockApiReview2, mockApiReview3];
      const result = getMergedApprovedReviews(apiReviews, 'vendor1', emptyStoreChanges);
      expect(result.length).toBe(2);
      expect(result.every(r => r.approvalStatus === 'approved')).toBe(true);
    });

    it('should include reviews changed to approved', () => {
      const storeChanges = {
        ...emptyStoreChanges,
        approvalChanges: {
          review3: 'approved' as const,
        },
      };
      const result = getMergedApprovedReviews([mockApiReview3], 'vendor1', storeChanges);
      expect(result.length).toBe(1);
      expect(result[0].approvalStatus).toBe('approved');
    });
  });

  describe('getMergedPendingReviews', () => {
    it('should return only pending reviews for vendor', () => {
      const apiReviews = [mockApiReview, mockApiReview2, mockApiReview3];
      const result = getMergedPendingReviews(apiReviews, 'vendor1', emptyStoreChanges);
      expect(result.length).toBe(1);
      expect(result[0].approvalStatus).toBe('pending');
    });
  });

  describe('calculateMergedAverageRating', () => {
    it('should calculate average rating from approved reviews', () => {
      const apiReviews = [mockApiReview, mockApiReview2]; // ratings: 4, 5
      const result = calculateMergedAverageRating(apiReviews, 'vendor1', emptyStoreChanges);
      expect(result).toBe(4.5); // (4 + 5) / 2 = 4.5
    });

    it('should exclude pending reviews from calculation', () => {
      const apiReviews = [mockApiReview, mockApiReview2, mockApiReview3]; // ratings: 4, 5, 3
      const result = calculateMergedAverageRating(apiReviews, 'vendor1', emptyStoreChanges);
      expect(result).toBe(4.5); // Only approved: (4 + 5) / 2 = 4.5
    });

    it('should return 0 when no approved reviews', () => {
      const result = calculateMergedAverageRating([], 'vendor1', emptyStoreChanges);
      expect(result).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      const reviews: UserReview[] = [
        { ...mockApiReview, rating: 4 },
        { ...mockApiReview2, rating: 5 },
        {
          ...mockApiReview,
          id: 'review4',
          rating: 3,
        },
      ];
      const result = calculateMergedAverageRating(reviews, 'vendor1', emptyStoreChanges);
      // (4 + 5 + 3) / 3 = 4.0
      expect(result).toBe(4.0);
    });
  });

  describe('getMergedUserReviewCount', () => {
    it('should count reviews by user ID', () => {
      const apiReviews = [
        mockApiReview, // user1
        mockApiReview2, // user2
        {
          ...mockApiReview,
          id: 'review4',
        },
      ];
      const result = getMergedUserReviewCount(apiReviews, 'user1', emptyStoreChanges);
      expect(result).toBe(2);
    });

    it('should include new reviews in count', () => {
      const newReview: UserReview = {
        ...mockApiReview,
        id: 'review4',
        userId: 'user1',
      };
      const storeChanges = {
        ...emptyStoreChanges,
        newReviews: [newReview],
      };
      const result = getMergedUserReviewCount([mockApiReview], 'user1', storeChanges);
      expect(result).toBe(2);
    });
  });

  describe('getMergedReview', () => {
    it('should return review by ID', () => {
      const result = getMergedReview([mockApiReview], 'review1', emptyStoreChanges);
      expect(result).toEqual(mockApiReview);
    });

    it('should return null when review not found', () => {
      const result = getMergedReview([mockApiReview], 'nonexistent', emptyStoreChanges);
      expect(result).toBeNull();
    });

    it('should return null when review is deleted', () => {
      const storeChanges = {
        ...emptyStoreChanges,
        deletedReviewIds: ['review1'],
      };
      const result = getMergedReview([mockApiReview], 'review1', storeChanges);
      expect(result).toBeNull();
    });
  });

  describe('getMergedUserReviewForVendor', () => {
    it('should return user review for specific vendor', () => {
      const result = getMergedUserReviewForVendor(
        [mockApiReview],
        'vendor1',
        'user1',
        emptyStoreChanges
      );
      expect(result).toEqual(mockApiReview);
    });

    it('should return null when no review found', () => {
      const result = getMergedUserReviewForVendor(
        [mockApiReview],
        'vendor1',
        'user999',
        emptyStoreChanges
      );
      expect(result).toBeNull();
    });

    it('should return null for different vendor', () => {
      const result = getMergedUserReviewForVendor(
        [mockApiReview],
        'vendor2',
        'user1',
        emptyStoreChanges
      );
      expect(result).toBeNull();
    });
  });
});
