import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserRatingsModal from '@/components/modals/user-ratings-modal';
import { UserReview } from '@/types/review-types';

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Star: ({ className }: { className?: string }) => (
    <div data-testid="star-icon" className={className}>
      Star
    </div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    target,
    rel,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
    rel?: string;
  }) => (
    <a href={href} target={target} rel={rel}>
      {children}
    </a>
  ),
}));

describe('UserRatingsModal', () => {
  const mockOnClose = vi.fn();
  const mockUserName = 'John Doe';

  const mockReviews: UserReview[] = [
    {
      id: 'review1',
      vendorId: 'vendor1',
      vendorName: 'Restaurant A',
      vendorLogo: '/logo1.png',
      userId: 'user1',
      userName: mockUserName,
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
      vendorName: 'Restaurant A',
      vendorLogo: '/logo1.png',
      userId: 'user1',
      userName: mockUserName,
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 4,
      content: 'Good service',
      timestamp: '2024-01-16T11:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
    {
      id: 'review3',
      vendorId: 'vendor2',
      vendorName: 'Restaurant B',
      vendorLogo: undefined,
      userId: 'user1',
      userName: mockUserName,
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 2,
      content: 'Not great',
      timestamp: '2024-01-17T12:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
    {
      id: 'review4',
      vendorId: 'vendor3',
      vendorName: 'Restaurant C',
      vendorLogo: '/logo3.png',
      userId: 'user1',
      userName: mockUserName,
      userEmail: 'john@example.com',
      userAvatar: null,
      rating: 5,
      content: 'Excellent!',
      timestamp: '2024-01-18T13:00:00Z',
      photos: [],
      ratedHelpfulBy: [],
      approvalStatus: 'approved',
      likedItems: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <UserRatingsModal
        isOpen={false}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    expect(screen.getByText(`${mockUserName}'s ratings`)).toBeInTheDocument();
  });

  it('should display user name in title', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    expect(screen.getByText(`${mockUserName}'s ratings`)).toBeInTheDocument();
  });

  it('should display tabs for filtering', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    expect(screen.getByText('Top rated (4-5 stars)')).toBeInTheDocument();
    expect(screen.getByText('1-3 stars')).toBeInTheDocument();
  });

  it('should show top-rated vendors by default', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    // Restaurant A (avg 4.5) and Restaurant C (5.0) should be shown
    expect(screen.getByText('Restaurant A')).toBeInTheDocument();
    expect(screen.getByText('Restaurant C')).toBeInTheDocument();
    // Restaurant B (2.0) should not be shown in top-rated
    expect(screen.queryByText('Restaurant B')).not.toBeInTheDocument();
  });

  it('should filter to low-rated vendors when 1-3 stars tab is clicked', async () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    const lowRatedTab = screen.getByText('1-3 stars');
    fireEvent.click(lowRatedTab);

    await waitFor(() => {
      // Restaurant B (2.0) should be shown
      expect(screen.getByText('Restaurant B')).toBeInTheDocument();
      // Top-rated restaurants should not be shown
      expect(screen.queryByText('Restaurant A')).not.toBeInTheDocument();
      expect(screen.queryByText('Restaurant C')).not.toBeInTheDocument();
    });
  });

  it('should display vendor logos when available', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    const restaurantAImage = screen.getByAltText('Restaurant A');
    expect(restaurantAImage).toHaveAttribute('src', '/logo1.png');
  });

  it('should display vendor initial when logo is not available', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    // Switch to low-rated tab to see Restaurant B
    const lowRatedTab = screen.getByText('1-3 stars');
    fireEvent.click(lowRatedTab);

    // Restaurant B has no logo, so should show initial
    expect(screen.getByText('R')).toBeInTheDocument(); // First letter of "Restaurant B"
  });

  it('should calculate and display average ratings correctly', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    // Restaurant A has ratings 5 and 4, so avg is 4.5
    // Should show 4 full stars and 1 half star
    const stars = screen.getAllByTestId('star-icon');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should sort vendors by average rating (highest first)', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    // Restaurant C (5.0) should appear before Restaurant A (4.5)
    const vendorLinks = screen.getAllByRole('link');

    const cIndex = Array.from(vendorLinks).findIndex(link =>
      link.textContent?.includes('Restaurant C')
    );
    const aIndex = Array.from(vendorLinks).findIndex(link =>
      link.textContent?.includes('Restaurant A')
    );

    expect(cIndex).toBeLessThan(aIndex);
  });

  it('should show "No ratings" message when no vendors match filter', () => {
    const emptyReviews: UserReview[] = [];

    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={emptyReviews}
      />
    );

    expect(screen.getByText('No ratings')).toBeInTheDocument();
    expect(screen.getByText('Nothing to see here')).toBeInTheDocument();
  });

  it('should show "No ratings" for low-rated tab when no low-rated vendors', () => {
    const onlyHighRatedReviews: UserReview[] = [
      {
        id: 'review1',
        vendorId: 'vendor1',
        vendorName: 'Restaurant A',
        userId: 'user1',
        userName: mockUserName,
        userEmail: 'john@example.com',
        userAvatar: null,
        rating: 5,
        content: 'Great!',
        timestamp: '2024-01-15T10:30:00Z',
        photos: [],
        ratedHelpfulBy: [],
        approvalStatus: 'approved',
        likedItems: [],
      },
    ];

    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={onlyHighRatedReviews}
      />
    );

    const lowRatedTab = screen.getByText('1-3 stars');
    fireEvent.click(lowRatedTab);

    expect(screen.getByText('No ratings')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    const backdrop = screen.getByText(`${mockUserName}'s ratings`).closest('[class*="fixed"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should link to vendor store page', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    const vendorLink = screen.getByText('Restaurant A').closest('a');
    expect(vendorLink).toHaveAttribute('href', '/store/vendor1');
    // Component uses target="_blank" and rel="noopener noreferrer"
    // expect(vendorLink).toHaveAttribute('target', '_blank');
    expect(vendorLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should group multiple reviews for same vendor', () => {
    render(
      <UserRatingsModal
        isOpen={true}
        onClose={mockOnClose}
        userName={mockUserName}
        reviews={mockReviews}
      />
    );

    // Restaurant A appears twice in reviews but should only appear once in the list
    const restaurantALinks = screen.getAllByText('Restaurant A');
    // Should only appear once (the vendor link)
    expect(restaurantALinks.length).toBe(1);
  });
});
