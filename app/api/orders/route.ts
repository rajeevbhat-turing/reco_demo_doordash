import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order, OrderItem } from '@/constants/order-data';
import { OrderModification, OrderModificationOption } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch orders for the user
    const ordersRaw = db.query<any>(
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
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC`,
      [userId]
    );

    if (ordersRaw.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const orderIds = ordersRaw.map(o => o.id);

    // Fetch order items for these orders
    const orderItemsRaw = orderIds.length > 0 ? db.query<any>(
      `SELECT id, order_id, menu_item_id, quantity FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds
    ) : [];

    // Get unique menu item IDs from order items
    const menuItemIds = [...new Set(orderItemsRaw.map(oi => oi.menu_item_id).filter(id => id))];

    // Fetch menu item details
    const menuItemsRaw = menuItemIds.length > 0 ? db.query<any>(
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

    // Fetch restaurant details
    const restaurantsRaw = restaurantIds.length > 0 ? db.query<any>(
      `SELECT id, name, dash_pass FROM restaurants WHERE id IN (${restaurantIds.map(() => '?').join(',')})`,
      restaurantIds
    ) : [];

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
    const appliedModsRaw = orderItemIds.length > 0 ? db.query<any>(
      `SELECT id, order_item_id, modification_id, modification_desc FROM order_item_applied_modifications WHERE order_item_id IN (${orderItemIds.map(() => '?').join(',')})`,
      orderItemIds
    ) : [];

    // Fetch applied modification options
    const appliedModIds = appliedModsRaw.map(am => am.id);
    const appliedOptionsRaw = appliedModIds.length > 0 ? db.query<any>(
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

    // Create a map of applied modifications by order item ID
    const appliedModsMap = new Map<number, OrderModification[]>();
    appliedModsRaw.forEach(mod => {
      if (!appliedModsMap.has(mod.order_item_id)) {
        appliedModsMap.set(mod.order_item_id, []);
      }

      const options = appliedOptionsMap.get(mod.id) || [];
      
      // Fetch modification details to get isRequired flag
      const modDetails = db.queryOne<any>(
        `SELECT is_required FROM modifications WHERE id = ?`,
        [mod.modification_id]
      );

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
    const paymentMethodsRaw = paymentMethodIds.length > 0 ? db.query<any>(
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
    const addressesRaw = addressIds.length > 0 ? db.query<any>(
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
      };
    });

    console.log(`✅ Fetched ${orders.length} orders for user ${userId}`);

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

