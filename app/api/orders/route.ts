import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order, OrderItem } from '@/constants/order-data';
import { OrderModification, OrderModificationOption } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const storeId = searchParams.get('storeId');

  if (!userId && !storeId) {
    return NextResponse.json(
      { success: false, message: 'User ID or Store ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch orders - by userId or storeId (for merchant portal)
    const whereClause = storeId ? 'o.store_id = ?' : 'o.user_id = ?';
    const queryParam = storeId || userId;
    
    const ordersRaw = await db.query<any>(
      `SELECT 
        o.id,
        o.user_id,
        o.store_id,
        o.store_category,
        o.payment_method_id,
        o.address_id,
        o.delivery_type,
        o.delivery_time_str,
        o.extra_fee,
        o.scheduled_date,
        o.scheduled_time_slot,
        o.phone_country_code,
        o.phone_number,
        o.tip_amount,
        o.subtotal,
        o.service_fee,
        o.delivery_fee,
        o.total,
        o.order_date,
        o.status
      FROM orders o
      WHERE ${whereClause}
      ORDER BY o.order_date DESC`,
      [queryParam]
    );

    if (ordersRaw.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const orderIds = ordersRaw.map(o => o.id);

    // Fetch order items for these orders
    const orderItemsRaw = orderIds.length > 0 ? await db.query<any>(
      `SELECT id, order_id, menu_item_id, quantity FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds
    ) : [];

    // Get unique menu item IDs from order items
    const menuItemIds = [...new Set(orderItemsRaw.map(oi => oi.menu_item_id).filter(id => id))];

    // Fetch menu item details
    const menuItemsRaw = menuItemIds.length > 0 ? await db.query<any>(
      `SELECT id, restaurant_id, name, price FROM menu_items WHERE id IN (${menuItemIds.map(() => '?').join(',')})`,
      menuItemIds
    ) : [];

    const menuItemsMap = new Map<number, any>();
    menuItemsRaw.forEach((item: any) => {
      menuItemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        price: item.price, // Store in cents
        restaurantId: item.restaurant_id,
      });
    });

    // Get unique restaurant IDs from orders
    const restaurantIds = [...new Set(ordersRaw.map(o => o.store_id).filter(id => id))];

    // Get unique user IDs from orders (for customer names in merchant portal)
    const userIds = [...new Set(ordersRaw.map(o => o.user_id).filter(id => id))];

    // Fetch restaurant details
    const restaurantsRaw = restaurantIds.length > 0 ? await db.query<any>(
      `SELECT id, name, dash_pass FROM restaurants WHERE id IN (${restaurantIds.map(() => '?').join(',')})`,
      restaurantIds
    ) : [];

    // Fetch user details for customer names (only if fetching by storeId for merchant portal)
    const usersRaw = storeId && userIds.length > 0 ? await db.query<any>(
      `SELECT id, name, email FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    ) : [];

    const usersMap = new Map<number, any>();
    usersRaw.forEach((u: any) => {
      usersMap.set(u.id, {
        id: String(u.id),
        name: u.name,
        email: u.email,
      });
    });

    const restaurantsMap = new Map<number, any>();
    restaurantsRaw.forEach((r: any) => {
      restaurantsMap.set(r.id, {
        id: r.id,
        name: r.name,
        dashPass: r.dash_pass === 1,
      });
    });

    // Fetch applied modifications for order items
    const orderItemIds = orderItemsRaw.map(oi => oi.id);
    const appliedModsRaw = orderItemIds.length > 0 ? await db.query<any>(
      `SELECT id, order_item_id, modification_id, modification_desc FROM order_item_applied_modifications WHERE order_item_id IN (${orderItemIds.map(() => '?').join(',')})`,
      orderItemIds
    ) : [];

    // Fetch applied modification options
    const appliedModIds = appliedModsRaw.map(am => am.id);
    const appliedOptionsRaw = appliedModIds.length > 0 ? await db.query<any>(
      `SELECT id, order_item_applied_mod_id, option_id, option_name, price, quantity FROM order_item_applied_options WHERE order_item_applied_mod_id IN (${appliedModIds.map(() => '?').join(',')})`,
      appliedModIds
    ) : [];

    // Create a map of applied modification options by applied modification ID
    const appliedOptionsMap = new Map<number, any[]>();
    appliedOptionsRaw.forEach(opt => {
      if (!appliedOptionsMap.has(opt.order_item_applied_mod_id)) {
        appliedOptionsMap.set(opt.order_item_applied_mod_id, []);
      }
      appliedOptionsMap.get(opt.order_item_applied_mod_id)!.push(opt);
    });

    // Fetch modification details to get isRequired flag
    const modificationIds = [...new Set(appliedModsRaw.map(mod => mod.modification_id))];
    const modificationsRaw = modificationIds.length > 0 ? await db.query<any>(
      `SELECT id, is_required FROM modifications WHERE id IN (${modificationIds.map(() => '?').join(',')})`,
      modificationIds
    ) : [];

    const modificationsMap = new Map<number, any>();
    modificationsRaw.forEach((mod: any) => {
      modificationsMap.set(mod.id, mod);
    });

    // Create a map of applied modifications by order item ID
    const appliedModsMap = new Map<number, OrderModification[]>();
    appliedModsRaw.forEach(mod => {
      if (!appliedModsMap.has(mod.order_item_id)) {
        appliedModsMap.set(mod.order_item_id, []);
      }

      const options = appliedOptionsMap.get(mod.id) || [];
      const modDetails = modificationsMap.get(mod.modification_id);

      appliedModsMap.get(mod.order_item_id)!.push({
        modificationId: String(mod.modification_id),
        modificationDescription: mod.modification_desc,
        isRequired: modDetails?.is_required === 1,
        options: options.map(opt => ({
          optionId: String(opt.option_id),
          optionName: opt.option_name,
          price: opt.price / 100, // Convert cents to dollars
          quantity: opt.quantity,
          isCounter: false, // We'll determine this from the DB if needed
        })),
      });
    });

    // Group order items by order_id
    const orderItemsMap = new Map<number, OrderItem[]>();
    orderItemsRaw.forEach(oi => {
      if (!orderItemsMap.has(oi.order_id)) {
        orderItemsMap.set(oi.order_id, []);
      }

      const menuItem = menuItemsMap.get(oi.menu_item_id);
      if (!menuItem) {
        console.warn(`Menu item ${oi.menu_item_id} not found for order item ${oi.id}`);
        return;
      }

      const appliedModifications = appliedModsMap.get(oi.id) || [];

      orderItemsMap.get(oi.order_id)!.push({
        id: String(oi.menu_item_id), // Use menu_item_id as the item ID
        name: menuItem.name,
        quantity: oi.quantity,
        price: menuItem.price / 100, // Convert cents to dollars
        modifications: appliedModifications.length > 0 ? appliedModifications : undefined,
      });
    });

    // Fetch payment methods for orders
    const paymentMethodIds = [...new Set(ordersRaw.map(o => o.payment_method_id).filter(id => id))];
    const paymentMethodsRaw = paymentMethodIds.length > 0 ? await db.query<any>(
      `SELECT 
        pm.id,
        pm.type,
        pm.last_four,
        pm.expiry,
        pm.zip_code,
        pm.is_default
      FROM payment_methods pm
      WHERE pm.id IN (${paymentMethodIds.map(() => '?').join(',')})`,
      paymentMethodIds
    ) : [];

    const paymentMethodsMap = new Map<number, any>();
    paymentMethodsRaw.forEach(pm => {
      paymentMethodsMap.set(pm.id, {
        id: String(pm.id),
        cardType: pm.type,
        lastFour: pm.last_four,
        expiry: pm.expiry,
        billingZipCode: pm.zip_code,
        default: pm.is_default === 1,
      });
    });

    // Fetch addresses for orders
    const addressIds = [...new Set(ordersRaw.map(o => o.address_id).filter(id => id))];
    const addressesRaw = addressIds.length > 0 ? await db.query<any>(
      `SELECT 
        a.id,
        a.address_type,
        a.street,
        a.apartment_suite,
        a.business_name,
        a.city,
        a.state,
        a.zip_code,
        a.latitude,
        a.longitude,
        a.delivery_instructions,
        a.is_default
      FROM addresses a
      WHERE a.id IN (${addressIds.map(() => '?').join(',')})`,
      addressIds
    ) : [];

    const addressesMap = new Map<number, any>();
    addressesRaw.forEach(addr => {
      addressesMap.set(addr.id, {
        id: String(addr.id),
        type: addr.address_type,
        street: addr.street,
        aptSuiteOther: addr.apartment_suite,
        businessName: addr.business_name,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        lat: addr.latitude,
        lng: addr.longitude,
        deliveryInstructions: addr.delivery_instructions,
        default: addr.is_default === 1,
      });
    });

    // Transform orders to match Order interface
    const orders: Order[] = ordersRaw.map(order => {
      const restaurant = restaurantsMap.get(order.store_id);
      const user = order.user_id ? usersMap.get(order.user_id) : undefined;
      const items = orderItemsMap.get(order.id) || [];
      const paymentCard = order.payment_method_id ? paymentMethodsMap.get(order.payment_method_id) : undefined;
      const deliveryAddress = order.address_id ? addressesMap.get(order.address_id) : undefined;

      return {
        id: String(order.id),
        storeId: String(order.store_id),
        storeName: restaurant?.name || 'Unknown Store',
        storeCategory: order.store_category,
        items: items,
        paymentCard: paymentCard,
        deliveryAddress: deliveryAddress,
        deliveryOption: {
          type: order.delivery_type,
          deliveryTime: order.delivery_time_str,
          extraFee: order.extra_fee / 100, // Convert cents to dollars
          scheduledDate: order.scheduled_date ? new Date(order.scheduled_date) : null,
          scheduledTimeSlot: order.scheduled_time_slot,
        },
        phoneNumber: {
          countryCode: order.phone_country_code,
          number: order.phone_number,
        },
        tipAmount: order.tip_amount / 100, // Convert cents to dollars
        subtotal: order.subtotal / 100, // Convert cents to dollars
        serviceFee: order.service_fee / 100, // Convert cents to dollars
        deliveryFee: order.delivery_fee / 100, // Convert cents to dollars
        total: order.total / 100, // Convert cents to dollars
        orderDate: order.order_date,
        status: order.status,
        orderType: 'Personal', // Default to Personal, can be enhanced later
        isDashPass: restaurant?.dashPass || false,
        // Add user info for merchant portal
        userId: order.user_id ? String(order.user_id) : undefined,
        userName: user?.name || undefined,
        userEmail: user?.email || undefined,
      };
    });

    if (storeId) {
      console.log(`✅ Fetched ${orders.length} orders for store ${storeId}`);
    } else {
      console.log(`✅ Fetched ${orders.length} orders for user ${userId}`);
    }

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      userId,
      storeCategory,
      items,
      paymentCard,
      deliveryAddress,
      deliveryOption,
      phoneNumber,
      tipAmount = 0,
      subtotal,
      serviceFee,
      deliveryFee,
      total,
      status = 'Confirmed',
    } = body;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Convert storeId to number (database uses INTEGER)
    const storeIdNum = parseInt(storeId, 10);
    if (isNaN(storeIdNum)) {
      return NextResponse.json(
        { success: false, message: 'Invalid store ID' },
        { status: 400 }
      );
    }

    // Get or create user_id (can be null for guest orders)
    let userIdNum: number | null = null;
    if (userId) {
      userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum)) {
        userIdNum = null;
      }
    }

    // Get or create payment_method_id
    let paymentMethodId: number | null = null;
    if (paymentCard && paymentCard.lastFour) {
      // Try to find existing payment method
      const existingPaymentMethods = await db.query<any>(
        `SELECT id FROM payment_methods WHERE last_four = ? AND user_id = ? LIMIT 1`,
        [paymentCard.lastFour, userIdNum]
      );
      
      if (existingPaymentMethods.length > 0) {
        paymentMethodId = existingPaymentMethods[0].id;
      } else if (userIdNum) {
        // Create new payment method
        const paymentResult = await db.query<any>(
          `INSERT INTO payment_methods (user_id, type, last_four, expiry, zip_code, is_default)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userIdNum,
            paymentCard.type || 'credit',
            paymentCard.lastFour,
            paymentCard.expiry || '',
            paymentCard.zipCode || '',
            0 // Not default
          ]
        );
        paymentMethodId = paymentResult.lastInsertRowid;
      }
    }

    // Get or create address_id
    let addressId: number | null = null;
    if (deliveryAddress) {
      // Try to find existing address
      const existingAddresses = await db.query<any>(
        `SELECT id FROM addresses 
         WHERE street = ? AND city = ? AND state = ? AND zip_code = ? 
         AND (user_id = ? OR user_id IS NULL)
         LIMIT 1`,
        [
          deliveryAddress.street,
          deliveryAddress.city,
          deliveryAddress.state,
          deliveryAddress.zipCode,
          userIdNum
        ]
      );
      
      if (existingAddresses.length > 0) {
        addressId = existingAddresses[0].id;
      } else {
        // Create new address
        const addressResult = await db.query<any>(
          `INSERT INTO addresses (
            user_id, address_type, street, apartment_suite, business_name,
            city, state, zip_code, latitude, longitude, delivery_instructions, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userIdNum,
            deliveryAddress.type || 'home',
            deliveryAddress.street,
            deliveryAddress.aptSuiteOther || null,
            deliveryAddress.businessName || null,
            deliveryAddress.city,
            deliveryAddress.state,
            deliveryAddress.zipCode,
            deliveryAddress.lat || null,
            deliveryAddress.lng || null,
            deliveryAddress.deliveryInstructions || null,
            0 // Not default
          ]
        );
        addressId = addressResult.lastInsertRowid;
      }
    }

    // Insert order
    const orderDate = new Date().toISOString();
    const orderResult = await db.query<any>(
      `INSERT INTO orders (
        user_id, store_id, store_category, payment_method_id, address_id,
        delivery_type, delivery_time_str, extra_fee, scheduled_date, scheduled_time_slot,
        phone_country_code, phone_number, tip_amount, subtotal, service_fee, delivery_fee, total, order_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userIdNum,
        storeIdNum,
        storeCategory || 'restaurant',
        paymentMethodId,
        addressId,
        deliveryOption?.type || 'standard',
        deliveryOption?.deliveryTime || '25-35 min',
        Math.round((deliveryOption?.extraFee || 0) * 100), // Convert to cents
        deliveryOption?.scheduledDate ? new Date(deliveryOption.scheduledDate).toISOString().split('T')[0] : null,
        deliveryOption?.scheduledTimeSlot || null,
        phoneNumber?.countryCode || '+1',
        phoneNumber?.number || '',
        Math.round((tipAmount || 0) * 100), // Convert to cents
        Math.round((subtotal || 0) * 100), // Convert to cents
        Math.round((serviceFee || 0) * 100), // Convert to cents
        Math.round((deliveryFee || 0) * 100), // Convert to cents
        Math.round((total || 0) * 100), // Convert to cents
        orderDate,
        status
      ]
    );

    const orderId = orderResult.lastInsertRowid;

    // Insert order items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const menuItemId = parseInt(item.id, 10);
        if (isNaN(menuItemId)) {
          console.warn(`Invalid menu item ID: ${item.id}`);
          continue;
        }

        const orderItemResult = await db.query<any>(
          `INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)`,
          [orderId, menuItemId, item.quantity || 1]
        );

        const orderItemId = orderItemResult.lastInsertRowid;

        // Insert modifications if any
        if (item.modifications && Array.isArray(item.modifications)) {
          for (const mod of item.modifications) {
            const modificationId = parseInt(mod.modificationId, 10);
            if (isNaN(modificationId)) {
              continue;
            }

            const appliedModResult = await db.query<any>(
              `INSERT INTO order_item_applied_modifications (order_item_id, modification_id, modification_desc)
               VALUES (?, ?, ?)`,
              [orderItemId, modificationId, mod.modificationDescription || '']
            );

            const appliedModId = appliedModResult.lastInsertRowid;

            // Insert modification options
            if (mod.options && Array.isArray(mod.options)) {
              for (const option of mod.options) {
                const optionId = parseInt(option.optionId, 10);
                if (isNaN(optionId)) {
                  continue;
                }

                await db.query(
                  `INSERT INTO order_item_applied_options (
                    order_item_applied_mod_id, option_id, option_name, price, quantity
                  ) VALUES (?, ?, ?, ?, ?)`,
                  [
                    appliedModId,
                    optionId,
                    option.optionName || '',
                    Math.round((option.price || 0) * 100), // Convert to cents
                    option.quantity || 1
                  ]
                );
              }
            }
          }
        }
      }
    }

    console.log(`✅ Order ${orderId} saved to database for store ${storeId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: String(orderId),
        orderId: String(orderId),
      },
    });
  } catch (error: any) {
    console.error('❌ Error saving order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

