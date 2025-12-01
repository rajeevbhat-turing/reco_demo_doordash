import { vi } from 'vitest';
import { loginUser, generateOTP } from './auth';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';

// Mock the store
vi.mock('@/store/user-store', () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('auth API', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '9999999999',
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

  describe('loginUser', () => {
    it('should login user from store when user exists and password matches', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => mockUser),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      const result = await loginUser({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when password does not match', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => mockUser),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      await expect(
        loginUser({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call API when user not found in store', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockUser,
        }),
      });

      const result = await loginUser({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'password123',
          deletedUserIds: [],
        }),
      });
    });

    it('should convert email to lowercase', async () => {
      const mockGetUserByEmail = vi.fn(() => mockUser);
      const mockGetState = vi.fn(() => ({
        getUserByEmail: mockGetUserByEmail,
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      const result = await loginUser({
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      // Verify getUserByEmail was called with lowercase email
      expect(mockGetUserByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw error when API call fails', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'Invalid credentials',
        }),
      });

      await expect(
        loginUser({
          email: 'john@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should include deletedUserIds in API request', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => null),
        deletedUserIds: ['deleted1', 'deleted2'],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockUser,
        }),
      });

      await loginUser({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john@example.com',
          password: 'password123',
          deletedUserIds: ['deleted1', 'deleted2'],
        }),
      });
    });
  });

  describe('generateOTP', () => {
    it('should generate OTP for user in store', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => mockUser),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      const result = await generateOTP({
        email: 'john@example.com',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.otp).toMatch(/^\d{6}$/); // 6-digit OTP
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call API when user not found in store', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      const mockOTPResult = {
        otp: '123456',
        user: mockUser,
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockOTPResult,
        }),
      });

      const result = await generateOTP({
        email: 'john@example.com',
      });

      expect(result).toEqual(mockOTPResult);
      expect(fetch).toHaveBeenCalledWith('/api/auth/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john@example.com',
          deletedUserIds: [],
        }),
      });
    });

    it('should convert email to lowercase', async () => {
      const mockGetUserByEmail = vi.fn(() => mockUser);
      const mockGetState = vi.fn(() => ({
        getUserByEmail: mockGetUserByEmail,
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      await generateOTP({
        email: 'JOHN@EXAMPLE.COM',
      });

      expect(mockGetUserByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw error when API call fails', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => ({
          success: false,
          error: 'User not found',
        }),
      });

      await expect(
        generateOTP({
          email: 'john@example.com',
        })
      ).rejects.toThrow('User not found');
    });

    it('should include deletedUserIds in API request', async () => {
      const mockGetState = vi.fn(() => ({
        getUserByEmail: vi.fn(() => null),
        deletedUserIds: ['deleted1'],
      }));
      (useUserStore.getState as ReturnType<typeof vi.fn>) = mockGetState;

      const mockOTPResult = {
        otp: '123456',
        user: mockUser,
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        json: async () => ({
          success: true,
          data: mockOTPResult,
        }),
      });

      await generateOTP({
        email: 'john@example.com',
      });

      expect(fetch).toHaveBeenCalledWith('/api/auth/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john@example.com',
          deletedUserIds: ['deleted1'],
        }),
      });
    });
  });
});
