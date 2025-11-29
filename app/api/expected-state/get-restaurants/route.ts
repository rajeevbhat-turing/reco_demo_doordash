import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';

interface SortSpec {
  key: string;
  order?: "asc" | "desc";
}

/**
 * GET /api/expected-state/get-restaurants
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 * - name: Restaurant name to filter by (optional, partial match, case-insensitive)
 * - item_keyword: Menu item keyword to filter by (optional, finds restaurants with matching items)
 * - sort_type: JSON array of sort specifications (optional, defaults to distance asc)
 *   - Each spec: { key: string, order?: "asc" | "desc" }
 *   - Example: [{ "key": "distance", "order": "asc" }, { "key": "minDeliveryFee", "order": "asc" }]
 *   - Sorts by first spec, then uses subsequent specs as tiebreakers
 *   - order defaults to "asc" if not provided
 * - limit: Number of restaurants to return (optional, returns all if not provided)
 * - cuisines: JSON array of cuisine types to filter by (optional, matches any)
 * - categories: JSON array of categories to filter by (optional, matches any)
 * - prices: JSON array of price ranges (optional): "$", "$$", "$$$", "$$$$"
 * - dashpass: Boolean to filter by DashPass availability (optional)
 * - restaurant_ids_not_in: JSON array of restaurant IDs to exclude (optional)
 * 
 * Finds restaurants with optional filtering and sorting:
 * 1. Fetches all restaurants from database
 * 2. Applies filters if provided (name, item_keyword, cuisines, categories, prices, dashpass, exclusions)
 * 3. Calculates distance for all restaurants
 * 4. Filters restaurants within 10 mile radius
 * 5. Applies multi-level sorting based on sort_type array (defaults to distance asc)
 * 6. Returns top N restaurants based on limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const name = searchParams.get('name');
    const itemKeyword = searchParams.get('item_keyword');
    const sortTypeParam = searchParams.get('sort_type');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const cuisinesParam = searchParams.get('cuisines');
    const categoriesParam = searchParams.get('categories');
    const pricesParam = searchParams.get('prices');
    const dashpassParam = searchParams.get('dashpass');
    const restaurantIdsNotInParam = searchParams.get('restaurant_ids_not_in');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        },
        { status: 400 }
      );
    }

    // lat and lng are always required for radius filtering
    if (!lat || !lng) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'lat and lng are required' 
        },
        { status: 400 }
      );
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
        
        // Validate each sort spec
        for (const spec of sortSpecs) {
          if (!spec.key || typeof spec.key !== 'string') {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Each sort_type entry must have a "key" field' 
              },
              { status: 400 }
            );
          }
          
          // Default order to "asc" if not provided
          if (!spec.order) {
            spec.order = "asc";
          }
          
          if (spec.order !== "asc" && spec.order !== "desc") {
            return NextResponse.json(
              { 
                success: false, 
                error: 'sort_type "order" must be "asc" or "desc"' 
              },
              { status: 400 }
            );
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

    // Parse filter arrays
    let cuisines: string[] = [];
    if (cuisinesParam) {
      try {
        cuisines = JSON.parse(cuisinesParam);
        if (!Array.isArray(cuisines)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'cuisines must be an array' 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid cuisines format' 
          },
          { status: 400 }
        );
      }
    }

    let categories: string[] = [];
    if (categoriesParam) {
      try {
        categories = JSON.parse(categoriesParam);
        if (!Array.isArray(categories)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'categories must be an array' 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid categories format' 
          },
          { status: 400 }
        );
      }
    }

    let prices: string[] = [];
    let priceRanges: number[] = [];
    if (pricesParam) {
      try {
        prices = JSON.parse(pricesParam);
        if (!Array.isArray(prices)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'prices must be an array' 
            },
            { status: 400 }
          );
        }
        
        // Convert price symbols to numeric ranges
        const priceMap: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
        priceRanges = prices.map(p => priceMap[p]).filter(Boolean);
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid prices format' 
          },
          { status: 400 }
        );
      }
    }

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

    // Build SQL query with optional filters
    let query = `
      SELECT DISTINCT
        r.id,
        r.name,
        r.logo,
        r.cuisine,
        r.min_delivery_fee,
        r.price_range,
        r.dash_pass,
        r.street,
        r.city,
        r.state,
        r.zip_code,
        r.latitude,
        r.longitude
      FROM restaurants r
    `;
    
    const queryParams: any[] = [];
    const whereClauses: string[] = [];
    
    // Apply name filter if provided
    if (name) {
      whereClauses.push('r.name LIKE ?');
      queryParams.push(`%${name}%`);
    }
    
    // Apply item keyword filter if provided
    if (itemKeyword) {
      query += ' INNER JOIN menu_items mi ON r.id = mi.restaurant_id';
      whereClauses.push('LOWER(mi.name) LIKE ?');
      queryParams.push(`%${itemKeyword.toLowerCase()}%`);
    }
    
    // Apply cuisines filter if provided
    if (cuisines.length > 0) {
      const cuisineConditions = cuisines.map(() => 'r.cuisine LIKE ?').join(' OR ');
      whereClauses.push(`(${cuisineConditions})`);
      cuisines.forEach(cuisine => {
        queryParams.push(`%${cuisine}%`);
      });
    }
    
    // Apply categories filter if provided
    if (categories.length > 0) {
      query += ' INNER JOIN restaurant_categories rc ON r.id = rc.restaurant_id';
      const categoryPlaceholders = categories.map(() => '?').join(',');
      whereClauses.push(`rc.category_name IN (${categoryPlaceholders})`);
      queryParams.push(...categories);
    }
    
    // Apply price ranges filter if provided
    if (priceRanges.length > 0) {
      const pricePlaceholders = priceRanges.map(() => '?').join(',');
      whereClauses.push(`r.price_range IN (${pricePlaceholders})`);
      queryParams.push(...priceRanges);
    }
    
    // Apply DashPass filter if provided
    if (dashpassParam !== null) {
      const dashpassValue = dashpassParam === 'true' ? 1 : 0;
      whereClauses.push('r.dash_pass = ?');
      queryParams.push(dashpassValue);
    }
    
    // Apply restaurant exclusion filter if provided
    if (restaurantIdsNotIn.length > 0) {
      const excludePlaceholders = restaurantIdsNotIn.map(() => '?').join(',');
      whereClauses.push(`r.id NOT IN (${excludePlaceholders})`);
      queryParams.push(...restaurantIdsNotIn);
    }
    
    // Add WHERE clause if we have any conditions
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const restaurants = await db.query<any>(query, queryParams);

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const userLat = parseFloat(lat!);
    const userLng = parseFloat(lng!);
    const maxRadius = 10; // 10 mile radius

    // Transform to result format and calculate distance for all restaurants
    let results = restaurants.map((restaurant: any) => {
      const distance = calculateDistance(
        restaurant.latitude,
        restaurant.longitude,
        userLat,
        userLng
      );
      
      return {
        id: String(restaurant.id),
        name: restaurant.name,
        logo: restaurant.logo,
        cuisine: restaurant.cuisine,
        minDeliveryFee: restaurant.min_delivery_fee,
        priceRange: restaurant.price_range,
        dashPass: restaurant.dash_pass === 1,
        address: {
          street: restaurant.street,
          city: restaurant.city,
          state: restaurant.state,
          zipCode: restaurant.zip_code,
        },
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
      };
    });

    // Filter restaurants within 10 mile radius
    results = results.filter((restaurant: any) => restaurant.distance <= maxRadius);

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
            comparison = aValue === bValue ? 0 : (aValue ? 1 : -1);
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
        
        // Final fallback: restaurant ID (for deterministic results)
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
    console.error('❌ Get restaurants error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

