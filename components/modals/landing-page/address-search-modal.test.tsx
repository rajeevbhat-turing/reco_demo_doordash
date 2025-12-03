import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddressSearchModal from './address-search-modal';

// Mock addresses data - hoisted
const { mockAddressesData } = vi.hoisted(() => {
  return {
    mockAddressesData: [
      {
        id: 'addr-1',
        street: '548 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        lat: 37.7897,
        lng: -122.4011,
      },
      {
        id: 'addr-2',
        street: '47 West 13th Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10011',
        lat: 40.7369,
        lng: -73.9968,
      },
      {
        id: 'addr-3',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        lat: 34.0522,
        lng: -118.2437,
      },
    ],
  };
});

vi.mock('@/data/addresses.json', () => ({
  default: mockAddressesData,
}));

// Mock icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  X: () => <div data-testid="x-icon">X</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
}));

// Mock DashDoorLogoMark
vi.mock('@/components/common/Icons', () => ({
  DashDoorLogoMark: ({
    width,
    height,
    color,
  }: {
    width: number;
    height: number;
    color: string;
  }) => (
    <div data-testid="dashdoor-logo" data-width={width} data-height={height} data-color={color}>
      DashDoorLogoMark
    </div>
  ),
}));

describe('AddressSearchModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectAddress = vi.fn();
  const mockOnAddNewAddress = vi.fn();
  const mockOnContinueInApp = vi.fn();

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
        <AddressSearchModal
          isOpen={false}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      expect(screen.getByPlaceholderText('Enter delivery address')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render search input with placeholder', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render app promotion section', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      expect(screen.getByText('Browse faster in the app')).toBeInTheDocument();
      expect(screen.getByText('$0 delivery fee on first order')).toBeInTheDocument();
      expect(screen.getByText('20M ratings')).toBeInTheDocument();
      expect(screen.getByText('Continue in app')).toBeInTheDocument();
    });

    it('should render DashDoor logo', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const logo = screen.getByTestId('dashdoor-logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('data-width', '38');
      expect(logo).toHaveAttribute('data-height', '20');
      expect(logo).toHaveAttribute('data-color', '#eb1700ff');
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when user types', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      expect(input.value).toBe('Market');
    });

    it('should show clear button when search query is not empty', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
    });

    it('should not show clear button when search query is empty', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument();
    });

    it('should clear search query when clear button is clicked', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      const clearButton = screen.getByLabelText('Clear input');
      fireEvent.click(clearButton);

      expect(input.value).toBe('');
    });

    it('should filter addresses based on search query', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      expect(screen.getByText('548 Market Street')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA 94104')).toBeInTheDocument();
    });

    it('should limit results to 3 addresses', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Street' } });

      // Should show max 3 results
      const addresses = screen.getAllByText(/Street/);
      expect(addresses.length).toBeLessThanOrEqual(3);
    });

    it('should not show addresses when search query is empty', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      expect(screen.queryByText('548 Market Street')).not.toBeInTheDocument();
    });

    it('should not show addresses when search query is only whitespace', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '   ' } });

      expect(screen.queryByText('548 Market Street')).not.toBeInTheDocument();
    });

    it('should show "Add a new address" option when search query is not empty', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      expect(screen.getByText('Add a new address')).toBeInTheDocument();
      expect(screen.getByText('Enter address manually')).toBeInTheDocument();
    });
  });

  describe('Address Selection', () => {
    it('should call onSelectAddress when address is clicked', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      const addressElement = screen.getByText('548 Market Street');
      fireEvent.click(addressElement);

      expect(mockOnSelectAddress).toHaveBeenCalledTimes(1);
      expect(mockOnSelectAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          street: '548 Market Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94104',
          addressType: 'house',
        })
      );
    });

    it('should clear search query after selecting address', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      const addressElement = screen.getByText('548 Market Street');
      fireEvent.click(addressElement);

      expect(input.value).toBe('');
    });
  });

  describe('Add New Address', () => {
    it('should call onAddNewAddress when "Add a new address" is clicked', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Market' } });

      const addNewAddressButton = screen.getByText('Add a new address');
      fireEvent.click(addNewAddressButton);

      expect(mockOnAddNewAddress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when Cancel button is clicked', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      // Click outside the modal (on the backdrop)
      const backdrop = screen.getByTestId('address-search-modal-backdrop');
      if (backdrop) {
        fireEvent.mouseDown(backdrop);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking inside modal', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const input = screen.getByPlaceholderText('Enter delivery address');
      fireEvent.mouseDown(input);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Continue in App', () => {
    it('should call onContinueInApp when provided and button is clicked', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
          onContinueInApp={mockOnContinueInApp}
        />
      );

      const continueButton = screen.getByText('Continue in app');
      fireEvent.click(continueButton);

      expect(mockOnContinueInApp).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when onContinueInApp is not provided and button is clicked', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const continueButton = screen.getByText('Continue in app');
      fireEvent.click(continueButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Star Ratings', () => {
    it('should render star ratings', () => {
      render(
        <AddressSearchModal
          isOpen={true}
          onClose={mockOnClose}
          onSelectAddress={mockOnSelectAddress}
          onAddNewAddress={mockOnAddNewAddress}
        />
      );

      const stars = screen.getAllByTestId('star-icon');
      expect(stars.length).toBe(5); // 4 full stars + 1 half star
    });
  });
});
