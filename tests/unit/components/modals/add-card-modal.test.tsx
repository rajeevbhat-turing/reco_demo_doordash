import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCardModal from '@/components/modals/add-card-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('AddCardModal', () => {
  const mockOnClose = vi.fn();
  const mockOnAddCard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AddCardModal isOpen={false} onClose={mockOnClose} onAddCard={mockOnAddCard} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    expect(screen.getByText('Add New Card')).toBeInTheDocument();
  });

  it('should display all form fields', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    expect(screen.getByPlaceholderText('XXXX XXXX XXXX XXXX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CVC')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM / YY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Zip Code')).toBeInTheDocument();
  });

  it('should format card number with spaces', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });

    expect(cardNumberInput.value).toBe('1234 5678 9012 3456');
  });

  it('should limit card number to 16 digits', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    fireEvent.change(cardNumberInput, { target: { value: '12345678901234567890' } });

    // Should only accept 16 digits
    expect(cardNumberInput.value.replace(/\s/g, '').length).toBeLessThanOrEqual(16);
  });

  it('should format expiration date as MM / YY', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const expirationInput = screen.getByPlaceholderText('MM / YY') as HTMLInputElement;
    fireEvent.change(expirationInput, { target: { value: '1225' } });

    expect(expirationInput.value).toBe('12 / 25');
  });

  it('should limit expiration to 4 digits', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const expirationInput = screen.getByPlaceholderText('MM / YY') as HTMLInputElement;
    fireEvent.change(expirationInput, { target: { value: '12256' } });

    // Should only accept 4 digits
    expect(expirationInput.value.replace(/\s|\//g, '').length).toBeLessThanOrEqual(4);
  });

  it('should limit CVC to 4 digits', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cvcInput = screen.getByPlaceholderText('CVC') as HTMLInputElement;
    fireEvent.change(cvcInput, { target: { value: '12345' } });

    expect(cvcInput.value.length).toBeLessThanOrEqual(4);
  });

  it('should only allow numeric input for card number', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    fireEvent.change(cardNumberInput, { target: { value: 'abc123def456' } });

    // Component formats as groups of 4 digits: "1234 56"
    expect(cardNumberInput.value).toBe('1234 56');
  });

  it('should only allow numeric input for CVC', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cvcInput = screen.getByPlaceholderText('CVC') as HTMLInputElement;
    fireEvent.change(cvcInput, { target: { value: 'abc123' } });

    expect(cvcInput.value).toBe('123');
  });

  it('should only allow numeric input for zip code', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const zipCodeInput = screen.getByPlaceholderText('Zip Code') as HTMLInputElement;
    fireEvent.change(zipCodeInput, { target: { value: 'abc12345' } });

    expect(zipCodeInput.value).toBe('12345');
  });

  it('should show error when card number is invalid', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    fireEvent.change(cardNumberInput, { target: { value: '123' } });

    const addButton = screen.getByText('Add Card');
    fireEvent.click(addButton);

    expect(screen.getByText('Card number must be 16 digits')).toBeInTheDocument();
  });

  it('should show error when CVC is invalid', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    const cvcInput = screen.getByPlaceholderText('CVC') as HTMLInputElement;

    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
    fireEvent.change(cvcInput, { target: { value: '12' } });

    const addButton = screen.getByText('Add Card');
    fireEvent.click(addButton);

    expect(screen.getByText('CVC must be 3 or 4 digits')).toBeInTheDocument();
  });

  it('should show error when expiration is invalid', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    const cvcInput = screen.getByPlaceholderText('CVC') as HTMLInputElement;
    const expirationInput = screen.getByPlaceholderText('MM / YY') as HTMLInputElement;
    const zipCodeInput = screen.getByPlaceholderText('Zip Code') as HTMLInputElement;

    // Fill all required fields
    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
    fireEvent.change(cvcInput, { target: { value: '123' } });
    fireEvent.change(zipCodeInput, { target: { value: '12345' } });

    // Set invalid expiration - use an invalid month (13)
    fireEvent.change(expirationInput, { target: { value: '1325' } });

    const addButton = screen.getByText('Add Card');
    fireEvent.click(addButton);

    // Component shows "Invalid month" when month is > 12
    expect(screen.getByText('Invalid month')).toBeInTheDocument();
  });

  it('should show error when zip code is invalid', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    const zipCodeInput = screen.getByPlaceholderText('Zip Code') as HTMLInputElement;

    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
    fireEvent.change(zipCodeInput, { target: { value: '123' } });

    const addButton = screen.getByText('Add Card');
    fireEvent.click(addButton);

    expect(screen.getByText('ZIP code must be 5 digits')).toBeInTheDocument();
  });

  it('should call onAddCard with correct data when form is valid', () => {
    // Use a future expiration date to avoid expiration validation errors
    const futureYear = (new Date().getFullYear() % 100) + 5;
    const futureExpiration = `12${futureYear.toString().padStart(2, '0')}`;

    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    const cvcInput = screen.getByPlaceholderText('CVC') as HTMLInputElement;
    const expirationInput = screen.getByPlaceholderText('MM / YY') as HTMLInputElement;
    const zipCodeInput = screen.getByPlaceholderText('Zip Code') as HTMLInputElement;

    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
    fireEvent.change(cvcInput, { target: { value: '123' } });
    fireEvent.change(expirationInput, { target: { value: futureExpiration } });
    fireEvent.change(zipCodeInput, { target: { value: '12345' } });

    const addButton = screen.getByText('Add Card');
    fireEvent.click(addButton);

    // Component formats card number with spaces and expiration with spaces
    expect(mockOnAddCard).toHaveBeenCalledWith({
      cardNumber: '1234 5678 9012 3456', // Formatted with spaces
      cvc: '123',
      expiration: `12 / ${futureYear.toString().padStart(2, '0')}`, // Formatted with spaces
      zipCode: '12345',
    });
    // Note: Component doesn't call onClose, it resets the form
  });

  it('should clear errors when user types', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const cardNumberInput = screen.getByPlaceholderText('XXXX XXXX XXXX XXXX') as HTMLInputElement;
    const addButton = screen.getByText('Add Card');

    // Trigger error
    fireEvent.change(cardNumberInput, { target: { value: '123' } });
    fireEvent.click(addButton);
    expect(screen.getByText('Card number must be 16 digits')).toBeInTheDocument();

    // Type again - error should clear
    fireEvent.change(cardNumberInput, { target: { value: '1234' } });
    expect(screen.queryByText('Card number must be 16 digits')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const closeButton = screen.getByLabelText('Close modal');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(<AddCardModal isOpen={true} onClose={mockOnClose} onAddCard={mockOnAddCard} />);

    const outsideTarget = document.createElement('div');
    document.body.appendChild(outsideTarget);

    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(mouseDownEvent, 'target', {
      writable: false,
      value: outsideTarget,
    });

    document.dispatchEvent(mouseDownEvent);
    document.body.removeChild(outsideTarget);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
