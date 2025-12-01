import { checkDealCriteria, checkDealCriteriaBoolean } from './deal-utils';
import type { Deal } from '@/types/deal-types';
import type { CartItemForDeal } from './deal-utils';

describe('deal-utils', () => {
  const mockDeal: Deal = {
    id: 'deal1',
    restaurantId: 'restaurant1',
    title: 'Free Burger Deal',
    description: 'Get a free burger',
    minimumPurchase: 20,
    freeItems: [
      {
        id: 'item1',
        name: 'Burger',
      },
    ],
  };

  const mockCartItem: CartItemForDeal = {
    id: 'item1',
    itemName: 'Burger',
    price: 10.99,
    quantity: 1,
  };

  describe('checkDealCriteria', () => {
    describe('free item deals', () => {
      it('should return meets: true when free item is in cart and minimum purchase met', () => {
        const cartItems: CartItemForDeal[] = [
          mockCartItem, // Free item: $10.99 (one is free)
          {
            id: 'item2',
            itemName: 'Fries',
            price: 25.0, // This meets minimum when burger is excluded
            quantity: 1,
          },
        ];
        const subtotal = 10.99 + 25.0; // Total: 35.99
        // Subtotal excluding one free burger: 25.0 (meets minimum of 20)

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should return meets: false when free item not in cart', () => {
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item2',
            itemName: 'Fries',
            price: 5.99,
            quantity: 1,
          },
        ];
        const subtotal = 5.99;

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(false);
        expect(result.message).toContain('required items');
      });

      it('should return meets: false when minimum purchase not met', () => {
        const cartItems: CartItemForDeal[] = [
          mockCartItem,
          {
            id: 'item2',
            itemName: 'Fries',
            price: 2.99,
            quantity: 1,
          },
        ];
        const subtotal = 10.99 + 2.99; // 13.98, below minimum

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(false);
      });

      it('should exclude one free item from minimum purchase calculation', () => {
        const cartItems: CartItemForDeal[] = [
          mockCartItem, // Free item: $10.99 (one is free)
          {
            id: 'item2',
            itemName: 'Fries',
            price: 25.0, // This meets minimum when burger is excluded
            quantity: 1,
          },
        ];
        const subtotal = 10.99 + 25.0; // Total: 35.99
        // Excluding one free burger: 25.0 (meets minimum of 20)

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should handle multiple quantities of free item', () => {
        const cartItems: CartItemForDeal[] = [
          {
            ...mockCartItem,
            quantity: 2, // 2 burgers, one is free
          },
          {
            id: 'item2',
            itemName: 'Fries',
            price: 15.0,
            quantity: 1,
          },
        ];
        const subtotal = 10.99 * 2 + 15.0; // 36.98
        // One burger is free, so subtotal excluding one: 10.99 + 15.0 = 25.99 (meets minimum of 20)

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should match free item by ID and name', () => {
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1',
            itemName: 'Burger', // Matches free item name
            price: 10.99,
            quantity: 1,
          },
          {
            id: 'item2',
            itemName: 'Fries',
            price: 25.0, // Meets minimum when burger is excluded
            quantity: 1,
          },
        ];
        const subtotal = 35.99;

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should handle item ID with restaurant prefix', () => {
        const dealWithRestaurant: Deal = {
          ...mockDeal,
          restaurantId: 'restaurant1',
        };
        const cartItems: CartItemForDeal[] = [
          {
            id: 'restaurant1-item1', // Has restaurant prefix
            itemName: 'Burger',
            price: 10.99,
            quantity: 1,
          },
          {
            id: 'restaurant1-item2',
            itemName: 'Fries',
            price: 25.0, // Meets minimum
            quantity: 1,
          },
        ];
        const subtotal = 10.99 + 25.0;

        const result = checkDealCriteria(dealWithRestaurant, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should handle item ID with modification hash', () => {
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1-abc123', // Has modification hash
            itemName: 'Burger',
            price: 10.99,
            quantity: 1,
          },
          {
            id: 'item2',
            itemName: 'Fries',
            price: 25.0, // Meets minimum
            quantity: 1,
          },
        ];
        const subtotal = 10.99 + 25.0;

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should handle price as string', () => {
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1',
            itemName: 'Burger',
            price: '$10.99', // String price
            quantity: 1,
          },
          {
            id: 'item2',
            itemName: 'Fries',
            price: '$25.00', // Meets minimum
            quantity: 1,
          },
        ];
        const subtotal = 35.99;

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should handle price with plus sign', () => {
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1',
            itemName: 'Burger',
            price: '$10.99+',
            quantity: 1,
          },
          {
            id: 'item2',
            itemName: 'Fries',
            price: '$25.00', // Meets minimum
            quantity: 1,
          },
        ];
        const subtotal = 35.99;

        const result = checkDealCriteria(mockDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });
    });

    describe('discount deals', () => {
      it('should return meets: true when minimum purchase met', () => {
        const discountDeal: Deal = {
          id: 'deal2',
          restaurantId: null,
          title: '20% Off',
          description: 'Get 20% off',
          minimumPurchase: 20,
        };
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1',
            itemName: 'Pizza',
            price: 25.0,
            quantity: 1,
          },
        ];
        const subtotal = 25.0;

        const result = checkDealCriteria(discountDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });

      it('should return meets: false when minimum purchase not met', () => {
        const discountDeal: Deal = {
          id: 'deal2',
          restaurantId: null,
          title: '20% Off',
          description: 'Get 20% off',
          minimumPurchase: 20,
        };
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1',
            itemName: 'Pizza',
            price: 15.0,
            quantity: 1,
          },
        ];
        const subtotal = 15.0;

        const result = checkDealCriteria(discountDeal, cartItems, subtotal);
        expect(result.meets).toBe(false);
        expect(result.message).toContain('required items');
      });

      it('should return meets: true when no minimum purchase required', () => {
        const discountDeal: Deal = {
          id: 'deal2',
          restaurantId: null,
          title: '20% Off',
          description: 'Get 20% off',
        };
        const cartItems: CartItemForDeal[] = [
          {
            id: 'item1',
            itemName: 'Pizza',
            price: 10.0,
            quantity: 1,
          },
        ];
        const subtotal = 10.0;

        const result = checkDealCriteria(discountDeal, cartItems, subtotal);
        expect(result.meets).toBe(true);
      });
    });
  });

  describe('checkDealCriteriaBoolean', () => {
    it('should return boolean result', () => {
      const cartItems: CartItemForDeal[] = [
        mockCartItem,
        {
          id: 'item2',
          itemName: 'Fries',
          price: 25.0, // Meets minimum
          quantity: 1,
        },
      ];
      const subtotal = 35.99;

      const result = checkDealCriteriaBoolean(mockDeal, cartItems, subtotal);
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    it('should return true when criteria met', () => {
      const cartItems: CartItemForDeal[] = [
        mockCartItem,
        {
          id: 'item2',
          itemName: 'Fries',
          price: 25.0, // Meets minimum
          quantity: 1,
        },
      ];
      const subtotal = 35.99;

      const result = checkDealCriteriaBoolean(mockDeal, cartItems, subtotal);
      expect(result).toBe(true);
    });

    it('should return false when criteria not met', () => {
      const cartItems: CartItemForDeal[] = [
        {
          id: 'item2',
          itemName: 'Fries',
          price: 5.0,
          quantity: 1,
        },
      ];
      const subtotal = 5.0;

      const result = checkDealCriteriaBoolean(mockDeal, cartItems, subtotal);
      expect(result).toBe(false);
    });
  });
});
