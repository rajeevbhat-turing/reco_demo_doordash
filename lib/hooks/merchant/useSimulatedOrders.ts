'use client';

import { useEffect, useRef } from 'react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';
import { useMerchantMenuStore } from '@/store/merchant-menu-store';
import { getCurrentTime } from '@/store/bootstrap-store';

// Sample users for order simulation (from dashdoor.db)
interface SampleUserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  businessName?: string;
}

interface SampleUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  addresses: SampleUserAddress[];
}

const sampleUsers: SampleUser[] = [
  {
    id: 'user-1',
    name: 'Kai Hayes',
    email: 'kai.hayes1@example.com',
    phoneNumber: '9337119195',
    addresses: [
      { street: '700 N Brookhurst St', city: 'Anaheim', state: 'CA', zipCode: '92801' },
      {
        street: '2023 East Cesar E Chavez Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90033',
        businessName: "Shakey's Pizza Parlor",
      },
    ],
  },
  {
    id: 'user-2',
    name: 'Nora Chambers',
    email: 'nora.chambers2@mail.test',
    phoneNumber: '2657562797',
    addresses: [
      {
        street: '276 5th Ave',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11215',
        businessName: 'Naruto Ramen',
      },
    ],
  },
  {
    id: 'user-3',
    name: 'Hannah Young',
    email: 'hannah.young3@example.com',
    phoneNumber: '7237679355',
    addresses: [
      { street: '16 Oak Grove Ave', city: 'Malden', state: 'MA', zipCode: '02148' },
      { street: '8214 S Van Ness Ave', city: 'Los Angeles', state: 'CA', zipCode: '90047' },
    ],
  },
  {
    id: 'user-4',
    name: 'Elias Fischer',
    email: 'elias.fischer4@example.com',
    phoneNumber: '3092304920',
    addresses: [
      {
        street: '1411 Nostrand Ave.',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11226',
        businessName: 'Immaculee Bakery',
      },
    ],
  },
];

// Hook to simulate new order arrivals at regular intervals (default is 1 minute)
export function useSimulatedOrders(intervalMs: number = 60000) {
  const { currentStoreId, currentStoreData } = useCurrentStore();
  const addOrder = useMerchantOrdersStore(state => state.addOrder);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsRef = useRef<Array<{ id: string; name: string; price: number; image?: string }>>([]);
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    if (!currentStoreId) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Load menu items from merchant-menu-store
    const loadMenuItems = () => {
      const menuState = useMerchantMenuStore.getState();
      const allItems: Array<{ id: string; name: string; price: number; image?: string }> = [];

      menuState.categories.forEach(category => {
        category.items.forEach(item => {
          // Only include items that are in stock
          if (item.status === 'In stock') {
            // Parse price from string (e.g., "$9.99" -> 9.99)
            const priceStr = item.pickupPrice || item.deliveryPrice || '$0';
            const price = parseFloat(priceStr.replace('$', '')) || 0;

            allItems.push({
              id: item.id,
              name: item.name,
              price,
              image: item.image || undefined,
            });
          }
        });
      });

      itemsRef.current = allItems;
    };

    loadMenuItems();

    timerRef.current = setInterval(() => {
      // Prevent concurrent executions
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;

      try {
        // If no menu items, try to load them again from merchant-menu-store
        if (itemsRef.current.length === 0) {
          loadMenuItems();
          // Still no items, skip this cycle
          if (itemsRef.current.length === 0) return;
        }

        const menuItems = itemsRef.current;

        // Pick random user from sample users
        const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];

        // Pick 1-3 random items for the order
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItemsMap = new Map<
          string,
          { id: string; name: string; quantity: number; price: number; image?: string }
        >();
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          const item = menuItems[Math.floor(Math.random() * menuItems.length)];
          const qty = Math.floor(Math.random() * 2) + 1;
          subtotal += item.price * qty;

          // Check if item already exists in order
          const existing = orderItemsMap.get(item.id);
          if (existing) {
            existing.quantity += qty;
          } else {
            orderItemsMap.set(item.id, {
              id: item.id,
              name: item.name,
              quantity: qty,
              price: item.price,
              image: item.image,
            });
          }
        }

        const orderItems = Array.from(orderItemsMap.values());

        const now = getCurrentTime(); // Supports simulated time
        const orderId = `DD-${Math.floor(Math.random() * 900000 + 100000)}`;

        // Randomly assign delivery or pickup (80% delivery, 20% pickup)
        const isPickup = Math.random() < 0.2;
        const fulfillmentType = isPickup ? 'Customer pickup' : 'DashDoor delivery';
        const channel = 'DashDoor';

        // Calculate fees
        const serviceFee = Math.round(subtotal * 0.15 * 100) / 100; // 15% service fee
        const deliveryFee = isPickup ? 0 : 3.99;
        const tipAmount = Math.round((Math.random() * 5 + 2) * 100) / 100; // Random tip $2-7
        const total = subtotal + serviceFee + deliveryFee + tipAmount;

        // Get store info
        const storeName = currentStoreData?.storeName || 'Restaurant';
        const storeCategory = 'Food'; // Default category

        // Get delivery address from user's addresses (if delivery and user has addresses)
        let deliveryAddress = undefined;
        if (!isPickup && user.addresses && user.addresses.length > 0) {
          const addr = user.addresses[Math.floor(Math.random() * user.addresses.length)];
          deliveryAddress = {
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            businessName: addr.businessName,
          };
        }

        addOrder({
          id: orderId,
          // Customer info
          customer: user.name,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          // Order status
          status: 'pending',
          // Date/time
          date: now.toLocaleDateString('en-US'),
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          orderDate: now.toISOString(),
          // Fulfillment
          fulfillmentType,
          channel,
          deliveryAddress,
          // Store info
          storeId: currentStoreId,
          storeName,
          storeCategory,
          // Order items
          items: orderItems,
          // Pricing
          subtotal: `$${subtotal.toFixed(2)}`,
          serviceFee,
          deliveryFee,
          tipAmount,
          total,
        });
      } finally {
        isGeneratingRef.current = false;
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStoreId, currentStoreData, addOrder, intervalMs]);
}
