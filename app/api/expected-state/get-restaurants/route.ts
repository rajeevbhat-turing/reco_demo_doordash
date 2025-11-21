import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';

/**
 * GET /api/expected-state/get-restaurants
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 * - sort_type: Sorting type (e.g., "nearest")
 * - limit: Number of restaurants to return (optional, returns all if not provided)
 * - cuisine: Filter by cuisine type
 * 
 * Finds restaurants with optional filtering and sorting:
 * 1. Fetches all restaurants from database
 * 2. Applies cuisine filter if provided
 * 3. Calculates distance for all restaurants
 * 4. Filters restaurants within 10 mile radius
 * 5. Sorts by distance if sort_type is "nearest"
 * 6. Returns top N restaurants based on limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const sortType = searchParams.get('sort_type');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const cuisineFilter = searchParams.get('cuisine');
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

    // Build SQL query with optional cuisine filter
    let query = `
      SELECT 
        id,
        name,
        logo,
        cuisine,
        min_delivery_fee,
        price_range,
        dash_pass,
        street,
        city,
        state,
        zip_code,
        latitude,
        longitude
      FROM restaurants
    `;
    
    const queryParams: any[] = [];
    
    // Apply cuisine filter if provided
    if (cuisineFilter) {
      query += ' WHERE cuisine like ?';
      queryParams.push(`%${cuisineFilter}%`);
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

    // Sort by distance if sort_type is "nearest"
    if (sortType === 'nearest') {
      results.sort((a: any, b: any) => a.distance - b.distance);
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

