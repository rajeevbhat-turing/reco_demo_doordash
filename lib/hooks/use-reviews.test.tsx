import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useReviews,
  useStoreReviews,
  useStoreApprovedReviews,
  useUserReviews,
  useReview,
} from './use-reviews';
// useReviewStore is mocked, not directly used
import { UserReview } from '@/types/review-types';

// Mock fetch
global.fetch = vi.fn();

// Mock the store
vi.mock('@/store/review-store', () => {
  const mockUseReviewStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector({
        newReviews: [],
        helpfulChanges: {},
        approvalChanges: {},
        deletedReviewIds: [],
      });
    }
    return {
      newReviews: [],
      helpfulChanges: {},
      approvalChanges: {},
      deletedReviewIds: [],
    };
  });

  return {
    useReviewStore: mockUseReviewStore,
  };
});

// Mock review utils
vi.mock('@/lib/utils/review-utils', () => ({
  mergeReviewsWithChanges: vi.fn((reviews, _changes) => reviews),
  getMergedVendorReviews: vi.fn((reviews, _storeId, _changes) => reviews),
  getMergedApprovedReviews: vi.fn((reviews, _storeId, _changes) => reviews),
  getMergedPendingReviews: vi.fn((reviews, _storeId, _changes) => reviews),
  calculateMergedAverageRating: vi.fn((_reviews, _storeId, _changes) => 4.5),
  getMergedUserReviewCount: vi.fn((_reviews, _userId, _changes) => _reviews.length),
  getMergedReview: vi.fn((reviews, _reviewId, _changes) => reviews[0]),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('useReviews', () => {
  const mockReviews: UserReview[] = [
    {
      id: 'review1',
      vendorId: 'store1',
      vendorName: 'Test Store',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 5,
      content: 'Great food!',
      timestamp: '2024-01-01T00:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should fetch reviews successfully without params', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(() => useReviews(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReviews);
    expect(fetch).toHaveBeenCalledWith('/api/reviews?');
  });

  it('should fetch reviews with params', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(
      () =>
        useReviews({
          storeId: 'store1',
          userId: 'user1',
          approvalStatus: 'approved',
          limit: 10,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/reviews?storeId=store1&userId=user1&approvalStatus=approved&limit=10'
    );
  });

  it('should handle error when fetch fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'Failed to fetch reviews',
      }),
    });

    const { result } = renderHook(() => useReviews(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useStoreReviews', () => {
  const mockReviews: UserReview[] = [
    {
      id: 'review1',
      vendorId: 'store1',
      vendorName: 'Test Store',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 5,
      content: 'Great food!',
      timestamp: '2024-01-01T00:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch store reviews successfully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(() => useStoreReviews('store1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReviews);
    expect(fetch).toHaveBeenCalledWith('/api/reviews/store1');
  });

  it('should fetch store reviews with approval status', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(() => useStoreReviews('store1', 'approved'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith('/api/reviews/store1?approvalStatus=approved');
  });

  it('should not fetch when storeId is empty', () => {
    const { result } = renderHook(() => useStoreReviews(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('useStoreApprovedReviews', () => {
  const mockReviews: UserReview[] = [
    {
      id: 'review1',
      vendorId: 'store1',
      vendorName: 'Test Store',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 5,
      content: 'Great food!',
      timestamp: '2024-01-01T00:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch approved reviews successfully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(() => useStoreApprovedReviews('store1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith('/api/reviews/store1/approved');
  });
});

describe('useUserReviews', () => {
  const mockReviews: UserReview[] = [
    {
      id: 'review1',
      vendorId: 'store1',
      vendorName: 'Test Store',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 5,
      content: 'Great food!',
      timestamp: '2024-01-01T00:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user reviews successfully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(() => useUserReviews('user1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith('/api/reviews/user/user1');
  });

  it('should fetch user reviews with approval status', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReviews,
      }),
    });

    const { result } = renderHook(() => useUserReviews('user1', 'approved'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith('/api/reviews/user/user1?approvalStatus=approved');
  });

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useUserReviews(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('useReview', () => {
  const mockReview: UserReview = {
    id: 'review1',
    vendorId: 'store1',
    vendorName: 'Test Store',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Great food!',
    timestamp: '2024-01-01T00:00:00Z',
    photos: [],
    ratedHelpfulBy: [],
    approvalStatus: 'approved',
    likedItems: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch review successfully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockReview,
      }),
    });

    const { result } = renderHook(() => useReview('review1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetch).toHaveBeenCalledWith('/api/reviews/review/review1');
  });

  it('should not fetch when reviewId is empty', () => {
    const { result } = renderHook(() => useReview(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
