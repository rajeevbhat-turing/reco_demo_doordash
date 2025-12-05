import {
  getRestaurantById,
  calculateDeliveryTime,
  parseDistance,
  checkIfOpen,
  formatHours,
} from '@/lib/utils/restaurant-utils';
import type { Restaurant } from '@/constants/restaurants';

describe('restaurant-utils', () => {
  const mockRestaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Test Restaurant',
      logo: 'logo1.jpg',
      banner: 'banner1.jpg',
      rating: 4.5,
      reviews: '100+ ratings',
      distance: '2.5 mi',
      time: '25-35 min',
      deliveryFee: '$5.99 delivery fee',
      isFreeDelivery: false,
      minDeliveryFee: 599,
      priceRange: '$$',
      cuisine: 'Italian',
      dashPass: true,
      isOpen: true,
      openingHours: '10:00 AM - 10:00 PM',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      lat: 40.7128,
      lng: -74.006,
      phone: '555-0100',
      discount: '20% off',
      featured: false,
      new: false,
      categories: ['Italian', 'Pizza'],
    },
    {
      id: '2',
      name: 'Another Restaurant',
      logo: 'logo2.jpg',
      banner: 'banner2.jpg',
      rating: 4.8,
      reviews: '200+ ratings',
      distance: '1.2 mi',
      time: '15-25 min',
      deliveryFee: '$0 delivery fee',
      isFreeDelivery: true,
      minDeliveryFee: 0,
      priceRange: '$$$',
      cuisine: 'Mexican',
      dashPass: false,
      isOpen: false,
      openingHours: '11:00 AM - 9:00 PM',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      lat: 34.0522,
      lng: -118.2437,
      phone: '555-0200',
      discount: undefined,
      featured: true,
      new: true,
      categories: ['Mexican', 'Tacos'],
    },
  ];

  describe('getRestaurantById', () => {
    it('should return restaurant when found', () => {
      const result = getRestaurantById(mockRestaurants, '1');
      expect(result).toEqual(mockRestaurants[0]);
    });

    it('should return undefined when not found', () => {
      const result = getRestaurantById(mockRestaurants, '999');
      expect(result).toBeUndefined();
    });

    it('should return undefined when restaurants array is undefined', () => {
      const result = getRestaurantById(undefined, '1');
      expect(result).toBeUndefined();
    });

    it('should handle empty restaurants array', () => {
      const result = getRestaurantById([], '1');
      expect(result).toBeUndefined();
    });
  });

  describe('calculateDeliveryTime', () => {
    it('should calculate standard delivery time correctly', () => {
      const time = calculateDeliveryTime(5);
      // Base: 15 min, distance: 5 * 3 = 15 min, buffer: 10 min
      // min: 30, max: 40
      expect(time).toBe('30-40 min');
    });

    it('should calculate express delivery time correctly', () => {
      const time = calculateDeliveryTime(5, 'express');
      // Base: 10 min, distance: 5 * 2 = 10 min, buffer: 5 min
      // min: 20, max: 25
      expect(time).toBe('20-25 min');
    });

    it('should handle zero distance', () => {
      const time = calculateDeliveryTime(0);
      expect(time).toBe('15-25 min');
    });

    it('should handle very short distance', () => {
      const time = calculateDeliveryTime(0.5);
      // Base: 15 min, distance: 0.5 * 3 = 1.5 min, minTime = round(15 + 1.5) = 17
      // buffer: 10 min, maxTime = 17 + 10 = 27
      expect(time).toBe('17-27 min');
    });

    it('should handle long distance', () => {
      const time = calculateDeliveryTime(20);
      // Base: 15 min, distance: 20 * 3 = 60 min, buffer: 10 min
      // min: 75, max: 85
      expect(time).toBe('75-85 min');
    });

    it('should default to standard delivery type', () => {
      const time1 = calculateDeliveryTime(5);
      const time2 = calculateDeliveryTime(5, 'standard');
      expect(time1).toBe(time2);
    });
  });

  describe('parseDistance', () => {
    it('should parse distance string correctly', () => {
      expect(parseDistance('2.5 mi')).toBe(2.5);
      expect(parseDistance('0.7 mi')).toBe(0.7);
      expect(parseDistance('10 mi')).toBe(10);
    });

    it('should handle undefined input', () => {
      expect(parseDistance(undefined)).toBe(0);
    });

    it('should handle null input', () => {
      expect(parseDistance(null)).toBe(0);
    });

    it('should handle invalid format', () => {
      expect(parseDistance('invalid')).toBe(0);
    });

    it('should extract number from string with extra text', () => {
      expect(parseDistance('About 2.5 miles away')).toBe(2.5);
    });
  });

  describe('checkIfOpen', () => {
    it('should return true when restaurant is open (normal hours)', () => {
      // Restaurant open 10 AM - 10 PM, current hour is 2 PM (14)
      expect(checkIfOpen(10, 22, 14)).toBe(true);
    });

    it('should return false when restaurant is closed (before opening)', () => {
      // Restaurant open 10 AM - 10 PM, current hour is 9 AM (9)
      expect(checkIfOpen(10, 22, 9)).toBe(false);
    });

    it('should return false when restaurant is closed (after closing)', () => {
      // Restaurant open 10 AM - 10 PM, current hour is 11 PM (23)
      expect(checkIfOpen(10, 22, 23)).toBe(false);
    });

    it('should handle overnight hours (closing < opening)', () => {
      // Restaurant open 10 PM - 2 AM (22 - 2)
      expect(checkIfOpen(22, 2, 23)).toBe(true); // 11 PM - open
      expect(checkIfOpen(22, 2, 1)).toBe(true); // 1 AM - open
      expect(checkIfOpen(22, 2, 3)).toBe(false); // 3 AM - closed
      expect(checkIfOpen(22, 2, 21)).toBe(false); // 9 PM - closed
    });

    it('should handle ISO date string for opening hour', () => {
      const openingHour = '2025-11-12T08:00:00-07:30';
      expect(checkIfOpen(openingHour, 22, 10)).toBe(true);
    });

    it('should handle ISO date string for closing hour', () => {
      const closingHour = '2025-11-12T22:00:00-07:30';
      expect(checkIfOpen(10, closingHour, 15)).toBe(true);
    });

    it('should handle null/undefined hours', () => {
      // When both are null/undefined, both default to 0
      // checkIfOpen(0, 0, hour) returns hour >= 0 && hour < 0, which is false
      // So restaurant appears closed when hours are null/undefined
      expect(checkIfOpen(null, undefined, 12)).toBe(false);
      expect(checkIfOpen(0, 0, 12)).toBe(false);
    });

    it('should handle string hour values', () => {
      // Note: String '10' parses as Date('10') which becomes Oct 1, 2001 at midnight (hour 0)
      // So we test with numbers directly, or use ISO format strings
      expect(checkIfOpen(10, 22, 15)).toBe(true);
      expect(checkIfOpen(10, 22, 9)).toBe(false);

      // Test with ISO format strings which parse correctly
      expect(checkIfOpen('2025-11-12T10:00:00-07:30', '2025-11-12T22:00:00-07:30', 15)).toBe(true);
    });
  });

  describe('formatHours', () => {
    it('should format hours correctly for AM', () => {
      expect(formatHours(8, 12)).toBe('8:00 AM - 12:00 PM');
    });

    it('should format hours correctly for PM', () => {
      expect(formatHours(14, 22)).toBe('2:00 PM - 10:00 PM');
    });

    it('should handle midnight correctly', () => {
      expect(formatHours(0, 12)).toBe('12:00 AM - 12:00 PM');
    });

    it('should handle noon correctly', () => {
      expect(formatHours(12, 18)).toBe('12:00 PM - 6:00 PM');
    });

    it('should handle ISO date strings', () => {
      const openingHour = '2025-11-12T08:00:00-07:30';
      const closingHour = '2025-11-12T22:00:00-07:30';
      expect(formatHours(openingHour, closingHour)).toBe('8:00 AM - 10:00 PM');
    });

    it('should handle null/undefined hours', () => {
      expect(formatHours(null, undefined)).toBe('12:00 AM - 12:00 AM');
    });
  });
});
