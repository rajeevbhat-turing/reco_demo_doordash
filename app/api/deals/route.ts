import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/deals
 * 
 * Fetches deals from the database
 * 
 * Query params:
 * - restaurantId: Filter by restaurant ID (optional)
 *   - If provided: returns restaurant-specific deals + common deals
 *   - If not provided: returns only common deals
 * - all: If set to 'true', returns all deals (restaurant-specific + common)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const restaurantId = searchParams.get('restaurantId');
    const all = searchParams.get('all') === 'true';

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (all) {
      // Return all deals (no filter)
      // Don't add any conditions
    } else if (restaurantId) {
      // Get deals for specific restaurant (restaurant_id = restaurantId) OR common deals (restaurant_id IS NULL)
      conditions.push('(restaurant_id = ? OR restaurant_id IS NULL)');
      params.push(parseInt(restaurantId));
    } else {
      // If no restaurantId provided, return only common deals (restaurant_id IS NULL)
      conditions.push('restaurant_id IS NULL');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch deals
    const deals = db.query<any>(
      `SELECT 
        id,
        restaurant_id,
        title,
        description,
        button_text,
        button_link,
        minimum_purchase,
        discount_type,
        discount_value,
        maximum_discount,
        promocode
      FROM deals
      ${whereClause}
      ORDER BY 
        CASE WHEN id = 'dashpass-delivery-fee' THEN 0 ELSE 1 END,
        restaurant_id NULLS LAST,
        id`,
      params
    );

    if (deals.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get all deal IDs
    const dealIds = deals.map((d: any) => d.id);

    // Fetch free items for all deals
    const freeItems = db.query<any>(
      `SELECT 
        deal_id,
        item_id,
        item_name,
        sort_order
      FROM deal_free_items
      WHERE deal_id IN (${dealIds.map(() => '?').join(',')})
      ORDER BY deal_id, sort_order`,
      dealIds
    );

    // Group free items by deal_id
    const freeItemsByDeal: Record<string, any[]> = {};
    freeItems.forEach((item: any) => {
      if (!freeItemsByDeal[item.deal_id]) {
        freeItemsByDeal[item.deal_id] = [];
      }
      freeItemsByDeal[item.deal_id].push({
        id: String(item.item_id),
        name: item.item_name,
      });
    });

    // Transform data to match Deal interface
    const dealsData = deals.map((deal: any) => ({
      id: deal.id,
      restaurantId: deal.restaurant_id ? String(deal.restaurant_id) : null,
      title: deal.title,
      description: deal.description,
      buttonText: deal.button_text || undefined,
      buttonLink: deal.button_link || undefined,
      minimumPurchase: deal.minimum_purchase ? deal.minimum_purchase / 100 : undefined,
      discountType: deal.discount_type || undefined,
      discountValue: deal.discount_value !== null ? (deal.discount_type === 'percentage' ? deal.discount_value : deal.discount_value / 100) : undefined,
      maximumDiscount: deal.maximum_discount ? deal.maximum_discount / 100 : undefined,
      promocode: deal.promocode || undefined,
      freeItems: freeItemsByDeal[deal.id] || undefined,
    }));

    return NextResponse.json({
      success: true,
      data: dealsData,
    });

  } catch (error) {
    console.error('❌ Fetch deals error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching deals'
      },
      { status: 500 }
    );
  }
}

