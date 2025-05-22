export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  orderDate: string;
  totalAmount: number;
  items: OrderItem[];
  status: string;
  orderType: 'Personal' | 'Business';
  rating?: number;
  tags?: string[];
  isDashPass?: boolean;
}

export const orderData: Order[] = [
  {
    id: 'order-1',
    restaurantId: 'Starbucks',
    restaurantName: 'Starbucks',
    orderDate: 'Wed, Apr 23',
    totalAmount: 71.38,
    items: [
      { id: '1', name: 'The Plate', quantity: 2, price: 15.99 },
      { id: '2', name: 'The Bowl', quantity: 2, price: 14.99 },
      { id: '3', name: 'Sides & Salads', quantity: 1, price: 9.42 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  },
  {
    id: 'order-2',
    restaurantId: 'Best Buy',
    restaurantName: 'Best Buy',
    orderDate: 'Thu, Mar 20',
    totalAmount: 39.31,
    items: [
      { id: '1', name: 'Spritz 54" x 108" Solid Table Cover Black', quantity: 1, price: 39.31 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    tags: ['Refund Issued', 'Rerouted from another store']
  },
  {
    id: 'order-3',
    restaurantId: 'mcdonalds',
    restaurantName: "McDonald's",
    orderDate: 'Mon, Mar 18',
    totalAmount: 25.47,
    items: [
      { id: '1', name: 'Big Mac Meal', quantity: 2, price: 12.99 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  },
  {
    id: 'order-4',
    restaurantId: 'chipotle',
    restaurantName: 'Chipotle',
    orderDate: 'Sun, Mar 17',
    totalAmount: 45.92,
    items: [
      { id: '1', name: 'Burrito Bowl', quantity: 3, price: 15.29 }
    ],
    status: 'Delivered',
    orderType: 'Business',
    isDashPass: true
  },
  {
    id: 'order-5',
    restaurantId: 'subway',
    restaurantName: 'Subway',
    orderDate: 'Sat, Mar 16',
    totalAmount: 32.45,
    items: [
      { id: '1', name: 'Footlong Sub', quantity: 2, price: 16.22 }
    ],
    status: 'Delivered',
    orderType: 'Personal'
  },
  {
    id: 'order-6',
    restaurantId: 'pizza-hut',
    restaurantName: 'Pizza Hut',
    orderDate: 'Fri, Mar 15',
    totalAmount: 52.99,
    items: [
      { id: '1', name: 'Large Pizza', quantity: 2, price: 26.49 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  },
  {
    id: 'order-7',
    restaurantId: 'walgreens',
    restaurantName: 'Walgreens',
    orderDate: 'Thu, Mar 14',
    totalAmount: 28.76,
    items: [
      { id: '1', name: 'Health & Beauty Items', quantity: 4, price: 7.19 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    tags: ['Items Substituted']
  },
  {
    id: 'order-8',
    restaurantId: 'panera',
    restaurantName: 'Panera',
    orderDate: 'Wed, Mar 13',
    totalAmount: 42.85,
    items: [
      { id: '1', name: 'You Pick Two', quantity: 3, price: 14.28 }
    ],
    status: 'Delivered',
    orderType: 'Business',
    isDashPass: true
  },
  {
    id: 'order-9',
    restaurantId: 'cvs',
    restaurantName: 'CVS',
    orderDate: 'Tue, Mar 12',
    totalAmount: 35.24,
    items: [
      { id: '1', name: 'Household Essentials', quantity: 5, price: 7.04 }
    ],
    status: 'Delivered',
    orderType: 'Personal'
  },
  {
    id: 'order-10',
    restaurantId: 'dennys',
    restaurantName: "Denny's",
    orderDate: 'Mon, Mar 11',
    totalAmount: 48.92,
    items: [
      { id: '1', name: 'Grand Slam', quantity: 3, price: 16.30 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  }
]; 