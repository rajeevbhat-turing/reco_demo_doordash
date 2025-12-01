import { loginUser, generateOTP } from './auth';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';

// Mock the store
jest.mock('@/store/user-store', () => ({
  useUserStore: {
    getState: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

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
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('loginUser', () => {
    it('should login user from store when user exists and password matches', async () => {
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => mockUser),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      const result = await loginUser({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should throw error when password does not match', async () => {
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => mockUser),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      await expect(
        loginUser({
          email: 'john@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call API when user not found in store', async () => {
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;
      (fetch as jest.Mock).mockResolvedValueOnce({
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
      const mockGetUserByEmail = jest.fn(() => mockUser);
      const mockGetState = jest.fn(() => ({
        getUserByEmail: mockGetUserByEmail,
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      const result = await loginUser({
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result).toEqual(mockUser);
      // Verify getUserByEmail was called with lowercase email
      expect(mockGetUserByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw error when API call fails', async () => {
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;
      (fetch as jest.Mock).mockResolvedValueOnce({
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
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => null),
        deletedUserIds: ['deleted1', 'deleted2'],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;
      (fetch as jest.Mock).mockResolvedValueOnce({
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
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => mockUser),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      const result = await generateOTP({
        email: 'john@example.com',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.otp).toMatch(/^\d{6}$/); // 6-digit OTP
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call API when user not found in store', async () => {
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      const mockOTPResult = {
        otp: '123456',
        user: mockUser,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
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
      const mockGetUserByEmail = jest.fn(() => mockUser);
      const mockGetState = jest.fn(() => ({
        getUserByEmail: mockGetUserByEmail,
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      await generateOTP({
        email: 'JOHN@EXAMPLE.COM',
      });

      expect(mockGetUserByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw error when API call fails', async () => {
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => null),
        deletedUserIds: [],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;
      (fetch as jest.Mock).mockResolvedValueOnce({
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
      const mockGetState = jest.fn(() => ({
        getUserByEmail: jest.fn(() => null),
        deletedUserIds: ['deleted1'],
      }));
      (useUserStore.getState as jest.Mock) = mockGetState;

      const mockOTPResult = {
        otp: '123456',
        user: mockUser,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
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
