import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/stores/[storeId]/customers/insights
 * 
 * Fetches customer insights data for a specific store based on orders
 * 
 * Query params:
 * - period: Time period filter ('this_month', 'last_month', 'this_year') (optional, default: 'this_month')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = request.nextUrl;
    const period = searchParams.get('period') || 'this_month';

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    const storeIdNum = parseInt(storeId, 10);
    if (isNaN(storeIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid store ID' },
        { status: 400 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (period) {
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'this_month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch all orders for this store in the period
    const orders = await db.query<any>(
      `SELECT 
        o.id,
        o.user_id,
        o.order_date,
        o.total,
        a.zip_code,
        u.name AS user_name,
        u.email AS user_email
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.store_id = ? 
        AND o.order_date >= ? 
        AND o.order_date <= ?
        AND o.user_id IS NOT NULL
      ORDER BY o.order_date DESC`,
      [storeIdNum, startDateStr, endDateStr]
    );

    // Calculate customer metrics
    const customerOrderCounts = new Map<number, number>();
    const customerFirstOrders = new Map<number, string>(); // user_id -> first order date
    const customerTotalSpent = new Map<number, number>(); // user_id -> total spent
    const zipCodeCustomers = new Map<string, Set<number>>(); // zip_code -> Set<user_id>

    // Process orders to calculate metrics
    orders.forEach((order: any) => {
      if (!order.user_id) return;

      const userId = order.user_id;
      const orderDate = order.order_date;
      const total = order.total ? order.total / 100 : 0; // Convert cents to dollars
      const zipCode = order.zip_code || '';

      // Count orders per customer
      customerOrderCounts.set(userId, (customerOrderCounts.get(userId) || 0) + 1);

      // Track first order date
      if (!customerFirstOrders.has(userId) || orderDate < customerFirstOrders.get(userId)!) {
        customerFirstOrders.set(userId, orderDate);
      }

      // Track total spent
      customerTotalSpent.set(userId, (customerTotalSpent.get(userId) || 0) + total);

      // Track customers by zip code
      if (zipCode) {
        if (!zipCodeCustomers.has(zipCode)) {
          zipCodeCustomers.set(zipCode, new Set());
        }
        zipCodeCustomers.get(zipCode)!.add(userId);
      }
    });

    // Categorize customers
    const totalCustomers = customerOrderCounts.size;
    let newCustomers = 0;
    let occasionalCustomers = 0;
    let frequentCustomers = 0;

    customerOrderCounts.forEach((orderCount, userId) => {
      if (orderCount === 1) {
        newCustomers++;
      } else if (orderCount >= 2 && orderCount <= 4) {
        occasionalCustomers++;
      } else if (orderCount >= 5) {
        frequentCustomers++;
      }
    });

    // Calculate percentages
    const newCustomersPercent = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;
    const occasionalCustomersPercent = totalCustomers > 0 ? (occasionalCustomers / totalCustomers) * 100 : 0;
    const frequentCustomersPercent = totalCustomers > 0 ? (frequentCustomers / totalCustomers) * 100 : 0;

    // Get customer locations (zip codes with at least 2 customers)
    const customerLocations = Array.from(zipCodeCustomers.entries())
      .filter(([_, customerSet]) => customerSet.size >= 2)
      .map(([zipCode, customerSet]) => ({
        zipCode,
        customerCount: customerSet.size,
        customerIds: Array.from(customerSet),
      }))
      .sort((a, b) => b.customerCount - a.customerCount)
      .slice(0, 20); // Top 20 locations

    // Get previous period for comparison (if this_month, compare to last_month)
    let previousPeriodData = {
      totalCustomers: 0,
      newCustomers: 0,
      occasionalCustomers: 0,
      frequentCustomers: 0,
    };

    if (period === 'this_month') {
      const prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      const prevStartDateStr = prevStartDate.toISOString().split('T')[0];
      const prevEndDateStr = prevEndDate.toISOString().split('T')[0];

      const prevOrders = await db.query<any>(
        `SELECT DISTINCT user_id
         FROM orders
         WHERE store_id = ? 
           AND order_date >= ? 
           AND order_date <= ?
           AND user_id IS NOT NULL`,
        [storeIdNum, prevStartDateStr, prevEndDateStr]
      );

      previousPeriodData.totalCustomers = prevOrders.length;
    }

    // Calculate percentage change
    const totalCustomersChange = previousPeriodData.totalCustomers > 0
      ? ((totalCustomers - previousPeriodData.totalCustomers) / previousPeriodData.totalCustomers) * 100
      : totalCustomers > 0 ? 100 : 0;

    console.log(`✅ Fetched customer insights for store ${storeId}: ${totalCustomers} total customers`);

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate: startDateStr,
        endDate: endDateStr,
        totalCustomers,
        totalCustomersChange: totalCustomersChange.toFixed(1),
        newCustomers,
        newCustomersPercent: newCustomersPercent.toFixed(1),
        occasionalCustomers,
        occasionalCustomersPercent: occasionalCustomersPercent.toFixed(1),
        frequentCustomers,
        frequentCustomersPercent: frequentCustomersPercent.toFixed(1),
        customerLocations,
        previousPeriod: previousPeriodData,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching customer insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching customer insights',
      },
      { status: 500 }
    );
  }
}

