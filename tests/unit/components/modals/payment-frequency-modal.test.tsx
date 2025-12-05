import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentFrequencyModal from '@/components/modals/payment-frequency-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('PaymentFrequencyModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <PaymentFrequencyModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    expect(screen.getByText('Payment detail')).toBeInTheDocument();
  });

  it('should display both frequency options', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    expect(screen.getByText('Pay once a day')).toBeInTheDocument();
    expect(screen.getByText('Pay after each order')).toBeInTheDocument();
  });

  it('should show current frequency as selected', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    const onceADayText = screen.getByText('Pay once a day');
    expect(onceADayText).toBeInTheDocument();

    const radioDot = screen.getByTestId('radio-dot-once-a-day');
    expect(radioDot).toBeInTheDocument();
  });

  it('should update selected frequency when clicking option', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    const afterEachOrderOption = screen.getByText('Pay after each order').closest('div');
    if (afterEachOrderOption) {
      fireEvent.click(afterEachOrderOption);
    }

    const radioDot = screen.getByTestId('radio-dot-after-each-order');
    expect(radioDot).toBeInTheDocument();
  });

  it('should call onSave with selected frequency and onClose when Save is clicked', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    // Change to after-each-order
    const afterEachOrderOption = screen.getByText('Pay after each order').closest('div');
    if (afterEachOrderOption) {
      fireEvent.click(afterEachOrderOption);
    }

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('after-each-order');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Back button is clicked', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should display description text', () => {
    render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    expect(
      screen.getByText(
        'Choose to pay once for all your orders in a day or pay after each order. Available for personal profile orders using Mastercard, Visa, Apple Pay, or Discover.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Not available for business profiles, orders over $100.00, or orders paid with American Express, PayPal, Venmo, Cash App, Klarna, SNAP/EBT, or HSA/FSA cards.'
      )
    ).toBeInTheDocument();
  });

  it('should update selected frequency when currentFrequency prop changes', () => {
    const { rerender } = render(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="once-a-day"
      />
    );

    rerender(
      <PaymentFrequencyModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        currentFrequency="after-each-order"
      />
    );

    const afterEachOrderOption = screen.getByText('Pay after each order').closest('div');
    expect(afterEachOrderOption).toBeInTheDocument();
    const radioDot = screen.getByTestId('radio-dot-after-each-order');
    expect(radioDot).toBeInTheDocument();
  });
});
