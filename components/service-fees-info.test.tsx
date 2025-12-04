import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceFeesInfo from './service-fees-info';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
}));

describe('ServiceFeesInfo', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ServiceFeesInfo {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Pricing & Fees')).not.toBeInTheDocument();
    });

    it('should render dialog when isOpen is true', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Pricing & Fees')).toBeInTheDocument();
    });

    it('should display Menu Prices section', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Menu Prices')).toBeInTheDocument();
      expect(screen.getByText(/This merchant sets prices/i)).toBeInTheDocument();
    });

    it('should display Service Fee section', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Service Fee')).toBeInTheDocument();
      expect(screen.getByText(/This fee goes to Dashdoor/i)).toBeInTheDocument();
    });

    it('should display Delivery Fee section', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Delivery Fee')).toBeInTheDocument();
    });

    it('should display Other Dashdoor Fees section', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Other Dashdoor Fees')).toBeInTheDocument();
    });

    it('should display Government Fees section', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Government Fees')).toBeInTheDocument();
    });

    it('should display Checkout section', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    it('should display Got it button', () => {
      render(<ServiceFeesInfo {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
    });
  });

  describe('Dialog Close', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<ServiceFeesInfo isOpen={true} onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close dialog'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when Got it button is clicked', () => {
      const onClose = vi.fn();
      render(<ServiceFeesInfo isOpen={true} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<ServiceFeesInfo isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside dialog', () => {
      const onClose = vi.fn();
      render(<ServiceFeesInfo isOpen={true} onClose={onClose} />);

      // Click on the overlay (outside the dialog content)
      const overlay = screen.getByText('Pricing & Fees').closest('.fixed');
      if (overlay) {
        fireEvent.mouseDown(overlay);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });
});
