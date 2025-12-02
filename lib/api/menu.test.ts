import { vi } from 'vitest';
import { fetchRestaurantMenu } from './menu';
import type { MenuItem } from '@/constants/menu-items';

// Mock fetch
global.fetch = vi.fn();

describe('menu API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe('fetchRestaurantMenu', () => {
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
        } as MenuItem,
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

    it('should fetch restaurant menu successfully', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockMenuData,
        }),
      });

      const result = await fetchRestaurantMenu('restaurant1');

      expect(result).toEqual(mockMenuData);
      expect(fetch).toHaveBeenCalledWith('/api/restaurants/restaurant1/menu');
    });

    it('should throw error when response is not ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Restaurant not found',
        }),
      });

      await expect(fetchRestaurantMenu('restaurant1')).rejects.toThrow('Restaurant not found');
    });

    it('should throw error when success is false', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Failed to fetch menu',
        }),
      });

      await expect(fetchRestaurantMenu('restaurant1')).rejects.toThrow('Failed to fetch menu');
    });

    it('should throw error when data is undefined', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      await expect(fetchRestaurantMenu('restaurant1')).rejects.toThrow('Menu data not found');
    });

    it('should throw default error message when message is not provided', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
        }),
      });

      await expect(fetchRestaurantMenu('restaurant1')).rejects.toThrow('Failed to fetch menu');
    });
  });
});
