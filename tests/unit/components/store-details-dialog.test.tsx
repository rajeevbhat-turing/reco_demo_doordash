import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StoreDetailsDialog from '@/components/store-details-dialog';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
  MapPin: () => <div data-testid="map-pin-icon">📍</div>,
  Clock: () => <div data-testid="clock-icon">🕐</div>,
  Phone: () => <div data-testid="phone-icon">📞</div>,
  ChevronDown: () => <div data-testid="chevron-down">▼</div>,
  ChevronUp: () => <div data-testid="chevron-up">▲</div>,
}));

const mockStore = {
  id: 'store-1',
  name: 'Pizza Palace',
  logo: '/logo.jpg',
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  isOpen: true,
  openingHours: '10:00 AM - 10:00 PM',
  phone: '(555) 123-4567',
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  store: mockStore,
};

describe('StoreDetailsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<StoreDetailsDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Pizza Palace')).not.toBeInTheDocument();
    });

    it('should render store name', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
    });

    it('should render store logo', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      const logo = screen.getByAltText('Pizza Palace');
      expect(logo).toHaveAttribute('src', '/logo.jpg');
    });

    it('should render full address', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      expect(screen.getByText(/123 Main St, San Francisco, CA 94102/)).toBeInTheDocument();
    });

    it('should render opening hours', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      expect(screen.getByText(/10:00 AM - 10:00 PM/)).toBeInTheDocument();
    });

    it('should render phone number', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    });
  });

  describe('Open/Closed Status', () => {
    it('should show Open now when isRestaurantOpen is true', () => {
      render(<StoreDetailsDialog {...defaultProps} isRestaurantOpen={true} />);
      expect(screen.getByText('Open now')).toBeInTheDocument();
    });

    it('should show Closed now when isRestaurantOpen is false', () => {
      render(<StoreDetailsDialog {...defaultProps} isRestaurantOpen={false} />);
      expect(screen.getByText('Closed now')).toBeInTheDocument();
    });

    it('should show Closed now when isRestaurantOpen is undefined', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      expect(screen.getByText('Closed now')).toBeInTheDocument();
    });
  });

  describe('Hours Expansion', () => {
    it('should not show weekly hours initially', () => {
      render(<StoreDetailsDialog {...defaultProps} />);
      expect(screen.queryByText('Monday')).not.toBeInTheDocument();
    });

    it('should show weekly hours when expanded', () => {
      render(<StoreDetailsDialog {...defaultProps} />);

      const expandButton = screen.getByTestId('chevron-down').parentElement!;
      fireEvent.click(expandButton);

      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
      expect(screen.getByText('Sunday')).toBeInTheDocument();
    });

    it('should hide weekly hours when collapsed', () => {
      render(<StoreDetailsDialog {...defaultProps} />);

      const expandButton = screen.getByTestId('chevron-down').parentElement!;
      fireEvent.click(expandButton);
      expect(screen.getByText('Monday')).toBeInTheDocument();

      const collapseButton = screen.getByTestId('chevron-up').parentElement!;
      fireEvent.click(collapseButton);
      expect(screen.queryByText('Monday')).not.toBeInTheDocument();
    });
  });

  describe('Dialog Close', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<StoreDetailsDialog {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<StoreDetailsDialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside dialog', () => {
      const onClose = vi.fn();
      render(<StoreDetailsDialog {...defaultProps} onClose={onClose} />);

      const overlay = screen.getByText('Pizza Palace').closest('.fixed');
      if (overlay) {
        fireEvent.mouseDown(overlay);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should render without logo', () => {
      const storeNoLogo = { ...mockStore, logo: undefined };
      render(<StoreDetailsDialog {...defaultProps} store={storeNoLogo} />);
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should show Address not available when no address', () => {
      const storeNoAddress = {
        ...mockStore,
        street: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        address: undefined,
      };
      render(<StoreDetailsDialog {...defaultProps} store={storeNoAddress} />);
      expect(screen.getByText('Address not available')).toBeInTheDocument();
    });
  });
});
