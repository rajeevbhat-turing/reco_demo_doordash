import {
  extractPrice,
  restaurantHasItemsInPriceRange,
  storeHasProductsInPriceRange,
} from '@/lib/utils/price-filter-utils';

describe('price-filter-utils', () => {
  describe('extractPrice', () => {
    it('should extract price from string with dollar sign', () => {
      expect(extractPrice('$7.40')).toBe(7.4);
      expect(extractPrice('$10.99')).toBe(10.99);
    });

    it('should extract price from string with plus sign', () => {
      expect(extractPrice('$7.40+')).toBe(7.4);
      expect(extractPrice('$10.99+')).toBe(10.99);
    });

    it('should return number as-is', () => {
      expect(extractPrice(7.4)).toBe(7.4);
      expect(extractPrice(10)).toBe(10);
    });

    it('should handle string without currency symbol', () => {
      expect(extractPrice('7.40')).toBe(7.4);
      expect(extractPrice('10.99')).toBe(10.99);
    });

    it('should return 0 for invalid string', () => {
      expect(extractPrice('invalid')).toBe(0);
      expect(extractPrice('abc')).toBe(0);
    });

    it('should handle empty string', () => {
      expect(extractPrice('')).toBe(0);
    });

    it('should handle zero', () => {
      expect(extractPrice(0)).toBe(0);
      expect(extractPrice('$0')).toBe(0);
    });
  });

  describe('restaurantHasItemsInPriceRange', () => {
    const mockMenuItems = [
      { price: '$5.99' },
      { price: '$10.50' },
      { price: '$15.00' },
      { price: '$20.99' },
      { price: 25.0 },
    ];

    it('should return true when no price filter is set', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', null, null, mockMenuItems)).toBe(true);
    });

    it('should return true when items exist in min-max range', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', 10, 20, mockMenuItems)).toBe(true);
    });

    it('should return false when no items in min-max range', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', 30, 40, mockMenuItems)).toBe(false);
    });

    it('should return true when items meet minimum price', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', 10, null, mockMenuItems)).toBe(true);
    });

    it('should return false when no items meet minimum price', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', 30, null, mockMenuItems)).toBe(false);
    });

    it('should return true when items meet maximum price', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', null, 20, mockMenuItems)).toBe(true);
    });

    it('should return false when no items meet maximum price', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', null, 5, mockMenuItems)).toBe(false);
    });

    it('should return false when menu items array is empty', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', 10, 20, [])).toBe(false);
    });

    it('should handle items with number prices', () => {
      const itemsWithNumbers = [{ price: 10 }, { price: 15 }, { price: 20 }];
      expect(restaurantHasItemsInPriceRange('restaurant1', 12, 18, itemsWithNumbers)).toBe(true);
    });

    it('should handle boundary values correctly', () => {
      expect(restaurantHasItemsInPriceRange('restaurant1', 5.99, 5.99, mockMenuItems)).toBe(true);
      expect(restaurantHasItemsInPriceRange('restaurant1', 25.0, 25.0, mockMenuItems)).toBe(true);
    });
  });

  describe('storeHasProductsInPriceRange', () => {
    const mockProducts = [
      { price: '$5.99' },
      { price: '$10.50' },
      { price: '$15.00' },
      { price: '$20.99' },
      { price: 25.0 },
    ];

    it('should return true when no price filter is set', () => {
      expect(storeHasProductsInPriceRange(mockProducts, null, null)).toBe(true);
    });

    it('should return true when products exist in min-max range', () => {
      expect(storeHasProductsInPriceRange(mockProducts, 10, 20)).toBe(true);
    });

    it('should return false when no products in min-max range', () => {
      expect(storeHasProductsInPriceRange(mockProducts, 30, 40)).toBe(false);
    });

    it('should return true when products meet minimum price', () => {
      expect(storeHasProductsInPriceRange(mockProducts, 10, null)).toBe(true);
    });

    it('should return false when no products meet minimum price', () => {
      expect(storeHasProductsInPriceRange(mockProducts, 30, null)).toBe(false);
    });

    it('should return true when products meet maximum price', () => {
      expect(storeHasProductsInPriceRange(mockProducts, null, 20)).toBe(true);
    });

    it('should return false when no products meet maximum price', () => {
      expect(storeHasProductsInPriceRange(mockProducts, null, 5)).toBe(false);
    });

    it('should return false when products array is empty', () => {
      expect(storeHasProductsInPriceRange([], 10, 20)).toBe(false);
    });

    it('should handle products with number prices', () => {
      const productsWithNumbers = [{ price: 10 }, { price: 15 }, { price: 20 }];
      expect(storeHasProductsInPriceRange(productsWithNumbers, 12, 18)).toBe(true);
    });

    it('should handle boundary values correctly', () => {
      expect(storeHasProductsInPriceRange(mockProducts, 5.99, 5.99)).toBe(true);
      expect(storeHasProductsInPriceRange(mockProducts, 25.0, 25.0)).toBe(true);
    });
  });
});
