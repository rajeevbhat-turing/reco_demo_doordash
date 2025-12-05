import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddressSelectionModal from '@/components/modals/address-selection-modal';

// Mock addresses data
const { mockAddressesData } = vi.hoisted(() => {
  return {
    mockAddressesData: [
      {
        id: 'addr1',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        lat: 37.7749,
        lng: -122.4194,
      },
      {
        id: 'addr2',
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        lat: 37.7849,
        lng: -122.4094,
      },
      {
        id: 'addr3',
        street: '789 Mission St',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94607',
        lat: 37.7949,
        lng: -122.3994,
      },
    ],
  };
});

vi.mock('@/data/addresses.json', () => ({
  default: mockAddressesData,
}));

const mockAddAddress = vi.fn();
const mockSetDefaultAddress = vi.fn();

vi.mock('@/store/user-store', () => ({
  useUserStore: () => ({
    addAddress: mockAddAddress,
    setDefaultAddress: mockSetDefaultAddress,
  }),
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
}));

describe('AddressSelectionModal', () => {
  const mockOnAddNewAddress = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
    mockAddAddress.mockReturnValue({
      id: 'new-addr1',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
    });
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <AddressSelectionModal
        isOpen={false}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Unlock $0 delivery fee on your first order')).toBeInTheDocument();
  });

  it('should display headline and disclaimer', () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Unlock $0 delivery fee on your first order')).toBeInTheDocument();
    expect(screen.getByText(/Other fees, taxes and gratuity still apply/i)).toBeInTheDocument();
  });

  it('should display address input field', () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Enter delivery address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter delivery address')).toBeInTheDocument();
  });

  it('should display food images', () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const images = screen.getAllByAltText(/Food item/i);
    expect(images.length).toBe(3);
  });

  it('should filter addresses based on search query', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });
  });

  it('should filter addresses by city', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Oakland' } });

    await waitFor(() => {
      expect(screen.getByText('789 Mission St')).toBeInTheDocument();
    });
  });

  it('should filter addresses by zip code', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '94104' } });

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });
  });

  it('should show clear button when input has value', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear input');
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('should clear input when clear button is clicked', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      const clearButton = screen.getByLabelText('Clear input');
      fireEvent.click(clearButton);
    });

    expect(input.value).toBe('');
  });

  it('should display "Add a new address" option in dropdown', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      expect(screen.getByText('Add a new address')).toBeInTheDocument();
      expect(screen.getByText('Enter address manually')).toBeInTheDocument();
    });
  });

  it('should call onAddNewAddress when "Add a new address" is clicked', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      const addNewAddressOption = screen.getByText('Add a new address');
      fireEvent.click(addNewAddressOption);
    });

    expect(mockOnAddNewAddress).toHaveBeenCalledTimes(1);
  });

  it('should call addAddress and setDefaultAddress when address is selected', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      const addressOption = screen.getByText('123 Main St');
      fireEvent.click(addressOption);
    });

    expect(mockAddAddress).toHaveBeenCalledWith({
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      lat: 37.7749,
      lng: -122.4194,
      addressType: 'house',
      default: true,
    });
    expect(mockSetDefaultAddress).toHaveBeenCalledWith('new-addr1');
  });

  it('should limit dropdown results to 3 addresses', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'San' } });

    await waitFor(() => {
      const addresses = screen.getAllByText(/Main St|Market St|Mission St/);
      // Should show max 3 addresses plus "Add a new address" option
      expect(addresses.length).toBeLessThanOrEqual(3);
    });
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close dropdown when clicking outside', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    // Click outside the dropdown
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
    fireEvent.mouseDown(outsideElement);
    document.body.removeChild(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
    });
  });

  it('should display full address in dropdown results', async () => {
    render(
      <AddressSelectionModal
        isOpen={true}
        onAddNewAddress={mockOnAddNewAddress}
        onClose={mockOnClose}
      />
    );

    const input = screen.getByPlaceholderText('Enter delivery address') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Main' } });

    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText(/San Francisco, CA 94104/)).toBeInTheDocument();
    });
  });
});
