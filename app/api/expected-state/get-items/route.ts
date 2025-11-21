import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-items
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - restaurant_id: Filter by restaurant ID (optional, searches all restaurants if not provided)
 * - keywords: JSON array of keywords to match against item name (optional)
 * - sort_type: Sorting type (e.g., "cheapest")
 * - tiebreaker: Tiebreaker strategy when items have same primary sort value (optional)
 *   - "keyword": Break ties based on keyword array order (earlier keywords preferred)
 * - limit: Number of items to return (optional, returns all if not provided)
 * 
 * Finds menu items with optional filtering and sorting:
 * 1. Fetches menu items from database (all or from specific restaurant)
 * 2. Filters by keywords if provided (matches against item name only)
 * 3. Sorts by primary sort field (e.g., price for "cheapest")
 * 4. Applies tiebreaker if specified and items are tied on primary sort
 * 5. Returns top N items based on limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurant_id');
    const keywordsParam = searchParams.get('keywords');
    const sortType = searchParams.get('sort_type');
    const tiebreaker = searchParams.get('tiebreaker');
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

    // Parse keywords if provided
    let keywords: string[] = [];
    if (keywordsParam) {
      try {
        keywords = JSON.parse(keywordsParam);
        if (!Array.isArray(keywords)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'keywords must be an array' 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid keywords format' 
          },
          { status: 400 }
        );
      }
    }

    // Build SQL query
    let query = `
      SELECT 
        id,
        restaurant_id,
        category_id,
        name,
        description,
        price,
        image,
        calories,
        rating,
        rating_count,
        popular,
        featured
      FROM menu_items
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Filter by restaurant if provided
    if (restaurantId) {
      query += ' AND restaurant_id = ?';
      queryParams.push(restaurantId);
    }

    // Filter by keywords if provided (match against name only)
    if (keywords.length > 0) {
      // Create OR conditions for each keyword
      const keywordConditions = keywords.map(() => 'LOWER(name) LIKE ?').join(' OR ');
      query += ` AND (${keywordConditions})`;
      
      // Add each keyword as a parameter with wildcard matching
      keywords.forEach(keyword => {
        queryParams.push(`%${keyword.toLowerCase()}%`);
      });
    }

    const menuItems = await db.query<any>(query, queryParams);

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform to result format
    let results = menuItems.map((item: any) => {
      const result: any = {
        id: String(item.id),
        restaurantId: String(item.restaurant_id),
        categoryId: String(item.category_id),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        calories: item.calories,
        rating: item.rating,
        ratingCount: item.rating_count,
        popular: item.popular === 1,
        featured: item.featured === 1,
      };

      // Calculate keyword priority if tiebreaker is "keyword"
      if (tiebreaker === 'keyword' && keywords.length > 0) {
        const itemNameLower = item.name.toLowerCase();
        let keywordPriority = Infinity; // Default: no match
        
        for (let i = 0; i < keywords.length; i++) {
          if (itemNameLower.includes(keywords[i].toLowerCase())) {
            keywordPriority = i; // Lower index = higher priority
            break; // Stop at first match
          }
        }
        
        result._keywordPriority = keywordPriority;
      }

      return result;
    });

    // Sort if sort_type is provided
    if (sortType === 'cheapest') {
      results.sort((a: any, b: any) => {
        // Primary sort: by price (ascending)
        if (a.price !== b.price) {
          return a.price - b.price;
        }
        
        // Tiebreaker: keyword priority if enabled
        if (tiebreaker === 'keyword' && a._keywordPriority !== undefined && b._keywordPriority !== undefined) {
          if (a._keywordPriority !== b._keywordPriority) {
            return a._keywordPriority - b._keywordPriority;
          }
        }
        
        // Final fallback: item ID (for deterministic results)
        return a.id.localeCompare(b.id);
      });
    }

    // Remove temporary fields
    results = results.map(({ _keywordPriority, ...rest }: any) => rest);

    // Apply limit if provided
    const limitedResults = limit ? results.slice(0, limit) : results;

    return NextResponse.json({
      success: true,
      data: limitedResults,
    });

  } catch (error) {
    console.error('❌ Get items error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

