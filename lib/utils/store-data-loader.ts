/**
 * Utility functions for loading store-specific data from real APIs
 */

import type {
  StoreMerchantData,
  Modifier as MerchantModifier,
} from '@/constants/merchant-store-data';
import { useMerchantStoresStore, MerchantStore } from '@/store/merchant-stores-store';

type MerchantMenuItemStatus =
  | 'In stock'
  | 'Out of stock - 4 hours'
  | 'Out of stock - Today'
  | 'Out of stock - 1 week'
  | 'Out of stock - Custom'
  | 'Out of stock - Indefinitely';

type ApiMenuItem = {
  id: string;
  name: string;
  image?: string;
  price?: string;
  isAvailable?: boolean;
  category?: string;
};

type ApiCategory = {
  id: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
};

type ApiModifierOption = {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
  isCounter?: boolean;
  maxQuantity?: number | null;
  isDefault?: boolean;
  sortOrder?: number | null;
  image?: string | null;
};

type ApiModifier = {
  id: string;
  menuItemId: string;
  menuItemName: string;
  description?: string | null;
  isRequired?: boolean;
  selectUpTo?: number | null;
  selectAtLeast?: number | null;
  parentOptionId?: string | null;
  options: ApiModifierOption[];
};

const formatCurrency = (value: number | undefined | null) => {
  const normalized = typeof value === 'number' ? value : 0;
  return `$${normalized.toFixed(2)}`;
};

const buildOrdersSection = (storeId: string, orders: any[], storeName?: string) => {
  const mappedOrders = (orders || []).map((order: any) => {
    const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();

    const isPickup = order.deliveryOption?.type === 'pickup';
    const fulfillmentType: 'Customer pickup' | 'DashDoor delivery' = isPickup
      ? 'Customer pickup'
      : 'DashDoor delivery';
    const channel = isPickup ? 'Pickup' : 'DashDoor';

    const id = order.id ? String(order.id) : `order-${Date.now()}`;

    // Build delivery address if available
    const deliveryAddress = order.deliveryAddress
      ? {
          street: order.deliveryAddress.street,
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.state,
          zipCode: order.deliveryAddress.zipCode,
          businessName: order.deliveryAddress.businessName,
        }
      : undefined;

    // Build order items if available
    const items = order.items?.map((item: any) => ({
      id: String(item.id),
      name: item.name || 'Item',
      quantity: item.quantity || 1,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      image: item.image,
    }));

    return {
      id,
      // Customer info
      customer: order.userName || (order.userId ? `Customer ${order.userId}` : 'Customer'),
      userId: order.userId ? String(order.userId) : undefined,
      userName: order.userName,
      userEmail: order.userEmail,
      // Order status
      status: order.status ? String(order.status) : 'pending',
      // Date/time
      date: orderDate.toLocaleDateString('en-US'),
      time: orderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      orderDate: orderDate.toISOString(),
      // Fulfillment
      fulfillmentType,
      channel,
      deliveryAddress,
      // Store info
      storeId,
      storeName: order.storeName || storeName,
      storeCategory: order.storeCategory,
      // Order items
      items,
      // Pricing
      subtotal: formatCurrency(typeof order.subtotal === 'number' ? order.subtotal : 0),
      serviceFee: typeof order.serviceFee === 'number' ? order.serviceFee : undefined,
      deliveryFee: typeof order.deliveryFee === 'number' ? order.deliveryFee : undefined,
      tipAmount: typeof order.tipAmount === 'number' ? order.tipAmount : undefined,
      total: typeof order.total === 'number' ? order.total : undefined,
    };
  });

  return {
    orders: mappedOrders,
    searchQuery: '',
    selectedFilter: 'All channels',
    activeTab: 'Active' as const,
  };
};

const buildMenuSection = (menuItems: ApiMenuItem[], categories: ApiCategory[]) => {
  const categoryMap = new Map<string, { id: string; name: string; items: any[] }>();

  categories.forEach(cat => {
    const id = String(cat.id || cat.name);
    categoryMap.set(id, { id, name: cat.name, items: [] });
  });

  menuItems.forEach(item => {
    const categoryName = item.category || 'Uncategorized';
    const categoryEntry =
      [...categoryMap.values()].find(cat => cat.name === categoryName) ||
      categoryMap.get(categoryName) ||
      (() => {
        const fallback = { id: categoryName, name: categoryName, items: [] as any[] };
        categoryMap.set(categoryName, fallback);
        return fallback;
      })();

    const priceString = item.price
      ? item.price.startsWith('$')
        ? item.price
        : `$${item.price}`
      : '$0.00';

    categoryEntry.items.push({
      id: String(item.id),
      name: item.name,
      image: item.image || '/placeholder.jpg',
      pickupPrice: priceString,
      deliveryPrice: priceString,
      status: item.isAvailable
        ? ('In stock' as MerchantMenuItemStatus)
        : ('Out of stock - Indefinitely' as MerchantMenuItemStatus),
    });
  });

  return {
    categories: Array.from(categoryMap.values()),
    expandedCategories: [] as string[],
    showBanner: true,
  };
};

const buildModifiersSection = (modifiers: ApiModifier[]) => {
  const modifierMap = new Map<string, MerchantModifier>();

  modifiers.forEach(modifier => {
    const existing = modifierMap.get(modifier.id);
    const usedInEntry = { id: modifier.menuItemId, name: modifier.menuItemName };

    const options = modifier.options?.map(opt => opt.name || `Option ${opt.id}`) || [];

    if (existing) {
      modifierMap.set(modifier.id, {
        ...existing,
        usedIn: [...existing.usedIn, usedInEntry],
      });
      return;
    }

    modifierMap.set(modifier.id, {
      id: modifier.id,
      name: modifier.description || `Modifier ${modifier.id}`,
      options,
      usedIn: [usedInEntry],
      status: 'In stock',
      timing: 'All Day',
      required: modifier.isRequired ?? false,
      allowMultipleOptions: (modifier.selectUpTo || 0) > 1,
      allowMultipleSameOption: false,
      allowFreeOptions: false,
    });
  });

  return { modifiers: Array.from(modifierMap.values()) };
};

const seedLocalStorage = (storeId: string, storeData: StoreMerchantData) => {
  if (typeof window === 'undefined') return;

  const sections: Array<[string, any]> = [
    ['home', storeData.home],
    ['orders', storeData.orders],
    ['menu', storeData.menu],
    ['modifiers', storeData.modifiers],
    ['users', storeData.users],
    ['settings', storeData.settings],
    ['store-availability', storeData.storeAvailability],
  ];

  sections.forEach(([key, data]) => {
    const storageKey = `merchant.${storeId}.${key}`;
    const existing = localStorage.getItem(storageKey);
    if (!existing) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  });
};

const fetchJson = async <T>(url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return (await res.json()) as T;
};

/**
 * Build store data from a MerchantStore (locally created store)
 */
const buildStoreDataFromMerchantStore = (store: MerchantStore): StoreMerchantData => {
  // Parse address
  const addressParts = store.storeAddress.split(',').map(part => part.trim());
  const street = addressParts[0] || '';
  const city = addressParts[1] || '';
  const stateZipParts = (addressParts[2] || '').split(' ').filter(Boolean);
  const state = stateZipParts[0] || '';

  return {
    storeId: store.id,
    storeName: store.storeName,
    modifiers: { modifiers: [] },
    home: {
      metrics: {
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
      },
      lastUpdated: Date.now(),
      selectedDateRange: 'Last 7 days',
    },
    orders: {
      orders: [],
      searchQuery: '',
      selectedFilter: 'All channels',
      activeTab: 'Active' as const,
    },
    menu: {
      categories: [],
      expandedCategories: [],
      showBanner: true,
    },
    users: { users: [] },
    settings: {
      store: {
        storeName: store.storeName,
        address: `${street} ${city} ${state}`.trim(),
        phoneNumber: store.phone,
        website: '',
        description: '',
      },
      account: {
        autoGeneratedDescriptions: false,
        alcoholSales: false,
        useCustomerPhotos: false,
        tabletAccess: true,
        tabletPin: '',
        chatFeature: false,
        staffTips: false,
      },
    },
    storeAvailability: {
      storeStatus: 'Active',
      pauseUntil: undefined,
      menuHours: [],
      selectedMenu: 'Default Menu',
    },
  };
};

export async function initializeStoreData(storeId: string): Promise<StoreMerchantData | null> {
  if (!storeId) return null;

  // First check if store exists in merchant-stores-store (locally created stores)
  const merchantStoresState = useMerchantStoresStore.getState();
  const merchantStore = merchantStoresState.getStoreById(storeId);

  if (merchantStore) {
    // Store exists in merchant-stores-store, use local data
    const storeData = buildStoreDataFromMerchantStore(merchantStore);
    seedLocalStorage(storeId, storeData);
    return storeData;
  }

  // Store not found locally, fetch from API
  try {
    const [restaurantResp, menuResp, ordersResp, modifiersResp] = await Promise.all([
      fetchJson<{ success: boolean; data: any }>(`/api/merchant/restaurants/${storeId}`),
      fetchJson<{
        success: boolean;
        data: { menuItems: ApiMenuItem[]; categories: ApiCategory[] };
      }>(`/api/merchant/restaurants/${storeId}/menu?includeUnavailable=true`),
      fetchJson<{ success: boolean; data: any[] }>(`/api/merchant/orders?storeId=${storeId}`),
      fetchJson<{ success: boolean; data: { modifiers: ApiModifier[] } }>(
        `/api/merchant/restaurants/${storeId}/modifiers`
      ),
    ]);

    if (!restaurantResp?.success) throw new Error('Restaurant fetch failed');

    const restaurant = restaurantResp.data;
    const menuItems = menuResp?.data?.menuItems || [];
    const categories = menuResp?.data?.categories || [];
    const orders = ordersResp?.data || [];
    const modifiers = modifiersResp?.data?.modifiers || [];

    const menuSection = buildMenuSection(menuItems, categories);
    const modifiersSection = buildModifiersSection(modifiers);
    const ordersSection = buildOrdersSection(storeId, orders, restaurant?.name);

    const storeData: StoreMerchantData = {
      storeId: String(storeId),
      storeName: restaurant?.name || `Store ${storeId}`,
      modifiers: modifiersSection,
      home: {
        metrics: {
          totalSales: 0,
          totalOrders: orders.length,
          totalCustomers: orders.length,
          averageOrderValue: 0,
        },
        lastUpdated: Date.now(),
        selectedDateRange: 'Last 7 days',
      },
      orders: ordersSection,
      menu: menuSection,
      users: { users: [] },
      settings: {
        store: {
          storeName: restaurant?.name || `Store ${storeId}`,
          address: `${restaurant?.street || ''} ${restaurant?.city || ''} ${
            restaurant?.state || ''
          }`.trim(),
          phoneNumber: restaurant?.phone || '',
          website: '',
          description: restaurant?.description || '',
        },
        account: {
          autoGeneratedDescriptions: false,
          alcoholSales: false,
          useCustomerPhotos: false,
          tabletAccess: true,
          tabletPin: '',
          chatFeature: false,
          staffTips: false,
        },
      },
      storeAvailability: {
        storeStatus: 'Active',
        pauseUntil: undefined,
        menuHours: [],
        selectedMenu: restaurant?.section || 'Default Menu',
      },
    };

    seedLocalStorage(storeId, storeData);
    return storeData;
  } catch (error) {
    console.error('Failed to initialize store data from API', error);
    return null;
  }
}

/**
 * Dispatch storeDataLoaded so individual stores rehydrate
 */
export function loadStoreDataIntoStores(storeId: string, storeData: StoreMerchantData | null) {
  if (!storeId || !storeData) return;
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('storeDataLoaded', {
      detail: { storeId, storeData },
    })
  );
}
