import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartSidebar from '@/components/cart-sidebar';
import { Cart, CartItem } from '@/store/cart-store';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Minus: () => <div data-testid="minus-icon">Minus</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
}));

// Mock cart store with hoisted functions
const {
  mockFindCart,
  mockGetCurrentCategory,
  mockGetCurrentStoreId,
  mockGetCurrentRestaurantId,
  mockUpdateQuantity,
  mockRemoveItem,
  mockClearCart,
  mockAddItem,
  mockGetConfig,
  getMockCarts,
  setMockCarts,
  getMockIsGroupOrder,
  setMockIsGroupOrder,
} = vi.hoisted(() => {
  let mockCarts: Cart[] = [];
  let mockIsGroupOrder = false;

  return {
    mockFindCart: vi.fn(),
    mockGetCurrentCategory: vi.fn(),
    mockGetCurrentStoreId: vi.fn(),
    mockGetCurrentRestaurantId: vi.fn(),
    mockUpdateQuantity: vi.fn(),
    mockRemoveItem: vi.fn(),
    mockClearCart: vi.fn(),
    mockAddItem: vi.fn(),
    mockGetConfig: vi.fn(),
    getMockCarts: () => mockCarts,
    setMockCarts: (carts: Cart[]) => {
      mockCarts = carts;
    },
    getMockIsGroupOrder: () => mockIsGroupOrder,
    setMockIsGroupOrder: (value: boolean) => {
      mockIsGroupOrder = value;
    },
  };
});

vi.mock('@/store/cart-store', () => ({
  useCartStore: () => {
    // Call getters each time to get fresh values
    return {
      carts: getMockCarts(),
      findCart: mockFindCart,
      getCurrentCategory: mockGetCurrentCategory,
      getCurrentStoreId: mockGetCurrentStoreId,
      getCurrentRestaurantId: mockGetCurrentRestaurantId,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
      addItem: mockAddItem,
      isGroupOrder: getMockIsGroupOrder(),
      getConfig: mockGetConfig,
    };
  },
}));

// Mock user store
const { mockUseUserStore } = vi.hoisted(() => {
  return {
    mockUseUserStore: vi.fn(),
  };
});

vi.mock('@/store/user-store', () => ({
  useUserStore: (selector: (state: any) => any) => mockUseUserStore(selector),
}));

// Mock hooks
const { mockUseRestaurants, mockUseRestaurantMenu } = vi.hoisted(() => {
  return {
    mockUseRestaurants: vi.fn(),
    mockUseRestaurantMenu: vi.fn(),
  };
});

vi.mock('@/lib/hooks/use-restaurants', () => ({
  useRestaurants: () => mockUseRestaurants(),
}));

vi.mock('@/lib/hooks/use-restaurant-menu', () => ({
  useRestaurantMenu: () => mockUseRestaurantMenu(),
}));

// Mock utils
const { mockGetRestaurantById } = vi.hoisted(() => {
  return {
    mockGetRestaurantById: vi.fn(),
  };
});

vi.mock('@/lib/utils/restaurant-utils', () => ({
  getRestaurantById: mockGetRestaurantById,
}));

// Mock components
vi.mock('@/components/other-carts', () => ({
  default: ({ carts }: { carts: Cart[] }) => (
    <div data-testid="other-carts">
      {carts.length} other cart{carts.length !== 1 ? 's' : ''}
    </div>
  ),
}));

vi.mock('@/components/menu-item-dialog', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="menu-item-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

describe('CartSidebar', () => {
  const mockOnClose = vi.fn();

  const mockCartItem: CartItem = {
    id: 'item1',
    itemName: 'Pizza',
    price: 15.99,
    image: '/pizza.jpg',
    quantity: 1,
  };

  const mockCart: Cart = {
    storeId: 'restaurant1',
    storeName: 'Test Restaurant',
    storeCategory: 'restaurant',
    items: [mockCartItem],
    userId: 'user1', // Match the user ID from mockUseUserStore
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockGetCurrentCategory.mockReturnValue('restaurant');
    mockGetCurrentStoreId.mockReturnValue('restaurant1');
    mockGetCurrentRestaurantId.mockReturnValue(null);
    mockFindCart.mockReturnValue(mockCart);
    mockGetConfig.mockReturnValue({
      freeDeliveryThreshold: 35,
      serviceFeePercentage: 0.15,
      minServiceFee: 2.5,
    });
    setMockCarts([mockCart]);
    setMockIsGroupOrder(false);

    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: {
          id: 'user1',
          addresses: [
            {
              id: 'addr1',
              default: true,
              lat: 37.7749,
              lng: -122.4194,
            },
          ],
        },
      };
      return selector(mockState);
    });

    mockUseRestaurants.mockReturnValue({
      data: [
        {
          id: 'restaurant1',
          name: 'Test Restaurant',
        },
      ],
    });

    mockUseRestaurantMenu.mockReturnValue({
      data: {
        menuItems: [],
      },
    });

    mockGetRestaurantById.mockReturnValue({
      id: 'restaurant1',
      name: 'Test Restaurant',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render sidebar when isOpen is true', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('should render empty cart message when cart is empty', () => {
    setMockCarts([]);
    mockFindCart.mockReturnValue(null);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Your cart')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should display cart items', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('should display store name', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Your cart from')).toBeInTheDocument();
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
  });

  it('should display item quantity', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('1×')).toBeInTheDocument();
  });

  it('should display item price for quantity', () => {
    const cartWithMultipleQuantity: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem,
          quantity: 2,
        },
      ],
    };
    mockFindCart.mockReturnValue(cartWithMultipleQuantity);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('$31.98')).toBeInTheDocument();
    expect(screen.getByText('2×')).toBeInTheDocument();
  });

  it('should call updateQuantity when increase button is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const increaseButtons = screen.getAllByLabelText('Add one more');
    fireEvent.click(increaseButtons[0]);

    expect(mockUpdateQuantity).toHaveBeenCalledWith('item1', 2);
  });

  it('should call updateQuantity when decrease button is clicked', () => {
    const cartWithMultipleQuantity: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem,
          quantity: 2,
        },
      ],
    };
    mockFindCart.mockReturnValue(cartWithMultipleQuantity);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const decreaseButtons = screen.getAllByLabelText('Decrease quantity');
    fireEvent.click(decreaseButtons[0]);

    expect(mockUpdateQuantity).toHaveBeenCalledWith('item1', 1);
  });

  it('should call removeItem when remove button is clicked for quantity 1', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const removeButtons = screen.getAllByLabelText('Remove item');
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveItem).toHaveBeenCalledWith('item1');
  });

  it('should display customizations when present', () => {
    const cartWithCustomizations: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem,
          customizations: 'Extra cheese, No onions',
        },
      ],
    };
    mockFindCart.mockReturnValue(cartWithCustomizations);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Extra cheese, No onions')).toBeInTheDocument();
  });

  it('should navigate to store when store name is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const storeNameLink = screen.getByText('Test Restaurant').closest('div');
    if (storeNameLink) {
      fireEvent.click(storeNameLink);
    }

    expect(mockPush).toHaveBeenCalledWith('/store/restaurant1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should navigate to checkout when Continue button is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith('/checkout?category=restaurant&storeId=restaurant1');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display subtotal without tax', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/\$15\.99 without tax/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByTestId('x-icon').closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside sidebar', async () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    // Wait for the timeout in useEffect (100ms delay) before clicking
    await new Promise(resolve => setTimeout(resolve, 150));

    // Click outside the sidebar
    fireEvent.mouseDown(document.body);

    // Wait for onClose to be called
    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  it('should display group order banner when isGroupOrder is true', () => {
    setMockIsGroupOrder(true);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Group Order Active')).toBeInTheDocument();
    expect(screen.getByText('Others can add items to this order')).toBeInTheDocument();
  });

  it('should display delivery fee notice for non-restaurant categories', () => {
    const groceryCart: Cart = {
      storeId: 'store1',
      storeName: 'Grocery Store',
      storeCategory: 'grocery',
      items: [
        {
          ...mockCartItem,
          price: 20.0,
        },
      ],
    };
    mockFindCart.mockReturnValue(groceryCart);
    mockGetCurrentCategory.mockReturnValue('grocery');
    mockGetCurrentStoreId.mockReturnValue('store1');

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Add \$15\.00 for \$0 delivery fee/)).toBeInTheDocument();
  });

  it('should display free delivery message when threshold is met', () => {
    const groceryCart: Cart = {
      storeId: 'store1',
      storeName: 'Grocery Store',
      storeCategory: 'grocery',
      items: [
        {
          ...mockCartItem,
          price: 40.0,
          quantity: 1,
        },
      ],
    };
    mockFindCart.mockReturnValue(groceryCart);
    mockGetCurrentCategory.mockReturnValue('grocery');
    mockGetCurrentStoreId.mockReturnValue('store1');

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('$0 delivery fee on orders over $35')).toBeInTheDocument();
  });

  it('should display complement items section for restaurant carts', async () => {
    const menuItems = [
      {
        id: 'menu1',
        name: 'Dessert',
        price: '5.99',
        restaurantId: 'restaurant1',
        category: 'Dessert',
        image: '/dessert.jpg',
      },
    ];

    mockUseRestaurantMenu.mockReturnValue({
      data: {
        menuItems,
      },
    });

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Complement your cart')).toBeInTheDocument();
    });
  });

  it('should open menu item dialog when complement item has modifications', async () => {
    const menuItems = [
      {
        id: 'menu1',
        name: 'Dessert',
        price: '5.99',
        restaurantId: 'restaurant1',
        category: 'Dessert',
        image: '/dessert.jpg',
        modifications: [
          {
            id: 'mod1',
            name: 'Size',
            options: [{ id: 'opt1', name: 'Small', price: 0 }],
          },
        ],
      },
    ];

    mockUseRestaurantMenu.mockReturnValue({
      data: {
        menuItems,
      },
    });

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Complement your cart')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByTestId('plus-icon');
    // Find the add button in complement section (last one)
    const complementAddButton = addButtons[addButtons.length - 1].closest('button');
    if (complementAddButton) {
      fireEvent.click(complementAddButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('menu-item-dialog')).toBeInTheDocument();
    });
  });

  it('should add complement item directly when it has no modifications', async () => {
    const menuItems = [
      {
        id: 'menu1',
        name: 'Dessert',
        price: '5.99',
        restaurantId: 'restaurant1',
        category: 'Dessert',
        image: '/dessert.jpg',
        modifications: [],
      },
    ];

    mockUseRestaurantMenu.mockReturnValue({
      data: {
        menuItems,
      },
    });

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Complement your cart')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByTestId('plus-icon');
    const complementAddButton = addButtons[addButtons.length - 1].closest('button');
    if (complementAddButton) {
      fireEvent.click(complementAddButton);
    }

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'menu1',
        itemName: 'Dessert',
        price: '5.99',
      }),
      'restaurant',
      'Test Restaurant',
      'restaurant1'
    );
  });

  it('should handle string price format', () => {
    const cartWithStringPrice: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem,
          price: '$15.99',
        },
      ],
    };
    mockFindCart.mockReturnValue(cartWithStringPrice);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('should handle multiple items in cart', () => {
    const cartWithMultipleItems: Cart = {
      ...mockCart,
      items: [
        mockCartItem,
        {
          id: 'item2',
          itemName: 'Burger',
          price: 12.99,
          image: '/burger.jpg',
          quantity: 2,
        },
      ],
    };
    mockFindCart.mockReturnValue(cartWithMultipleItems);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    // Total should be 15.99 + (12.99 * 2) = 41.97
    expect(screen.getByText(/\$41\.97 without tax/)).toBeInTheDocument();
  });

  it('should display OtherCarts component when no active store and other carts exist', () => {
    mockGetCurrentStoreId.mockReturnValue(null);
    mockGetCurrentRestaurantId.mockReturnValue(null);
    mockFindCart.mockReturnValue(null);
    // Set up carts so that when filtered by user, there's at least one cart
    setMockCarts([mockCart]);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    // When no active store, the last cart becomes currentCart, so otherCarts would be empty
    // We need at least 2 carts for otherCarts to show
    const otherCart: Cart = {
      storeId: 'restaurant2',
      storeName: 'Other Restaurant',
      storeCategory: 'restaurant',
      items: [],
      userId: 'user1',
    };
    setMockCarts([mockCart, otherCart]);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('other-carts')).toBeInTheDocument();
  });

  it('should handle guest user (no currentUser)', () => {
    mockUseUserStore.mockImplementation((selector: (state: any) => any) => {
      const mockState = {
        currentUser: null,
      };
      return selector(mockState);
    });

    setMockCarts([
      {
        ...mockCart,
        userId: undefined,
      },
    ]);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('should handle item with missing image', () => {
    const cartWithNoImage: Cart = {
      ...mockCart,
      items: [
        {
          ...mockCartItem,
          image: '',
        },
      ],
    };
    mockFindCart.mockReturnValue(cartWithNoImage);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    // Component uses item.itemName || 'Item Image' for alt text
    const images = screen.getAllByAltText('Pizza');
    expect(images.length).toBeGreaterThan(0);
  });
});
