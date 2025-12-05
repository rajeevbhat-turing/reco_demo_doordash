import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { fetchRestaurants } from '@/lib/api/restaurants';

// Mock the API function
vi.mock('@/lib/api/restaurants', () => ({
  fetchRestaurants: vi.fn(),
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

describe('useRestaurants', () => {
  const mockRestaurants = [
    {
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch restaurants successfully with coordinates', async () => {
    (fetchRestaurants as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRestaurants);

    const { result } = renderHook(() => useRestaurants(40.7128, -74.006), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRestaurants);
    expect(fetchRestaurants).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.006, radius: 10 });
  });

  it('should fetch restaurants with custom radius', async () => {
    (fetchRestaurants as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockRestaurants);

    const { result } = renderHook(() => useRestaurants(40.7128, -74.006, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchRestaurants).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.006, radius: 5 });
  });

  it('should not fetch when lat is undefined', () => {
    const { result } = renderHook(() => useRestaurants(undefined, -74.006), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchRestaurants).not.toHaveBeenCalled();
  });

  it('should not fetch when lng is undefined', () => {
    const { result } = renderHook(() => useRestaurants(40.7128, undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchRestaurants).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const error = new Error('Failed to fetch restaurants');
    (fetchRestaurants as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRestaurants(40.7128, -74.006), {
      wrapper: createWrapper(),
    });

    // Wait for query to complete (either success or error)
    // Error handling may take slightly longer to process
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    // Check if error occurred
    expect(result.current.isError || result.current.error).toBeTruthy();
  });
});
