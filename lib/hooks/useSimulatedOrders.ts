'use client';

import { useEffect, useRef } from 'react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';
import { fetchRestaurantMenu } from '@/lib/api/menu';
import { fetchSampleUsers, UserWithAddress } from '@/lib/api/users';

// Hook to simulate new order arrivals at regular intervals (default is 1 minute)
export function useSimulatedOrders(intervalMs: number = 60000) {
  const { currentStoreId, currentStoreData } = useCurrentStore();
  const addOrder = useMerchantOrdersStore(state => state.addOrder);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usersRef = useRef<UserWithAddress[]>([]);
  const itemsRef = useRef<Array<{ id: string; name: string; price: number; image?: string }>>([]);

  useEffect(() => {
    if (!currentStoreId) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Load users from API
    const loadUsers = async () => {
      try {
        const users = await fetchSampleUsers();
        usersRef.current = users;
      } catch (e) {
        usersRef.current = [];
      }
    };

    // Load menu items from API
    const loadMenuItems = async () => {
      try {
        const menu = await fetchRestaurantMenu(currentStoreId);
        itemsRef.current =
          menu?.menuItems.map(item => ({
            id: String(item.id),
            name: item.name ?? 'Menu Item',
            price: Number(item.price) || 10,
            image: item.image || undefined,
          })) || [];
      } catch {
        itemsRef.current = [];
      }
    };

    loadUsers();
    loadMenuItems();

    timerRef.current = setInterval(() => {
      // Skip if no users available
      if (usersRef.current.length === 0) return;

      const menuItems =
        itemsRef.current.length > 0
          ? itemsRef.current
          : [{ id: 'item-1', name: 'Menu Item', price: 9.99, image: undefined }];

      // Pick random user
      const user = usersRef.current[Math.floor(Math.random() * usersRef.current.length)];

      // Pick 1-3 random items for the order
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let subtotal = 0;

      for (let i = 0; i < numItems; i++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        subtotal += item.price * qty;
        orderItems.push({
          id: item.id,
          name: item.name,
          quantity: qty,
          price: item.price,
          image: item.image,
        });
      }

      const now = new Date();
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
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStoreId, currentStoreData, addOrder, intervalMs]);
}

