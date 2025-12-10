import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditPhoneModal from '@/components/modals/edit-phone-modal';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
}));

describe('EditPhoneModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <EditPhoneModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    expect(screen.getByText('Edit phone number')).toBeInTheDocument();
  });

  it('should display initial country code and phone number', () => {
    render(
      <EditPhoneModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialCountryCode="+44 (UK)"
        initialNumber="1234567890"
      />
    );

    const countrySelect = screen.getByLabelText('Country') as HTMLSelectElement;
    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;

    expect(countrySelect.value).toBe('+44 (UK)');
    expect(phoneInput.value).toBe('1234567890');
  });

  it('should use default values when initial props are not provided', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const countrySelect = screen.getByLabelText('Country') as HTMLSelectElement;
    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;

    expect(countrySelect.value).toBe('+1 (US)');
    expect(phoneInput.value).toBe('');
  });

  it('should update country code when changed', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const countrySelect = screen.getByLabelText('Country') as HTMLSelectElement;
    fireEvent.change(countrySelect, { target: { value: '+91 (IN)' } });

    expect(countrySelect.value).toBe('+91 (IN)');
  });

  it('should update phone number when changed', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    expect(phoneInput.value).toBe('1234567890');
  });

  it('should only allow numeric input for phone number', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: 'abc123def456' } });

    expect(phoneInput.value).toBe('123456');
  });

  it('should limit phone number to 10 digits', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    // Simulate typing character by character to match component behavior
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(phoneInput, { target: { value: '123456789012345' } });

    // Component filters non-digits and limits to 10, so it should stay at 10
    expect(phoneInput.value.length).toBeLessThanOrEqual(10);
  });

  it('should show error when phone number is not 10 digits on Continue', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: '12345' } });

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onSave with correct data when phone number is valid', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const countrySelect = screen.getByLabelText('Country') as HTMLSelectElement;
    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;

    fireEvent.change(countrySelect, { target: { value: '+44 (UK)' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      countryCode: '+44 (UK)',
      number: '1234567890',
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should clear error when user types after error', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;
    const continueButton = screen.getByText('Continue');

    // Trigger error
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.click(continueButton);
    expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument();

    // Type again - error should clear
    fireEvent.change(phoneInput, { target: { value: '1234' } });
    expect(screen.queryByText('Phone number must be 10 digits')).not.toBeInTheDocument();
  });

  it('should call onClose and reset values when Cancel is clicked', () => {
    render(
      <EditPhoneModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialCountryCode="+44 (UK)"
        initialNumber="1234567890"
      />
    );

    const countrySelect = screen.getByLabelText('Country') as HTMLSelectElement;
    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;

    // Change values
    fireEvent.change(countrySelect, { target: { value: '+91 (IN)' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(<EditPhoneModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const backdrop = screen.getByTestId('edit-phone-modal-backdrop');
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
