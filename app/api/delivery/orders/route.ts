import { NextRequest, NextResponse } from 'next/server';
import { deliveryDb } from '@/lib/delivery-db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/delivery/orders
 *
 * Fetches orders for a delivery partner
 * Query params:
 * - partnerId: required - the delivery partner's ID
 * - status: optional - filter by status ('completed' | 'cancelled' | 'all')
 * - limit: optional - number of orders to return (default: 50)
 * - offset: optional - pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate partnerId
    if (!partnerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner ID is required',
        },
        { status: 400 }
      );
    }

    // Build query based on status filter
    let query = `
      SELECT 
        id,
        partner_id as partnerId,
        store_name as storeName,
        store_logo as storeLogo,
        store_address as storeAddress,
        customer_name as customerName,
        customer_address as customerAddress,
        items_count as itemsCount,
        distance_miles as distanceMiles,
        base_pay as basePay,
        tip_amount as tipAmount,
        total_earnings as totalEarnings,
        status,
        order_date as orderDate,
        completed_at as completedAt
      FROM delivery_orders
      WHERE partner_id = ?
    `;

    const params: any[] = [partnerId];

    if (status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY order_date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await deliveryDb.query<any>(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM delivery_orders WHERE partner_id = ?';
    const countParams: any[] = [partnerId];

    if (status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const countResult = await deliveryDb.queryOne<{ total: number }>(countQuery, countParams);
    const total = countResult?.total || 0;

    // Transform orders data
    const transformedOrders = orders.map(order => ({
      id: order.id,
      partnerId: order.partnerId,
      storeName: order.storeName,
      storeLogo: getImageWithFallback(order.storeLogo, 'logo'),
      storeAddress: order.storeAddress,
      customerName: order.customerName,
      customerAddress: order.customerAddress,
      itemsCount: order.itemsCount,
      distanceMiles: order.distanceMiles,
      basePay: order.basePay,
      tipAmount: order.tipAmount,
      totalEarnings: order.totalEarnings,
      status: order.status,
      orderDate: order.orderDate,
      completedAt: order.completedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + orders.length < total,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching delivery orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching orders',
      },
      { status: 500 }
    );
  }
}

