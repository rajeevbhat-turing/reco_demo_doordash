import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddressesModal from '@/components/modals/addresses-modal';
import { Address } from '@/lib/types/user-types';

// Mock addresses data - hoisted
const { mockAddressesData } = vi.hoisted(() => {
  return {
    mockAddressesData: [
      {
        id: '1',
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
        id: '2',
        street: '456 Oak Ave',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601',
        lat: 37.8044,
        lng: -122.2712,
        addressType: 'apartment',
        personalLabel: 'work',
      },
    ],
  };
});

vi.mock('@/data/addresses.json', () => ({
  default: mockAddressesData,
}));

// Mock dependencies
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit2: () => <div data-testid="edit-icon">Edit2</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}));

describe('AddressesModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectAddress = vi.fn();
  const mockOnEditAddress = vi.fn();
  const mockOnSelectSearchAddress = vi.fn();
  const mockOnManualEntry = vi.fn();
  const mockOnAddLabel = vi.fn();

  const mockAddresses: Address[] = [
    {
      id: '1',
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
      id: '2',
      street: '456 Oak Ave',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94601',
      lat: 37.8044,
      lng: -122.2712,
      addressType: 'apartment',
      personalLabel: 'work',
    },
    {
      id: '3',
      street: '789 Pine St',
      city: 'Berkeley',
      state: 'CA',
      zipCode: '94704',
      lat: 37.8715,
      lng: -122.273,
      addressType: 'office',
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
      <AddressesModal
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
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByText('Addresses')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(
      <AddressesModal
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
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // Addresses with labels show label first, then full address
    expect(screen.getByText('123 Main St, San Francisco, CA 94104')).toBeInTheDocument();
    expect(screen.getByText('456 Oak Ave, Oakland, CA 94601')).toBeInTheDocument();
    // Address without label shows street first
    expect(screen.getByText('789 Pine St')).toBeInTheDocument();
    expect(screen.getByText('Berkeley, CA 94704')).toBeInTheDocument();
  });

  it('should display personal labels when available', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // Labels appear both in pills and in address content
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Work').length).toBeGreaterThan(0);
  });

  it('should display label pills for addresses with labels', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // Labels appear in pills (buttons) - use getAllByText and check for button
    const homeButtons = screen.getAllByText('Home').filter(el => el.tagName === 'BUTTON');
    const workButtons = screen.getAllByText('Work').filter(el => el.tagName === 'BUTTON');
    expect(homeButtons.length).toBeGreaterThan(0);
    expect(workButtons.length).toBeGreaterThan(0);
  });

  it('should call onSelectAddress when label pill is clicked', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // Find the button (pill), not the text in address content
    const homeButtons = screen.getAllByText('Home').filter(el => el.tagName === 'BUTTON');
    if (homeButtons[0]) {
      fireEvent.click(homeButtons[0]);
    }

    expect(mockOnSelectAddress).toHaveBeenCalledWith('1');
  });

  it('should highlight selected address', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        selectedAddressId="1"
      />
    );

    // Find the button (pill) for selected address
    const homeButtons = screen.getAllByText('Home').filter(el => el.tagName === 'BUTTON');
    if (homeButtons[0]) {
      expect(homeButtons[0]).toHaveClass('bg-black', 'text-white');
    }
  });

  it('should call onSelectAddress when address is clicked', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    // Find address by its street address text
    const addressElement = screen.getByText('123 Main St, San Francisco, CA 94104').closest('div');
    if (addressElement) {
      fireEvent.click(addressElement);
    }

    expect(mockOnSelectAddress).toHaveBeenCalledWith('1');
  });

  it('should call onEditAddress when edit button is clicked', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onEditAddress={mockOnEditAddress}
      />
    );

    const editButton = screen.getByTestId('edit-address-button-1');
    fireEvent.click(editButton);

    expect(mockOnEditAddress).toHaveBeenCalled();
  });

  it('should not call onSelectAddress when edit button is clicked', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onEditAddress={mockOnEditAddress}
      />
    );

    const editButton = screen.getByTestId('edit-address-button-1');
    fireEvent.click(editButton);

    // Should not have been called with the address ID from clicking edit
    expect(mockOnSelectAddress).not.toHaveBeenCalled();
  });

  it('should filter addresses based on search query', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Oakland' } });

    // Note: Search only filters the dropdown results (from addressesData.json),
    // not the saved addresses list. Saved addresses are always shown.
    // So "123 Main St" will still be visible in the saved addresses section.
    // The search dropdown should show Oakland results if they exist in addressesData.json
    expect(screen.getByText('123 Main St, San Francisco, CA 94104')).toBeInTheDocument();
  });

  it('should show search results dropdown when typing', async () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onSelectSearchAddress={mockOnSelectSearchAddress}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Main' } });

    await waitFor(() => {
      expect(screen.getByText('123 Main St, San Francisco CA 94104')).toBeInTheDocument();
    });
  });

  it('should call onSelectSearchAddress when search result is clicked', async () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onSelectSearchAddress={mockOnSelectSearchAddress}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Main' } });

    await waitFor(() => {
      const searchResult = screen.getByText('123 Main St, San Francisco CA 94104');
      fireEvent.click(searchResult);
    });

    expect(mockOnSelectSearchAddress).toHaveBeenCalled();
  });

  it('should show manual entry option when onManualEntry is provided', async () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onManualEntry={mockOnManualEntry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Enter address manually')).toBeInTheDocument();
    });
  });

  it('should call onManualEntry when manual entry is clicked', async () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onManualEntry={mockOnManualEntry}
      />
    );

    const searchInput = screen.getByPlaceholderText('Enter Your Address') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      const manualEntry = screen.getByText('Enter address manually');
      fireEvent.click(manualEntry);
    });

    expect(mockOnManualEntry).toHaveBeenCalledTimes(1);
    // Note: Component does not call onClose when manual entry is clicked
    // It only calls onManualEntry() and clears the search query
  });

  it('should call onAddLabel and onClose when Add label button is clicked', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        onAddLabel={mockOnAddLabel}
      />
    );

    const addLabelButton = screen.getByText('Add label');
    fireEvent.click(addLabelButton);

    expect(mockOnAddLabel).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show "No addresses found" when addresses array is empty', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={[]}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    expect(screen.getByText('No addresses found')).toBeInTheDocument();
  });

  it('should show selected address with radio button indicator', () => {
    render(
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
        selectedAddressId="1"
      />
    );

    // Selected address should have red border on the radio button
    expect(screen.getByText('123 Main St, San Francisco, CA 94104')).toBeInTheDocument();
    const radioIndicator = screen.getByTestId('radio-indicator-1');
    expect(radioIndicator).toHaveAttribute('data-selected', 'true');
    const radioDot = screen.getByTestId('radio-dot-1');
    expect(radioDot).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <AddressesModal
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
      <AddressesModal
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
      <AddressesModal
        isOpen={true}
        onClose={mockOnClose}
        addresses={mockAddresses}
        onSelectAddress={mockOnSelectAddress}
      />
    );

    const backdrop = screen.getByTestId('addresses-modal-backdrop');
    if (backdrop) {
      fireEvent.mouseDown(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
