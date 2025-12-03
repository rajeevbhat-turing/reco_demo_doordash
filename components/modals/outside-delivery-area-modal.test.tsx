import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OutsideDeliveryAreaModal from './outside-delivery-area-modal';

// Mock dependencies
const mockGetAddresses = vi.fn();
const mockAddAddress = vi.fn();
const mockUpdateAddress = vi.fn();
const mockSetDefaultAddress = vi.fn();
const mockGetTempAddress = vi.fn();
const mockPush = vi.fn();

const mockCurrentUser = {
  id: 'user1',
  name: 'Test User',
  addresses: [
    {
      id: 'addr1',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      default: true,
    },
  ],
};

vi.mock('@/store/user-store', () => ({
  useUserStore: (selectorOrUndefined?: (state: any) => any) => {
    const mockState = {
      currentUser: mockCurrentUser,
      getAddresses: mockGetAddresses,
      addAddress: mockAddAddress,
      updateAddress: mockUpdateAddress,
      setDefaultAddress: mockSetDefaultAddress,
      getTempAddress: mockGetTempAddress,
    };

    // If selector is provided, use it; otherwise return the state object (for destructuring)
    if (typeof selectorOrUndefined === 'function') {
      return selectorOrUndefined(mockState);
    }
    // When called without selector (destructuring), return the state object
    return mockState;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('./addresses-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="addresses-modal">Addresses Modal</div> : null,
}));

vi.mock('./add-address-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="add-address-modal">Add Address Modal</div> : null,
}));

vi.mock('./address-review-error-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="address-review-error-modal">Address Review Error Modal</div> : null,
}));

vi.mock('./address-type-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="address-type-modal">Address Type Modal</div> : null,
}));

vi.mock('./address-details-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="address-details-modal">Address Details Modal</div> : null,
}));

vi.mock('./choose-address-label-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="choose-address-label-modal">Choose Address Label Modal</div> : null,
}));

vi.mock('./choose-label-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="choose-label-modal">Choose Label Modal</div> : null,
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
}));

describe('OutsideDeliveryAreaModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';
    mockGetAddresses.mockReturnValue([
      {
        id: 'addr1',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        default: true,
      },
    ]);
    mockGetTempAddress.mockReturnValue(null);
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<OutsideDeliveryAreaModal isOpen={false} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText("Your address is outside of this store's delivery area")
    ).toBeInTheDocument();
  });

  it('should display current address', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    // Address is formatted and displayed - check for the formatted string
    // formatAddress() returns "street, city, state, zipCode"
    const addressText = screen.getByText(/123 Main St|San Francisco|CA|94104/);
    expect(addressText).toBeInTheDocument();
  });

  it('should open addresses modal when "Change delivery address" is clicked', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    const changeAddressButton = screen.getByRole('button', { name: /Change delivery address/i });
    fireEvent.click(changeAddressButton);

    expect(screen.getByTestId('addresses-modal')).toBeInTheDocument();
  });

  it('should call router.push when "Find stores nearby" is clicked', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    const findStoresButton = screen.getByText('Find stores nearby');
    fireEvent.click(findStoresButton);

    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('should call onClose when close button is clicked', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should hide main modal when addresses modal is open', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    const changeAddressButton = screen.getByRole('button', { name: /Change delivery address/i });
    fireEvent.click(changeAddressButton);

    // Main modal should be hidden when addresses modal is open
    expect(
      screen.queryByText("Your address is outside of this store's delivery area")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('addresses-modal')).toBeInTheDocument();
  });

  it('should display formatted address correctly', () => {
    render(<OutsideDeliveryAreaModal isOpen={true} onClose={mockOnClose} />);

    // Address should be displayed - formatAddress() joins with ", "
    expect(screen.getByText('Change delivery address')).toBeInTheDocument();
    // Address text should be present (check for address parts)
    expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
  });
});
