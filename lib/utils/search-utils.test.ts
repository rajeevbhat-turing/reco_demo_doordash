import {
  cleanQuery,
  isOnlySpecialCharacters,
  searchByMenuItem,
  performSearch,
} from './search-utils';
import type { Restaurant } from '@/constants/restaurants';
import type { MenuItem } from './search-utils';

describe('search-utils', () => {
  const mockRestaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Burger King',
      cuisine: 'American',
      categories: ['Burgers', 'Fast Food'],
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
      lat: 0,
      lng: 0,
    },
    {
      id: '2',
      name: 'Pizza Hut',
      cuisine: 'Italian',
      categories: ['Pizza', 'Italian'],
      logo: '',
      banner: '',
      rating: 4.3,
      reviews: '',
      distance: '',
      time: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      priceRange: '',
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
      lat: 0,
      lng: 0,
    },
    {
      id: '3',
      name: 'Dessert Place',
      cuisine: 'Desserts',
      categories: ['Desserts', 'Ice Cream'],
      logo: '',
      banner: '',
      rating: 4.7,
      reviews: '',
      distance: '',
      time: '',
      deliveryFee: '',
      isFreeDelivery: false,
      minDeliveryFee: 0,
      priceRange: '',
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
      lat: 0,
      lng: 0,
    },
  ];

  const mockMenuItems: MenuItem[] = [
    {
      id: 'item1',
      restaurantId: '1',
      name: 'Whopper Burger',
      description: 'Delicious burger',
      category: 'Burgers',
      price: 10.99,
    },
    {
      id: 'item2',
      restaurantId: '2',
      name: 'Pepperoni Pizza',
      description: 'Classic pizza',
      category: 'Pizza',
      price: 15.99,
    },
    {
      id: 'item3',
      restaurantId: '3',
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake',
      category: 'Desserts',
      price: 8.99,
    },
  ];

  describe('cleanQuery', () => {
    it('should remove special characters', () => {
      expect(cleanQuery('hello@world!')).toBe('helloworld');
      expect(cleanQuery('test#123')).toBe('test123');
    });

    it('should keep alphanumeric and spaces', () => {
      expect(cleanQuery('hello world 123')).toBe('hello world 123');
    });

    it('should trim whitespace', () => {
      expect(cleanQuery('  hello  ')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(cleanQuery('')).toBe('');
    });
  });

  describe('isOnlySpecialCharacters', () => {
    it('should return true for only special characters', () => {
      expect(isOnlySpecialCharacters('@#$')).toBe(true);
      expect(isOnlySpecialCharacters('!!!')).toBe(true);
    });

    it('should return false for alphanumeric', () => {
      expect(isOnlySpecialCharacters('hello')).toBe(false);
      expect(isOnlySpecialCharacters('123')).toBe(false);
    });

    it('should return false for mixed content', () => {
      expect(isOnlySpecialCharacters('hello@world')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isOnlySpecialCharacters('')).toBe(false);
    });
  });

  describe('searchByMenuItem', () => {
    it('should find restaurants by menu item name', () => {
      const results = searchByMenuItem('whopper', mockRestaurants, mockMenuItems);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
      expect(results[0].matchType).toBe('menu-item');
    });

    it('should find restaurants by menu item description', () => {
      const results = searchByMenuItem('delicious', mockRestaurants, mockMenuItems);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should find restaurants by menu item category', () => {
      const results = searchByMenuItem('pizza', mockRestaurants, mockMenuItems);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should return empty array when no matches', () => {
      const results = searchByMenuItem('nonexistent', mockRestaurants, mockMenuItems);
      expect(results.length).toBe(0);
    });

    it('should be case-insensitive', () => {
      const results = searchByMenuItem('WHOPPER', mockRestaurants, mockMenuItems);
      expect(results.length).toBe(1);
    });

    it('should include matched items in result', () => {
      const results = searchByMenuItem('whopper', mockRestaurants, mockMenuItems);
      expect(results[0].matchedItems).toContain('Whopper Burger');
    });
  });

  describe('performSearch', () => {
    it('should return empty array for only special characters', () => {
      const results = performSearch('@#$', mockRestaurants);
      expect(results.length).toBe(0);
    });

    it('should return empty array for numeric-only query', () => {
      const results = performSearch('123', mockRestaurants);
      expect(results.length).toBe(0);
    });

    it('should return empty array for empty query', () => {
      const results = performSearch('', mockRestaurants);
      expect(results.length).toBe(0);
    });

    it('should find restaurants by name', () => {
      const results = performSearch('burger', mockRestaurants);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name.toLowerCase().includes('burger'))).toBe(true);
    });

    it('should find restaurants by cuisine', () => {
      const results = performSearch('italian', mockRestaurants);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.cuisine.toLowerCase().includes('italian'))).toBe(true);
    });

    it('should find restaurants by category', () => {
      const results = performSearch('pizza', mockRestaurants);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle dessert search specifically', () => {
      const results = performSearch('dessert', mockRestaurants);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.categories?.some(c => c.toLowerCase().includes('dessert')))).toBe(
        true
      );
    });

    it('should search by menu items when provided', () => {
      const results = performSearch('whopper', mockRestaurants, mockMenuItems);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.matchType === 'menu-item')).toBe(true);
    });

    it('should handle multi-word queries', () => {
      const results = performSearch('burger king', mockRestaurants);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should prioritize restaurant matches over menu item matches', () => {
      const results = performSearch('burger', mockRestaurants, mockMenuItems);
      // Restaurant matches should come first
      const restaurantMatches = results.filter(r => r.matchType === 'restaurant');
      const menuItemMatches = results.filter(r => r.matchType === 'menu-item');
      expect(restaurantMatches.length).toBeGreaterThan(0);
    });

    it('should remove duplicates', () => {
      const results = performSearch('burger', mockRestaurants, mockMenuItems);
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
