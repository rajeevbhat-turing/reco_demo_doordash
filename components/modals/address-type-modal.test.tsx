import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddressTypeModal from './address-type-modal';
import { Address } from '@/lib/types/user-types';

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  Building2: () => <div data-testid="building2-icon">Building2</div>,
  Hotel: () => <div data-testid="hotel-icon">Hotel</div>,
  Building: () => <div data-testid="building-icon">Building</div>,
  MapPin: () => <div data-testid="mappin-icon">MapPin</div>,
}));

describe('AddressTypeModal', () => {
  const mockOnClose = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const mockAddressData: Omit<Address, 'id' | 'addressType'> = {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94104',
    lat: 37.7749,
    lng: -122.4194,
    personalLabel: 'home',
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
      <AddressTypeModal
        isOpen={false}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Address type')).toBeInTheDocument();
  });

  it('should display full address', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('123 Main St, San Francisco CA 94104')).toBeInTheDocument();
  });

  it('should display all address type options', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Use getAllByText for labels that might appear multiple times (icon + label)
    expect(screen.getAllByText('House').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Apartment').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hotel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Office').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0);
  });

  it('should show house as selected by default when no addressType', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Find button by finding the text and getting its parent button
    const houseText = screen.getAllByText('House').find(text => text.tagName === 'SPAN');
    const houseButton = houseText?.closest('button') as HTMLButtonElement;
    expect(houseButton).toHaveClass('border-gray-900', 'bg-gray-50');
  });

  it('should show provided addressType as selected', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={{ ...mockAddressData, addressType: 'apartment' }}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Find button by finding the text and getting its parent button
    const apartmentText = screen.getByText('Apartment');
    const apartmentButton = apartmentText.closest('button') as HTMLButtonElement;
    expect(apartmentButton).toHaveClass('border-gray-900', 'bg-gray-50');
  });

  it('should update selected type when clicking different option', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Find button by finding the text and getting its parent button
    const apartmentText = screen.getAllByText('Apartment').find(text => text.tagName === 'SPAN');
    const apartmentButton = apartmentText?.closest('button') as HTMLButtonElement;
    if (apartmentButton) {
      fireEvent.click(apartmentButton);
      expect(apartmentButton).toHaveClass('border-gray-900', 'bg-gray-50');
    }
  });

  it('should call onNext with selected type when Next is clicked', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const apartmentButton = screen.getByText('Apartment').closest('button');
    if (apartmentButton) {
      fireEvent.click(apartmentButton);
    }

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    expect(mockOnNext).toHaveBeenCalledWith('apartment');
  });

  it('should call onBack when Back button is clicked', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(
      <AddressTypeModal
        isOpen={true}
        onClose={mockOnClose}
        addressData={mockAddressData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    const backdrop = screen.getByTestId('address-type-modal-backdrop');
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
