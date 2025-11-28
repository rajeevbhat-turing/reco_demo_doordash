import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Build date filter
    let dateFilter = '';
    const queryParams: any[] = [storeId];
    
    if (startDate && endDate) {
      // SQLite date comparison - use string comparison for ISO dates
      dateFilter = 'AND o.order_date >= ? AND o.order_date <= ?';
      queryParams.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    // Fetch orders for this store
    const ordersRaw = await db.query<any>(
      `SELECT 
        o.id,
        o.total,
        o.subtotal,
        o.service_fee,
        o.delivery_fee,
        o.tip_amount,
        o.order_date,
        o.status
      FROM orders o
      WHERE o.store_id = ? ${dateFilter}
      ORDER BY o.order_date DESC`,
      queryParams
    );

    // Calculate metrics
    const completedOrders = ordersRaw.filter((o: any) => o.status === 'completed' || o.status === 'delivered');
    
    console.log(`📊 Sales API: Found ${ordersRaw.length} total orders, ${completedOrders.length} completed for store ${storeId}`);
    
    const grossSales = completedOrders.reduce((sum: number, order: any) => sum + (order.total / 100), 0);
    const totalOrders = completedOrders.length;
    const averageTicketSize = totalOrders > 0 ? grossSales / totalOrders : 0;
    
    console.log(`💰 Sales metrics: Gross sales: $${grossSales.toFixed(2)}, Orders: ${totalOrders}, Avg ticket: $${averageTicketSize.toFixed(2)}`);

    // Group by date for time series
    const salesByDate: Record<string, { sales: number; orders: number }> = {};
    
    completedOrders.forEach((order: any) => {
      // Handle different date formats
      let date: string;
      if (order.order_date instanceof Date) {
        date = order.order_date.toISOString().split('T')[0];
      } else if (typeof order.order_date === 'string') {
        date = order.order_date.split('T')[0].split(' ')[0]; // Handle both ISO and SQL datetime formats
      } else {
        return; // Skip invalid dates
      }
      
      if (!salesByDate[date]) {
        salesByDate[date] = { sales: 0, orders: 0 };
      }
      salesByDate[date].sales += order.total / 100;
      salesByDate[date].orders += 1;
    });

    // Group by day of week
    const salesByDayOfWeek: Record<string, { sales: number; orders: number }> = {
      'Sun': { sales: 0, orders: 0 },
      'Mon': { sales: 0, orders: 0 },
      'Tue': { sales: 0, orders: 0 },
      'Wed': { sales: 0, orders: 0 },
      'Thu': { sales: 0, orders: 0 },
      'Fri': { sales: 0, orders: 0 },
      'Sat': { sales: 0, orders: 0 },
    };

    completedOrders.forEach((order: any) => {
      try {
        const date = new Date(order.order_date);
        if (isNaN(date.getTime())) return; // Skip invalid dates
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (salesByDayOfWeek[dayName]) {
          salesByDayOfWeek[dayName].sales += order.total / 100;
          salesByDayOfWeek[dayName].orders += 1;
        }
      } catch (e) {
        console.error('Error parsing date:', order.order_date, e);
      }
    });

    // Group by hour of day
    const salesByHour: Record<number, { sales: number; orders: number }> = {};
    for (let i = 0; i < 24; i++) {
      salesByHour[i] = { sales: 0, orders: 0 };
    }

    completedOrders.forEach((order: any) => {
      try {
        const date = new Date(order.order_date);
        if (isNaN(date.getTime())) return; // Skip invalid dates
        const hour = date.getHours();
        if (salesByHour[hour] !== undefined) {
          salesByHour[hour].sales += order.total / 100;
          salesByHour[hour].orders += 1;
        }
      } catch (e) {
        console.error('Error parsing date:', order.order_date, e);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        grossSales,
        totalOrders,
        averageTicketSize,
        salesByDate,
        salesByDayOfWeek,
        salesByHour,
        orders: completedOrders.map((o: any) => ({
          id: o.id,
          total: o.total / 100,
          subtotal: o.subtotal / 100,
          serviceFee: o.service_fee / 100,
          deliveryFee: o.delivery_fee / 100,
          tipAmount: o.tip_amount / 100,
          orderDate: o.order_date,
          status: o.status,
        })),
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching sales data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

