import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DealModal from './deal-modal';
import { Deal } from '@/types/deal-types';

// Mock dependencies
const {
  mockAddItem,
  mockSetCategory,
  mockSetSnackbar,
  mockUseRestaurantMenu,
  mockUseRestaurants,
  mockGetRestaurantById,
} = vi.hoisted(() => {
  return {
    mockAddItem: vi.fn(),
    mockSetCategory: vi.fn(),
    mockSetSnackbar: vi.fn(),
    mockUseRestaurantMenu: vi.fn(),
    mockUseRestaurants: vi.fn(),
    mockGetRestaurantById: vi.fn(),
  };
});

vi.mock('@/store/cart-store', () => ({
  useCartStore: () => ({
    addItem: mockAddItem,
    setCategory: mockSetCategory,
  }),
}));

vi.mock('@/app/global-context', () => ({
  useGlobalContext: () => ({
    setSnackbar: mockSetSnackbar,
  }),
}));

vi.mock('@/lib/hooks/use-restaurant-menu', () => ({
  useRestaurantMenu: () => mockUseRestaurantMenu(),
}));

vi.mock('@/lib/hooks/use-restaurants', () => ({
  useRestaurants: () => mockUseRestaurants(),
}));

vi.mock('@/store/user-store', () => ({
  useUserStore: (selector: (state: any) => any) => {
    const mockState = {
      currentUser: {
        id: 'user1',
        name: 'Test User',
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
  },
}));

vi.mock('@/lib/utils/restaurant-utils', () => ({
  getRestaurantById: mockGetRestaurantById,
}));
vi.mock('@/components/menu-item-dialog', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="menu-item-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

vi.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  ThumbsUp: () => <div data-testid="thumbs-up-icon">ThumbsUp</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('DealModal', () => {
  const mockOnClose = vi.fn();

  const mockDeal: Deal = {
    id: 'deal1',
    restaurantId: 'restaurant1',
    title: 'Free Item Deal',
    description: 'Get a free item with your order',
    minimumPurchase: 20,
    freeItems: [
      {
        id: 'item1',
        name: 'Free Pizza',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = 'auto';

    mockUseRestaurantMenu.mockReturnValue({
      data: {
        menuItems: [
          {
            id: 'item1',
            name: 'Free Pizza',
            price: '15.99',
            description: 'Delicious pizza',
            image: 'pizza.jpg',
            restaurantId: 'restaurant1',
          },
        ],
      },
    });

    mockUseRestaurants.mockReturnValue({
      data: [
        {
          id: 'restaurant1',
          name: 'Test Restaurant',
        },
      ],
    });

    // useUserStore is mocked as a selector function, no need to set return value

    mockGetRestaurantById.mockReturnValue({
      id: 'restaurant1',
      name: 'Test Restaurant',
    });
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('should not render when isOpen is false', () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <DealModal isOpen={false} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when deal is null', () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={null} />
      </Wrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true and deal is provided', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(screen.getByText('Free item on $20+')).toBeInTheDocument();
  });

  it('should display deal title/offer text', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(screen.getByText('Free item on $20+')).toBeInTheDocument();
  });

  it('should display minimum purchase condition', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(screen.getByText('Spend $20+ (excluding fees) to apply')).toBeInTheDocument();
  });

  it('should display free items limit condition when freeItems exist', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(screen.getByText('Limit 1 eligible free item per order')).toBeInTheDocument();
  });

  it('should display fees apply condition', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(screen.getByText('Fees apply')).toBeInTheDocument();
  });

  it('should display free items when available', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Free Pizza')).toBeInTheDocument();
    });
  });

  it('should call onClose when close button is clicked', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Close button in footer is clicked', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    const backdrop = screen.getByTestId('deal-modal-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should set cart category to restaurant when modal opens', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={mockDeal} />
      </Wrapper>
    );

    expect(mockSetCategory).toHaveBeenCalled();
  });

  it('should display percentage discount offer text', () => {
    const percentageDeal: Deal = {
      id: 'deal2',
      restaurantId: 'restaurant1',
      title: 'Percentage Discount',
      description: 'Get percentage off',
      discountType: 'percentage',
      discountValue: 20,
      maximumDiscount: 10,
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={percentageDeal} />
      </Wrapper>
    );

    expect(screen.getByText('20% off, up to $10')).toBeInTheDocument();
  });

  it('should display fixed discount offer text', () => {
    const fixedDeal: Deal = {
      id: 'deal3',
      restaurantId: 'restaurant1',
      title: 'Fixed Discount',
      description: 'Get fixed amount off',
      discountType: 'fixed',
      discountValue: 5,
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <DealModal isOpen={true} onClose={mockOnClose} deal={fixedDeal} />
      </Wrapper>
    );

    expect(screen.getByText('$5 off')).toBeInTheDocument();
  });
});
