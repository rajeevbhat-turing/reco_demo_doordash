import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SortSpec {
  key: string;
  order?: "asc" | "desc";
}

/**
 * GET /api/expected-state/get-orders
 * 
 * Query Parameters:
 * - userId: User ID (optional, use this OR email)
 * - email: User email (optional, use this OR userId)
 * - sort_type: JSON array of sort specifications (optional)
 *   - Supports aggregation: { "key": "field.count", "order": "desc" }
 *   - Regular sorting: { "key": "field", "order": "asc" }
 * - limit: Number of orders to return (optional)
 * - status: Filter by order status (optional)
 * - date_from: Filter orders from this date (ISO string, optional)
 * - date_to: Filter orders to this date (ISO string, optional)
 * 
 * Aggregation Behavior:
 * - When first sort_type has ".count", groups by that field and sorts by count
 * - Secondary sorts pick the best representative order from each group
 * - Returns one order per group
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const sortTypeParam = searchParams.get('sort_type');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const statusFilter = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Must provide either userId or email
    if (!userId && !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either userId or email is required' 
        },
        { status: 400 }
      );
    }

    // If email is provided, look up the user first
    if (email && !userId) {
      const user = await db.queryOne<any>(
        'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
        [email]
      );
      
      if (!user) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      
      userId = String(user.id);
    }

    // Parse sort_type if provided
    let sortSpecs: SortSpec[] = [];
    if (sortTypeParam) {
      try {
        sortSpecs = JSON.parse(sortTypeParam);
        if (!Array.isArray(sortSpecs)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'sort_type must be an array' 
            },
            { status: 400 }
          );
        }
        
        // Default order to "asc" if not provided
        for (const spec of sortSpecs) {
          if (!spec.order) {
            spec.order = "asc";
          }
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid sort_type format' 
          },
          { status: 400 }
        );
      }
    }

    // Check if first sort spec uses aggregation
    const firstSort = sortSpecs[0];
    const hasAggregation = firstSort && firstSort.key.includes('.count');
    
    let aggregationField: string | null = null;
    if (hasAggregation) {
      aggregationField = firstSort.key.split('.')[0]; // e.g., "cuisine.count" -> "cuisine"
    }

    // Build the query
    let query: string;
    const queryParams: any[] = [userId];

    if (hasAggregation && aggregationField) {
      // Aggregation query with grouping
      // Build secondary sort for representative selection
      let secondarySorts = '';
      if (sortSpecs.length > 1) {
        const secondarySortClauses = sortSpecs.slice(1).map(spec => {
          const direction = spec.order === 'desc' ? 'DESC' : 'ASC';
          return `o2.${spec.key} ${direction}`;
        });
        secondarySorts = secondarySortClauses.join(', ');
      }
      
      const groupSortDirection = firstSort.order === 'desc' ? 'DESC' : 'ASC';

      query = `
        WITH grouped_orders AS (
          SELECT 
            r.${aggregationField} as group_field,
            COUNT(*) as group_count
          FROM orders o
          LEFT JOIN restaurants r ON o.store_id = r.id
          WHERE o.user_id = ?
      `;

      // Add filters
      if (statusFilter) {
        query += ' AND o.status = ?';
        queryParams.push(statusFilter);
      }
      if (dateFrom) {
        query += ' AND o.order_date >= ?';
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND o.order_date <= ?';
        queryParams.push(dateTo);
      }

      query += `
          GROUP BY r.${aggregationField}
          ORDER BY group_count ${groupSortDirection}
      `;

      if (limit) {
        query += ` LIMIT ${limit}`;
      }

      query += `
        ),
        representative_orders AS (
          SELECT 
            o2.*,
            r2.name as store_name,
            r2.cuisine,
            go.group_count,
            ROW_NUMBER() OVER (
              PARTITION BY r2.${aggregationField}
              ORDER BY ${secondarySorts || 'o2.id'}
            ) as rn
          FROM orders o2
          LEFT JOIN restaurants r2 ON o2.store_id = r2.id
          INNER JOIN grouped_orders go ON r2.${aggregationField} = go.group_field
          WHERE o2.user_id = ?
      `;
      
      queryParams.push(userId);

      // Add filters again for representative selection
      if (statusFilter) {
        query += ' AND o2.status = ?';
        queryParams.push(statusFilter);
      }
      if (dateFrom) {
        query += ' AND o2.order_date >= ?';
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND o2.order_date <= ?';
        queryParams.push(dateTo);
      }

      query += `
        )
        SELECT 
          id,
          user_id,
          store_id,
          store_name,
          cuisine,
          delivery_fee,
          subtotal,
          total,
          status,
          order_date
        FROM representative_orders
        WHERE rn = 1
        ORDER BY group_count ${groupSortDirection}
      `;

    } else {
      // Regular query without aggregation
      query = `
        SELECT 
          o.id,
          o.user_id,
          o.store_id,
          r.name as store_name,
          r.cuisine,
          o.delivery_fee,
          o.subtotal,
          o.total,
          o.status,
          o.order_date
        FROM orders o
        LEFT JOIN restaurants r ON o.store_id = r.id
        WHERE o.user_id = ?
      `;

      // Add filters
      if (statusFilter) {
        query += ' AND o.status = ?';
        queryParams.push(statusFilter);
      }
      if (dateFrom) {
        query += ' AND o.order_date >= ?';
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND o.order_date <= ?';
        queryParams.push(dateTo);
      }

      // Add sorting if provided
      if (sortSpecs.length > 0) {
        const sortClauses = sortSpecs.map(spec => {
          const direction = spec.order === 'desc' ? 'DESC' : 'ASC';
          return `o.${spec.key} ${direction}`;
        });
        query += ` ORDER BY ${sortClauses.join(', ')}`;
      }

      // Add limit
      if (limit) {
        query += ` LIMIT ${limit}`;
      }
    }

    const orders = await db.query<any>(query, queryParams);

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform to result format
    const results = orders.map((order: any) => ({
      id: String(order.id),
      userId: String(order.user_id),
      storeId: String(order.store_id),
      storeName: order.store_name,
      cuisine: order.cuisine,
      deliveryFee: order.delivery_fee,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      orderDate: order.order_date,
    }));

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('❌ Get orders error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

