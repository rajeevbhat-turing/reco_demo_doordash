import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser, useUserByEmail } from './use-user';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';

// Mock fetch
global.fetch = vi.fn();

// Mock the store
vi.mock('@/store/user-store', () => {
  const mockUseUserStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector({
        users: [],
      });
    }
    return {
      users: [],
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

describe('useUser', () => {
  const mockUser: User = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    password: 'password123',
    country: {
      dialCode: '+1',
      code: 'US',
      name: 'United States',
    },
    userCountry: 'United States',
    avatar: null,
    is_restricted: false,
    reviews: [],
    paymentMethods: [],
    addresses: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should return user from store when available', () => {
    const mockUseUserStoreWithUser = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          users: [mockUser],
        });
      }
      return {
        users: [mockUser],
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithUser;

    const { result } = renderHook(() => useUser('user1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch user from API when not in store', async () => {
    const mockUseUserStoreWithoutUser = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          users: [],
        });
      }
      return {
        users: [],
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithoutUser;

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockUser,
      }),
    });

    const { result } = renderHook(() => useUser('user1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/user1');
  });

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useUser(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockUseUserStoreWithoutUser = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          users: [],
        });
      }
      return {
        users: [],
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithoutUser;

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'User not found',
      }),
    });

    const { result } = renderHook(() => useUser('user1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUserByEmail', () => {
  const mockUser: User = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    password: 'password123',
    country: {
      dialCode: '+1',
      code: 'US',
      name: 'United States',
    },
    userCountry: 'United States',
    avatar: null,
    is_restricted: false,
    reviews: [],
    paymentMethods: [],
    addresses: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should return user from store when available', () => {
    const mockUseUserStoreWithUser = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          users: [mockUser],
        });
      }
      return {
        users: [mockUser],
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithUser;

    const { result } = renderHook(() => useUserByEmail('john@example.com'), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch user from API when not in store', async () => {
    const mockUseUserStoreWithoutUser = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          users: [],
        });
      }
      return {
        users: [],
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithoutUser;

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockUser,
      }),
    });

    const { result } = renderHook(() => useUserByEmail('john@example.com'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/email/john%40example.com');
  });

  it('should not fetch when email is empty', () => {
    const { result } = renderHook(() => useUserByEmail(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle error when fetch fails', async () => {
    const mockUseUserStoreWithoutUser = vi.fn((selector?: any) => {
      if (selector) {
        return selector({
          users: [],
        });
      }
      return {
        users: [],
      };
    });
    (useUserStore as unknown as ReturnType<typeof vi.fn>) = mockUseUserStoreWithoutUser;

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'User not found',
      }),
    });

    const { result } = renderHook(() => useUserByEmail('john@example.com'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
