import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestaurantMenu } from './use-restaurant-menu';
import { fetchRestaurantMenu } from '@/lib/api/menu';

// Mock the API function
vi.mock('@/lib/api/menu', () => ({
  fetchRestaurantMenu: vi.fn(),
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

describe('useRestaurantMenu', () => {
  const mockMenuData = {
    menuItems: [
      {
        id: '1',
        restaurantId: 'restaurant1',
        name: 'Burger',
        price: '$10.99',
        description: 'Delicious burger',
        image: 'burger.jpg',
        category: 'Main',
      },
    ],
    categories: [
      {
        id: '1',
        name: 'Main',
        description: 'Main dishes',
        displayOrder: 1,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch restaurant menu successfully', async () => {
    (fetchRestaurantMenu as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockMenuData);

    const { result } = renderHook(() => useRestaurantMenu('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMenuData);
    expect(fetchRestaurantMenu).toHaveBeenCalledWith('restaurant1');
  });

  it('should not fetch when restaurantId is undefined', () => {
    const { result } = renderHook(() => useRestaurantMenu(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchRestaurantMenu).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(() => useRestaurantMenu('restaurant1', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchRestaurantMenu).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const error = new Error('Failed to fetch menu');
    (fetchRestaurantMenu as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRestaurantMenu('restaurant1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should not fetch when restaurantId is undefined even if enabled', () => {
    const { result } = renderHook(() => useRestaurantMenu(undefined, true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetchRestaurantMenu).not.toHaveBeenCalled();
  });
});
