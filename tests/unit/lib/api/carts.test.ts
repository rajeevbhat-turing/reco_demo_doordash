import { vi } from 'vitest';
import { fetchUserCarts } from '@/lib/api/carts';
import { Cart } from '@/store/cart-store';

// Mock fetch
global.fetch = vi.fn();

describe('carts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe('fetchUserCarts', () => {
    const mockCarts: Cart[] = [
      {
        storeId: '1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant',
        items: [],
      },
      {
        storeId: '2',
        storeName: 'Another Restaurant',
        storeCategory: 'restaurant',
        items: [],
      },
    ];

    it('should fetch user carts successfully', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCarts,
        }),
      });

      const result = await fetchUserCarts('user1');

      expect(result).toEqual(mockCarts);
      expect(fetch).toHaveBeenCalledWith('/api/carts?userId=user1');
    });

    it('should return empty array when data is undefined', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      const result = await fetchUserCarts('user1');

      expect(result).toEqual([]);
    });

    it('should throw error when response is not ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Failed to fetch carts',
        }),
      });

      await expect(fetchUserCarts('user1')).rejects.toThrow('Failed to fetch carts');
    });

    it('should throw error when success is false', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'User not found',
        }),
      });

      await expect(fetchUserCarts('user1')).rejects.toThrow('User not found');
    });

    it('should throw default error message when message is not provided', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
        }),
      });

      await expect(fetchUserCarts('user1')).rejects.toThrow('Failed to fetch carts');
    });
  });
});
