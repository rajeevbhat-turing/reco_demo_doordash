import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-deal?promocode=SAVE20
 *
 * Gets a deal/promotion by promo code from the database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const promocode = searchParams.get('promocode');

    if (!promocode) {
      return NextResponse.json(
        {
          success: false,
          error: 'promocode is required',
        },
        { status: 400 }
      );
    }

    const deal = await db.queryOne<any>(
      `SELECT 
        id,
        restaurant_id as restaurantId,
        title,
        description,
        button_text as buttonText,
        button_link as buttonLink,
        minimum_purchase as minimumPurchase,
        discount_type as discountType,
        discount_value as discountValue,
        maximum_discount as maximumDiscount,
        promocode
      FROM deals
      WHERE promocode = ? COLLATE NOCASE`,
      [promocode]
    );

    if (!deal) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Get free items for this deal
    const freeItems = await db.query<any>(
      `SELECT 
        item_id as id,
        item_name as name,
        sort_order as sortOrder
      FROM deal_free_items
      WHERE deal_id = ?
      ORDER BY sort_order`,
      [deal.id]
    );

    const result = {
      id: String(deal.id),
      restaurantId: deal.restaurantId ? String(deal.restaurantId) : null,
      title: deal.title,
      description: deal.description,
      buttonText: deal.buttonText,
      buttonLink: deal.buttonLink,
      minimumPurchase: deal.minimumPurchase,
      discountType: deal.discountType,
      discountValue: deal.discountValue,
      maximumDiscount: deal.maximumDiscount,
      promocode: deal.promocode,
      freeItems: freeItems.length > 0 ? freeItems : undefined,
    };

    return NextResponse.json({
      success: true,
      data: {
        deal: result,
      },
    });
  } catch (error) {
    console.error('❌ Get deal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
