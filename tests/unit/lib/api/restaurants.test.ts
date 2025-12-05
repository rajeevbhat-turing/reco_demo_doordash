import { vi } from 'vitest';
import { fetchRestaurants, fetchRestaurantById } from '@/lib/api/restaurants';
import type { Restaurant } from '@/constants/restaurants';

// Mock fetch
global.fetch = vi.fn();

describe('restaurants API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe('fetchRestaurants', () => {
    const mockRestaurants: Restaurant[] = [
      {
        id: '1',
        name: 'Test Restaurant',
        logo: 'logo.jpg',
        banner: 'banner.jpg',
        cuisine: 'Italian',
        rating: 4.5,
        reviews: '100+ ratings',
        time: '30-40 min',
        deliveryFee: '$5.99 delivery fee',
        isFreeDelivery: false,
        minDeliveryFee: 599,
        priceRange: '$$',
        dashPass: false,
        isOpen: true,
        openingHours: '9 AM - 10 PM',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        lat: 40.7128,
        lng: -74.006,
        phone: '123-456-7890',
        distance: '1.5 mi',
      },
    ];

    it('should fetch restaurants successfully with default radius', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRestaurants,
        }),
      });

      const result = await fetchRestaurants({ lat: 40.7128, lng: -74.006 });

      expect(result).toEqual(mockRestaurants);
      expect(fetch).toHaveBeenCalledWith('/api/restaurants?lat=40.7128&lng=-74.006&radius=10');
    });

    it('should fetch restaurants successfully with custom radius', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRestaurants,
        }),
      });

      const result = await fetchRestaurants({ lat: 40.7128, lng: -74.006, radius: 5 });

      expect(result).toEqual(mockRestaurants);
      expect(fetch).toHaveBeenCalledWith('/api/restaurants?lat=40.7128&lng=-74.006&radius=5');
    });

    it('should throw error when response is not ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(fetchRestaurants({ lat: 40.7128, lng: -74.006 })).rejects.toThrow(
        'Failed to fetch restaurants: Internal Server Error'
      );
    });

    it('should throw error when success is false', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Invalid coordinates',
        }),
      });

      await expect(fetchRestaurants({ lat: 40.7128, lng: -74.006 })).rejects.toThrow(
        'Invalid coordinates'
      );
    });

    it('should throw error when data is undefined', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
        }),
      });

      await expect(fetchRestaurants({ lat: 40.7128, lng: -74.006 })).rejects.toThrow(
        'Failed to fetch restaurants'
      );
    });
  });

  describe('fetchRestaurantById', () => {
    const mockRestaurant: Restaurant = {
      id: '1',
      name: 'Test Restaurant',
      logo: 'logo.jpg',
      banner: 'banner.jpg',
      cuisine: 'Italian',
      rating: 4.5,
      reviews: '100+ ratings',
      time: '30-40 min',
      deliveryFee: '$5.99 delivery fee',
      isFreeDelivery: false,
      minDeliveryFee: 599,
      priceRange: '$$',
      dashPass: false,
      isOpen: true,
      openingHours: '9 AM - 10 PM',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      lat: 40.7128,
      lng: -74.006,
      phone: '123-456-7890',
      distance: '1.5 mi',
    };

    it('should fetch restaurant by id successfully without coordinates', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRestaurant,
        }),
      });

      const result = await fetchRestaurantById('restaurant1');

      expect(result).toEqual(mockRestaurant);
      expect(fetch).toHaveBeenCalledWith('/api/restaurants/restaurant1');
    });

    it('should fetch restaurant by id successfully with coordinates', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRestaurant,
        }),
      });

      const result = await fetchRestaurantById('restaurant1', 40.7128, -74.006);

      expect(result).toEqual(mockRestaurant);
      expect(fetch).toHaveBeenCalledWith('/api/restaurants/restaurant1?lat=40.7128&lng=-74.006');
    });

    it('should throw error when response is not ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Restaurant not found',
        }),
      });

      await expect(fetchRestaurantById('restaurant1')).rejects.toThrow('Restaurant not found');
    });

    it('should throw error when success is false', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          message: 'Failed to fetch restaurant',
        }),
      });

      await expect(fetchRestaurantById('restaurant1')).rejects.toThrow(
        'Failed to fetch restaurant'
      );
    });

    it('should throw error when data is undefined', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      await expect(fetchRestaurantById('restaurant1')).rejects.toThrow('Restaurant not found');
    });

    it('should throw default error message when message is not provided', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
        }),
      });

      await expect(fetchRestaurantById('restaurant1')).rejects.toThrow(
        'Failed to fetch restaurant'
      );
    });
  });
});
