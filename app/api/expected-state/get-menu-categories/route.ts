import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-menu-categories
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - restaurant_id: Restaurant ID (required)
 * - keyword: Keyword to filter category names (optional, partial match, case-insensitive)
 * - limit: Number of categories to return (optional, returns all if not provided)
 * 
 * Fetches menu categories for a specific restaurant:
 * 1. Fetches categories that have menu items in the specified restaurant
 * 2. Filters by keyword if provided
 * 3. Orders by display_order ascending
 * 4. Returns top N categories based on limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurant_id');
    const keyword = searchParams.get('keyword');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        },
        { status: 400 }
      );
    }

    if (!restaurantId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'restaurant_id is required' 
        },
        { status: 400 }
      );
    }

    // Build SQL query to get menu categories for this restaurant
    let query = `
      SELECT DISTINCT
        mc.id,
        mc.name,
        mc.display_order
      FROM menu_categories mc
      INNER JOIN menu_items mi ON mc.id = mi.category_id
      WHERE mi.restaurant_id = ?
        AND mi.is_available = 1
    `;
    
    const queryParams: any[] = [restaurantId];
    
    // Apply keyword filter if provided
    if (keyword) {
      query += ' AND LOWER(mc.name) LIKE ?';
      queryParams.push(`%${keyword.toLowerCase()}%`);
    }
    
    // Order by display_order
    query += ' ORDER BY mc.display_order ASC';
    
    // Apply limit if provided
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const categories = await db.query<any>(query, queryParams);

    if (!categories || categories.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform to result format
    const results = categories.map((category: any) => ({
      id: String(category.id),
      name: category.name,
      sortOrder: category.display_order,
    }));

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('❌ Get menu categories error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

