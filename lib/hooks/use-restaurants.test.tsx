import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestaurants } from './use-restaurants';
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
      cuisine: 'Italian',
      rating: 4.5,
      deliveryTime: '30-40 min',
      deliveryFee: 5.99,
      image: 'restaurant1.jpg',
      city: 'New York',
      state: 'NY',
      lat: 40.7128,
      lng: -74.006,
      distance: 1.5,
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
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 5000 }
    );

    // Check if error occurred
    expect(result.current.isError || result.current.error).toBeTruthy();
  });
});
