import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  detectCategoryFromRestaurantId,
  convertOrderItemsToCartItems,
  prepareOrderForReorder,
} from '@/lib/reorder-utils';
import type { Restaurant } from '@/constants/restaurants';
import type { Order, OrderItem } from '@/constants/order-data';

// Suppress console logs during tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Pizza Palace',
    logo: '/logo.jpg',
    banner: '/banner.jpg',
    rating: 4.5,
    reviews: '120',
    distance: '1.2 mi',
    time: '25-35 min',
    deliveryFee: '$2.99',
    isFreeDelivery: false,
    minDeliveryFee: 299,
    priceRange: '$$',
    cuisine: 'Italian',
    dashPass: true,
    isOpen: true,
    openingHours: '10:00 AM - 10:00 PM',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    lat: 37.7749,
    lng: -122.4194,
    phone: '555-1234',
  },
  {
    id: 'rest-2',
    name: 'Burger Joint',
    logo: '/burger-logo.jpg',
    banner: '/burger-banner.jpg',
    rating: 4.2,
    reviews: '85',
    distance: '0.8 mi',
    time: '15-25 min',
    deliveryFee: '$1.99',
    isFreeDelivery: false,
    minDeliveryFee: 199,
    priceRange: '$',
    cuisine: 'American',
    dashPass: false,
    isOpen: true,
    openingHours: '11:00 AM - 11:00 PM',
    street: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    lat: 37.775,
    lng: -122.42,
    phone: '555-5678',
  },
];

describe('detectCategoryFromRestaurantId', () => {
  it('should return restaurant category for valid restaurant id', () => {
    const result = detectCategoryFromRestaurantId('rest-1', mockRestaurants);
    expect(result).toBe('restaurant');
  });

  it('should return restaurant category for another valid restaurant id', () => {
    const result = detectCategoryFromRestaurantId('rest-2', mockRestaurants);
    expect(result).toBe('restaurant');
  });

  it('should default to restaurant for unknown id', () => {
    const result = detectCategoryFromRestaurantId('unknown-id', mockRestaurants);
    expect(result).toBe('restaurant');
  });

  it('should default to restaurant for empty restaurants array', () => {
    const result = detectCategoryFromRestaurantId('rest-1', []);
    expect(result).toBe('restaurant');
  });
});

describe('convertOrderItemsToCartItems', () => {
  const orderItems: OrderItem[] = [
    {
      id: 'item-1',
      name: 'Margherita Pizza',
      price: 15.99,
      quantity: 2,
    },
    {
      id: 'item-2',
      name: 'Garlic Bread',
      price: 5.99,
      quantity: 1,
    },
  ];

  it('should convert order items to cart items', () => {
    const result = convertOrderItemsToCartItems(orderItems, 'rest-1', 'Pizza Palace', 'restaurant');

    expect(result).toHaveLength(2);
    expect(result[0].itemName).toBe('Margherita Pizza');
    expect(result[0].price).toBe(15.99);
    expect(result[0].quantity).toBe(2);
    expect(result[1].itemName).toBe('Garlic Bread');
  });

  it('should generate unique cart item ids', () => {
    const result = convertOrderItemsToCartItems(orderItems, 'rest-1', 'Pizza Palace', 'restaurant');

    expect(result[0].id).toContain('rest-1');
    expect(result[0].id).toContain('margherita-pizza');
    expect(result[1].id).toContain('garlic-bread');
  });

  it('should use placeholder image when no menu items provided', () => {
    const result = convertOrderItemsToCartItems(orderItems, 'rest-1', 'Pizza Palace', 'restaurant');

    expect(result[0].image).toBe('/placeholder.jpg');
  });

  it('should find image from menu items when provided', () => {
    const menuItems = [
      { name: 'Margherita Pizza', image: '/margherita.jpg' },
      { name: 'Garlic Bread', image: '/garlic-bread.jpg' },
    ];

    const result = convertOrderItemsToCartItems(
      orderItems,
      'rest-1',
      'Pizza Palace',
      'restaurant',
      menuItems
    );

    expect(result[0].image).toBe('/margherita.jpg');
    expect(result[1].image).toBe('/garlic-bread.jpg');
  });

  it('should convert order modifications to applied modifications', () => {
    const itemsWithMods: OrderItem[] = [
      {
        id: 'item-3',
        name: 'Pizza',
        price: 15.99,
        quantity: 1,
        modifications: [
          {
            modificationId: 'mod-1',
            modificationDescription: 'Size',
            isRequired: false,
            options: [
              { optionId: 'opt-1', optionName: 'Large', price: 3.0, quantity: 1, isCounter: false },
            ],
          },
        ],
      },
    ];

    const result = convertOrderItemsToCartItems(
      itemsWithMods,
      'rest-1',
      'Pizza Palace',
      'restaurant'
    );

    expect(result[0].appliedModifications).toBeDefined();
    expect(result[0].appliedModifications![0].appliedOptions[0].optionName).toBe('Large');
  });

  it('should handle empty order items', () => {
    const result = convertOrderItemsToCartItems([], 'rest-1', 'Pizza Palace', 'restaurant');
    expect(result).toHaveLength(0);
  });
});

describe('prepareOrderForReorder', () => {
  const mockOrder: Order = {
    id: 'order-1',
    restaurantId: 'rest-1',
    restaurantName: 'Pizza Palace',
    items: [
      { id: 'item-1', name: 'Margherita Pizza', price: 15.99, quantity: 1 },
      { id: 'item-2', name: 'Garlic Bread', price: 5.99, quantity: 2 },
    ],
    subtotal: 27.97,
    total: 33.2,
    status: 'delivered',
    orderDate: 'Wed, Jan 15',
  };

  it('should prepare order for reorder', () => {
    const result = prepareOrderForReorder(mockOrder, mockRestaurants);

    expect(result.orderId).toBe('order-1');
    expect(result.storeId).toBe('rest-1');
    expect(result.storeName).toBe('Pizza Palace');
    expect(result.category).toBe('restaurant');
    expect(result.items).toHaveLength(2);
  });

  it('should use storeId when restaurantId is not present', () => {
    const orderWithStoreId = {
      ...mockOrder,
      restaurantId: undefined,
      storeId: 'rest-2',
      restaurantName: undefined,
      storeName: 'Burger Joint',
    };

    const result = prepareOrderForReorder(orderWithStoreId as Order, mockRestaurants);

    expect(result.storeId).toBe('rest-2');
    expect(result.storeName).toBe('Burger Joint');
  });

  it('should throw error when no store id found', () => {
    const orderNoId = {
      ...mockOrder,
      restaurantId: undefined,
      storeId: undefined,
    };

    expect(() => prepareOrderForReorder(orderNoId as Order, mockRestaurants)).toThrow(
      'Cannot reorder: missing store/restaurant ID'
    );
  });

  it('should throw error when no items in order', () => {
    const orderNoItems = {
      ...mockOrder,
      items: [],
    };

    expect(() => prepareOrderForReorder(orderNoItems, mockRestaurants)).toThrow(
      'Cannot reorder: no items in order'
    );
  });

  it('should throw error when items is undefined', () => {
    const orderUndefinedItems = {
      ...mockOrder,
      items: undefined,
    };

    expect(() => prepareOrderForReorder(orderUndefinedItems as Order, mockRestaurants)).toThrow(
      'Cannot reorder: no items in order'
    );
  });

  it('should use menu items for image lookup when provided', () => {
    const menuItems = [{ name: 'Margherita Pizza', image: '/margherita.jpg' }];

    const result = prepareOrderForReorder(mockOrder, mockRestaurants, menuItems);

    expect(result.items[0].image).toBe('/margherita.jpg');
  });

  it('should default storeName to Store when not provided', () => {
    const orderNoName = {
      ...mockOrder,
      restaurantName: undefined,
      storeName: undefined,
    };

    const result = prepareOrderForReorder(orderNoName as Order, mockRestaurants);

    expect(result.storeName).toBe('Store');
  });
});
