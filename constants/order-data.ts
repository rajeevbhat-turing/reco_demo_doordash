import { PaymentMethod, Address } from "@/lib/types/user-types"
import { OrderModification } from "@/types"

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifications?: OrderModification[];
}

// Reuse PaymentMethod from user-types with all fields optional for orders
export type PaymentCard = Partial<PaymentMethod>

export interface DeliveryOption {
  type: string;
  deliveryTime: string;
  extraFee: number;
  scheduledDate?: Date | null;
  scheduledTimeSlot?: string;
}

export interface PhoneNumber {
  countryCode: string;
  number: string;
}

// Reuse Address from user-types as DeliveryAddress
export type DeliveryAddress = Address

export interface Order {
  id: string;
  // Store/Restaurant info (support both old and new field names)
  storeId?: string;
  storeName?: string;
  restaurantId?: string;  // Old field name
  restaurantName?: string; // Old field name
  storeCategory?: string;
  
  // Order items
  items?: OrderItem[];
  
  // Payment info
  paymentCard?: PaymentCard;
  
  // Delivery info
  deliveryAddress?: DeliveryAddress;
  deliveryOption?: DeliveryOption;
  phoneNumber?: PhoneNumber;
  
  // Pricing (support both old and new field names)
  tipAmount?: number;
  subtotal?: number;
  serviceFee?: number;
  deliveryFee?: number;
  total?: number;
  totalAmount?: number; // Old field name
  
  // Order metadata
  orderDate: string;
  status: string;
  orderType?: 'Personal' | 'Business';
  
  // Optional features
  rating?: number;
  reviewDate?: string;
  reviewText?: string;
  tags?: string[];
  isDashPass?: boolean;
  isGroupOrder?: boolean;
}

// Commented out dummy data - now using real orders from the store
/* export const orderData: Order[] = [
  {
    id: 'order-1',
    restaurantId: 'starbucks-(299-fremont-street)',
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
  },
  {
    id: 'order-11',
    restaurantId: 'safeway',
    restaurantName: 'Safeway',
    orderDate: 'Sun, Mar 10',
    totalAmount: 28.94,
    items: [
      { id: '1', name: 'Gatorade Thirst Quencher Cool Blue', quantity: 2, price: 3.29 },
      { id: '2', name: 'Bodyarmor Fruit Punch', quantity: 3, price: 2.39 },
      { id: '3', name: 'Simply Pulp Free Orange Juice', quantity: 3, price: 5.49 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true,
    tags: ['Group Order']
  },
  {
    id: 'order-12',
    restaurantId: 'whole-foods',
    restaurantName: 'Whole Foods Market',
    orderDate: 'Sat, Mar 9',
    totalAmount: 45.76,
    items: [
      { id: '1', name: 'Vital Farms Organic Pasture Raised Eggs', quantity: 2, price: 13.19 },
      { id: '2', name: 'Horizon Organic High Vitamin D Milk', quantity: 2, price: 7.39 },
      { id: '3', name: 'Organic Avocado', quantity: 2, price: 2.99 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  },
  {
    id: 'order-13',
    restaurantId: 'trader-joes',
    restaurantName: "Trader Joe's",
    orderDate: 'Fri, Mar 8',
    totalAmount: 32.85,
    items: [
      { id: '1', name: 'Strawberries', quantity: 3, price: 4.49 },
      { id: '2', name: 'Baby Carrots', quantity: 2, price: 3.39 },
      { id: '3', name: 'Red Bell Pepper', quantity: 4, price: 1.69 },
      { id: '4', name: 'Broccoli Crown', quantity: 3, price: 1.99 }
    ],
    status: 'Delivered',
    orderType: 'Business',
    isDashPass: true,
    tags: ['Items Substituted']
  },
  {
    id: 'order-14',
    restaurantId: 'smart-final',
    restaurantName: 'Smart & Final',
    orderDate: 'Thu, Mar 7',
    totalAmount: 52.93,
    items: [
      { id: '1', name: "Lay's Baked Original Potato Crisps", quantity: 3, price: 5.99 },
      { id: '2', name: 'RXBAR Chocolate Sea Salt Protein Bar', quantity: 5, price: 3.49 },
      { id: '3', name: 'Gatorade Lemon Lime Bottles', quantity: 2, price: 10.79 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  },
  {
    id: 'order-15',
    restaurantId: 'sprouts',
    restaurantName: 'Sprouts Farmers Market',
    orderDate: 'Wed, Mar 6',
    totalAmount: 29.87,
    items: [
      { id: '1', name: 'Sargento String Cheese Mozzarella', quantity: 2, price: 7.19 },
      { id: '2', name: 'Kiwi', quantity: 5, price: 0.89 },
      { id: '3', name: 'Cucumber', quantity: 3, price: 0.99 },
      { id: '4', name: 'Ginger', quantity: 2, price: 1.49 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    tags: ['Rerouted from another store']
  },
  {
    id: 'order-16',
    restaurantId: 'philz-coffee',
    restaurantName: "Philz Coffee",
    orderDate: 'Tue, Mar 5',
    totalAmount: 32.45,
    items: [
      { id: '1', name: 'Mint Mojito Iced Coffee', quantity: 2, price: 6.95 },
      { id: '2', name: 'Avocado Toast', quantity: 1, price: 8.95 },
      { id: '3', name: 'Butter Croissant', quantity: 2, price: 4.80 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true,
    isGroupOrder: true
  },
  {
    id: 'order-17',
    restaurantId: 'peet\'s-coffee',
    restaurantName: "Peet's Coffee",
    orderDate: 'Mon, Mar 4',
    totalAmount: 45.75,
    items: [
      { id: '1', name: 'Dark Roast Coffee', quantity: 3, price: 4.95 },
      { id: '2', name: 'Breakfast Sandwich', quantity: 2, price: 7.95 },
      { id: '3', name: 'Chocolate Croissant', quantity: 3, price: 4.50 }
    ],
    status: 'Delivered',
    orderType: 'Business',
    isDashPass: true
  },
  {
    id: 'order-18',
    restaurantId: 'il-canto-cafe',
    restaurantName: "IL Canto Cafe",
    orderDate: 'Sun, Mar 3',
    totalAmount: 58.90,
    items: [
      { id: '1', name: 'Margherita Pizza', quantity: 1, price: 18.95 },
      { id: '2', name: 'Pasta Carbonara', quantity: 2, price: 16.95 },
      { id: '3', name: 'Tiramisu', quantity: 1, price: 6.95 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true,
    tags: ['Group Order']
  },
  {
    id: 'order-19',
    restaurantId: 'petco',
    restaurantName: "Petco",
    orderDate: 'Sat, Mar 2',
    totalAmount: 89.97,
    items: [
      { id: '1', name: 'Premium Dog Food (30lb)', quantity: 1, price: 54.99 },
      { id: '2', name: 'Dog Toys Bundle', quantity: 2, price: 12.99 },
      { id: '3', name: 'Pet Shampoo', quantity: 1, price: 8.99 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true
  },
  {
    id: 'order-20',
    restaurantId: 'petsmart',
    restaurantName: "PetSmart",
    orderDate: 'Fri, Mar 1',
    totalAmount: 125.45,
    items: [
      { id: '1', name: 'Cat Tree Tower', quantity: 1, price: 89.99 },
      { id: '2', name: 'Cat Food (24 cans)', quantity: 1, price: 25.99 },
      { id: '3', name: 'Cat Litter', quantity: 1, price: 9.47 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    tags: ['Large Item Delivery']
  },
  {
    id: 'order-21',
    restaurantId: 'pet-food-express',
    restaurantName: "Pet Food Express",
    orderDate: 'Thu, Feb 29',
    totalAmount: 59.97,
    items: [
      { id: '1', name: 'Icelandic+ Treats Dog Fish Treat Long Strips Cod Skin (20 ct)', quantity: 3, price: 19.99 }
    ],
    status: 'Delivered',
    orderType: 'Personal',
    isDashPass: true,
    tags: ['Fragile Items']
  },
]; */ 