import { vi } from 'vitest';
import { useVerifierStore } from '@/store/verifier-store';
import type { CartItem } from '@/store/cart-store';

// Mock persist and devtools middleware
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('verifier-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useVerifierStore.setState({
      lastClearInfo: null,
      maxItemsReached: 0,
      verifierConsumed: false,
      lastSearchInfo: null,
      searchVerifierConsumed: false,
      lastRemovalInfo: null,
      removalVerifierConsumed: false,
      lastQuantityChangeInfo: null,
      quantityVerifierConsumed: false,
      lastOrderInfo: null,
      orderVerifierConsumed: false,
      lastCheckoutInfo: null,
      checkoutVerifierConsumed: false,
    });
  });

  describe('markVerifierConsumed and resetVerifierConsumed', () => {
    it('should mark verifier as consumed', () => {
      useVerifierStore.getState().markVerifierConsumed();

      expect(useVerifierStore.getState().verifierConsumed).toBe(true);
    });

    it('should reset verifier consumed', () => {
      useVerifierStore.getState().markVerifierConsumed();
      useVerifierStore.getState().resetVerifierConsumed();

      expect(useVerifierStore.getState().verifierConsumed).toBe(false);
    });
  });

  describe('recordSearch', () => {
    it('should record search term', () => {
      useVerifierStore.getState().recordSearch('pizza');

      const searchInfo = useVerifierStore.getState().lastSearchInfo;
      expect(searchInfo?.searchTerm).toBe('pizza');
      expect(searchInfo?.navigatedFromSearch).toBe(false);
      expect(searchInfo?.timestamp).toBeDefined();
    });

    it('should reset searchVerifierConsumed on new search', () => {
      useVerifierStore.setState({ searchVerifierConsumed: true });
      useVerifierStore.getState().recordSearch('pizza');

      expect(useVerifierStore.getState().searchVerifierConsumed).toBe(false);
    });
  });

  describe('recordNavigationFromSearch', () => {
    it('should update navigatedFromSearch to true', () => {
      useVerifierStore.getState().recordSearch('pizza');
      useVerifierStore.getState().recordNavigationFromSearch();

      const searchInfo = useVerifierStore.getState().lastSearchInfo;
      expect(searchInfo?.navigatedFromSearch).toBe(true);
    });

    it('should not update if no search info exists', () => {
      useVerifierStore.getState().recordNavigationFromSearch();

      expect(useVerifierStore.getState().lastSearchInfo).toBeNull();
    });
  });

  describe('markSearchVerifierConsumed', () => {
    it('should mark search verifier as consumed', () => {
      useVerifierStore.getState().markSearchVerifierConsumed();

      expect(useVerifierStore.getState().searchVerifierConsumed).toBe(true);
    });
  });

  describe('recordClearInfo', () => {
    it('should record clear info', () => {
      useVerifierStore.getState().recordClearInfo(5);

      const clearInfo = useVerifierStore.getState().lastClearInfo;
      expect(clearInfo?.itemsBeforeClear).toBe(5);
      expect(clearInfo?.timestamp).toBeDefined();
    });

    it('should reset verifierConsumed on clear', () => {
      useVerifierStore.setState({ verifierConsumed: true });
      useVerifierStore.getState().recordClearInfo(5);

      expect(useVerifierStore.getState().verifierConsumed).toBe(false);
    });
  });

  describe('resetClearInfo', () => {
    it('should reset clear info', () => {
      useVerifierStore.getState().recordClearInfo(5);
      useVerifierStore.getState().resetClearInfo();

      expect(useVerifierStore.getState().lastClearInfo).toBeNull();
    });
  });

  describe('updateMaxItemsReached', () => {
    it('should update max items reached', () => {
      useVerifierStore.getState().updateMaxItemsReached(10);

      expect(useVerifierStore.getState().maxItemsReached).toBe(10);
    });

    it('should only update if new value is greater', () => {
      useVerifierStore.getState().updateMaxItemsReached(10);
      useVerifierStore.getState().updateMaxItemsReached(5);

      expect(useVerifierStore.getState().maxItemsReached).toBe(10);
    });

    it('should update if new value is greater', () => {
      useVerifierStore.getState().updateMaxItemsReached(10);
      useVerifierStore.getState().updateMaxItemsReached(15);

      expect(useVerifierStore.getState().maxItemsReached).toBe(15);
    });
  });

  describe('resetMaxItemsReached', () => {
    it('should reset max items reached to 0', () => {
      useVerifierStore.getState().updateMaxItemsReached(10);
      useVerifierStore.getState().resetMaxItemsReached();

      expect(useVerifierStore.getState().maxItemsReached).toBe(0);
    });
  });

  describe('recordRemoval', () => {
    it('should record removal info', () => {
      const removedItems: CartItem[] = [
        {
          id: 'item1',
          itemName: 'Burger',
          price: 10.99,
          image: 'burger.jpg',
          quantity: 1,
        },
      ];

      useVerifierStore.getState().recordRemoval(removedItems);

      const removalInfo = useVerifierStore.getState().lastRemovalInfo;
      expect(removalInfo?.removedItems).toEqual(removedItems);
      expect(removalInfo?.timestamp).toBeDefined();
    });

    it('should reset removalVerifierConsumed on removal', () => {
      useVerifierStore.setState({ removalVerifierConsumed: true });
      const removedItems: CartItem[] = [
        {
          id: 'item1',
          itemName: 'Burger',
          price: 10.99,
          image: 'burger.jpg',
          quantity: 1,
        },
      ];

      useVerifierStore.getState().recordRemoval(removedItems);

      expect(useVerifierStore.getState().removalVerifierConsumed).toBe(false);
    });
  });

  describe('markRemovalVerifierConsumed', () => {
    it('should mark removal verifier as consumed', () => {
      useVerifierStore.getState().markRemovalVerifierConsumed();

      expect(useVerifierStore.getState().removalVerifierConsumed).toBe(true);
    });
  });

  describe('recordQuantityChange', () => {
    it('should record quantity change', () => {
      useVerifierStore.getState().recordQuantityChange('Burger', 1, 2);

      const quantityInfo = useVerifierStore.getState().lastQuantityChangeInfo;
      expect(quantityInfo?.itemName).toBe('Burger');
      expect(quantityInfo?.oldQuantity).toBe(1);
      expect(quantityInfo?.newQuantity).toBe(2);
      expect(quantityInfo?.timestamp).toBeDefined();
    });

    it('should reset quantityVerifierConsumed on change', () => {
      useVerifierStore.setState({ quantityVerifierConsumed: true });
      useVerifierStore.getState().recordQuantityChange('Burger', 1, 2);

      expect(useVerifierStore.getState().quantityVerifierConsumed).toBe(false);
    });
  });

  describe('markQuantityVerifierConsumed', () => {
    it('should mark quantity verifier as consumed', () => {
      useVerifierStore.getState().markQuantityVerifierConsumed();

      expect(useVerifierStore.getState().quantityVerifierConsumed).toBe(true);
    });
  });

  describe('recordOrderCompletion', () => {
    it('should record order completion', () => {
      const orderInfo = {
        orderId: 'order1',
        tipAmount: 5.0,
        orderTotal: 50.0,
        storeName: 'Test Restaurant',
        category: 'restaurant',
        items: [
          {
            id: 'item1',
            itemName: 'Burger',
            price: 10.99,
            image: 'burger.jpg',
            quantity: 1,
          },
        ],
      };

      useVerifierStore.getState().recordOrderCompletion(orderInfo);

      const lastOrderInfo = useVerifierStore.getState().lastOrderInfo;
      expect(lastOrderInfo?.orderId).toBe('order1');
      expect(lastOrderInfo?.tipAmount).toBe(5.0);
      expect(lastOrderInfo?.orderTotal).toBe(50.0);
      expect(lastOrderInfo?.storeName).toBe('Test Restaurant');
      expect(lastOrderInfo?.category).toBe('restaurant');
      expect(lastOrderInfo?.isCompleted).toBe(true);
      expect(lastOrderInfo?.timestamp).toBeDefined();
    });

    it('should reset orderVerifierConsumed on new order', () => {
      useVerifierStore.setState({ orderVerifierConsumed: true });
      const orderInfo = {
        orderId: 'order1',
        tipAmount: 5.0,
        orderTotal: 50.0,
        storeName: 'Test Restaurant',
        category: 'restaurant',
        items: [],
      };

      useVerifierStore.getState().recordOrderCompletion(orderInfo);

      expect(useVerifierStore.getState().orderVerifierConsumed).toBe(false);
    });
  });

  describe('markOrderVerifierConsumed', () => {
    it('should mark order verifier as consumed', () => {
      useVerifierStore.getState().markOrderVerifierConsumed();

      expect(useVerifierStore.getState().orderVerifierConsumed).toBe(true);
    });
  });

  describe('recordCheckoutNavigation', () => {
    it('should record checkout navigation', () => {
      useVerifierStore.getState().recordCheckoutNavigation();

      const checkoutInfo = useVerifierStore.getState().lastCheckoutInfo;
      expect(checkoutInfo?.navigatedToCheckout).toBe(true);
      expect(checkoutInfo?.tipAmount).toBe(0);
      expect(checkoutInfo?.timestamp).toBeDefined();
    });

    it('should reset checkoutVerifierConsumed on navigation', () => {
      useVerifierStore.setState({ checkoutVerifierConsumed: true });
      useVerifierStore.getState().recordCheckoutNavigation();

      expect(useVerifierStore.getState().checkoutVerifierConsumed).toBe(false);
    });
  });

  describe('recordTipSelection', () => {
    it('should record tip selection', () => {
      useVerifierStore.getState().recordCheckoutNavigation();
      useVerifierStore.getState().recordTipSelection(5.0);

      const checkoutInfo = useVerifierStore.getState().lastCheckoutInfo;
      expect(checkoutInfo?.tipAmount).toBe(5.0);
    });

    it('should create checkout info if it does not exist', () => {
      useVerifierStore.getState().recordTipSelection(5.0);

      const checkoutInfo = useVerifierStore.getState().lastCheckoutInfo;
      expect(checkoutInfo?.tipAmount).toBe(5.0);
      expect(checkoutInfo?.navigatedToCheckout).toBe(true);
    });
  });

  describe('recordDeliveryTimeSelection', () => {
    it('should record delivery time selection', () => {
      useVerifierStore.getState().recordCheckoutNavigation();
      useVerifierStore.getState().recordDeliveryTimeSelection('30-40 min');

      const checkoutInfo = useVerifierStore.getState().lastCheckoutInfo;
      expect(checkoutInfo?.deliveryTime).toBe('30-40 min');
    });

    it('should preserve existing tip amount', () => {
      useVerifierStore.getState().recordCheckoutNavigation();
      useVerifierStore.getState().recordTipSelection(5.0);
      useVerifierStore.getState().recordDeliveryTimeSelection('30-40 min');

      const checkoutInfo = useVerifierStore.getState().lastCheckoutInfo;
      expect(checkoutInfo?.tipAmount).toBe(5.0);
      expect(checkoutInfo?.deliveryTime).toBe('30-40 min');
    });
  });

  describe('markCheckoutVerifierConsumed', () => {
    it('should mark checkout verifier as consumed', () => {
      useVerifierStore.getState().markCheckoutVerifierConsumed();

      expect(useVerifierStore.getState().checkoutVerifierConsumed).toBe(true);
    });
  });
});
