import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/promotionals
 *
 * Fetches active promotional banners from the database
 * Returns promotionals with restaurant logos
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch active promotionals with restaurant logos
    const promotionals = await db.query<any>(
      `SELECT 
        p.id,
        p.restaurant_id,
        p.title,
        p.description,
        p.button_text,
        p.button_color,
        p.gradient,
        p.display_order,
        r.logo AS restaurant_logo,
        r.name AS restaurant_name
      FROM promotionals p
      INNER JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.is_active = 1
      ORDER BY p.display_order ASC, p.id ASC`
    );

    if (promotionals.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform data to match component interface
    const promotionalsData = promotionals.map((promo: any) => ({
      id: String(promo.id),
      restaurantId: String(promo.restaurant_id),
      title: promo.title,
      description: promo.description,
      buttonText: promo.button_text,
      buttonColor: promo.button_color,
      gradient: promo.gradient,
      image: getImageWithFallback(promo.restaurant_logo, 'logo'),
      restaurantName: promo.restaurant_name,
    }));

    return NextResponse.json({
      success: true,
      data: promotionalsData,
    });
  } catch (error) {
    console.error('❌ Fetch promotionals error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching promotionals',
      },
      { status: 500 }
    );
  }
}
