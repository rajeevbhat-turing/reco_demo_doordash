import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddressReviewErrorModal from '@/components/modals/landing-page/address-review-error-modal';

// Mock icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('AddressReviewErrorModal', () => {
  const mockOnClose = vi.fn();
  const mockOnReviewAddress = vi.fn();
  const mockOnEnterNewAddress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    // Clean up body overflow
    document.body.style.overflow = 'auto';
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <AddressReviewErrorModal
          isOpen={false}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      expect(screen.getByText("We can't add this address at the moment")).toBeInTheDocument();
    });

    it('should render error message', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      expect(screen.getByText("We can't add this address at the moment")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We're currently reviewing the address. Please check for any typos and re-enter your address."
        )
      ).toBeInTheDocument();
    });

    it('should render modal title on desktop', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      // Title is hidden on mobile, but should exist in DOM
      const title = screen.getByText('Add new address');
      expect(title).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      expect(screen.getByText('Review address')).toBeInTheDocument();
      expect(screen.getByText('Enter new address')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onReviewAddress when "Review address" button is clicked', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      const reviewButton = screen.getByText('Review address');
      fireEvent.click(reviewButton);

      expect(mockOnReviewAddress).toHaveBeenCalledTimes(1);
    });

    it('should call onEnterNewAddress when "Enter new address" button is clicked', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      const enterNewButton = screen.getByText('Enter new address');
      fireEvent.click(enterNewButton);

      expect(mockOnEnterNewAddress).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when Escape key is pressed', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      // Click outside the modal (on the backdrop)
      const backdrop = screen.getByTestId('address-review-error-modal-backdrop');
      if (backdrop) {
        fireEvent.mouseDown(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside modal', () => {
      render(
        <AddressReviewErrorModal
          isOpen={true}
          onClose={mockOnClose}
          onReviewAddress={mockOnReviewAddress}
          onEnterNewAddress={mockOnEnterNewAddress}
        />
      );

      const reviewButton = screen.getByText('Review address');
      fireEvent.mouseDown(reviewButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
