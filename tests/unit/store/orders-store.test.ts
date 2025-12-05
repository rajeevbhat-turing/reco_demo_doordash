import { vi } from 'vitest';
import { useOrdersStore } from '@/store/orders-store';
import { Order } from '@/constants/order-data';

// Mock persist and devtools middleware
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('orders-store', () => {
  const mockOrder: Order = {
    id: 'order1',
    userId: 'user1',
    storeId: 'store1',
    storeName: 'Test Restaurant',
    items: [],
    subtotal: 20.99,
    deliveryFee: 5.99,
    serviceFee: 3.15,
    total: 32.23,
    status: 'delivered',
    orderDate: '2024-01-15T10:30:00Z',
    deliveryAddress: {
      id: 'addr1',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      lat: 40.7128,
      lng: -74.006,
      addressType: 'house',
    },
  };

  beforeEach(() => {
    // Reset store state before each test
    useOrdersStore.setState({
      orders: [],
      isInitialized: false,
    });
  });

  describe('addOrder', () => {
    it('should add order to store', () => {
      useOrdersStore.getState().addOrder(mockOrder);

      const orders = useOrdersStore.getState().getOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0]).toEqual(mockOrder);
    });

    it('should add new order at the beginning of the list', () => {
      const order1: Order = { ...mockOrder, id: 'order1' };
      const order2: Order = { ...mockOrder, id: 'order2' };

      useOrdersStore.getState().addOrder(order1);
      useOrdersStore.getState().addOrder(order2);

      const orders = useOrdersStore.getState().getOrders();
      expect(orders[0].id).toBe('order2');
      expect(orders[1].id).toBe('order1');
    });

    it('should handle multiple orders', () => {
      const order1: Order = { ...mockOrder, id: 'order1' };
      const order2: Order = { ...mockOrder, id: 'order2' };
      const order3: Order = { ...mockOrder, id: 'order3' };

      useOrdersStore.getState().addOrder(order1);
      useOrdersStore.getState().addOrder(order2);
      useOrdersStore.getState().addOrder(order3);

      const orders = useOrdersStore.getState().getOrders();
      expect(orders).toHaveLength(3);
    });
  });

  describe('getOrders', () => {
    it('should return all orders', () => {
      const order1: Order = { ...mockOrder, id: 'order1' };
      const order2: Order = { ...mockOrder, id: 'order2' };

      useOrdersStore.getState().addOrder(order1);
      useOrdersStore.getState().addOrder(order2);

      const orders = useOrdersStore.getState().getOrders();
      expect(orders).toHaveLength(2);
      expect(orders).toContainEqual(order1);
      expect(orders).toContainEqual(order2);
    });

    it('should return empty array when no orders', () => {
      const orders = useOrdersStore.getState().getOrders();
      expect(orders).toEqual([]);
    });
  });

  describe('updateOrderReview', () => {
    it('should update order review', () => {
      useOrdersStore.getState().addOrder(mockOrder);

      useOrdersStore.getState().updateOrderReview('order1', 5, 'Great food!');

      const orders = useOrdersStore.getState().getOrders();
      const updatedOrder = orders.find(o => o.id === 'order1');
      expect(updatedOrder?.rating).toBe(5);
      expect(updatedOrder?.reviewText).toBe('Great food!');
      expect(updatedOrder?.reviewDate).toBeDefined();
    });

    it('should not update non-existent order', () => {
      useOrdersStore.getState().addOrder(mockOrder);

      useOrdersStore.getState().updateOrderReview('nonexistent', 5, 'Great!');

      const orders = useOrdersStore.getState().getOrders();
      const order = orders.find(o => o.id === 'nonexistent');
      expect(order).toBeUndefined();
    });

    it('should update only the specified order', () => {
      const order1: Order = { ...mockOrder, id: 'order1' };
      const order2: Order = { ...mockOrder, id: 'order2' };

      useOrdersStore.getState().addOrder(order1);
      useOrdersStore.getState().addOrder(order2);

      useOrdersStore.getState().updateOrderReview('order1', 5, 'Great!');

      const orders = useOrdersStore.getState().getOrders();
      const updatedOrder1 = orders.find(o => o.id === 'order1');
      const unchangedOrder2 = orders.find(o => o.id === 'order2');

      expect(updatedOrder1?.rating).toBe(5);
      expect(unchangedOrder2?.rating).toBeUndefined();
    });
  });

  describe('initializeOrdersFromDB', () => {
    it('should initialize orders from database', () => {
      const dbOrders: Order[] = [
        { ...mockOrder, id: 'order1' },
        { ...mockOrder, id: 'order2' },
      ];

      useOrdersStore.getState().initializeOrdersFromDB(dbOrders);

      expect(useOrdersStore.getState().isInitialized).toBe(true);
      const orders = useOrdersStore.getState().getOrders();
      expect(orders).toHaveLength(2);
    });

    it('should prepend existing orders to database orders', () => {
      const existingOrder: Order = { ...mockOrder, id: 'existing' };
      useOrdersStore.getState().addOrder(existingOrder);

      const dbOrders: Order[] = [
        { ...mockOrder, id: 'order1' },
        { ...mockOrder, id: 'order2' },
      ];

      useOrdersStore.getState().initializeOrdersFromDB(dbOrders);

      const orders = useOrdersStore.getState().getOrders();
      expect(orders).toHaveLength(3);
      // DB orders should come first, then existing orders
      expect(orders[0].id).toBe('order1');
      expect(orders[1].id).toBe('order2');
      expect(orders[2].id).toBe('existing');
    });

    it('should set isInitialized to true', () => {
      useOrdersStore.getState().initializeOrdersFromDB([]);

      expect(useOrdersStore.getState().isInitialized).toBe(true);
    });
  });
});
