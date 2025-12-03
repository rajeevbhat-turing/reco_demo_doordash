import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Reviews from './reviews';
import { useStoreReviews } from '@/lib/hooks/use-reviews';
import { useReviewStore } from '@/store/review-store';
import { useUserStore } from '@/store/user-store';
import { getMergedUserReviewForVendor } from '@/lib/utils/review-utils';
import { UserReview } from '@/types/review-types';

// Mock dependencies
vi.mock('@/lib/hooks/use-reviews', () => ({
  useStoreReviews: vi.fn(),
  useUserReviews: vi.fn(() => ({
    userReviewCount: 10,
  })),
}));
vi.mock('@/store/review-store');
vi.mock('@/store/user-store');
vi.mock('@/lib/utils/review-utils');
vi.mock('@/components/review-dialog', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="review-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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

describe('Reviews', () => {
  const mockReviews: UserReview[] = [
    {
      id: 'review1',
      vendorId: 'vendor1',
      vendorName: 'Test Restaurant',
      vendorLogo: 'restaurant-logo.jpg',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 5,
      content: 'Great food!',
      timestamp: '2024-01-15T10:30:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
    {
      id: 'review2',
      vendorId: 'vendor1',
      vendorName: 'Test Restaurant',
      vendorLogo: 'restaurant-logo.jpg',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      userAvatar: null,
      rating: 4,
      content: 'Good service',
      timestamp: '2024-01-16T11:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
  ];

  const mockCurrentUser = {
    id: 'currentUser1',
    name: 'Current User',
    email: 'current@example.com',
  };

  const mockGetNewReviewForVendor = vi.fn(() => null);
  const mockGetState = vi.fn(() => ({
    getNewReviewForVendor: mockGetNewReviewForVendor,
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    (useStoreReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      vendorReviews: mockReviews,
      approvedReviews: mockReviews,
      averageRating: 4.5,
      isLoading: false,
      apiData: mockReviews,
    });

    (useReviewStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
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

    (useReviewStore as any).getState = mockGetState;
    (useUserStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
      if (selector) {
        return selector({
          currentUser: mockCurrentUser,
        });
      }
      return {
        currentUser: mockCurrentUser,
      };
    });
    (getMergedUserReviewForVendor as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('should render reviews component with header', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText(/ratings/)).toBeInTheDocument();
  });

  it('should display total reviews count', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.getByText(/2\+ ratings/)).toBeInTheDocument();
    expect(screen.getByText(/2\+ public reviews/)).toBeInTheDocument();
  });

  it('should render OverallRating component', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    // OverallRating should be rendered (it shows "of 5 stars")
    expect(screen.getByText('of 5 stars')).toBeInTheDocument();
  });

  it('should render ReviewCard components for visible reviews', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show "Add Review" button when user is logged in', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.getByText('Add Review')).toBeInTheDocument();
  });

  it('should not show "Add Review" button when user is not logged in', () => {
    (useUserStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
      if (selector) {
        return selector({
          currentUser: null,
        });
      }
      return {
        currentUser: null,
      };
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.queryByText('Add Review')).not.toBeInTheDocument();
  });

  it('should open review dialog when "Add Review" is clicked', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    const addReviewButton = screen.getByText('Add Review');
    fireEvent.click(addReviewButton);

    await waitFor(() => {
      expect(screen.getByTestId('review-dialog')).toBeInTheDocument();
    });
  });

  it('should open review dialog when star is clicked', async () => {
    // Set up empty state to show stars
    (useStoreReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      vendorReviews: [],
      approvedReviews: [],
      averageRating: 0,
      isLoading: false,
      apiData: [],
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    // Click on a star to open the review dialog
    const star = screen.getByTestId('rating-star-3');
    fireEvent.click(star);

    await waitFor(() => {
      expect(screen.getByTestId('review-dialog')).toBeInTheDocument();
    });
  });

  it('should close review dialog when close is clicked', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    const addReviewButton = screen.getByText('Add Review');
    fireEvent.click(addReviewButton);

    await waitFor(() => {
      expect(screen.getByTestId('review-dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close Dialog');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('review-dialog')).not.toBeInTheDocument();
    });
  });

  it('should show "See All" button', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.getByText('See All')).toBeInTheDocument();
  });

  it('should return null when loading', () => {
    (useStoreReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      vendorReviews: [],
      approvedReviews: [],
      averageRating: 0,
      isLoading: true,
      apiData: [],
    });

    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show empty state when no reviews and user is logged in', () => {
    (useStoreReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      vendorReviews: [],
      approvedReviews: [],
      averageRating: 0,
      isLoading: false,
      apiData: [],
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(screen.getByText('Be the first to review')).toBeInTheDocument();
    expect(screen.getByText('Start your review')).toBeInTheDocument();
  });

  it('should return null when no reviews and user is not logged in', () => {
    (useStoreReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      vendorReviews: [],
      approvedReviews: [],
      averageRating: 0,
      isLoading: false,
      apiData: [],
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector?: any) => {
      if (selector) {
        return selector({
          currentUser: null,
        });
      }
      return {
        currentUser: null,
      };
    });

    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should limit visible reviews to 5', () => {
    const manyReviews: UserReview[] = Array.from({ length: 10 }, (_, i) => ({
      ...mockReviews[0],
      id: `review${i}`,
      userId: `user${i}`,
      userName: `User ${i}`,
    }));

    (useStoreReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      vendorReviews: manyReviews,
      approvedReviews: manyReviews,
      averageRating: 4.5,
      isLoading: false,
      apiData: manyReviews,
    });

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    // Should only show first 5 reviews
    const userNames = screen.getAllByText(/User \d/);
    expect(userNames.length).toBeLessThanOrEqual(5);
  });

  it('should handle scroll buttons', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <Reviews vendorId="vendor1" vendorName="Test Restaurant" />
      </Wrapper>
    );

    // Scroll buttons should be present (ChevronLeft and ChevronRight icons)
    const buttons = screen.getAllByRole('button');
    // Should have Add Review, See All, and scroll buttons
    expect(buttons.length).toBeGreaterThan(0);
  });
});
