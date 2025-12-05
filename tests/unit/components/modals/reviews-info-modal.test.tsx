import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewsInfoModal from '@/components/modals/reviews-info-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  CircleCheck: () => <div data-testid="circle-check-icon">CircleCheck</div>,
}));

vi.mock('@/lib/utils/icons', () => ({
  FollowersIcon: () => <div data-testid="followers-icon">FollowersIcon</div>,
  MarketIcon: () => <div data-testid="market-icon">MarketIcon</div>,
}));

describe('ReviewsInfoModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ReviewsInfoModal isOpen={false} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Public reviews on DashDoor')).toBeInTheDocument();
  });

  it('should display all bullet points', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(
        'Customer reviews are about their relevant experiences with a merchant and the items they have tried.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Reviews are publicly available to customers and shared with merchants')
    ).toBeInTheDocument();
    expect(
      screen.getByText('All reviews are checked to ensure they meet our Review Guidelines.')
    ).toBeInTheDocument();
  });

  it('should display illustration image', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    const img = screen.getByAltText('Public reviews illustration');
    expect(img).toHaveAttribute('src', '/review-info.png');
  });

  it('should call onClose when close button is clicked', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when "Review Guidelines" button is clicked', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    const reviewGuidelinesButton = screen.getByText('Review Guidelines');
    fireEvent.click(reviewGuidelinesButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when "Got it" button is clicked', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    const gotItButton = screen.getByText('Got it');
    fireEvent.click(gotItButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(<ReviewsInfoModal isOpen={true} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId('reviews-info-modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
