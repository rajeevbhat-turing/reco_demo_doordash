import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTopChains, useTopCuisines, useTopCities } from './use-top-chains';

// Mock fetch
global.fetch = vi.fn();

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0, // Disable caching for tests
        gcTime: 0, // Clear cache immediately
      },
    },
  });

const createWrapper = (client?: QueryClient) => {
  const queryClient = client ?? createQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
};

describe('useTopChains', () => {
  const mockChains = [
    {
      id: '1',
      name: 'Restaurant 1',
      cuisine: 'Italian',
      city: 'New York',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Restaurant 2',
      cuisine: 'Italian',
      city: 'Los Angeles',
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Restaurant 3',
      cuisine: 'Mexican',
      city: 'New York',
      rating: 4.7,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should fetch top chains successfully', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockChains,
      }),
    });

    const { result } = renderHook(() => useTopChains(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockChains);
    expect(fetch).toHaveBeenCalledWith('/api/top-chains');
  });

  it('should return empty array when data is undefined', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: undefined,
      }),
    });

    const { result } = renderHook(() => useTopChains(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle error when fetch fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Failed to fetch top chains',
      }),
    });

    const { result } = renderHook(() => useTopChains(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useTopCuisines', () => {
  const mockChains = [
    {
      id: '1',
      name: 'Restaurant 1',
      cuisine: 'Italian',
      city: 'New York',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Restaurant 2',
      cuisine: 'Italian',
      city: 'Los Angeles',
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Restaurant 3',
      cuisine: 'Mexican',
      city: 'New York',
      rating: 4.7,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockChains,
      }),
    });
  });

  it('should derive unique cuisines from top chains', async () => {
    const { result } = renderHook(() => useTopCuisines(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const cuisines = result.current;
    expect(cuisines).toHaveLength(2); // Italian and Mexican
    expect(cuisines.find(c => c.name === 'Italian')).toBeDefined();
    expect(cuisines.find(c => c.name === 'Mexican')).toBeDefined();
  });

  it('should calculate average rating for each cuisine', async () => {
    const { result } = renderHook(() => useTopCuisines(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const italianCuisine = result.current.find(c => c.name === 'Italian');
    expect(italianCuisine).toBeDefined();
    expect(italianCuisine?.restaurantCount).toBe(2);
    expect(italianCuisine?.avgRating).toBeCloseTo(4.7, 1);
  });

  it('should return empty array when no chains available', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    const { result } = renderHook(() => useTopCuisines(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });
});

describe('useTopCities', () => {
  const mockChains = [
    {
      id: '1',
      name: 'Restaurant 1',
      cuisine: 'Italian',
      city: 'New York',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Restaurant 2',
      cuisine: 'Italian',
      city: 'Los Angeles',
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Restaurant 3',
      cuisine: 'Mexican',
      city: 'New York',
      rating: 4.7,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should derive unique cities from top chains', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['top-chains'], mockChains);

    const { result } = renderHook(() => useTopCities(), {
      wrapper: createWrapper(queryClient),
    });

    const cities = result.current;
    expect(cities).toHaveLength(2); // New York and Los Angeles
    expect(cities.find(c => c.name === 'New York')).toBeDefined();
    expect(cities.find(c => c.name === 'Los Angeles')).toBeDefined();
  });

  it('should calculate average rating for each city', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['top-chains'], mockChains);

    const { result } = renderHook(() => useTopCities(), {
      wrapper: createWrapper(queryClient),
    });

    const newYorkCity = result.current.find(c => c.name === 'New York');
    expect(newYorkCity).toBeDefined();
    expect(newYorkCity?.restaurantCount).toBe(2);
    expect(newYorkCity?.avgRating).toBeCloseTo(4.75, 1);
  });

  it('should return empty array when no chains available', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(['top-chains'], []);

    const { result } = renderHook(() => useTopCities(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current).toEqual([]);
  });
});
