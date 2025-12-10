import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';

/**
 * GET /api/expected-state/get-cheapest-restaurant-by-frequent-cuisine?userId=123&lat=37.7749&lng=-122.4194&radius=10
 *
 * Finds the restaurant with the lowest delivery fee for user's most frequent cuisine:
 * 1. Gets user's previous orders
 * 2. Finds the most frequently ordered cuisine
 * 3. Gets the lowest delivery fee from orders of that cuisine
 * 4. Returns the restaurant for that cuisine with the lowest delivery fee (within radius)
 * 5. If no cheaper restaurant found, returns the restaurant from previous orders with lowest fee
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10'; // Default 10 miles

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'lat and lng are required',
        },
        { status: 400 }
      );
    }

    // Create user address object from parameters
    const userAddress = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const maxRadius = parseFloat(radius);

    // Step 1: Get all orders for the user with restaurant info
    const orders = await db.query<any>(
      `SELECT 
        o.id,
        o.store_id,
        o.delivery_fee,
        r.cuisine
      FROM orders o
      LEFT JOIN restaurants r ON o.store_id = r.id
      WHERE o.user_id = ? AND r.cuisine IS NOT NULL`,
      [userId]
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        metadata: {
          reason: 'No previous orders found',
          mostFrequentCuisine: null,
          lowestDeliveryFee: null,
        },
      });
    }

    // Step 2: Find the most frequently ordered cuisine
    const cuisineCount: Record<string, number> = {};
    for (const order of orders) {
      const cuisine = order.cuisine;
      cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
    }

    const mostFrequentCuisine = Object.entries(cuisineCount).sort(([, a], [, b]) => b - a)[0][0];

    // Step 3: Find the lowest delivery fee from orders of that cuisine
    const cuisineOrders = orders.filter(order => order.cuisine === mostFrequentCuisine);
    const lowestDeliveryFee = Math.min(...cuisineOrders.map(order => order.delivery_fee));

    // Find the restaurant with the lowest delivery fee from previous orders
    const orderWithLowestFee = cuisineOrders.find(
      order => order.delivery_fee === lowestDeliveryFee
    );
    const restaurantIdWithLowestFee = orderWithLowestFee?.store_id;

    // Step 4: Get all restaurants of that cuisine
    const allRestaurants = await db.query<any>(
      `SELECT 
        id,
        name,
        logo,
        cuisine,
        min_delivery_fee,
        price_range,
        dash_pass,
        is_free_delivery,
        latitude,
        longitude,
        street,
        city,
        state,
        zip_code
      FROM restaurants
      WHERE cuisine = ?`,
      [mostFrequentCuisine]
    );

    // Step 4.5: Filter restaurants by distance (within radius)
    const restaurantsWithinRadius = allRestaurants.filter(restaurant => {
      const distance = calculateDistance(
        restaurant.latitude,
        restaurant.longitude,
        userAddress.lat,
        userAddress.lng
      );
      return distance <= maxRadius;
    });

    // Step 5: Find restaurant with lowest min_delivery_fee (cheaper than historical lowest)
    const cheaperRestaurants = restaurantsWithinRadius
      .filter(r => r.min_delivery_fee < lowestDeliveryFee)
      .sort((a, b) => a.min_delivery_fee - b.min_delivery_fee);

    let selectedRestaurant = cheaperRestaurants[0];

    // If no cheaper restaurants found, return the restaurant with lowest delivery fee from previous orders
    if (!selectedRestaurant && restaurantIdWithLowestFee) {
      selectedRestaurant = allRestaurants.find(r => r.id === restaurantIdWithLowestFee);
    }

    if (!selectedRestaurant) {
      return NextResponse.json({
        success: true,
        data: null,
        metadata: {
          reason: 'No restaurant found',
          mostFrequentCuisine,
          lowestDeliveryFee,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        restaurant: {
          id: String(selectedRestaurant.id),
          name: selectedRestaurant.name,
          cuisine: selectedRestaurant.cuisine,
          minDeliveryFee: selectedRestaurant.min_delivery_fee,
        },
      },
    });
  } catch (error) {
    console.error('❌ Get cheapest restaurant by frequent cuisine error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
