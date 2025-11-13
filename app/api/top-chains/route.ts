import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/top-chains
 * 
 * Fetches restaurants (chains) with average rating > 4.5
 * Returns array of restaurant objects with id, name, and rating
 */
export async function GET(request: NextRequest) {
  try {
    // Get restaurants with average rating > 4.5
    const restaurants = db.query<any>(
      `SELECT 
        r.id,
        r.name,
        r.cuisine,
        (
          SELECT AVG(mi.rating)
          FROM menu_items mi
          WHERE mi.restaurant_id = r.id AND mi.rating IS NOT NULL
        ) AS avg_rating
      FROM restaurants r
      WHERE (
        SELECT AVG(mi.rating)
        FROM menu_items mi
        WHERE mi.restaurant_id = r.id AND mi.rating IS NOT NULL
      ) > 4.5
      ORDER BY avg_rating DESC, r.name ASC`
    );

    const chains = restaurants.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      cuisine: r.cuisine,
      rating: r.avg_rating ? parseFloat(r.avg_rating.toFixed(1)) : null,
    }));

    return NextResponse.json({
      success: true,
      data: chains,
    });

  } catch (error) {
    console.error('❌ Fetch top chains error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching top chains'
      },
      { status: 500 }
    );
  }
}

