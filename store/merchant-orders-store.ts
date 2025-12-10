'use client';

import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import { MerchantStorageKeys } from '@/lib/utils/merchant-storage';
import { setStoreScopedStorage } from '@/lib/utils/store-scoped-storage';
import { StoreMerchantData } from '@/constants/merchant-store-data';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessName?: string;
}

export interface MerchantOrder {
  id: string;
  // Customer info
  customer?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  // Order status
  status: string;
  // Date/time
  date: string;
  time: string;
  orderDate?: string; // ISO string for sorting/calculations
  // Fulfillment
  fulfillmentType: 'Customer pickup' | 'DashDoor delivery';
  channel: string;
  deliveryAddress?: DeliveryAddress;
  // Store info
  storeId?: string;
  storeName?: string;
  storeCategory?: string;
  // Order items
  items?: OrderItem[];
  // Pricing
  subtotal: string;
  serviceFee?: number;
  deliveryFee?: number;
  tipAmount?: number;
  total?: number;
}

interface OrdersStore {
  orders: MerchantOrder[];
  searchQuery: string;
  selectedFilter: string;
  activeTab: 'Active' | 'Scheduled' | 'History';

  // Actions
  setOrders: (orders: MerchantOrder[]) => void;
  addOrder: (order: MerchantOrder) => void;
  updateOrder: (orderId: string, updates: Partial<MerchantOrder>) => void;
  deleteOrder: (orderId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: string) => void;
  setActiveTab: (tab: 'Active' | 'Scheduled' | 'History') => void;
}

const initialOrders: MerchantOrder[] = [];

let currentStoreId = '';

const scopedStorage: () => StateStorage = () => {
  const noop: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  if (typeof window === 'undefined') return noop;
  const storeKey = currentStoreId ? `merchant.${currentStoreId}.orders` : null;
  if (!storeKey) return noop;
  return {
    getItem: (name: string) => localStorage.getItem(storeKey) ?? localStorage.getItem(name),
    setItem: (name: string, value: string) => {
      localStorage.setItem(storeKey, value);
      localStorage.setItem(name, value);
    },
    removeItem: (name: string) => {
      localStorage.removeItem(storeKey);
      localStorage.removeItem(name);
    },
  };
};

export const useMerchantOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      searchQuery: '',
      selectedFilter: 'All channels',
      activeTab: 'Active', // Default to Active tab to show new orders

      setOrders: orders => {
        if (!currentStoreId) return;
        set({ orders });
        if (typeof window !== 'undefined') {
          setStoreScopedStorage(currentStoreId, 'orders', {
            orders,
            searchQuery: get().searchQuery,
            selectedFilter: get().selectedFilter,
            activeTab: get().activeTab,
          });
        }
      },
      addOrder: order =>
        set(state => {
          if (!currentStoreId) return state;
          const newOrders = [...state.orders, order];
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'orders', {
              orders: newOrders,
              searchQuery: state.searchQuery,
              selectedFilter: state.selectedFilter,
              activeTab: state.activeTab,
            });
          }
          return { orders: newOrders };
        }),
      updateOrder: (orderId, updates) =>
        set(state => {
          if (!currentStoreId) return state;
          const newOrders = state.orders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
          );
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'orders', {
              orders: newOrders,
              searchQuery: state.searchQuery,
              selectedFilter: state.selectedFilter,
              activeTab: state.activeTab,
            });
          }
          return { orders: newOrders };
        }),
      deleteOrder: orderId =>
        set(state => {
          if (!currentStoreId) return state;
          const newOrders = state.orders.filter(order => order.id !== orderId);
          if (typeof window !== 'undefined') {
            setStoreScopedStorage(currentStoreId, 'orders', {
              orders: newOrders,
              searchQuery: state.searchQuery,
              selectedFilter: state.selectedFilter,
              activeTab: state.activeTab,
            });
          }
          return { orders: newOrders };
        }),
      setSearchQuery: query => {
        set({ searchQuery: query });
        if (typeof window !== 'undefined' && currentStoreId) {
          setStoreScopedStorage(currentStoreId, 'orders', {
            orders: get().orders,
            searchQuery: query,
            selectedFilter: get().selectedFilter,
            activeTab: get().activeTab,
          });
        }
      },
      setSelectedFilter: filter => {
        set({ selectedFilter: filter });
        if (typeof window !== 'undefined' && currentStoreId) {
          setStoreScopedStorage(currentStoreId, 'orders', {
            orders: get().orders,
            searchQuery: get().searchQuery,
            selectedFilter: filter,
            activeTab: get().activeTab,
          });
        }
      },
      setActiveTab: tab => {
        set({ activeTab: tab });
        if (typeof window !== 'undefined' && currentStoreId) {
          setStoreScopedStorage(currentStoreId, 'orders', {
            orders: get().orders,
            searchQuery: get().searchQuery,
            selectedFilter: get().selectedFilter,
            activeTab: tab,
          });
        }
      },
    }),
    {
      name: MerchantStorageKeys.ORDERS,
      getStorage: scopedStorage,
    }
  )
);

// Listen for store changes and reload data
if (typeof window !== 'undefined') {
  window.addEventListener('storeDataLoaded', ((
    event: CustomEvent<{ storeId: string; storeData: StoreMerchantData }>
  ) => {
    const { storeId, storeData } = event.detail;
    currentStoreId = storeId;

    // Load store-specific data from localStorage or use default from storeData
    const storageKey = `merchant.${storeId}.orders`;
    let storedData = storeData.orders;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        storedData = JSON.parse(stored);
      }
    } catch (e) {
      // Use default from storeData
    }

    const orders = (storedData.orders || []).map((o: any) => ({
      // ID (required)
      id: o.id || o.orderId || `order-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      // Customer info
      customer: o.customer || o.userName || 'Customer',
      userId: o.userId,
      userName: o.userName,
      userEmail: o.userEmail,
      // Order status
      status: o.status || 'pending',
      // Date/time
      date: o.date || new Date().toLocaleDateString('en-US'),
      time: o.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      orderDate: o.orderDate,
      // Fulfillment
      fulfillmentType: o.fulfillmentType || (o.deliveryOption?.type === 'pickup' ? 'Customer pickup' : 'DashDoor delivery'),
      channel: o.channel || 'DashDoor',
      deliveryAddress: o.deliveryAddress,
      // Store info
      storeId: o.storeId,
      storeName: o.storeName,
      storeCategory: o.storeCategory,
      // Order items
      items: o.items,
      // Pricing
      subtotal: o.subtotal || '$0.00',
      serviceFee: o.serviceFee,
      deliveryFee: o.deliveryFee,
      tipAmount: o.tipAmount,
      total: o.total,
    }));
    useMerchantOrdersStore.getState().setOrders(orders);
    useMerchantOrdersStore.getState().setSearchQuery(storedData.searchQuery);
    useMerchantOrdersStore.getState().setSelectedFilter(storedData.selectedFilter);
    useMerchantOrdersStore.getState().setActiveTab(storedData.activeTab);
  }) as EventListener);
}
