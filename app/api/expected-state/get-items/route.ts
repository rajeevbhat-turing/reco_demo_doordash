import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';

interface SortSpec {
  key: string;
  order?: 'asc' | 'desc';
}

/**
 * GET /api/expected-state/get-items
 *
 * Query Parameters:
 * - userId: User ID (required)
 * - restaurant_id: Filter by restaurant ID (optional, searches all restaurants if not provided)
 * - lat: Latitude (optional, used for distance filtering when restaurant_id not provided)
 * - lng: Longitude (optional, used for distance filtering when restaurant_id not provided)
 * - keywords: JSON array of keywords to match against item name (optional)
 * - menu_categories: JSON array of menu category names to filter by (optional, matches any)
 * - restaurant_ids_not_in: JSON array of restaurant IDs to exclude (optional)
 * - featured: Boolean to filter by featured status (optional, "true" or "false")
 * - sort_type: JSON array of sort specifications (optional)
 *   - Each spec: { key: string, order?: "asc" | "desc" }
 *   - Example: [{ "key": "price", "order": "asc" }, { "key": "rating", "order": "desc" }]
 *   - Sorts by first spec, then uses subsequent specs as tiebreakers
 *   - order defaults to "asc" if not provided
 * - limit: Number of items to return (optional, returns all if not provided)
 *
 * Finds menu items with optional filtering and sorting:
 * 1. Fetches menu items from database (all or from specific restaurant)
 * 2. If restaurant_id not provided: filters restaurants by 10 mile radius using lat/lng
 * 3. Filters by menu categories if provided (matches against category name)
 * 4. Filters by keywords if provided (matches against item name only)
 * 5. Excludes items from specific restaurants if restaurant_ids_not_in provided
 * 6. Applies multi-level sorting based on sort_type array
 * 7. Returns top N items based on limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurant_id');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const keywordsParam = searchParams.get('keywords');
    const menuCategoriesParam = searchParams.get('menu_categories');
    const restaurantIdsNotInParam = searchParams.get('restaurant_ids_not_in');
    const featuredParam = searchParams.get('featured');
    const sortTypeParam = searchParams.get('sort_type');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }
    
    // If restaurant_id is not provided, lat and lng are required for distance filtering
    if (!restaurantId && (!lat || !lng)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'lat and lng are required when restaurant_id is not provided' 
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
              error: 'keywords must be an array',
            },
            { status: 400 }
          );
        }
      } catch (_error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid keywords format',
          },
          { status: 400 }
        );
      }
    }

    // Parse menu_categories if provided
    let menuCategories: string[] = [];
    if (menuCategoriesParam) {
      try {
        menuCategories = JSON.parse(menuCategoriesParam);
        if (!Array.isArray(menuCategories)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'menu_categories must be an array' 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid menu_categories format' 
          },
          { status: 400 }
        );
      }
    }

    // Parse restaurant_ids_not_in if provided
    let restaurantIdsNotIn: string[] = [];
    if (restaurantIdsNotInParam) {
      try {
        restaurantIdsNotIn = JSON.parse(restaurantIdsNotInParam);
        if (!Array.isArray(restaurantIdsNotIn)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'restaurant_ids_not_in must be an array' 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid restaurant_ids_not_in format' 
          },
          { status: 400 }
        );
      }
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
              error: 'sort_type must be an array',
            },
            { status: 400 }
          );
        }

        // Validate each sort spec
        for (const spec of sortSpecs) {
          if (!spec.key || typeof spec.key !== 'string') {
            return NextResponse.json(
              {
                success: false,
                error: 'Each sort_type entry must have a "key" field',
              },
              { status: 400 }
            );
          }

          // Default order to "asc" if not provided
          if (!spec.order) {
            spec.order = 'asc';
          }

          if (spec.order !== 'asc' && spec.order !== 'desc') {
            return NextResponse.json(
              {
                success: false,
                error: 'sort_type "order" must be "asc" or "desc"',
              },
              { status: 400 }
            );
          }
        }
      } catch (_error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid sort_type format',
          },
          { status: 400 }
        );
      }
    }

    // If restaurant_id is not provided, we need to filter by distance
    let restaurantIdsInRadius: string[] | null = null;
    
    if (!restaurantId && lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = 10; // 10 mile radius
      
      // Get all restaurants with their coordinates
      const allRestaurants = await db.query<any>(
        'SELECT id, latitude, longitude FROM restaurants WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
      );
      
      // Filter restaurants within radius
      restaurantIdsInRadius = allRestaurants
        .filter((restaurant: any) => {
          const distance = calculateDistance(
            restaurant.latitude,
            restaurant.longitude,
            userLat,
            userLng
          );
          return distance <= maxRadius;
        })
        .map((restaurant: any) => String(restaurant.id));
      
      // If no restaurants in radius, return empty result
      if (restaurantIdsInRadius.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
    }
    
    // Build SQL query
    let query = `
      SELECT DISTINCT
        mi.id,
        mi.restaurant_id,
        mi.category_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image,
        mi.calories,
        mi.rating,
        mi.rating_count,
        mi.popular,
        mi.featured
      FROM menu_items mi
    `;
    
    // Join with menu_categories if filtering by categories
    if (menuCategories.length > 0) {
      query += ' INNER JOIN menu_categories mc ON mi.category_id = mc.id';
    }
    
    query += ' WHERE mi.is_available=1';
    
    const queryParams: any[] = [];

    // Filter by restaurant if provided
    if (restaurantId) {
      query += ' AND mi.restaurant_id = ?';
      queryParams.push(restaurantId);
    } else if (restaurantIdsInRadius) {
      // Filter by restaurants within radius
      const placeholders = restaurantIdsInRadius.map(() => '?').join(',');
      query += ` AND mi.restaurant_id IN (${placeholders})`;
      queryParams.push(...restaurantIdsInRadius);
    }

    // Filter by menu categories if provided
    if (menuCategories.length > 0) {
      const categoryPlaceholders = menuCategories.map(() => '?').join(',');
      query += ` AND mc.name COLLATE NOCASE IN (${categoryPlaceholders})`;
      queryParams.push(...menuCategories);
    }

    // Filter by keywords if provided (match against name only)
    if (keywords.length > 0) {
      // Create OR conditions for each keyword
      const keywordConditions = keywords.map(() => 'LOWER(mi.name) LIKE ?').join(' OR ');
      query += ` AND (${keywordConditions})`;

      // Add each keyword as a parameter with wildcard matching
      keywords.forEach(keyword => {
        queryParams.push(`%${keyword.toLowerCase()}%`);
      });
    }

    // Apply restaurant exclusion filter if provided
    if (restaurantIdsNotIn.length > 0) {
      const excludePlaceholders = restaurantIdsNotIn.map(() => '?').join(',');
      query += ` AND mi.restaurant_id NOT IN (${excludePlaceholders})`;
      queryParams.push(...restaurantIdsNotIn);
    }
    
    // Apply featured filter if provided
    if (featuredParam !== null) {
      const featuredValue = featuredParam.toLowerCase() === 'true' ? 1 : 0;
      query += ` AND mi.featured = ?`;
      queryParams.push(featuredValue);
    }

    const menuItems = await db.query<any>(query, queryParams);

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform to result format
    const results = menuItems.map((item: any) => ({
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
    }));

    // Apply multi-level sorting if sort_type is provided
    if (sortSpecs.length > 0) {
      results.sort((a: any, b: any) => {
        // Apply each sort spec in order
        for (const spec of sortSpecs) {
          const aValue = a[spec.key];
          const bValue = b[spec.key];

          // Handle null/undefined values (put them at the end)
          if (aValue == null && bValue == null) continue;
          if (aValue == null) return 1;
          if (bValue == null) return -1;

          let comparison = 0;

          // Compare based on type
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
          } else {
            // String comparison
            comparison = String(aValue).localeCompare(String(bValue));
          }

          // If values are different, apply order and return
          if (comparison !== 0) {
            return spec.order === 'desc' ? -comparison : comparison;
          }

          // If values are equal, continue to next sort spec
        }

        // Final fallback: item ID (for deterministic results)
        return a.id.localeCompare(b.id);
      });
    }

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
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
