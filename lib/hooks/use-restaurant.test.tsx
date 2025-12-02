import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestaurant } from './use-restaurant';
import { fetchRestaurantById } from '@/lib/api/restaurants';
import { useUserStore } from '@/store/user-store';

// Mock the API function
vi.mock('@/lib/api/restaurants', () => ({
  fetchRestaurantById: vi.fn(),
}));

// Mock the store
vi.mock('@/store/user-store', () => {
  const mockGetTempAddressFn = vi.fn(() => null);
  const mockUseUserStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector({
        currentUser: {
          id: 'user1',
          addresses: [
            {
              id: 'addr1',
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              lat: 40.7128,
              lng: -74.006,
              addressType: 'house',
              default: true,
            },
          ],
        },
        getTempAddress: mockGetTempAddressFn,
      });
    }
    return {
      getTempAddress: mockGetTempAddressFn,
    };
  });

  return {
    useUserStore: mockUseUserStore,
  };
});

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

describe('useRestaurant', () => {
  const mockRestaurant = {
    id: '1',
    name: 'Test Restaurant',
    logo: 'logo.jpg',
    banner: 'banner.jpg',
    cuisine: 'Italian',
    rating: 4.5,
    reviews: '100+ ratings',
    time: '30-40 min',
    deliveryFee: '$5.99 delivery fee',
    isFreeDelivery: false,
    minDeliveryFee: 599,
    priceRange: '$$',
    dashPass: false,
    isOpen: true,
    openingHours: '9 AM - 10 PM',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    lat: 40.7128,
    lng: -74.006,
    phone: '123-456-7890',
    distance: '1.5 mi',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch restaurant successfully with user address coordinates', async () => {
    (fetchRestaurantById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRestaurant);

    const { result } = renderHook(() => useRestaurant('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRestaurant);
    expect(fetchRestaurantById).toHaveBeenCalledWith('restaurant1', 40.7128, -74.006);
  });

  it('should fetch restaurant without coordinates when user has no address', async () => {
    const mockUseUserStoreWithoutAddress = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          currentUser: null,
          getTempAddress: vi.fn(() => null),
        });
      }
      return {
        getTempAddress: vi.fn(() => null),
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithoutAddress;

    (fetchRestaurantById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRestaurant);

    const { result } = renderHook(() => useRestaurant('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchRestaurantById).toHaveBeenCalledWith('restaurant1', undefined, undefined);
  });

  it('should not fetch when restaurantId is undefined', () => {
    const { result } = renderHook(() => useRestaurant(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchRestaurantById).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const error = new Error('Failed to fetch restaurant');
    (fetchRestaurantById as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRestaurant('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
