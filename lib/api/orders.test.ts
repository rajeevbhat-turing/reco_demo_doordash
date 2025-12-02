import { vi } from 'vitest';
import { fetchUserOrders } from './orders';
import { Order } from '@/constants/order-data';

// Mock fetch
global.fetch = vi.fn();

describe('orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe('fetchUserOrders', () => {
    const mockOrders: Order[] = [
      {
        id: '1',
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant',
        items: [],
        deliveryAddress: {
          id: 'addr1',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          lat: 40.7128,
          lng: -74.006,
          addressType: 'house',
        },
        deliveryOption: {
          type: 'delivery',
          deliveryTime: '30-40 min',
          extraFee: 0,
          scheduledDate: null,
          scheduledTimeSlot: undefined,
        },
        phoneNumber: {
          countryCode: '+1',
          number: '9999999999',
        },
        tipAmount: 5.0,
        subtotal: 20.99,
        deliveryFee: 5.99,
        serviceFee: 3.15,
        total: 32.23,
        orderDate: '2024-01-01T00:00:00Z',
        status: 'delivered',
        orderType: 'Personal',
        isDashPass: false,
      },
    ];

    it('should fetch user orders successfully', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockOrders,
        }),
      });

      const result = await fetchUserOrders('user1');

      expect(result).toEqual(mockOrders);
      expect(fetch).toHaveBeenCalledWith('/api/orders?userId=user1');
    });

    it('should throw error when response is not ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'User not found',
        }),
      });

      await expect(fetchUserOrders('user1')).rejects.toThrow('User not found');
    });

    it('should throw error when success is false', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Failed to fetch orders',
        }),
      });

      await expect(fetchUserOrders('user1')).rejects.toThrow('Failed to fetch orders');
    });

    it('should throw error when data is undefined', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      await expect(fetchUserOrders('user1')).rejects.toThrow('Orders data not found');
    });

    it('should throw default error message when message is not provided', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
        }),
      });

      await expect(fetchUserOrders('user1')).rejects.toThrow('Failed to fetch orders');
    });
  });
});
