import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useDeals,
  useCommonDeals,
  useAllDeals,
  useDealsByRestaurantId,
  useCheckoutDeals,
} from './use-deals';

// Mock fetch
global.fetch = vi.fn();

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

describe('useDeals', () => {
  const mockDeals = [
    {
      id: 'deal1',
      restaurantId: 'restaurant1',
      title: 'Test Deal',
      description: 'Test description',
    },
    {
      id: 'deal2',
      restaurantId: null,
      title: 'Common Deal',
      description: 'Common description',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should fetch deals without restaurantId', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDeals,
      }),
    });

    const { result } = renderHook(() => useDeals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockDeals);
    expect(fetch).toHaveBeenCalledWith('/api/deals?');
  });

  it('should fetch deals with restaurantId', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDeals,
      }),
    });

    const { result } = renderHook(() => useDeals('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith('/api/deals?restaurantId=restaurant1');
  });

  it('should handle error when fetch fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Failed to fetch deals',
      }),
    });

    const { result } = renderHook(() => useDeals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});

describe('useCommonDeals', () => {
  it('should call useDeals without restaurantId', () => {
    const { result } = renderHook(() => useCommonDeals(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });
});

describe('useAllDeals', () => {
  const mockDeals = [
    {
      id: 'deal1',
      restaurantId: 'restaurant1',
      title: 'Test Deal',
      description: 'Test description',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all deals when enabled is true', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDeals,
      }),
    });

    const { result } = renderHook(() => useAllDeals(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith('/api/deals?all=true');
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(() => useAllDeals(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('useDealsByRestaurantId', () => {
  const mockDeals = [
    {
      id: 'deal1',
      restaurantId: 'restaurant1',
      title: 'Test Deal',
      description: 'Test description',
    },
    {
      id: 'deal2',
      restaurantId: null,
      title: 'Common Deal',
      description: 'Common description',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter deals for restaurant', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDeals,
      }),
    });

    const { result } = renderHook(() => useDealsByRestaurantId('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.restaurantDeals).toEqual([
      expect.objectContaining({
        id: 'deal1',
        restaurantId: 'restaurant1',
      }),
    ]);
  });
});

describe('useCheckoutDeals', () => {
  const mockDeals = [
    {
      id: 'deal1',
      restaurantId: 'restaurant1',
      title: 'Test Deal',
      description: 'Test description',
    },
    {
      id: 'deal2',
      restaurantId: null,
      title: 'Common Deal',
      description: 'Common description',
    },
    {
      id: 'dashpass-delivery-fee',
      restaurantId: null,
      title: 'DashPass',
      description: 'DashPass deal',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter deals excluding DashPass', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockDeals,
      }),
    });

    const { result } = renderHook(() => useCheckoutDeals('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).not.toContainEqual(
      expect.objectContaining({
        id: 'dashpass-delivery-fee',
      })
    );
    expect(result.current.restaurantDeals).toEqual([
      expect.objectContaining({
        id: 'deal1',
        restaurantId: 'restaurant1',
      }),
    ]);
    expect(result.current.commonDeals).toEqual([
      expect.objectContaining({
        id: 'deal2',
        restaurantId: null,
      }),
    ]);
  });
});
