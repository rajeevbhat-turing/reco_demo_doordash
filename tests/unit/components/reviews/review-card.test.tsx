import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewCard from '@/components/reviews/review-card';
import { UserReview } from '@/types/review-types';
import { generateAvatarColor } from '@/lib/utils/helperFunctions';
import { useUserReviews } from '@/lib/hooks/use-reviews';

// Mock dependencies
vi.mock('@/lib/utils/helperFunctions', () => ({
  generateAvatarColor: vi.fn(),
}));

vi.mock('@/lib/hooks/use-reviews', () => ({
  useUserReviews: vi.fn(() => ({
    userReviewCount: 10,
  })),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ReviewCard', () => {
  const mockReview: UserReview = {
    id: 'review1',
    vendorId: 'vendor1',
    vendorName: 'Test Restaurant',
    vendorLogo: 'restaurant-logo.jpg',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Great food and excellent service!',
    timestamp: '2024-01-15T10:30:00Z',
    photos: [],
    ratedHelpfulBy: [],
    approvalStatus: 'approved',
    likedItems: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (generateAvatarColor as ReturnType<typeof vi.fn>).mockReturnValue('#f44336');
    (useUserReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      userReviewCount: 10,
    });
  });

  it('should render review card with user information', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('10 contributions')).toBeInTheDocument();
  });

  it('should display user avatar with first letter', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('J')).toBeInTheDocument();
    expect(generateAvatarColor).toHaveBeenCalledWith('John Doe');
  });

  it('should display rating stars correctly', () => {
    render(<ReviewCard review={mockReview} />);

    // Check that rating stars container is rendered
    const ratingStars = screen.getByTestId('rating-stars');
    expect(ratingStars).toBeInTheDocument();

    // For a 5-star rating, stars 1-5 should be filled
    const star1 = screen.getByTestId('rating-star-1');
    const star2 = screen.getByTestId('rating-star-2');
    const star3 = screen.getByTestId('rating-star-3');
    const star4 = screen.getByTestId('rating-star-4');
    const star5 = screen.getByTestId('rating-star-5');

    expect(star1).toHaveAttribute('data-filled', 'true');
    expect(star2).toHaveAttribute('data-filled', 'true');
    expect(star3).toHaveAttribute('data-filled', 'true');
    expect(star4).toHaveAttribute('data-filled', 'true');
    expect(star5).toHaveAttribute('data-filled', 'true');
  });

  it('should display formatted date', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText(/1\/15\/24/)).toBeInTheDocument();
  });

  it('should display review content', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Great food and excellent service!')).toBeInTheDocument();
  });

  it('should truncate long review content', () => {
    const longContentReview: UserReview = {
      ...mockReview,
      content: 'A'.repeat(150), // Longer than 120 characters
    };

    render(<ReviewCard review={longContentReview} />);

    const content = screen.getByText(/A+/);
    expect(content.textContent).toContain('...');
    expect(content.textContent?.length).toBeLessThanOrEqual(123); // 120 + '...'
  });

  it('should display "DashDoor order" when orderId is present', () => {
    const reviewWithOrder: UserReview = {
      ...mockReview,
      orderId: 'order123',
    };

    render(<ReviewCard review={reviewWithOrder} />);

    expect(screen.getByText(/DashDoor order/)).toBeInTheDocument();
  });

  it('should not display "DashDoor order" when orderId is not present', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.queryByText(/DashDoor order/)).not.toBeInTheDocument();
  });

  it('should link to user profile with correct href', () => {
    render(<ReviewCard review={mockReview} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/consumer/profile/user1?source=reviews_list');
  });

  it('should display contribution count from useUserReviews hook', () => {
    (useUserReviews as ReturnType<typeof vi.fn>).mockReturnValue({
      userReviewCount: 25,
    });

    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('25 contributions')).toBeInTheDocument();
    expect(useUserReviews).toHaveBeenCalledWith('user1');
  });

  it('should handle different ratings correctly', () => {
    const threeStarReview: UserReview = {
      ...mockReview,
      rating: 3,
    };

    render(<ReviewCard review={threeStarReview} />);

    // Should still render the component
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display partial star filling for 3-star rating', () => {
    const threeStarReview: UserReview = {
      ...mockReview,
      rating: 3,
    };

    render(<ReviewCard review={threeStarReview} />);

    // Check that rating stars container is rendered
    const ratingStars = screen.getByTestId('rating-stars');
    expect(ratingStars).toBeInTheDocument();

    // For a 3-star rating, stars 1-3 should be filled, stars 4-5 should not be filled
    const star1 = screen.getByTestId('rating-star-1');
    const star2 = screen.getByTestId('rating-star-2');
    const star3 = screen.getByTestId('rating-star-3');
    const star4 = screen.getByTestId('rating-star-4');
    const star5 = screen.getByTestId('rating-star-5');

    expect(star1).toHaveAttribute('data-filled', 'true');
    expect(star2).toHaveAttribute('data-filled', 'true');
    expect(star3).toHaveAttribute('data-filled', 'true');
    expect(star4).toHaveAttribute('data-filled', 'false');
    expect(star5).toHaveAttribute('data-filled', 'false');
  });

  it('should handle empty content', () => {
    const emptyContentReview: UserReview = {
      ...mockReview,
      content: '',
    };

    render(<ReviewCard review={emptyContentReview} />);

    // Should still render the card
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
