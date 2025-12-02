import { vi } from 'vitest';
import { useDealsStore } from './deals-store';

// Mock persist and devtools middleware
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('deals-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDealsStore.setState({
      appliedDeals: [],
    });
  });

  describe('applyDeal', () => {
    it('should apply a deal to a cart', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');

      const dealId = useDealsStore.getState().getAppliedDealId('cart1');
      expect(dealId).toBe('deal1');
    });

    it('should replace existing deal for the same cart', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');
      useDealsStore.getState().applyDeal('deal2', 'cart1');

      const dealId = useDealsStore.getState().getAppliedDealId('cart1');
      expect(dealId).toBe('deal2');
      expect(useDealsStore.getState().appliedDeals).toHaveLength(1);
    });

    it('should apply deal with free item IDs', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1', ['item1', 'item2']);

      const freeItemIds = useDealsStore.getState().getFreeItemIds('cart1');
      expect(freeItemIds).toEqual(['item1', 'item2']);
    });

    it('should apply multiple deals to different carts', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');
      useDealsStore.getState().applyDeal('deal2', 'cart2');

      expect(useDealsStore.getState().appliedDeals).toHaveLength(2);
      expect(useDealsStore.getState().getAppliedDealId('cart1')).toBe('deal1');
      expect(useDealsStore.getState().getAppliedDealId('cart2')).toBe('deal2');
    });

    it('should set appliedAt timestamp', () => {
      const beforeTime = Date.now();
      useDealsStore.getState().applyDeal('deal1', 'cart1');
      const afterTime = Date.now();

      const deal = useDealsStore.getState().appliedDeals[0];
      expect(deal.appliedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(deal.appliedAt).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('removeDeal', () => {
    it('should remove deal from cart', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');
      useDealsStore.getState().removeDeal('cart1');

      const dealId = useDealsStore.getState().getAppliedDealId('cart1');
      expect(dealId).toBeNull();
    });

    it('should not affect other carts when removing a deal', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');
      useDealsStore.getState().applyDeal('deal2', 'cart2');

      useDealsStore.getState().removeDeal('cart1');

      expect(useDealsStore.getState().getAppliedDealId('cart1')).toBeNull();
      expect(useDealsStore.getState().getAppliedDealId('cart2')).toBe('deal2');
    });

    it('should not throw error when removing non-existent deal', () => {
      expect(() => useDealsStore.getState().removeDeal('nonexistent')).not.toThrow();
    });
  });

  describe('getAppliedDealId', () => {
    it('should return deal ID for cart with applied deal', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');

      const dealId = useDealsStore.getState().getAppliedDealId('cart1');
      expect(dealId).toBe('deal1');
    });

    it('should return null for cart without applied deal', () => {
      const dealId = useDealsStore.getState().getAppliedDealId('cart1');
      expect(dealId).toBeNull();
    });
  });

  describe('getFreeItemIds', () => {
    it('should return free item IDs for cart with deal', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1', ['item1', 'item2']);

      const freeItemIds = useDealsStore.getState().getFreeItemIds('cart1');
      expect(freeItemIds).toEqual(['item1', 'item2']);
    });

    it('should return empty array for cart without deal', () => {
      const freeItemIds = useDealsStore.getState().getFreeItemIds('cart1');
      expect(freeItemIds).toEqual([]);
    });

    it('should return empty array when deal has no free items', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1');

      const freeItemIds = useDealsStore.getState().getFreeItemIds('cart1');
      expect(freeItemIds).toEqual([]);
    });
  });

  describe('isFreeItem', () => {
    it('should return true for free item in cart with deal', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1', ['item1', 'item2']);

      expect(useDealsStore.getState().isFreeItem('cart1', 'item1')).toBe(true);
      expect(useDealsStore.getState().isFreeItem('cart1', 'item2')).toBe(true);
    });

    it('should return false for non-free item', () => {
      useDealsStore.getState().applyDeal('deal1', 'cart1', ['item1']);

      expect(useDealsStore.getState().isFreeItem('cart1', 'item2')).toBe(false);
    });

    it('should return false for cart without deal', () => {
      expect(useDealsStore.getState().isFreeItem('cart1', 'item1')).toBe(false);
    });
  });
});
