import { vi } from 'vitest';
import { useCartStore } from '@/store/cart-store';
import { useAppStore } from '@/store/app-store';
import { useUserStore } from '@/store/user-store';
import { useVerifierStore } from '@/store/verifier-store';
import type { CartItem, CartCategory } from '@/store/cart-store';

// Mock dependencies
vi.mock('@/store/app-store');
vi.mock('@/store/user-store');
vi.mock('@/store/verifier-store');
vi.mock('@/lib/utils/deal-utils');
const { mockHaveSameModifications, mockGenerateCartItemId } = vi.hoisted(() => {
  const mockHaveSameModifications = vi.fn((item1: any, item2: any) => {
    // Check if items have the same base ID and same modifications
    const id1 = String(item1.id).split('-')[0]; // Get base ID (before hash)
    const id2 = String(item2.id).split('-')[0];
    return (
      id1 === id2 &&
      JSON.stringify(item1.appliedModifications || []) ===
        JSON.stringify(item2.appliedModifications || [])
    );
  });

  const mockGenerateCartItemId = vi.fn((id: string | number) => {
    return String(id);
  });

  return { mockHaveSameModifications, mockGenerateCartItemId };
});

vi.mock('@/lib/utils/cart-merge', () => ({
  haveSameModifications: mockHaveSameModifications,
  generateCartItemId: mockGenerateCartItemId,
  mergeGuestCartsWithDBCarts: vi.fn((guestCarts: any[], dbCarts: any[]) => [
    ...dbCarts,
    ...guestCarts,
  ]),
}));

// Mock persist and devtools middleware
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('cart-store', () => {
  const mockItem: Omit<CartItem, 'quantity'> = {
    id: 'item1',
    itemName: 'Burger',
    price: 10.99,
    image: 'burger.jpg',
  };

  beforeEach(() => {
    // Reset store state
    useCartStore.setState({
      carts: [],
      isGroupOrder: false,
      groupOrderId: null,
      isInitialized: false,
      shouldOpenCart: false,
    });

    // Mock app store
    (useAppStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      currentCategory: 'restaurant' as CartCategory,
      currentStore: { id: 'store1', name: 'Test Restaurant', type: 'restaurant' },
    });

    // Mock user store
    (useUserStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      currentUser: null,
    });

    // Mock verifier store
    const mockVerifierStore = {
      updateMaxItemsReached: vi.fn(),
      resetClearInfo: vi.fn(),
      resetVerifierConsumed: vi.fn(),
      recordRemoval: vi.fn(),
      recordClearInfo: vi.fn(),
      resetMaxItemsReached: vi.fn(),
      recordQuantityChange: vi.fn(),
      maxItemsReached: 0,
      lastClearInfo: null,
    };
    (useVerifierStore.getState as ReturnType<typeof vi.fn>).mockReturnValue(mockVerifierStore);
  });

  describe('getCurrentCategory', () => {
    it('should return current category from app store', () => {
      const category = useCartStore.getState().getCurrentCategory();
      expect(category).toBe('restaurant');
    });

    it('should default to restaurant when category is null', () => {
      (useAppStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        currentCategory: null,
        currentStore: {},
      });

      const category = useCartStore.getState().getCurrentCategory();
      expect(category).toBe('restaurant');
    });
  });

  describe('getCurrentStoreId', () => {
    it('should return store ID when store is not a restaurant', () => {
      (useAppStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        currentCategory: 'grocery' as CartCategory,
        currentStore: { id: 'store1', type: 'grocery' },
      });

      const storeId = useCartStore.getState().getCurrentStoreId();
      expect(storeId).toBe('store1');
    });

    it('should return null when store is a restaurant', () => {
      const storeId = useCartStore.getState().getCurrentStoreId();
      expect(storeId).toBeNull();
    });
  });

  describe('getCurrentRestaurantId', () => {
    it('should return restaurant ID when store is a restaurant', () => {
      const restaurantId = useCartStore.getState().getCurrentRestaurantId();
      expect(restaurantId).toBe('store1');
    });

    it('should return null when store is not a restaurant', () => {
      (useAppStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        currentCategory: 'grocery' as CartCategory,
        currentStore: { id: 'store1', type: 'grocery' },
      });

      const restaurantId = useCartStore.getState().getCurrentRestaurantId();
      expect(restaurantId).toBeNull();
    });
  });

  describe('findCart', () => {
    it('should find cart by storeId and category for guest user', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [],
      };

      useCartStore.setState({ carts: [cart] });

      const foundCart = useCartStore.getState().findCart('store1', 'restaurant');
      expect(foundCart).toEqual(cart);
    });

    it('should find cart for logged-in user', () => {
      (useUserStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      });

      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [],
        userId: 'user1',
      };

      useCartStore.setState({ carts: [cart] });

      const foundCart = useCartStore.getState().findCart('store1', 'restaurant');
      expect(foundCart).toEqual(cart);
    });

    it('should return undefined when cart not found', () => {
      const foundCart = useCartStore.getState().findCart('nonexistent', 'restaurant');
      expect(foundCart).toBeUndefined();
    });
  });

  describe('addItem', () => {
    it('should create new cart when no cart exists', () => {
      useCartStore.getState().addItem(mockItem);

      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(1);
      expect(carts[0].items).toHaveLength(1);
      expect(carts[0].items[0].itemName).toBe('Burger');
      expect(carts[0].items[0].quantity).toBe(1);
    });

    it('should add item to existing cart', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().addItem(mockItem);

      const carts = useCartStore.getState().carts;
      expect(carts[0].items).toHaveLength(1);
    });

    it('should increment quantity when adding same item', () => {
      // Reset mock to ensure it matches correctly
      mockHaveSameModifications.mockImplementation((item1: any, item2: any) => {
        const id1 = String(item1.id).split('-')[0];
        const id2 = String(item2.id).split('-')[0];
        return id1 === id2 || item1.id === item2.id;
      });

      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().addItem(mockItem);

      const carts = useCartStore.getState().carts;
      expect(carts[0].items[0].quantity).toBe(2);
    });

    it('should use provided storeId and category', () => {
      useCartStore.getState().addItem(mockItem, 'grocery', 'Grocery Store', 'grocery1');

      const carts = useCartStore.getState().carts;
      expect(carts[0].storeId).toBe('grocery1');
      expect(carts[0].storeCategory).toBe('grocery');
      expect(carts[0].storeName).toBe('Grocery Store');
    });

    it('should associate cart with user when logged in', () => {
      (useUserStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        currentUser: { id: 'user1', name: 'Test User', email: 'test@example.com' },
      });

      useCartStore.getState().addItem(mockItem);

      const carts = useCartStore.getState().carts;
      expect(carts[0].userId).toBe('user1');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().removeItem('item1');

      // When cart becomes empty, it's removed entirely
      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(0);
    });

    it('should remove cart when it becomes empty', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().removeItem('item1');

      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(0);
    });

    it('should not remove item that does not exist', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().removeItem('nonexistent');

      const carts = useCartStore.getState().carts;
      expect(carts[0].items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().updateQuantity('item1', 3);

      const carts = useCartStore.getState().carts;
      expect(carts[0].items[0].quantity).toBe(3);
    });

    it('should remove item when quantity is 0', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().updateQuantity('item1', 0);

      // When cart becomes empty, it's removed entirely
      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear specific cart', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().clearCart('store1', 'restaurant');

      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(0);
    });

    it('should clear current cart when no parameters provided', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      useCartStore.getState().clearCart();

      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(0);
    });
  });

  describe('clearAllCarts', () => {
    it('should clear all carts', () => {
      const cart1 = {
        storeId: 'store1',
        storeName: 'Restaurant 1',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item1' }],
      };
      const cart2 = {
        storeId: 'store2',
        storeName: 'Restaurant 2',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, quantity: 1, id: 'item2' }],
      };

      useCartStore.setState({ carts: [cart1, cart2] });

      useCartStore.getState().clearAllCarts();

      const carts = useCartStore.getState().carts;
      expect(carts).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('should return total items in cart', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [
          { ...mockItem, quantity: 2, id: 'item1' },
          { ...mockItem, quantity: 3, id: 'item2' },
        ],
      };

      useCartStore.setState({ carts: [cart] });

      const totalItems = useCartStore.getState().getTotalItems('store1', 'restaurant');
      expect(totalItems).toBe(5);
    });

    it('should return 0 when cart is empty', () => {
      const totalItems = useCartStore.getState().getTotalItems('store1', 'restaurant');
      expect(totalItems).toBe(0);
    });
  });

  describe('getSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [
          { ...mockItem, price: 10.99, quantity: 2, id: 'item1' },
          { ...mockItem, price: 5.99, quantity: 1, id: 'item2' },
        ],
      };

      useCartStore.setState({ carts: [cart] });

      const subtotal = useCartStore.getState().getSubtotal('store1', 'restaurant');
      expect(subtotal).toBeCloseTo(27.97, 2);
    });

    it('should handle string prices', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, price: '10.99', quantity: 2, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      const subtotal = useCartStore.getState().getSubtotal('store1', 'restaurant');
      expect(subtotal).toBeCloseTo(21.98, 2);
    });
  });

  describe('getServiceFee', () => {
    it('should calculate service fee based on subtotal', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, price: 20, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      const serviceFee = useCartStore.getState().getServiceFee('store1', 'restaurant');
      // 20 * 0.15 = 3, but min is 4.99
      expect(serviceFee).toBe(4.99);
    });
  });

  describe('getDeliveryFee', () => {
    it('should return default delivery fee when subtotal is below threshold', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, price: 10, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      const deliveryFee = useCartStore.getState().getDeliveryFee('store1', 'restaurant');
      expect(deliveryFee).toBe(5.99);
    });

    it('should return 0 when subtotal meets free delivery threshold', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, price: 30, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      const deliveryFee = useCartStore.getState().getDeliveryFee('store1', 'restaurant');
      expect(deliveryFee).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('should calculate total including fees', () => {
      const cart = {
        storeId: 'store1',
        storeName: 'Test Restaurant',
        storeCategory: 'restaurant' as CartCategory,
        items: [{ ...mockItem, price: 20, quantity: 1, id: 'item1' }],
      };

      useCartStore.setState({ carts: [cart] });

      const total = useCartStore.getState().getTotal('store1', 'restaurant');
      // 20 (subtotal) + 4.99 (service fee) + 5.99 (delivery fee) = 30.98
      expect(total).toBeCloseTo(30.98, 2);
    });
  });

  describe('startGroupOrder', () => {
    it('should start a group order and return group order ID', () => {
      const groupOrderId = useCartStore.getState().startGroupOrder();

      expect(groupOrderId).toBeDefined();
      expect(useCartStore.getState().isGroupOrder).toBe(true);
      expect(useCartStore.getState().groupOrderId).toBe(groupOrderId);
    });
  });

  describe('joinGroupOrder', () => {
    it('should join an existing group order', () => {
      useCartStore.getState().joinGroupOrder('group123');

      expect(useCartStore.getState().isGroupOrder).toBe(true);
      expect(useCartStore.getState().groupOrderId).toBe('group123');
    });
  });

  describe('leaveGroupOrder', () => {
    it('should leave group order', () => {
      useCartStore.setState({ isGroupOrder: true, groupOrderId: 'group123' });
      useCartStore.getState().leaveGroupOrder();

      expect(useCartStore.getState().isGroupOrder).toBe(false);
      expect(useCartStore.getState().groupOrderId).toBeNull();
    });
  });

  describe('triggerOpenCart and resetOpenCartTrigger', () => {
    it('should trigger cart to open', () => {
      useCartStore.getState().triggerOpenCart();

      expect(useCartStore.getState().shouldOpenCart).toBe(true);
    });

    it('should reset cart open trigger', () => {
      useCartStore.setState({ shouldOpenCart: true });
      useCartStore.getState().resetOpenCartTrigger();

      expect(useCartStore.getState().shouldOpenCart).toBe(false);
    });
  });

  describe('initializeCartsFromDB', () => {
    it('should initialize carts from database', async () => {
      const dbCarts = [
        {
          storeId: 'store1',
          storeName: 'Restaurant 1',
          storeCategory: 'restaurant' as CartCategory,
          items: [],
        },
        {
          storeId: 'store2',
          storeName: 'Restaurant 2',
          storeCategory: 'restaurant' as CartCategory,
          items: [],
        },
      ];

      useCartStore.getState().initializeCartsFromDB(dbCarts);

      // Wait for async import and merge to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(useCartStore.getState().isInitialized).toBe(true);
      // The merge function should combine carts, so we check that DB carts are included
      const finalCarts = useCartStore.getState().carts;
      expect(finalCarts.length).toBeGreaterThanOrEqual(dbCarts.length);
    });
  });
});
