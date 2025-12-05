import {
  generateCartItemId,
  haveSameModifications,
  mergeCarts,
  mergeGuestCartsWithDBCarts,
} from '@/lib/utils/cart-merge';
import type { Cart, CartItem } from '@/store/cart-store';
import type { AppliedModification, AppliedModificationOption } from '@/types';

describe('cart-merge', () => {
  const mockModificationOption: AppliedModificationOption = {
    optionId: 'opt1',
    optionName: 'Large',
    price: 2.0,
    quantity: 1,
  };

  const mockModification: AppliedModification = {
    modificationId: 'mod1',
    modificationDescription: 'Size',
    appliedOptions: [mockModificationOption],
  };

  describe('generateCartItemId', () => {
    it('should return base ID when no modifications', () => {
      expect(generateCartItemId('123')).toBe('123');
      expect(generateCartItemId(456)).toBe('456');
    });

    it('should generate unique ID for item with modifications', () => {
      const id1 = generateCartItemId('123', [mockModification]);
      expect(id1).toContain('123-');
      expect(id1).not.toBe('123');
    });

    it('should generate same ID for same modifications', () => {
      const id1 = generateCartItemId('123', [mockModification]);
      const id2 = generateCartItemId('123', [mockModification]);
      expect(id1).toBe(id2);
    });

    it('should generate different IDs for different modifications', () => {
      const mod1: AppliedModification = {
        modificationId: 'mod1',
        modificationDescription: 'Size',
        appliedOptions: [{ optionId: 'opt1', optionName: 'Large', price: 2.0, quantity: 1 }],
      };
      const mod2: AppliedModification = {
        modificationId: 'mod2',
        modificationDescription: 'Toppings',
        appliedOptions: [{ optionId: 'opt2', optionName: 'Extra Cheese', price: 1.5, quantity: 1 }],
      };

      const id1 = generateCartItemId('123', [mod1]);
      const id2 = generateCartItemId('123', [mod2]);
      expect(id1).not.toBe(id2);
    });

    it('should handle modifications in different order consistently', () => {
      const mod1: AppliedModification = {
        modificationId: 'mod1',
        modificationDescription: 'Size',
        appliedOptions: [{ optionId: 'opt1', optionName: 'Large', price: 2.0, quantity: 1 }],
      };
      const mod2: AppliedModification = {
        modificationId: 'mod2',
        modificationDescription: 'Toppings',
        appliedOptions: [{ optionId: 'opt2', optionName: 'Extra Cheese', price: 1.5, quantity: 1 }],
      };

      const id1 = generateCartItemId('123', [mod1, mod2]);
      const id2 = generateCartItemId('123', [mod2, mod1]);
      expect(id1).toBe(id2); // Should be same regardless of order
    });
  });

  describe('haveSameModifications', () => {
    const baseItem: CartItem = {
      id: '123',
      itemName: 'Pizza',
      price: 10,
      image: 'pizza.jpg',
      quantity: 1,
    };

    it('should return true for items with same base ID and no modifications', () => {
      const item1: CartItem = { ...baseItem };
      const item2: CartItem = { ...baseItem, id: '123' };
      expect(haveSameModifications(item1, item2)).toBe(true);
    });

    it('should return false for items with different base IDs', () => {
      const item1: CartItem = { ...baseItem, id: '123' };
      const item2: CartItem = { ...baseItem, id: '456' };
      expect(haveSameModifications(item1, item2)).toBe(false);
    });

    it('should return true for items with same modifications', () => {
      const item1: CartItem = {
        ...baseItem,
        id: '123',
        appliedModifications: [mockModification],
      };
      const item2: CartItem = {
        ...baseItem,
        id: '123',
        appliedModifications: [mockModification],
      };
      expect(haveSameModifications(item1, item2)).toBe(true);
    });

    it('should return false when one has modifications and other does not', () => {
      const item1: CartItem = {
        ...baseItem,
        id: '123',
        appliedModifications: [mockModification],
      };
      const item2: CartItem = {
        ...baseItem,
        id: '123',
      };
      expect(haveSameModifications(item1, item2)).toBe(false);
    });

    it('should handle items with unique IDs containing hash', () => {
      const item1: CartItem = {
        ...baseItem,
        id: '123-abc',
        appliedModifications: [mockModification],
      };
      const item2: CartItem = {
        ...baseItem,
        id: '123-def',
        appliedModifications: [mockModification],
      };
      // Should extract base ID '123' from both and compare modifications
      expect(haveSameModifications(item1, item2)).toBe(true);
    });
  });

  describe('mergeCarts', () => {
    const baseCart: Cart = {
      storeId: 'store1',
      storeName: 'Test Restaurant',
      storeCategory: 'restaurant',
      items: [],
    };

    it('should merge items with same modifications by adding quantities', () => {
      const dbCart: Cart = {
        ...baseCart,
        items: [
          {
            id: '123',
            itemName: 'Pizza',
            price: 10,
            image: 'pizza.jpg',
            quantity: 2,
          },
        ],
      };

      const guestCart: Cart = {
        ...baseCart,
        items: [
          {
            id: '123',
            itemName: 'Pizza',
            price: 10,
            image: 'pizza.jpg',
            quantity: 3,
          },
        ],
      };

      const merged = mergeCarts(guestCart, dbCart);
      expect(merged.items.length).toBe(1);
      expect(merged.items[0].quantity).toBe(5);
    });

    it('should add new items when no match found', () => {
      const dbCart: Cart = {
        ...baseCart,
        items: [
          {
            id: '123',
            itemName: 'Pizza',
            price: 10,
            image: 'pizza.jpg',
            quantity: 1,
          },
        ],
      };

      const guestCart: Cart = {
        ...baseCart,
        items: [
          {
            id: '456',
            itemName: 'Burger',
            price: 8,
            image: 'burger.jpg',
            quantity: 2,
          },
        ],
      };

      const merged = mergeCarts(guestCart, dbCart);
      expect(merged.items.length).toBe(2);
      expect(merged.items.some(item => item.id === '123')).toBe(true);
      expect(merged.items.some(item => item.id === '456')).toBe(true);
    });

    it('should handle items with different modifications separately', () => {
      const mod1: AppliedModification = {
        modificationId: 'mod1',
        modificationDescription: 'Size',
        appliedOptions: [{ optionId: 'opt1', optionName: 'Large', price: 2.0, quantity: 1 }],
      };

      const dbCart: Cart = {
        ...baseCart,
        items: [
          {
            id: '123',
            itemName: 'Pizza',
            price: 10,
            image: 'pizza.jpg',
            quantity: 1,
            appliedModifications: [mod1],
          },
        ],
      };

      const guestCart: Cart = {
        ...baseCart,
        items: [
          {
            id: '123',
            itemName: 'Pizza',
            price: 10,
            image: 'pizza.jpg',
            quantity: 1,
            // No modifications
          },
        ],
      };

      const merged = mergeCarts(guestCart, dbCart);
      expect(merged.items.length).toBe(2); // Should be separate items
    });

    it('should preserve cart metadata', () => {
      const dbCart: Cart = {
        ...baseCart,
        storeId: 'store1',
        storeName: 'DB Restaurant',
      };

      const guestCart: Cart = {
        ...baseCart,
        storeId: 'store1',
        storeName: 'Guest Restaurant',
      };

      const merged = mergeCarts(guestCart, dbCart);
      expect(merged.storeId).toBe('store1');
      expect(merged.storeName).toBe('DB Restaurant'); // Should preserve DB cart metadata
    });
  });

  describe('mergeGuestCartsWithDBCarts', () => {
    const baseCart: Cart = {
      storeId: 'store1',
      storeName: 'Test Restaurant',
      storeCategory: 'restaurant',
      items: [],
    };

    it('should add guest cart when no matching DB cart exists', () => {
      const guestCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          items: [
            {
              id: '123',
              itemName: 'Pizza',
              price: 10,
              image: 'pizza.jpg',
              quantity: 1,
            },
          ],
        },
      ];

      const dbCarts: Cart[] = [];

      const merged = mergeGuestCartsWithDBCarts(guestCarts, dbCarts);
      expect(merged.length).toBe(1);
      expect(merged[0].storeId).toBe('store1');
    });

    it('should merge guest cart with existing DB cart', () => {
      const guestCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          items: [
            {
              id: '123',
              itemName: 'Pizza',
              price: 10,
              image: 'pizza.jpg',
              quantity: 2,
            },
          ],
        },
      ];

      const dbCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          items: [
            {
              id: '123',
              itemName: 'Pizza',
              price: 10,
              image: 'pizza.jpg',
              quantity: 1,
            },
          ],
        },
      ];

      const merged = mergeGuestCartsWithDBCarts(guestCarts, dbCarts);
      expect(merged.length).toBe(1);
      expect(merged[0].items[0].quantity).toBe(3);
    });

    it('should handle multiple guest carts', () => {
      const guestCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          items: [{ id: '123', itemName: 'Pizza', price: 10, image: 'pizza.jpg', quantity: 1 }],
        },
        {
          ...baseCart,
          storeId: 'store2',
          items: [{ id: '456', itemName: 'Burger', price: 8, image: 'burger.jpg', quantity: 1 }],
        },
      ];

      const dbCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          items: [{ id: '123', itemName: 'Pizza', price: 10, image: 'pizza.jpg', quantity: 1 }],
        },
      ];

      const merged = mergeGuestCartsWithDBCarts(guestCarts, dbCarts);
      expect(merged.length).toBe(2);
      expect(merged.some(cart => cart.storeId === 'store1')).toBe(true);
      expect(merged.some(cart => cart.storeId === 'store2')).toBe(true);
    });

    it('should match carts by storeId and storeCategory', () => {
      const guestCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          storeCategory: 'restaurant',
          items: [{ id: '123', itemName: 'Pizza', price: 10, image: 'pizza.jpg', quantity: 1 }],
        },
      ];

      const dbCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          storeCategory: 'restaurant',
          items: [{ id: '123', itemName: 'Pizza', price: 10, image: 'pizza.jpg', quantity: 1 }],
        },
      ];

      const merged = mergeGuestCartsWithDBCarts(guestCarts, dbCarts);
      expect(merged.length).toBe(1);
      expect(merged[0].items[0].quantity).toBe(2);
    });

    it('should not match carts with different categories', () => {
      const guestCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          storeCategory: 'restaurant',
          items: [{ id: '123', itemName: 'Pizza', price: 10, image: 'pizza.jpg', quantity: 1 }],
        },
      ];

      const dbCarts: Cart[] = [
        {
          ...baseCart,
          storeId: 'store1',
          storeCategory: 'grocery',
          items: [{ id: '123', itemName: 'Pizza', price: 10, image: 'pizza.jpg', quantity: 1 }],
        },
      ];

      const merged = mergeGuestCartsWithDBCarts(guestCarts, dbCarts);
      expect(merged.length).toBe(2); // Should be separate carts
    });
  });
});
