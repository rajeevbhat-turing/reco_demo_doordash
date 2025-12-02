import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrders } from './use-orders';
import { fetchUserOrders } from '@/lib/api/orders';

type UserStoreState = {
  currentUser: {
    id: string;
  } | null;
};

type OrdersStoreState = {
  initializeOrdersFromDB: ReturnType<typeof vi.fn>;
  isInitialized: boolean;
  orders: any[];
};

const {
  mockUseUserStore,
  mockUseOrdersStore,
  resetUserStoreState,
  resetOrdersStoreState,
  setUserStoreState,
  setOrdersStoreState,
} = vi.hoisted(() => {
  const createUserStoreState = (): UserStoreState => ({
    currentUser: {
      id: 'user1',
    },
  });

  const createOrdersStoreState = (): OrdersStoreState => ({
    initializeOrdersFromDB: vi.fn(),
    isInitialized: false,
    orders: [],
  });

  let userStoreState: UserStoreState = createUserStoreState();
  let ordersStoreState: OrdersStoreState = createOrdersStoreState();

  const mockUseUserStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector(userStoreState);
    }
    return userStoreState;
  });

  const mockSetOrdersState = vi.fn((partial: Partial<OrdersStoreState>) => {
    ordersStoreState = { ...ordersStoreState, ...partial };
  });

  const mockUseOrdersStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector(ordersStoreState);
    }
    return ordersStoreState;
  });

  (mockUseOrdersStore as any).setState = mockSetOrdersState;

  const resetUserStoreState = () => {
    userStoreState = createUserStoreState();
  };

  const setUserStoreState = (state: Partial<UserStoreState>) => {
    userStoreState = { ...userStoreState, ...state };
  };

  const resetOrdersStoreState = () => {
    ordersStoreState = createOrdersStoreState();
    mockSetOrdersState.mockClear();
  };

  const setOrdersStoreState = (state: Partial<OrdersStoreState>) => {
    ordersStoreState = { ...ordersStoreState, ...state };
  };

  return {
    mockUseUserStore,
    mockUseOrdersStore,
    resetUserStoreState,
    resetOrdersStoreState,
    setUserStoreState,
    setOrdersStoreState,
  };
});

// Mock the API function
vi.mock('@/lib/api/orders', () => ({
  fetchUserOrders: vi.fn(),
}));

// Mock the stores
vi.mock('@/store/user-store', () => ({
  useUserStore: mockUseUserStore,
}));

vi.mock('@/store/orders-store', () => ({
  useOrdersStore: mockUseOrdersStore,
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

describe('useOrders', () => {
  const mockOrders = [
    {
      id: '1',
      userId: 'user1',
      storeId: 'store1',
      storeName: 'Test Restaurant',
      items: [],
      subtotal: 20.99,
      deliveryFee: 5.99,
      serviceFee: 3.15,
      total: 32.23,
      status: 'delivered',
      orderDate: '2024-01-01T00:00:00Z',
      deliveryAddress: {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house' as const,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    resetUserStoreState();
    resetOrdersStoreState();
  });

  it('should fetch orders successfully when user is logged in and store is not initialized', async () => {
    (fetchUserOrders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockOrders);

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.orders).toEqual(mockOrders);
    expect(fetchUserOrders).toHaveBeenCalledWith('user1');
  });

  it('should not fetch when user is not logged in', () => {
    setUserStoreState({
      currentUser: null,
    });

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchUserOrders).not.toHaveBeenCalled();
  });

  it('should not fetch when store is already initialized', () => {
    setOrdersStoreState({
      initializeOrdersFromDB: vi.fn(),
      isInitialized: true,
      orders: [],
    });

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchUserOrders).not.toHaveBeenCalled();
  });

  it('should initialize orders store with fetched orders', async () => {
    const mockInitializeOrdersFromDB = vi.fn();
    setOrdersStoreState({
      initializeOrdersFromDB: mockInitializeOrdersFromDB,
      isInitialized: false,
      orders: [],
    });

    (fetchUserOrders as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrders);

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to complete first - orders should be available
    await waitFor(
      () => {
        expect(result.current.orders.length).toBeGreaterThan(0);
      },
      { timeout: 15000 }
    );

    // Then wait for the initialization to happen (useEffect runs after data is available)
    // The useEffect checks: orders && orders.length > 0 && !isInitialized && userId
    await waitFor(
      () => {
        expect(mockInitializeOrdersFromDB).toHaveBeenCalled();
      },
      { timeout: 15000 }
    );

    expect(mockInitializeOrdersFromDB).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          userId: 'user1',
        }),
      ])
    );
  }, 30000);

  it('should handle error when fetch fails', async () => {
    const error = new Error('Failed to fetch orders');
    (fetchUserOrders as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    const mockInitializeOrdersFromDB = vi.fn();
    setOrdersStoreState({
      initializeOrdersFromDB: mockInitializeOrdersFromDB,
      isInitialized: false,
      orders: [],
    });

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete (either success or error)
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 15000 }
    );

    // Check if error occurred - React Query sets error
    expect(result.current.error).toBeTruthy();
  }, 20000);
});
