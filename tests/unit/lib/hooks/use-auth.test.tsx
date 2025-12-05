import { vi } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/use-auth';
import { loginUser, generateOTP } from '@/lib/api/auth';
import { User, Address } from '@/lib/types/user-types';
import { useUserStore } from '@/store/user-store';

// Mock the API functions
vi.mock('@/lib/api/auth', () => ({
  loginUser: vi.fn(),
  generateOTP: vi.fn(),
}));

// Mock the store
vi.mock('@/store/user-store', () => {
  const mockGetTempAddressFn = vi.fn(() => null);
  const mockGetStateFn = vi.fn(() => ({
    users: [],
    currentUser: null,
    changePasswordPhoneVerified: false,
  }));
  const mockSetStateFn = vi.fn();

  const mockUseUserStore = vi.fn((selector?: any) => {
    if (selector) {
      return selector({
        getTempAddress: mockGetTempAddressFn,
      });
    }
    return {
      getTempAddress: mockGetTempAddressFn,
    };
  });

  // Add getState and setState to the mock
  (mockUseUserStore as any).getState = mockGetStateFn;
  (mockUseUserStore as any).setState = mockSetStateFn;

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
      mutations: {
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

describe('useAuth', () => {
  const mockUser: User = {
    id: '1',
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
    const mockStore = useUserStore as unknown as ReturnType<typeof vi.fn> & {
      getState: ReturnType<typeof vi.fn>;
      setState: ReturnType<typeof vi.fn>;
    };
    mockStore.getState.mockReturnValue({
      users: [],
      currentUser: null,
      changePasswordPhoneVerified: false,
    });
  });

  describe('login', () => {
    it('should call loginUser and update store on success', async () => {
      (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.login).toBeDefined();
      });

      await result.current.login({
        email: 'john@example.com',
        password: 'password123',
      });

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalled();
        const callArgs = (loginUser as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(callArgs.email).toBe('john@example.com');
        expect(callArgs.password).toBe('password123');
        const mockStore = useUserStore as unknown as ReturnType<typeof vi.fn> & {
          setState: ReturnType<typeof vi.fn>;
        };
        expect(mockStore.setState).toHaveBeenCalled();
      });
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      (loginUser as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.login).toBeDefined();
      });

      await expect(
        result.current.login({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle tempAddress when logging in', async () => {
      const tempAddress: Address = {
        id: 'temp1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };

      (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
      const mockStore = useUserStore as unknown as ReturnType<typeof vi.fn>;
      mockStore.mockImplementation((selector?: any) => {
        if (selector) {
          return selector({
            getTempAddress: () => tempAddress,
          });
        }
        return {
          getTempAddress: () => tempAddress,
        };
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.login).toBeDefined();
      });

      await result.current.login({
        email: 'john@example.com',
        password: 'password123',
      });

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalled();
        const mockStore = useUserStore as unknown as ReturnType<typeof vi.fn> & {
          setState: ReturnType<typeof vi.fn>;
        };
        expect(mockStore.setState).toHaveBeenCalled();
      });
    });

    it('should set existing address as default when tempAddress matches', async () => {
      const existingAddress: Address = {
        id: 'existing-addr',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: false,
      };

      const tempAddress: Address = {
        id: 'temp-id',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };

      const userWithExistingAddress: User = {
        ...mockUser,
        addresses: [existingAddress],
      };

      (loginUser as ReturnType<typeof vi.fn>).mockResolvedValue(userWithExistingAddress);

      const mockStore = useUserStore as unknown as ReturnType<typeof vi.fn> & {
        getState: ReturnType<typeof vi.fn>;
        setState: ReturnType<typeof vi.fn>;
      };
      mockStore.mockImplementation((selector?: any) => {
        if (selector) {
          return selector({
            getTempAddress: () => tempAddress,
          });
        }
        return {
          getTempAddress: () => tempAddress,
        };
      });
      mockStore.getState.mockReturnValue({
        users: [],
        currentUser: null,
        changePasswordPhoneVerified: false,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await result.current.login({
        email: 'john@example.com',
        password: 'password123',
      });

      await waitFor(() => {
        expect(mockStore.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            currentUser: expect.objectContaining({
              addresses: expect.arrayContaining([
                expect.objectContaining({ id: 'existing-addr', default: true }),
              ]),
            }),
            tempAddress: null,
          })
        );
      });
    });
  });

  describe('generateOTP', () => {
    it('should call generateOTP', async () => {
      const mockOTPResult = {
        otp: '123456',
        user: mockUser,
      };
      (generateOTP as ReturnType<typeof vi.fn>).mockResolvedValue(mockOTPResult);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.generateOTP).toBeDefined();
      });

      const otpResult = await result.current.generateOTP({
        email: 'john@example.com',
      });

      // React Query passes additional parameters, so we check if it was called with the email
      expect(generateOTP).toHaveBeenCalled();
      const callArgs = (generateOTP as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.email).toBe('john@example.com');
      expect(otpResult).toEqual(mockOTPResult);
    });

    it('should handle generateOTP error', async () => {
      const error = new Error('User not found');
      (generateOTP as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.generateOTP).toBeDefined();
      });

      await expect(
        result.current.generateOTP({
          email: 'nonexistent@example.com',
        })
      ).rejects.toThrow('User not found');
    });
  });
});
