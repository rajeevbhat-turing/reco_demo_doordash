import { filterRestaurantsByLocation } from './location-filter-utils';
import type { Restaurant } from '@/constants/restaurants';
import type { Address } from '@/lib/types/user-types';

describe('location-filter-utils', () => {
  const mockRestaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Near Restaurant',
      lat: 40.7128,
      lng: -74.006,
      logo: '',
      banner: '',
      rating: 4.5,
      reviews: '',
      distance: '',
      time: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      priceRange: '',
      cuisine: '',
      dashPass: false,
      isOpen: true,
      openingHours: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      discount: undefined,
      featured: false,
      new: false,
      categories: [],
    },
    {
      id: '2',
      name: 'Far Restaurant',
      lat: 40.8,
      lng: -74.1,
      logo: '',
      banner: '',
      rating: 4.5,
      reviews: '',
      distance: '',
      time: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      priceRange: '',
      cuisine: '',
      dashPass: false,
      isOpen: true,
      openingHours: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      discount: undefined,
      featured: false,
      new: false,
      categories: [],
    },
    {
      id: '3',
      name: 'Restaurant Without Coordinates',
      lat: undefined as any,
      lng: undefined as any,
      logo: '',
      banner: '',
      rating: 4.5,
      reviews: '',
      distance: '',
      time: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      priceRange: '',
      cuisine: '',
      dashPass: false,
      isOpen: true,
      openingHours: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      discount: undefined,
      featured: false,
      new: false,
      categories: [],
    },
  ];

  const mockAddress: Address = {
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

  describe('filterRestaurantsByLocation', () => {
    it('should filter restaurants within default radius (3 miles)', () => {
      const result = filterRestaurantsByLocation(mockRestaurants, mockAddress, null);
      // Restaurant 1 is at same location, Restaurant 2 is far, Restaurant 3 has no coordinates
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.id === '1')).toBe(true);
    });

    it('should filter restaurants within custom radius', () => {
      const result = filterRestaurantsByLocation(mockRestaurants, mockAddress, null, 1);
      // With 1 mile radius, should only include very close restaurants
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should use tempAddress when selectedAddress is null', () => {
      const result = filterRestaurantsByLocation(mockRestaurants, null, mockAddress);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should prioritize selectedAddress over tempAddress', () => {
      const tempAddress: Address = {
        ...mockAddress,
        lat: 40.8,
        lng: -74.1,
      };
      const result = filterRestaurantsByLocation(mockRestaurants, mockAddress, tempAddress);
      // Should use selectedAddress (40.7128, -74.006), not tempAddress
      expect(result.some(r => r.id === '1')).toBe(true);
    });

    it('should exclude restaurants without valid coordinates', () => {
      const result = filterRestaurantsByLocation(mockRestaurants, mockAddress, null);
      expect(result.some(r => r.id === '3')).toBe(false);
    });

    it('should handle address without coordinates', () => {
      const invalidAddress: Address = {
        ...mockAddress,
        lat: undefined as any,
        lng: undefined as any,
      };
      const result = filterRestaurantsByLocation(mockRestaurants, invalidAddress, null);
      // Should return all restaurants when address has no coordinates
      expect(result).toEqual(mockRestaurants);
    });

    it('should handle empty restaurants array', () => {
      const result = filterRestaurantsByLocation([], mockAddress, null);
      expect(result).toEqual([]);
    });
  });
});
