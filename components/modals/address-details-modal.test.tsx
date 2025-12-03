import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddressDetailsModal from './address-details-modal';
import { Address } from '@/lib/types/user-types';

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
}));

describe('AddressDetailsModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnBack = vi.fn();

  const mockAddress: Address = {
    id: 'addr1',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
    addressType: 'house',
    lat: 37.7749,
    lng: -122.4194,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AddressDetailsModal
        isOpen={false}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when address is not provided', () => {
    const { container } = render(
      <AddressDetailsModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true and address is provided', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Address details')).toBeInTheDocument();
    expect(screen.getByText(/123 Main St, San Francisco, CA 94104/)).toBeInTheDocument();
  });

  it('should display full address', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText(/123 Main St, San Francisco, CA 94104/)).toBeInTheDocument();
  });

  it('should show address type dropdown when hideAddressType is false', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
        hideAddressType={false}
      />
    );

    expect(screen.getByText('Address type')).toBeInTheDocument();
    const addressTypeSelect = screen.getByRole('combobox');
    expect(addressTypeSelect).toBeInTheDocument();
  });

  it('should hide address type dropdown when hideAddressType is true', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
        hideAddressType={true}
      />
    );

    expect(screen.queryByText('Address type')).not.toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('should show house-specific fields when address type is house', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Gate code')).toBeInTheDocument();
  });

  it('should show apartment-specific fields when address type is apartment', () => {
    const apartmentAddress: Address = {
      ...mockAddress,
      addressType: 'apartment',
    };

    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={apartmentAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Apartment/Suite')).toBeInTheDocument();
    expect(screen.getByText('Entry code')).toBeInTheDocument();
    expect(screen.getByText('Building name')).toBeInTheDocument();
  });

  it('should show hotel-specific fields when address type is hotel', () => {
    const hotelAddress: Address = {
      ...mockAddress,
      addressType: 'hotel',
    };

    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={hotelAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Room/Suite')).toBeInTheDocument();
    expect(screen.getByText('Hotel name')).toBeInTheDocument();
  });

  it('should show office-specific fields when address type is office', () => {
    const officeAddress: Address = {
      ...mockAddress,
      addressType: 'office',
    };

    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={officeAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Suite/Floor')).toBeInTheDocument();
    expect(screen.getByText('Business name')).toBeInTheDocument();
  });

  it('should show other-specific fields when address type is other', () => {
    const otherAddress: Address = {
      ...mockAddress,
      addressType: 'other',
    };

    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={otherAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Suite/Floor')).toBeInTheDocument();
    expect(screen.getByText('Gate code')).toBeInTheDocument();
    expect(screen.getByText('Building name')).toBeInTheDocument();
  });

  it('should display delivery preferences', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Delivery preferences')).toBeInTheDocument();
    expect(screen.getByText('Leave at door')).toBeInTheDocument();
    expect(screen.getByText('Meet at a location')).toBeInTheDocument();
  });

  it('should display delivery instructions field', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Delivery instructions')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/ring the bell/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should display personal label options', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Personal label')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
  });

  it('should show custom label input when Custom is selected', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    const customButton = screen.getByRole('button', { name: 'Custom' });
    fireEvent.click(customButton);

    const customInput = screen.getByPlaceholderText('Enter custom label');
    expect(customInput).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave when Save button is clicked', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onBack when Back button is clicked and hideAddressType is true', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
        hideAddressType={true}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: 'Back' });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should update gate code when user types', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    // Find input by its position after the "Gate code" label
    const gateCodeLabel = screen.getByText('Gate code');
    const inputContainer = gateCodeLabel.parentElement;
    const gateCodeInput = inputContainer?.querySelector('input') as HTMLInputElement;
    expect(gateCodeInput).toBeInTheDocument();
    fireEvent.change(gateCodeInput, { target: { value: '1234' } });
    expect(gateCodeInput.value).toBe('1234');
  });

  it('should update delivery instructions when user types', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    const instructionsTextarea = screen.getByPlaceholderText(
      /ring the bell/i
    ) as HTMLTextAreaElement;
    fireEvent.change(instructionsTextarea, { target: { value: 'Ring doorbell twice' } });

    expect(instructionsTextarea.value).toBe('Ring doorbell twice');
  });

  it('should toggle delivery preference when clicking buttons', () => {
    render(
      <AddressDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        address={mockAddress}
        onSave={mockOnSave}
      />
    );

    const meetAtLocationButton = screen.getByText('Meet at a location');
    fireEvent.click(meetAtLocationButton);

    // Should show location options
    expect(screen.getByText('Door')).toBeInTheDocument();
    expect(screen.getByText('Outside')).toBeInTheDocument();
  });
});
