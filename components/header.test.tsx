import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './header';

// Mock Next.js navigation
const { mockPush, mockBack, mockPathnameRef } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockBack: vi.fn(),
    mockPathnameRef: { current: '/home' },
  };
});

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathnameRef.current,
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon">MapPin</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  ShoppingCart: () => <div data-testid="shopping-cart-icon">ShoppingCart</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
}));

// Mock components
vi.mock('@/components/search-bar', () => ({
  default: () => <div data-testid="search-bar">SearchBar</div>,
}));

vi.mock('@/components/cart-sidebar', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="cart-sidebar">CartSidebar</div> : null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <div data-testid="select-value">SelectValue</div>,
}));

vi.mock('@/components/modals/authentication-modal', () => ({
  default: ({ defaultMode }: { defaultMode: string | null; onClose: () => void }) =>
    defaultMode ? <div data-testid="authentication-modal">AuthenticationModal</div> : null,
}));

vi.mock('@/components/modals/addresses-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="addresses-modal">AddressesModal</div> : null,
}));

vi.mock('@/components/modals/add-address-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="add-address-modal">AddAddressModal</div> : null,
}));

vi.mock('@/components/modals/address-review-error-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="address-review-error-modal">AddressReviewErrorModal</div> : null,
}));

vi.mock('@/components/modals/address-type-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="address-type-modal">AddressTypeModal</div> : null,
}));

vi.mock('@/components/modals/address-details-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="address-details-modal">AddressDetailsModal</div> : null,
}));

vi.mock('@/components/modals/choose-address-label-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="choose-address-label-modal">ChooseAddressLabelModal</div> : null,
}));

vi.mock('@/components/modals/choose-label-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="choose-label-modal">ChooseLabelModal</div> : null,
}));

vi.mock('@/components/modals/address-selection-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="address-selection-modal">AddressSelectionModal</div> : null,
}));

vi.mock('@/components/common/Icons', () => ({
  DashDoorLogoMark: () => <div data-testid="logo-mark">LogoMark</div>,
  DashDoorWordMark: () => <div data-testid="word-mark">WordMark</div>,
}));

// Mock stores
const {
  mockGetAddresses,
  mockAddAddress,
  mockUpdateAddress,
  mockSetDefaultAddress,
  mockSetTempAddress,
  mockGetTempAddress,
  mockIsAuthenticated,
  mockCurrentUser,
  mockShouldOpenCart,
  mockResetOpenCartTrigger,
  mockFindCart,
  mockCarts,
  mockCurrentStore,
  mockCurrentCategory,
  mockUserStoreSubscribe,
  mockCartStoreSubscribe,
} = vi.hoisted(() => {
  return {
    mockGetAddresses: vi.fn(() => []),
    mockAddAddress: vi.fn((address: any) => ({ ...address, id: 'new-address-id' })),
    mockUpdateAddress: vi.fn(),
    mockSetDefaultAddress: vi.fn(),
    mockSetTempAddress: vi.fn(),
    mockGetTempAddress: vi.fn(() => null as any),
    mockIsAuthenticated: vi.fn(() => false),
    mockCurrentUser: vi.fn(() => null as any),
    mockShouldOpenCart: vi.fn(() => false),
    mockResetOpenCartTrigger: vi.fn(),
    mockFindCart: vi.fn(() => undefined as any),
    mockCarts: vi.fn(() => [] as any[]),
    mockCurrentStore: vi.fn(() => null as any),
    mockCurrentCategory: vi.fn(() => 'restaurant'),
    mockUserStoreSubscribe: vi.fn(() => () => {}),
    mockCartStoreSubscribe: vi.fn(() => () => {}),
  };
});

vi.mock('@/store/user-store', () => ({
  useUserStore: Object.assign(
    (selector: any) => {
      const state = {
        getAddresses: mockGetAddresses,
        addAddress: mockAddAddress,
        updateAddress: mockUpdateAddress,
        setDefaultAddress: mockSetDefaultAddress,
        setTempAddress: mockSetTempAddress,
        getTempAddress: mockGetTempAddress,
        isAuthenticated: mockIsAuthenticated,
        currentUser: mockCurrentUser(),
      };
      return selector ? selector(state) : state;
    },
    {
      subscribe: mockUserStoreSubscribe,
      getState: () => ({
        getAddresses: mockGetAddresses,
        getTempAddress: mockGetTempAddress,
        isAuthenticated: mockIsAuthenticated,
        currentUser: mockCurrentUser(),
      }),
    }
  ),
}));

vi.mock('@/store/cart-store', () => ({
  useCartStore: Object.assign(
    (selector: any) => {
      const state = {
        shouldOpenCart: mockShouldOpenCart(),
        resetOpenCartTrigger: mockResetOpenCartTrigger,
        findCart: mockFindCart,
        carts: mockCarts(),
      };
      return selector ? selector(state) : state;
    },
    {
      subscribe: mockCartStoreSubscribe,
      getState: () => ({
        carts: mockCarts(),
        findCart: mockFindCart,
      }),
    }
  ),
}));

vi.mock('@/store/app-store', () => ({
  useAppStore: {
    getState: () => ({
      currentStore: mockCurrentStore(),
      currentCategory: mockCurrentCategory(),
    }),
    subscribe: vi.fn(() => () => {}),
  },
}));

// Mock addresses data
vi.mock('@/data/addresses.json', () => ({
  default: [
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
  ],
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathnameRef.current = '/home';
  });

  it('should render header with logo', () => {
    render(<Header />);
    expect(screen.getByTestId('logo-mark')).toBeInTheDocument();
    expect(screen.getByTestId('word-mark')).toBeInTheDocument();
  });

  it('should render search bar on home page', () => {
    mockPathnameRef.current = '/home';
    render(<Header />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('should not render search bar on store page', () => {
    mockPathnameRef.current = '/store/123';
    render(<Header />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  it('should not render search bar on reviews page', () => {
    mockPathnameRef.current = '/reviews/store/123';
    render(<Header />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  it('should display cart icon', () => {
    render(<Header />);
    expect(screen.getByTestId('cart-button')).toBeInTheDocument();
  });

  it('should display cart count when items are in cart', () => {
    mockFindCart.mockReturnValue({
      items: [{ quantity: 2 }, { quantity: 3 }],
    } as any);
    mockCurrentStore.mockReturnValue({ id: 'store1' } as any);

    render(<Header />);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('5');
  });

  it('should display cart count as 0 when cart is empty', () => {
    mockFindCart.mockReturnValue({
      items: [],
    } as any);
    mockCurrentStore.mockReturnValue({ id: 'store1' } as any);

    render(<Header />);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  it('should open cart sidebar when cart icon is clicked', () => {
    render(<Header />);
    const cartButton = screen.getByTestId('cart-button');
    fireEvent.click(cartButton);
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('should close cart sidebar when onClose is called', () => {
    render(<Header />);
    const cartButton = screen.getByTestId('cart-button');
    fireEvent.click(cartButton);
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();

    // Close cart
    const closeButton = screen
      .getByTestId('cart-sidebar')
      .querySelector('[data-testid="close-sidebar-button"]');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
  });

  it('should display address button', () => {
    render(<Header />);
    expect(screen.getByText(/Your address/i)).toBeInTheDocument();
  });

  it('should display selected address when address is set', () => {
    mockGetTempAddress.mockReturnValue({
      id: 'temp-1',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    } as any);

    render(<Header />);
    expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
  });

  it('should open addresses modal when address button is clicked for authenticated user', () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetAddresses.mockReturnValue([
      {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        default: true,
      },
    ] as any);

    render(<Header />);
    const addressButton = screen.getByTestId('address-button');
    fireEvent.click(addressButton);
    expect(screen.getByTestId('addresses-modal')).toBeInTheDocument();
  });

  it('should open address popover when address button is clicked for non-authenticated user', () => {
    mockIsAuthenticated.mockReturnValue(false);

    render(<Header />);
    const addressButton = screen.getByTestId('address-button');
    fireEvent.click(addressButton);
    expect(screen.getByTestId('address-popover')).toBeInTheDocument();
    expect(screen.getByText('Enter Your Address')).toBeInTheDocument();
  });

  it('should display checkout header layout on checkout page', () => {
    mockPathnameRef.current = '/checkout';
    render(<Header />);
    expect(screen.getByTestId('back-to-store-button')).toBeInTheDocument();
  });

  it('should display auth header layout on auth page', () => {
    mockPathnameRef.current = '/auth';
    render(<Header />);
    expect(screen.queryByText('Back to store')).not.toBeInTheDocument();
  });

  it('should navigate back when back button is clicked on checkout page', () => {
    mockPathnameRef.current = '/checkout';
    render(<Header />);
    const backButton = screen.getByTestId('back-to-store-button');
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });

  it('should open cart sidebar when shouldOpenCart is true', () => {
    mockShouldOpenCart.mockReturnValue(true);
    render(<Header />);
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
    expect(mockResetOpenCartTrigger).toHaveBeenCalled();
  });

  it('should display number of carts when no current store is set', () => {
    mockCurrentStore.mockReturnValue(null);
    mockCarts.mockReturnValue([
      { storeId: 'store1', items: [] },
      { storeId: 'store2', items: [] },
    ] as any);

    render(<Header />);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
  });

  it('should filter carts by current user for authenticated users', () => {
    mockCurrentUser.mockReturnValue({ id: 'user1' } as any);
    mockIsAuthenticated.mockReturnValue(true);
    mockCarts.mockReturnValue([
      { storeId: 'store1', userId: 'user1', items: [] },
      { storeId: 'store2', userId: 'user2', items: [] },
    ] as any);

    render(<Header />);
    // Should only show cart count for user1's cart
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
  });

  it('should show carts without userId for guest users', () => {
    mockCurrentUser.mockReturnValue(null);
    mockIsAuthenticated.mockReturnValue(false);
    mockCarts.mockReturnValue([
      { storeId: 'store1', items: [] },
      { storeId: 'store2', userId: 'user1', items: [] },
    ] as any);

    render(<Header />);
    // Should only show cart count for cart without userId
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
  });

  it('should not render search bar on order detail page', () => {
    mockPathnameRef.current = '/orders/123';
    render(<Header />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });

  it('should not render address button on order detail page', () => {
    mockPathnameRef.current = '/orders/123';
    render(<Header />);
    expect(screen.queryByTestId('address-button')).not.toBeInTheDocument();
  });

  it('should display Sign In and Sign Up buttons for non-authenticated users', () => {
    mockIsAuthenticated.mockReturnValue(false);
    render(<Header />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('should not display Sign In and Sign Up buttons for authenticated users', () => {
    mockIsAuthenticated.mockReturnValue(true);
    render(<Header />);
    expect(screen.queryByRole('button', { name: 'Sign In' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign Up' })).not.toBeInTheDocument();
  });

  it('should open authentication modal when Sign In is clicked', () => {
    mockIsAuthenticated.mockReturnValue(false);
    render(<Header />);
    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInButton);
    expect(screen.getByTestId('authentication-modal')).toBeInTheDocument();
  });

  it('should open authentication modal when Sign Up is clicked', () => {
    mockIsAuthenticated.mockReturnValue(false);
    render(<Header />);
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(signUpButton);
    expect(screen.getByTestId('authentication-modal')).toBeInTheDocument();
  });

  it('should not render cart button on order detail page', () => {
    mockPathnameRef.current = '/orders/123';
    render(<Header />);
    expect(screen.queryByTestId('cart-button')).not.toBeInTheDocument();
  });

  it('should render search bar on consumer profile page', () => {
    mockPathnameRef.current = '/consumer/profile';
    render(<Header />);
    expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
  });
});
