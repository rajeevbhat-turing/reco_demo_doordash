import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';
import { getImageWithFallback } from '@/constants/image-placeholders';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json({ success: false, message: 'Store ID is required' }, { status: 400 });
  }

  try {
    // Fetch orders for the store
    const ordersRaw = await merchantDb.query<any>(
      `SELECT 
        o.id,
        o.store_id,
        o.customer_name,
        o.customer_id,
        o.customer_email,
        o.status,
        o.order_date,
        o.scheduled_date,
        o.fulfillment_type,
        o.channel,
        o.delivery_street,
        o.delivery_city,
        o.delivery_state,
        o.delivery_zip_code,
        o.delivery_business,
        o.delivery_latitude,
        o.delivery_longitude,
        o.subtotal,
        o.service_fee,
        o.delivery_fee,
        o.tip_amount,
        o.total,
        o.created_at,
        o.updated_at,
        s.name as store_name
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      WHERE o.store_id = ?
      ORDER BY o.order_date DESC`,
      [storeId]
    );

    if (ordersRaw.length === 0) {
      console.log(`⚠️ No orders found for store ${storeId}`);
      return NextResponse.json({ success: true, data: [] });
    }

    const orderIds = ordersRaw.map(o => o.id);

    // Fetch order items
    const orderItemsRaw = await merchantDb.query<any>(
      `SELECT 
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        oi.name,
        oi.quantity,
        oi.price,
        oi.image
      FROM order_items oi
      WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})`,
      orderIds
    );

    // Group order items by order_id
    const orderItemsMap = new Map<string, any[]>();
    orderItemsRaw.forEach(oi => {
      if (!orderItemsMap.has(oi.order_id)) {
        orderItemsMap.set(oi.order_id, []);
      }
      orderItemsMap.get(oi.order_id)!.push({
        id: oi.id,
        menuItemId: oi.menu_item_id,
        name: oi.name,
        quantity: oi.quantity,
        price: oi.price / 100, // Convert cents to dollars
        image: getImageWithFallback(oi.image, 'image'),
      });
    });

    // Transform orders
    const orders = ordersRaw.map(order => ({
      id: order.id,
      storeId: order.store_id,
      storeName: order.store_name || 'Unknown Store',
      // Customer info
      customer: order.customer_name,
      customerId: order.customer_id,
      customerEmail: order.customer_email,
      // Status
      status: order.status,
      // Date/time
      orderDate: order.order_date,
      scheduledDate: order.scheduled_date,
      // For display compatibility
      date: new Date(order.order_date).toLocaleDateString('en-US'),
      time: new Date(order.order_date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      // Fulfillment
      fulfillmentType:
        order.fulfillment_type === 'pickup' ? 'Customer pickup' : 'DashDoor delivery',
      channel: order.channel,
      // Delivery address
      deliveryAddress: order.delivery_street
        ? {
            street: order.delivery_street,
            city: order.delivery_city,
            state: order.delivery_state,
            zipCode: order.delivery_zip_code,
            businessName: order.delivery_business,
            lat: order.delivery_latitude,
            lng: order.delivery_longitude,
          }
        : undefined,
      // Items
      items: orderItemsMap.get(order.id) || [],
      // Pricing (convert cents to dollars)
      subtotal: `$${(order.subtotal / 100).toFixed(2)}`,
      serviceFee: order.service_fee / 100,
      deliveryFee: order.delivery_fee / 100,
      tipAmount: order.tip_amount / 100,
      total: order.total / 100,
    }));

    console.log(`✅ Fetched ${orders.length} orders for store ${storeId}`);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      customerName,
      customerId,
      customerEmail,
      status = 'pending',
      fulfillmentType = 'delivery',
      channel = 'DashDoor',
      deliveryAddress,
      items,
      subtotal,
      serviceFee = 0,
      deliveryFee = 0,
      tipAmount = 0,
      total,
    } = body;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const orderDate = new Date().toISOString();

    // Insert order
    await merchantDb.run(
      `INSERT INTO orders (
        id, store_id, customer_name, customer_id, customer_email,
        status, order_date, fulfillment_type, channel,
        delivery_street, delivery_city, delivery_state, delivery_zip_code,
        delivery_business, delivery_latitude, delivery_longitude,
        subtotal, service_fee, delivery_fee, tip_amount, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        storeId,
        customerName || null,
        customerId || null,
        customerEmail || null,
        status,
        orderDate,
        fulfillmentType,
        channel,
        deliveryAddress?.street || null,
        deliveryAddress?.city || null,
        deliveryAddress?.state || null,
        deliveryAddress?.zipCode || null,
        deliveryAddress?.businessName || null,
        deliveryAddress?.lat || null,
        deliveryAddress?.lng || null,
        Math.round(subtotal * 100), // Convert to cents
        Math.round(serviceFee * 100),
        Math.round(deliveryFee * 100),
        Math.round(tipAmount * 100),
        Math.round(total * 100),
      ]
    );

    // Insert order items
    if (items && items.length > 0) {
      for (const item of items) {
        const itemId = `oi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await merchantDb.run(
          `INSERT INTO order_items (id, order_id, menu_item_id, name, quantity, price, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            item.menuItemId || null,
            item.name,
            item.quantity,
            Math.round(item.price * 100), // Convert to cents
            item.image || null,
          ]
        );
      }
    }

    console.log(`✅ Order ${orderId} created for store ${storeId}`);

    return NextResponse.json({
      success: true,
      data: { id: orderId, storeId, status, orderDate },
    });
  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
