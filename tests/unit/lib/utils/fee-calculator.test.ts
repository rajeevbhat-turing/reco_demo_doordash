import {
  calculateDeliveryFee,
  calculateEstimatedTax,
  calculateFees,
  getCategoryConfig,
} from '@/lib/utils/fee-calculator';
import type { FeeCalculationParams } from '@/lib/utils/fee-calculator';
import type { Address } from '@/lib/types/user-types';

describe('fee-calculator', () => {
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

  const baseParams: FeeCalculationParams = {
    subtotal: 25.0,
    distance: 2.5,
    restaurant: null,
    customerAddress: mockAddress,
    appliedDeal: null,
    deliveryOption: 'standard',
    category: 'restaurant',
  };

  describe('calculateDeliveryFee', () => {
    it('should return free delivery when restaurant offers free delivery (standard)', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        restaurant: {
          id: '1',
          isFreeDelivery: true,
          minDeliveryFee: 0,
          dashPass: false,
        },
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBe(0);
      expect(result.breakdown.baseDeliveryFee).toBe(0);
    });

    it('should charge express surcharge even with free delivery', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        restaurant: {
          id: '1',
          isFreeDelivery: true,
          minDeliveryFee: 0,
          dashPass: false,
        },
        deliveryOption: 'express',
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBe(2.99);
      expect(result.breakdown.expressSurcharge).toBe(2.99);
    });

    it('should return free delivery when subtotal meets threshold (standard)', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 30.0, // Meets threshold
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBe(0);
    });

    it('should charge express surcharge even when subtotal meets threshold', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 30.0,
        deliveryOption: 'express',
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBe(2.99);
    });

    it('should calculate base delivery fee', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 20.0, // Below threshold
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBeGreaterThan(0);
      expect(result.breakdown.baseDeliveryFee).toBeGreaterThan(0);
    });

    it('should use restaurant min delivery fee if higher than default', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 20.0,
        restaurant: {
          id: '1',
          isFreeDelivery: false,
          minDeliveryFee: 799, // $7.99 in cents
          dashPass: false,
        },
      };
      const result = calculateDeliveryFee(params);
      expect(result.breakdown.baseDeliveryFee).toBeGreaterThanOrEqual(7.99);
    });

    it('should calculate distance surcharge for distances over free threshold', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 20.0,
        distance: 5.0, // Over 2 mile free threshold
      };
      const result = calculateDeliveryFee(params);
      expect(result.breakdown.distanceSurcharge).toBeGreaterThan(0);
    });

    it('should not charge distance surcharge within free threshold', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 20.0,
        distance: 1.5, // Within 2 mile free threshold
      };
      const result = calculateDeliveryFee(params);
      expect(result.breakdown.distanceSurcharge).toBe(0);
    });

    it('should calculate express surcharge', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 20.0,
        deliveryOption: 'express',
      };
      const result = calculateDeliveryFee(params);
      expect(result.breakdown.expressSurcharge).toBe(2.99);
      expect(result.fee).toBeGreaterThan(2.99);
    });

    it('should handle different categories', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        category: 'grocery',
        subtotal: 20.0,
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBeGreaterThanOrEqual(0);
    });

    it('should ensure fee is never negative', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 20.0,
        appliedDeal: {
          id: 'test-deal',
          title: 'Test Deal',
          description: 'Test',
          discountType: 'percentage',
          discountValue: 100,
          minimumPurchase: 0,
          freeItems: [],
          restaurantId: null,
        },
      };
      const result = calculateDeliveryFee(params);
      expect(result.fee).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateEstimatedTax', () => {
    it('should calculate tax based on state', () => {
      const tax = calculateEstimatedTax(100, 5, 3, mockAddress);
      // NY tax rate is 8%
      expect(tax).toBeCloseTo(8.64, 2); // (100 + 5 + 3) * 0.08 = 8.64
    });

    it('should use default tax rate when address not provided', () => {
      const tax = calculateEstimatedTax(100, 5, 3, null);
      // Default rate is 6%
      expect(tax).toBeCloseTo(6.48, 2); // (100 + 5 + 3) * 0.06 = 6.48
    });

    it('should calculate tax on subtotal + delivery fee + service fee', () => {
      const tax = calculateEstimatedTax(50, 5, 2, mockAddress);
      // NY: 8% of (50 + 5 + 2) = 4.56
      expect(tax).toBeCloseTo(4.56, 2);
    });

    it('should handle zero amounts', () => {
      const tax = calculateEstimatedTax(0, 0, 0, mockAddress);
      expect(tax).toBe(0);
    });
  });

  describe('calculateFees', () => {
    it('should calculate all fees correctly', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 25.0,
        distance: 3.0,
      };
      const result = calculateFees(params);
      expect(result.deliveryFee).toBeGreaterThanOrEqual(0);
      expect(result.serviceFee).toBeGreaterThan(0);
      expect(result.estimatedTax).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(params.subtotal);
    });

    it('should include breakdown in result', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 25.0,
      };
      const result = calculateFees(params);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.baseDeliveryFee).toBeDefined();
      expect(result.breakdown.distanceSurcharge).toBeDefined();
      expect(result.breakdown.expressSurcharge).toBeDefined();
      expect(result.breakdown.dealDiscount).toBeDefined();
    });

    it('should calculate total correctly', () => {
      const params: FeeCalculationParams = {
        ...baseParams,
        subtotal: 25.0,
      };
      const result = calculateFees(params);
      const expectedTotal =
        params.subtotal + result.deliveryFee + result.serviceFee + result.estimatedTax;
      expect(result.total).toBeCloseTo(expectedTotal, 2);
    });
  });

  describe('getCategoryConfig', () => {
    it('should return config for restaurant category', () => {
      const config = getCategoryConfig('restaurant');
      expect(config.freeDeliveryThreshold).toBe(30);
      expect(config.defaultDeliveryFee).toBe(5.99);
    });

    it('should return config for grocery category', () => {
      const config = getCategoryConfig('grocery');
      expect(config.freeDeliveryThreshold).toBe(30);
    });

    it('should return config for all categories', () => {
      const categories: Array<'restaurant' | 'grocery' | 'retail' | 'convenience' | 'pets'> = [
        'restaurant',
        'grocery',
        'retail',
        'convenience',
        'pets',
      ];
      categories.forEach(category => {
        const config = getCategoryConfig(category);
        expect(config).toBeDefined();
        expect(config.freeDeliveryThreshold).toBeDefined();
        expect(config.defaultDeliveryFee).toBeDefined();
      });
    });
  });
});
