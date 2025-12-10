import { vi } from 'vitest';
import { useAppStore } from '@/store/app-store';
import type { SearchResult } from '@/store/app-store';

// Mock persist and devtools middleware
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
  devtools: (config: any) => (set: any, get: any, api: any) => config(set, get, api),
}));

describe('app-store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      searchResults: [],
      currentStore: {},
      currentCategory: null,
      visitedStores: [],
      routeBeforeAuth: null,
    });
  });

  describe('updateSearchResults', () => {
    it('should update search results', () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          name: 'Test Restaurant',
          logo: 'logo.jpg',
          description: 'A test restaurant',
          type: 'restaurant',
          restaurantId: 'rest1',
        },
      ];

      useAppStore.getState().updateSearchResults(mockResults);

      expect(useAppStore.getState().searchResults).toEqual(mockResults);
    });

    it('should replace existing search results', () => {
      const initialResults: SearchResult[] = [
        {
          id: '1',
          name: 'Restaurant 1',
          logo: 'logo1.jpg',
          description: 'First restaurant',
          type: 'restaurant',
          restaurantId: 'rest1',
        },
      ];

      useAppStore.getState().updateSearchResults(initialResults);

      const newResults: SearchResult[] = [
        {
          id: '2',
          name: 'Restaurant 2',
          logo: 'logo2.jpg',
          description: 'Second restaurant',
          type: 'restaurant',
          restaurantId: 'rest2',
        },
      ];

      useAppStore.getState().updateSearchResults(newResults);

      expect(useAppStore.getState().searchResults).toEqual(newResults);
      expect(useAppStore.getState().searchResults).toHaveLength(1);
    });
  });

  describe('clearSearchResults', () => {
    it('should clear search results', () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          name: 'Test Restaurant',
          logo: 'logo.jpg',
          description: 'A test restaurant',
          type: 'restaurant',
          restaurantId: 'rest1',
        },
      ];

      useAppStore.getState().updateSearchResults(mockResults);
      useAppStore.getState().clearSearchResults();

      expect(useAppStore.getState().searchResults).toEqual([]);
    });
  });

  describe('setCurrentStore', () => {
    it('should set current store with category', () => {
      const mockStore = {
        id: 'store1',
        name: 'Test Store',
        type: 'restaurant',
      };

      useAppStore.getState().setCurrentStore(mockStore, 'restaurant');

      expect(useAppStore.getState().currentStore).toEqual(mockStore);
      expect(useAppStore.getState().currentCategory).toBe('restaurant');
    });

    it('should add store to visitedStores when store has id', () => {
      const mockStore = {
        id: 'store1',
        name: 'Test Store',
      };

      useAppStore.getState().setCurrentStore(mockStore, 'restaurant');

      expect(useAppStore.getState().visitedStores).toContain('store1');
      expect(useAppStore.getState().visitedStores[0]).toBe('store1');
    });

    it('should move existing store to beginning of visitedStores', () => {
      useAppStore.setState({ visitedStores: ['store2', 'store3'] });

      const mockStore = {
        id: 'store2',
        name: 'Test Store',
      };

      useAppStore.getState().setCurrentStore(mockStore, 'restaurant');

      expect(useAppStore.getState().visitedStores[0]).toBe('store2');
      expect(useAppStore.getState().visitedStores).toHaveLength(2);
    });

    it('should not add to visitedStores when store has no id', () => {
      const mockStore = {
        name: 'Test Store',
      };

      useAppStore.getState().setCurrentStore(mockStore, 'restaurant');

      expect(useAppStore.getState().visitedStores).toHaveLength(0);
    });

    it('should set category to null when not provided', () => {
      const mockStore = {
        id: 'store1',
        name: 'Test Store',
      };

      useAppStore.getState().setCurrentStore(mockStore);

      expect(useAppStore.getState().currentCategory).toBeNull();
    });
  });

  describe('clearCurrentStore', () => {
    it('should clear current store and category', () => {
      const mockStore = {
        id: 'store1',
        name: 'Test Store',
      };

      useAppStore.getState().setCurrentStore(mockStore, 'restaurant');
      useAppStore.getState().clearCurrentStore();

      expect(useAppStore.getState().currentStore).toEqual({});
      expect(useAppStore.getState().currentCategory).toBeNull();
    });
  });

  describe('setRouteBeforeAuth', () => {
    it('should set route before auth', () => {
      useAppStore.getState().setRouteBeforeAuth('/checkout');

      expect(useAppStore.getState().routeBeforeAuth).toBe('/checkout');
    });

    it('should clear route when set to null', () => {
      useAppStore.getState().setRouteBeforeAuth('/checkout');
      useAppStore.getState().setRouteBeforeAuth(null);

      expect(useAppStore.getState().routeBeforeAuth).toBeNull();
    });
  });
});
