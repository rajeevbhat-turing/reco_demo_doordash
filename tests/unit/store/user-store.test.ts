import { vi } from 'vitest';
import { useUserStore } from '@/store/user-store';
import { User, Address } from '@/lib/types/user-types';

// Mock persist and devtools middleware to return the config as-is
vi.mock('zustand/middleware', () => ({
  persist: (config: any, _options?: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any, _options?: any) => (set: any, get: any, api: any) =>
    config(set, get, api),
}));

describe('user-store', () => {
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
    // Reset store state before each test
    useUserStore.setState({
      users: [],
      currentUser: null,
      changePasswordPhoneVerified: false,
      deletedUserIds: [],
      tempAddress: null,
      isInitialized: false,
    });
  });

  describe('getUser', () => {
    it('should return user by ID', () => {
      useUserStore.setState({ users: [mockUser] });

      const user = useUserStore.getState().getUser('1');
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found', () => {
      const user = useUserStore.getState().getUser('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', () => {
      useUserStore.setState({ users: [mockUser] });

      const user = useUserStore.getState().getUserByEmail('john@example.com');
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found', () => {
      const user = useUserStore.getState().getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('should exclude deleted users', () => {
      useUserStore.setState({
        users: [mockUser],
        deletedUserIds: ['1'],
      });

      const user = useUserStore.getState().getUserByEmail('john@example.com');
      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', () => {
      const user2: User = { ...mockUser, id: '2', email: 'jane@example.com' };
      useUserStore.setState({ users: [mockUser, user2] });

      const users = useUserStore.getState().getAllUsers();
      expect(users).toHaveLength(2);
      expect(users).toContainEqual(mockUser);
      expect(users).toContainEqual(user2);
    });
  });

  describe('setCurrentUser', () => {
    it('should set current user', () => {
      useUserStore.getState().setCurrentUser(mockUser);

      expect(useUserStore.getState().currentUser).toEqual(mockUser);
      expect(useUserStore.getState().isInitialized).toBe(true);
    });

    it('should clear tempAddress when setting current user', () => {
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

      useUserStore.setState({ tempAddress });
      useUserStore.getState().setCurrentUser(mockUser);

      expect(useUserStore.getState().tempAddress).toBeNull();
    });

    it('should clear current user when set to null', () => {
      useUserStore.setState({ currentUser: mockUser });
      useUserStore.getState().setCurrentUser(null);

      expect(useUserStore.getState().currentUser).toBeNull();
    });
  });

  describe('addUser', () => {
    it('should add user to store', () => {
      const newUser = {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '0987654321',
        password: 'password456',
        country: mockUser.country,
        userCountry: 'United States',
        avatar: null,
        is_restricted: false,
        reviews: [],
      };

      useUserStore.getState().addUser(newUser, false);

      const users = useUserStore.getState().getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('jane@example.com');
    });

    it('should set user as current when setAsCurrent is true', () => {
      const newUser = {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '0987654321',
        password: 'password456',
        country: mockUser.country,
        userCountry: 'United States',
        avatar: null,
        is_restricted: false,
        reviews: [],
      };

      useUserStore.getState().addUser(newUser, true);

      expect(useUserStore.getState().currentUser?.email).toBe('jane@example.com');
    });

    it('should add tempAddress to new user if it exists', () => {
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

      useUserStore.setState({ tempAddress });

      const newUser = {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '0987654321',
        password: 'password456',
        country: mockUser.country,
        userCountry: 'United States',
        avatar: null,
        is_restricted: false,
        reviews: [],
      };

      useUserStore.getState().addUser(newUser, false);

      const addedUser = useUserStore.getState().getUser('2');
      expect(addedUser?.addresses).toHaveLength(1);
      expect(addedUser?.addresses[0].street).toBe('123 Main St');
      expect(addedUser?.addresses[0].default).toBe(true);
      expect(useUserStore.getState().tempAddress).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should remove user from users array', () => {
      useUserStore.setState({ users: [mockUser] });
      useUserStore.getState().deleteUser('1');

      expect(useUserStore.getState().getAllUsers()).toHaveLength(0);
    });

    it('should add user ID to deletedUserIds', () => {
      useUserStore.setState({ users: [mockUser] });
      useUserStore.getState().deleteUser('1');

      expect(useUserStore.getState().deletedUserIds).toContain('1');
    });

    it('should clear currentUser if deleted user is current user', () => {
      useUserStore.setState({
        users: [mockUser],
        currentUser: mockUser,
      });
      useUserStore.getState().deleteUser('1');

      expect(useUserStore.getState().currentUser).toBeNull();
    });

    it('should not clear currentUser if deleted user is not current user', () => {
      const user2: User = { ...mockUser, id: '2', email: 'jane@example.com' };
      useUserStore.setState({
        users: [mockUser, user2],
        currentUser: mockUser,
      });
      useUserStore.getState().deleteUser('2');

      expect(useUserStore.getState().currentUser).toEqual(mockUser);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when currentUser exists', () => {
      useUserStore.setState({ currentUser: mockUser });
      expect(useUserStore.getState().isAuthenticated()).toBe(true);
    });

    it('should return false when currentUser is null', () => {
      expect(useUserStore.getState().isAuthenticated()).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change password when old password is correct', () => {
      useUserStore.setState({ currentUser: mockUser });
      const result = useUserStore.getState().changePassword('password123', 'newpassword456');

      expect(result).toBe(true);
      expect(useUserStore.getState().currentUser?.password).toBe('newpassword456');
      expect(useUserStore.getState().changePasswordPhoneVerified).toBe(false);
    });

    it('should return false when old password is incorrect', () => {
      useUserStore.setState({ currentUser: mockUser });
      const result = useUserStore.getState().changePassword('wrongpassword', 'newpassword456');

      expect(result).toBe(false);
      expect(useUserStore.getState().currentUser?.password).toBe('password123');
    });

    it('should return false when no current user', () => {
      const result = useUserStore.getState().changePassword('password123', 'newpassword456');
      expect(result).toBe(false);
    });

    it('should update password in users array', () => {
      useUserStore.setState({
        users: [mockUser],
        currentUser: mockUser,
      });
      useUserStore.getState().changePassword('password123', 'newpassword456');

      const user = useUserStore.getState().getUser('1');
      expect(user?.password).toBe('newpassword456');
    });
  });

  describe('setTempAddress', () => {
    it('should set temp address', () => {
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

      useUserStore.getState().setTempAddress(tempAddress);
      expect(useUserStore.getState().getTempAddress()).toEqual(tempAddress);
    });

    it('should clear temp address when set to null', () => {
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

      useUserStore.getState().setTempAddress(tempAddress);
      useUserStore.getState().setTempAddress(null);
      expect(useUserStore.getState().getTempAddress()).toBeNull();
    });
  });

  describe('addAddress', () => {
    it('should add address to current user', () => {
      useUserStore.setState({ currentUser: mockUser });
      const newAddress = {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        lat: 34.0522,
        lng: -118.2437,
        addressType: 'house' as const,
        default: false,
      };

      const addedAddress = useUserStore.getState().addAddress(newAddress);

      expect(addedAddress.id).toBeDefined();
      expect(addedAddress.default).toBe(true);
      expect(useUserStore.getState().currentUser?.addresses).toHaveLength(1);
    });

    it('should throw error when no current user', () => {
      const newAddress = {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        lat: 34.0522,
        lng: -118.2437,
        addressType: 'house' as const,
        default: false,
      };

      expect(() => useUserStore.getState().addAddress(newAddress)).toThrow('No current user');
    });

    it('should set all existing addresses to default: false when adding new address', () => {
      const existingAddress: Address = {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, addresses: [existingAddress] },
      });

      const newAddress = {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        lat: 34.0522,
        lng: -118.2437,
        addressType: 'house' as const,
        default: false,
      };

      useUserStore.getState().addAddress(newAddress);

      const addresses = useUserStore.getState().currentUser?.addresses || [];
      expect(addresses[0].default).toBe(false);
      expect(addresses[1].default).toBe(true);
    });
  });

  describe('removeAddress', () => {
    it('should remove address from current user', () => {
      const address: Address = {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, addresses: [address] },
      });

      useUserStore.getState().removeAddress('addr1');

      expect(useUserStore.getState().currentUser?.addresses).toHaveLength(0);
    });

    it('should not throw error when no current user', () => {
      expect(() => useUserStore.getState().removeAddress('addr1')).not.toThrow();
    });
  });

  describe('setDefaultAddress', () => {
    it('should set address as default', () => {
      const address1: Address = {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };
      const address2: Address = {
        id: 'addr2',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        lat: 34.0522,
        lng: -118.2437,
        addressType: 'house',
        default: false,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, addresses: [address1, address2] },
      });

      useUserStore.getState().setDefaultAddress('addr2');

      const addresses = useUserStore.getState().currentUser?.addresses || [];
      expect(addresses[0].default).toBe(false);
      expect(addresses[1].default).toBe(true);
    });
  });

  describe('updateAddress', () => {
    it('should update address fields', () => {
      const address: Address = {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, addresses: [address] },
      });

      useUserStore.getState().updateAddress('addr1', {
        street: '456 New St',
        city: 'Brooklyn',
      });

      const updatedAddress = useUserStore.getState().currentUser?.addresses[0];
      expect(updatedAddress?.street).toBe('456 New St');
      expect(updatedAddress?.city).toBe('Brooklyn');
      expect(updatedAddress?.state).toBe('NY'); // unchanged
    });

    it('should not update when no current user', () => {
      expect(() =>
        useUserStore.getState().updateAddress('addr1', { street: 'New St' })
      ).not.toThrow();
    });
  });

  describe('getAddresses', () => {
    it('should return all addresses for current user', () => {
      const address1: Address = {
        id: 'addr1',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        addressType: 'house',
        default: true,
      };
      const address2: Address = {
        id: 'addr2',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        lat: 34.0522,
        lng: -118.2437,
        addressType: 'house',
        default: false,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, addresses: [address1, address2] },
      });

      const addresses = useUserStore.getState().getAddresses();
      expect(addresses).toHaveLength(2);
    });

    it('should return empty array when no current user', () => {
      const addresses = useUserStore.getState().getAddresses();
      expect(addresses).toEqual([]);
    });
  });

  describe('addPaymentMethod', () => {
    it('should add payment method to current user', () => {
      useUserStore.setState({ currentUser: mockUser });

      const newMethod = {
        cardNumber: '4111111111111111',
        expirationDate: '12/32',
        cvv: '123',
        cvc: '123',
        expiry: '12/32',
        nameOnCard: 'John Doe',
        zipCode: '10001',
        default: false,
      };

      const addedMethod = useUserStore.getState().addPaymentMethod(newMethod);

      expect(addedMethod.id).toBeDefined();
      expect(addedMethod.type).toBe('MasterCard'); // Store hardcodes type to MasterCard
      expect(addedMethod.lastFour).toBe('1111');
      expect(useUserStore.getState().currentUser?.paymentMethods).toHaveLength(1);
    });

    it('should throw error when no current user', () => {
      const newMethod = {
        cardNumber: '4111111111111111',
        expirationDate: '12/32',
        cvv: '123',
        cvc: '123',
        expiry: '12/32',
        nameOnCard: 'John Doe',
        zipCode: '10001',
        default: false,
      };

      expect(() => useUserStore.getState().addPaymentMethod(newMethod)).toThrow('No current user');
    });
  });

  describe('removePaymentMethod', () => {
    it('should remove payment method from current user', () => {
      const paymentMethod = {
        id: 'pm1',
        type: 'Visa' as const,
        cardNumber: '4111111111111111',
        lastFour: '1111',
        expirationDate: '12/32',
        cvv: '123',
        cvc: '123',
        expiry: '12/32',
        nameOnCard: 'John Doe',
        zipCode: '10001',
        default: true,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, paymentMethods: [paymentMethod] },
      });

      useUserStore.getState().removePaymentMethod('pm1');

      expect(useUserStore.getState().currentUser?.paymentMethods).toHaveLength(0);
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should set payment method as default', () => {
      const pm1 = {
        id: 'pm1',
        type: 'Visa' as const,
        cardNumber: '4111111111111111',
        lastFour: '1111',
        expirationDate: '12/32',
        cvv: '123',
        cvc: '123',
        expiry: '12/32',
        nameOnCard: 'John Doe',
        zipCode: '10001',
        default: true,
      };
      const pm2 = {
        id: 'pm2',
        type: 'Mastercard' as const,
        cardNumber: '5500000000000004',
        lastFour: '0004',
        expirationDate: '06/26',
        cvv: '456',
        cvc: '456',
        expiry: '06/26',
        nameOnCard: 'John Doe',
        zipCode: '10001',
        default: false,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, paymentMethods: [pm1, pm2] },
      });

      useUserStore.getState().setDefaultPaymentMethod('pm2');

      const methods = useUserStore.getState().currentUser?.paymentMethods || [];
      expect(methods[0].default).toBe(false);
      expect(methods[1].default).toBe(true);
    });
  });

  describe('getPaymentMethods', () => {
    it('should return all payment methods for current user', () => {
      const paymentMethod = {
        id: 'pm1',
        type: 'Visa' as const,
        cardNumber: '4111111111111111',
        lastFour: '1111',
        expirationDate: '12/32',
        cvv: '123',
        cvc: '123',
        expiry: '12/32',
        nameOnCard: 'John Doe',
        zipCode: '10001',
        default: true,
      };

      useUserStore.setState({
        currentUser: { ...mockUser, paymentMethods: [paymentMethod] },
      });

      const methods = useUserStore.getState().getPaymentMethods();
      expect(methods).toHaveLength(1);
      expect(methods[0].id).toBe('pm1');
    });

    it('should return empty array when no current user', () => {
      const methods = useUserStore.getState().getPaymentMethods();
      expect(methods).toEqual([]);
    });
  });
});
