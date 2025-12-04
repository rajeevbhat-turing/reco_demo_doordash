import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCarts } from './use-carts';
import { fetchUserCarts } from '@/lib/api/carts';

type UserStoreState = {
  currentUser: {
    id: string;
  } | null;
};

type CartStoreState = {
  initializeCartsFromDB: ReturnType<typeof vi.fn>;
  isInitialized: boolean;
  carts: any[];
};

const {
  mockUseUserStore,
  mockUseCartStore,
  resetUserStoreState,
  resetCartStoreState,
  setUserStoreState,
  setCartStoreState,
} = vi.hoisted(() => {
  const createUserStoreState = (): UserStoreState => ({
    currentUser: {
      id: 'user1',
    },
  });

  const createCartStoreState = (): CartStoreState => ({
    initializeCartsFromDB: vi.fn(),
    isInitialized: false,
    carts: [],
  });

  let userStoreState: UserStoreState = createUserStoreState();
  let cartStoreState: CartStoreState = createCartStoreState();

  const mockUseUserStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector(userStoreState);
    }
    return userStoreState;
  });

  const mockSetCartStoreState = vi.fn((partial: Partial<CartStoreState>) => {
    cartStoreState = { ...cartStoreState, ...partial };
  });

  const mockUseCartStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector(cartStoreState);
    }
    return cartStoreState;
  });

  (mockUseCartStore as any).setState = mockSetCartStoreState;

  const resetUserStoreState = () => {
    userStoreState = createUserStoreState();
  };

  const setUserStoreState = (state: Partial<UserStoreState>) => {
    userStoreState = { ...userStoreState, ...state };
  };

  const resetCartStoreState = () => {
    cartStoreState = createCartStoreState();
    mockSetCartStoreState.mockClear();
  };

  const setCartStoreState = (state: Partial<CartStoreState>) => {
    cartStoreState = { ...cartStoreState, ...state };
  };

  return {
    mockUseUserStore,
    mockUseCartStore,
    resetUserStoreState,
    resetCartStoreState,
    setUserStoreState,
    setCartStoreState,
  };
});

// Mock the API function
vi.mock('@/lib/api/carts', () => ({
  fetchUserCarts: vi.fn(),
}));

// Mock the stores
vi.mock('@/store/user-store', () => ({
  useUserStore: mockUseUserStore,
}));

vi.mock('@/store/cart-store', () => ({
  useCartStore: mockUseCartStore,
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

describe('useCarts', () => {
  const mockCarts = [
    {
      storeId: '1',
      storeName: 'Test Restaurant',
      storeCategory: 'restaurant' as const,
      items: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    resetUserStoreState();
    resetCartStoreState();
  });

  it('should fetch carts successfully when user is logged in and store is not initialized', async () => {
    (fetchUserCarts as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCarts);

    const { result } = renderHook(() => useCarts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.carts).toEqual(mockCarts);
    expect(fetchUserCarts).toHaveBeenCalledWith('user1');
  });

  it('should not fetch when user is not logged in', () => {
    setUserStoreState({
      currentUser: null,
    });

    const { result } = renderHook(() => useCarts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchUserCarts).not.toHaveBeenCalled();
  });

  it('should not fetch when store is already initialized', () => {
    setCartStoreState({
      initializeCartsFromDB: vi.fn(),
      isInitialized: true,
      carts: [],
    });

    const { result } = renderHook(() => useCarts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchUserCarts).not.toHaveBeenCalled();
  });

  it('should initialize cart store with fetched carts', async () => {
    (fetchUserCarts as ReturnType<typeof vi.fn>).mockResolvedValue(mockCarts);

    const mockInitializeCartsFromDB = vi.fn();
    setCartStoreState({
      initializeCartsFromDB: mockInitializeCartsFromDB,
      isInitialized: false,
      carts: [], // ensure hasUserCarts returns false
    });

    const { result } = renderHook(() => useCarts(), {
      wrapper: createWrapper(),
    });

    // Wait for the query to complete first - carts should be available
    await waitFor(() => {
      expect(result.current.carts.length).toBeGreaterThan(0);
    });

    // Then wait for the initialization to happen (useEffect runs after data is available)
    // The useEffect checks: carts !== undefined && !isInitialized && userId
    await waitFor(() => {
      expect(mockInitializeCartsFromDB).toHaveBeenCalled();
    });

    expect(mockInitializeCartsFromDB).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          storeId: '1',
          userId: 'user1',
        }),
      ])
    );
  });

  it('should handle error when fetch fails', async () => {
    const error = new Error('Failed to fetch carts');
    (fetchUserCarts as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    const mockInitializeCartsFromDB = vi.fn();
    setCartStoreState({
      initializeCartsFromDB: mockInitializeCartsFromDB,
      isInitialized: false,
      carts: [],
    });

    const { result } = renderHook(() => useCarts(), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete (either success or error)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check if error occurred - React Query sets error
    expect(result.current.error).toBeTruthy();
  });

  it('should initialize with empty array when user carts already exist in store', async () => {
    (fetchUserCarts as ReturnType<typeof vi.fn>).mockResolvedValue(mockCarts);

    const mockInitializeCartsFromDB = vi.fn();
    setCartStoreState({
      initializeCartsFromDB: mockInitializeCartsFromDB,
      isInitialized: false,
      carts: [{ storeId: 'existing-store', userId: 'user1', items: [] }], // User already has carts
    });

    renderHook(() => useCarts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockInitializeCartsFromDB).toHaveBeenCalledWith([]);
    });
  });
});
