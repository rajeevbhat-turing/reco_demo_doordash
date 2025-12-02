import { vi } from 'vitest';
import { useReviewStore } from './review-store';
import { UserReview } from '@/types/review-types';

// Mock persist and devtools middleware
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('review-store', () => {
  const mockReview: Omit<UserReview, 'id' | 'timestamp' | 'approvalStatus'> = {
    vendorId: 'vendor1',
    vendorName: 'Test Restaurant',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Great food!',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
  };

  beforeEach(() => {
    // Reset store state before each test
    useReviewStore.setState({
      newReviews: [],
      helpfulChanges: {},
      approvalChanges: {},
      deletedReviewIds: [],
    });
  });

  describe('addReview', () => {
    it('should add a new review', () => {
      useReviewStore.getState().addReview(mockReview);

      const reviews = useReviewStore.getState().newReviews;
      expect(reviews).toHaveLength(1);
      expect(reviews[0].vendorId).toBe('vendor1');
      expect(reviews[0].userId).toBe('user1');
      expect(reviews[0].approvalStatus).toBe('approved');
      expect(reviews[0].id).toBeDefined();
      expect(reviews[0].timestamp).toBeDefined();
    });

    it('should generate unique IDs for reviews', () => {
      useReviewStore.getState().addReview(mockReview);
      useReviewStore.getState().addReview(mockReview);

      const reviews = useReviewStore.getState().newReviews;
      expect(reviews[0].id).not.toBe(reviews[1].id);
    });

    it('should set timestamp when adding review', () => {
      const beforeTime = Date.now();
      useReviewStore.getState().addReview(mockReview);
      const afterTime = Date.now();

      const review = useReviewStore.getState().newReviews[0];
      const reviewTime = new Date(review.timestamp).getTime();
      expect(reviewTime).toBeGreaterThanOrEqual(beforeTime - 1000); // Allow 1 second margin
      expect(reviewTime).toBeLessThanOrEqual(afterTime + 1000); // Allow 1 second margin
    });
  });

  describe('toggleHelpfulRating', () => {
    it('should add user to helpful ratings when not rated', () => {
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1');

      expect(useReviewStore.getState().hasHelpfulChange('review1', 'user1')).toBe(true);
    });

    it('should remove user from helpful ratings when already rated', () => {
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1');
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1');

      expect(useReviewStore.getState().hasHelpfulChange('review1', 'user1')).toBe(false);
    });

    it('should handle multiple users rating helpful', () => {
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1');
      useReviewStore.getState().toggleHelpfulRating('review1', 'user2');

      expect(useReviewStore.getState().hasHelpfulChange('review1', 'user1')).toBe(true);
      expect(useReviewStore.getState().hasHelpfulChange('review1', 'user2')).toBe(true);
    });

    it('should use currentHelpfulBy when provided', () => {
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1', ['user2']);

      // Should add user1 to the existing list
      const changes = useReviewStore.getState().helpfulChanges['review1'];
      expect(changes).toContain('user1');
      expect(changes).toContain('user2');
    });
  });

  describe('updateReviewApproval', () => {
    it('should update review approval status', () => {
      useReviewStore.getState().updateReviewApproval('review1', 'pending');

      const changes = useReviewStore.getState().approvalChanges;
      expect(changes['review1']).toBe('pending');
    });

    it('should update approval status to approved', () => {
      useReviewStore.getState().updateReviewApproval('review1', 'approved');

      const changes = useReviewStore.getState().approvalChanges;
      expect(changes['review1']).toBe('approved');
    });

    it('should update approval status to rejected', () => {
      useReviewStore.getState().updateReviewApproval('review1', 'rejected');

      const changes = useReviewStore.getState().approvalChanges;
      expect(changes['review1']).toBe('rejected');
    });
  });

  describe('deleteReview', () => {
    it('should add review ID to deletedReviewIds', () => {
      useReviewStore.getState().deleteReview('review1');

      expect(useReviewStore.getState().isReviewDeleted('review1')).toBe(true);
    });

    it('should remove review from newReviews if it exists', () => {
      useReviewStore.getState().addReview(mockReview);
      const review = useReviewStore.getState().newReviews[0];

      useReviewStore.getState().deleteReview(review.id);

      expect(useReviewStore.getState().newReviews).toHaveLength(0);
      expect(useReviewStore.getState().isReviewDeleted(review.id)).toBe(true);
    });

    it('should not duplicate deleted review IDs', () => {
      useReviewStore.getState().deleteReview('review1');
      useReviewStore.getState().deleteReview('review1');

      const deletedIds = useReviewStore.getState().deletedReviewIds;
      expect(deletedIds.filter(id => id === 'review1')).toHaveLength(1);
    });
  });

  describe('clearAllChanges', () => {
    it('should clear all session changes', () => {
      useReviewStore.getState().addReview(mockReview);
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1');
      useReviewStore.getState().updateReviewApproval('review1', 'pending');
      useReviewStore.getState().deleteReview('review2');

      useReviewStore.getState().clearAllChanges();

      expect(useReviewStore.getState().newReviews).toHaveLength(0);
      expect(useReviewStore.getState().helpfulChanges).toEqual({});
      expect(useReviewStore.getState().approvalChanges).toEqual({});
      expect(useReviewStore.getState().deletedReviewIds).toHaveLength(0);
    });
  });

  describe('hasHelpfulChange', () => {
    it('should return true when user has rated helpful', () => {
      useReviewStore.getState().toggleHelpfulRating('review1', 'user1');

      expect(useReviewStore.getState().hasHelpfulChange('review1', 'user1')).toBe(true);
    });

    it('should return false when user has not rated helpful', () => {
      expect(useReviewStore.getState().hasHelpfulChange('review1', 'user1')).toBe(false);
    });
  });

  describe('getNewReview', () => {
    it('should return new review by ID', () => {
      useReviewStore.getState().addReview(mockReview);
      const review = useReviewStore.getState().newReviews[0];

      const foundReview = useReviewStore.getState().getNewReview(review.id);
      expect(foundReview).toEqual(review);
    });

    it('should return null when review not found', () => {
      const foundReview = useReviewStore.getState().getNewReview('nonexistent');
      expect(foundReview).toBeNull();
    });
  });

  describe('getNewReviewForVendor', () => {
    it('should return user review for specific vendor', () => {
      useReviewStore.getState().addReview(mockReview);

      const review = useReviewStore.getState().getNewReviewForVendor('vendor1', 'user1');
      expect(review).toBeDefined();
      expect(review?.vendorId).toBe('vendor1');
      expect(review?.userId).toBe('user1');
    });

    it('should return null when no review found for vendor and user', () => {
      const review = useReviewStore.getState().getNewReviewForVendor('vendor1', 'user1');
      expect(review).toBeNull();
    });

    it('should return null for different vendor', () => {
      useReviewStore.getState().addReview(mockReview);

      const review = useReviewStore.getState().getNewReviewForVendor('vendor2', 'user1');
      expect(review).toBeNull();
    });

    it('should return null for different user', () => {
      useReviewStore.getState().addReview(mockReview);

      const review = useReviewStore.getState().getNewReviewForVendor('vendor1', 'user2');
      expect(review).toBeNull();
    });
  });

  describe('isReviewDeleted', () => {
    it('should return true for deleted review', () => {
      useReviewStore.getState().deleteReview('review1');

      expect(useReviewStore.getState().isReviewDeleted('review1')).toBe(true);
    });

    it('should return false for non-deleted review', () => {
      expect(useReviewStore.getState().isReviewDeleted('review1')).toBe(false);
    });
  });
});
