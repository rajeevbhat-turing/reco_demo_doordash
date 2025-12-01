import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { loginUser, generateOTP } from '@/lib/api/auth';
import { User, Address } from '@/lib/types/user-types';

// Mock the API functions
jest.mock('@/lib/api/auth', () => ({
  loginUser: jest.fn(),
  generateOTP: jest.fn(),
}));

// Mock the store
jest.mock('@/store/user-store', () => {
  const mockGetTempAddressFn = jest.fn(() => null);
  const mockGetStateFn = jest.fn(() => ({
    users: [],
    currentUser: null,
    changePasswordPhoneVerified: false,
  }));
  const mockSetStateFn = jest.fn();

  const mockUseUserStore = jest.fn((selector?: any) => {
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

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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
    jest.clearAllMocks();
    const { useUserStore } = require('@/store/user-store');
    const mockStore = useUserStore as jest.Mock & {
      getState: jest.Mock;
      setState: jest.Mock;
    };
    mockStore.getState.mockReturnValue({
      users: [],
      currentUser: null,
      changePasswordPhoneVerified: false,
    });
  });

  describe('login', () => {
    it('should call loginUser and update store on success', async () => {
      (loginUser as jest.Mock).mockResolvedValue(mockUser);

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
        const callArgs = (loginUser as jest.Mock).mock.calls[0][0];
        expect(callArgs.email).toBe('john@example.com');
        expect(callArgs.password).toBe('password123');
        const { useUserStore } = require('@/store/user-store');
        const mockStore = useUserStore as jest.Mock & {
          setState: jest.Mock;
        };
        expect(mockStore.setState).toHaveBeenCalled();
      });
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      (loginUser as jest.Mock).mockRejectedValue(error);

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

      (loginUser as jest.Mock).mockResolvedValue(mockUser);
      const { useUserStore } = require('@/store/user-store');
      const mockStore = useUserStore as jest.Mock;
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
        const { useUserStore } = require('@/store/user-store');
        const mockStore = useUserStore as jest.Mock & {
          setState: jest.Mock;
        };
        expect(mockStore.setState).toHaveBeenCalled();
      });
    });
  });

  describe('generateOTP', () => {
    it('should call generateOTP', async () => {
      const mockOTPResult = {
        otp: '123456',
        user: mockUser,
      };
      (generateOTP as jest.Mock).mockResolvedValue(mockOTPResult);

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
      const callArgs = (generateOTP as jest.Mock).mock.calls[0][0];
      expect(callArgs.email).toBe('john@example.com');
      expect(otpResult).toEqual(mockOTPResult);
    });

    it('should handle generateOTP error', async () => {
      const error = new Error('User not found');
      (generateOTP as jest.Mock).mockRejectedValue(error);

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
