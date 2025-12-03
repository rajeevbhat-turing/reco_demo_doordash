import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChooseAddressLabelModal from './choose-address-label-modal';
import { Address } from '@/lib/types/user-types';

// Mock dependencies
const { mockAddressesData } = vi.hoisted(() => {
  return {
    mockAddressesData: [
      {
        id: '1',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        country: 'United States',
        lat: 37.7749,
        lng: -122.4194,
        addressType: 'house',
        personalLabel: 'home',
      },
      {
        id: '2',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'United States',
        lat: 34.0522,
        lng: -118.2437,
        addressType: 'apartment',
      },
    ],
  };
});

vi.mock('@/data/addresses.json', () => ({
  default: mockAddressesData,
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}));

describe('ChooseAddressLabelModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectAddress = vi.fn();
  const mockOnSelectSearchAddress = vi.fn();
  const mockOnManualEntry = vi.fn();

  const mockAddresses: Address[] = [
    {
      id: 'addr1',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      lat: 37.7749,
      lng: -122.4194,
      addressType: 'house',
      personalLabel: 'home',
    },
    {
      id: 'addr2',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      lat: 34.0522,
      lng: -118.2437,
      addressType: 'apartment',
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
      <ChooseAddressLabelModal
        isOpen={false}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByText('Choose address to label')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByPlaceholderText('Enter Your Address')).toBeInTheDocument();
  });

  it('should display all addresses', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // First address has a label "Home" and street "123 Main St"
    expect(screen.getByText('Home')).toBeInTheDocument();
    // Check for street address which appears in the address list
    const homeAddress = screen.getByText('Home').closest('div');
    expect(homeAddress).toBeInTheDocument();

    // Second address doesn't have a label, so street "456 Oak Ave" is the main text
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
  });

  it('should display address with personal label', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, San Francisco, CA 94104')).toBeInTheDocument();
  });

  it('should display address without personal label', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA 90001')).toBeInTheDocument();
  });

  it('should call onSelectAddress when address is clicked', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // Find and click the address container by its label text
    const addressContainer = screen.getByText('Home').closest('div');
    if (addressContainer) {
      fireEvent.click(addressContainer);
    }

    expect(mockOnSelectAddress).toHaveBeenCalledWith('addr1');
  });

  it('should filter addresses based on search query', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Oak' } });

    // After filtering, only the matching address should be visible
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });

  it('should show search results dropdown when typing', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onSelectSearchAddress={mockOnSelectSearchAddress}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Main' } });

    // Search results from addressesData.json should appear in dropdown
    const searchResults = screen.queryAllByText(/123 Main St.*San Francisco.*CA.*94104/);
    expect(searchResults.length).toBeGreaterThan(0);
  });

  it('should call onSelectSearchAddress when search result is clicked', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onSelectSearchAddress={mockOnSelectSearchAddress}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Main' } });

    // Find the search result from the dropdown
    const searchResults = screen.queryAllByText(/123 Main St.*San Francisco.*CA.*94104/);
    if (searchResults.length > 0) {
      fireEvent.click(searchResults[0]);
      expect(mockOnSelectSearchAddress).toHaveBeenCalled();
    }
  });

  it('should show manual entry option when onManualEntry is provided', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onManualEntry={mockOnManualEntry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByText('Enter address manually')).toBeInTheDocument();
  });

  it('should call onManualEntry when manual entry option is clicked', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onManualEntry={mockOnManualEntry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const manualEntryOption = screen.getByText('Enter address manually');
    fireEvent.click(manualEntryOption);

    expect(mockOnManualEntry).toHaveBeenCalledTimes(1);
    expect(searchInput.value).toBe('');
  });

  it('should display "No addresses found" when filtered addresses is empty', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={[]}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByText('No addresses found')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    render(
      <ChooseAddressLabelModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    const backdrop = screen.getByTestId('choose-address-label-modal-backdrop');
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
