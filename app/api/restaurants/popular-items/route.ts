import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';
import { calculateDistance } from '@/lib/utils/distance-utils';

/**
 * GET /api/restaurants/popular-items
 * 
 * Fetches popular/featured menu items across all restaurants in a single query.
 * This is much more efficient than making N calls to individual restaurant menus.
 * 
 * Query Parameters:
 * - lat: User's latitude (optional, for distance filtering)
 * - lng: User's longitude (optional, for distance filtering)
 * - radius: Max radius in miles (default: 10)
 * - limit: Max number of items to return (default: 20)
 * - search: Search query to filter items by name (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search');
    
    const radius = radiusParam ? parseFloat(radiusParam) : 10;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Get restaurant IDs within radius if coordinates provided
    let restaurantIdsInRadius: string[] | null = null;
    
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      // Get all restaurants with their coordinates
      const allRestaurants = await db.query<any>(
        'SELECT id, name, logo, latitude, longitude FROM restaurants WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
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
          return distance <= radius;
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

    // Build the query to fetch popular/featured items with restaurant info
    let query = `
      SELECT 
        mi.id,
        mi.restaurant_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image,
        mi.calories,
        mi.rating,
        mi.rating_count,
        mi.popular,
        mi.featured,
        mi.category_id,
        mc.name AS category_name,
        r.name AS restaurant_name,
        r.logo AS restaurant_logo
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.is_available = 1
    `;
    
    const queryParams: any[] = [];

    // Filter by popular or featured
    if (search && search.trim()) {
      // If searching, filter by search term
      query += ' AND LOWER(mi.name) LIKE ?';
      queryParams.push(`%${search.toLowerCase()}%`);
    } else {
      // If not searching, show popular/featured items
      query += ' AND (mi.popular = 1 OR mi.featured = 1)';
    }

    // Filter by restaurants within radius
    if (restaurantIdsInRadius && restaurantIdsInRadius.length > 0) {
      const placeholders = restaurantIdsInRadius.map(() => '?').join(',');
      query += ` AND mi.restaurant_id IN (${placeholders})`;
      queryParams.push(...restaurantIdsInRadius);
    }

    // Order by popularity score (rating * log(rating_count + 1)) and limit
    query += `
      ORDER BY 
        CASE WHEN mi.featured = 1 THEN 0 ELSE 1 END,
        CASE WHEN mi.popular = 1 THEN 0 ELSE 1 END,
        (COALESCE(mi.rating, 0) * (1 + LOG(COALESCE(mi.rating_count, 0) + 1))) DESC
      LIMIT ?
    `;
    queryParams.push(limit);

    const menuItems = await db.query<any>(query, queryParams);

    // Transform the results
    const items = menuItems.map((item: any) => {
      const priceInDollars = (item.price / 100).toFixed(2);
      
      return {
        id: String(item.id),
        restaurant_id: String(item.restaurant_id),
        restaurantId: String(item.restaurant_id),
        restaurantName: item.restaurant_name,
        restaurantLogo: item.restaurant_logo,
        name: item.name,
        description: item.description || null,
        price: `$${priceInDollars}`,
        image: getImageWithFallback(item.image, 'image'),
        category: item.category_name,
        categoryId: String(item.category_id),
        category_name: item.category_name,
        calories: item.calories ? String(item.calories) : undefined,
        rating: item.rating || null,
        ratingCount: item.rating_count || null,
        popular: item.popular === 1,
        featured: item.featured === 1,
      };
    });

    console.log(`✅ Fetched ${items.length} popular menu items`);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('❌ Error fetching popular items:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch popular items' },
      { status: 500 }
    );
  }
}

