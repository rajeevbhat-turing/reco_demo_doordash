import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils/distance-utils';

/**
 * GET /api/expected-state/get-cheaptest-item
 * 
 * Finds an item based on multiple filters:
 * - options: array of item names to search for
 * - cuisine: restaurant cuisine type
 * - restaurantFilters: filters like "nearest", "with_discounts"
 * - lat/lng: user location for distance calculations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const optionsParam = searchParams.get('options');
    const cuisine = searchParams.get('cuisine');
    const restaurantFiltersParam = searchParams.get('restaurantFilters');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = '10';

    if (!optionsParam) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'options is required' 
        },
        { status: 400 }
      );
    }

    const options: string[] = JSON.parse(optionsParam);
    const restaurantFilters: string[] = restaurantFiltersParam ? JSON.parse(restaurantFiltersParam) : [];

    if (!options || options.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one option is required' 
        },
        { status: 400 }
      );
    }

    // Step 1: Build base query to find restaurants with matching items
    let query = `
      SELECT 
        mi.id as itemId,
        mi.name as itemName,
        mi.price as itemPrice,
        mi.description as itemDescription,
        mi.image as itemImage,
        mi.calories as itemCalories,
        mi.rating as itemRating,
        mi.discount_percentage as itemDiscountPercentage,
        mi.discount_cap as itemDiscountCap,
        r.id as restaurantId,
        r.name as restaurantName,
        r.cuisine as restaurantCuisine,
        r.min_delivery_fee as restaurantMinDeliveryFee,
        r.latitude as restaurantLat,
        r.longitude as restaurantLng,
        r.discount_percentage as restaurantDiscountPercentage,
        r.discount_cap as restaurantDiscountCap,
        r.street as restaurantStreet,
        r.city as restaurantCity,
        r.state as restaurantState,
        r.zip_code as restaurantZipCode
      FROM menu_items mi
      INNER JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE mi.is_available = 1
    `;

    const queryParams: any[] = [];

    // Step 2: Filter by cuisine if provided (check both restaurant cuisine and categories)
    if (cuisine) {
      query += ` AND (
        r.cuisine like ? COLLATE NOCASE 
        OR EXISTS (
          SELECT 1 FROM restaurant_categories rc 
          WHERE rc.restaurant_id = r.id 
          AND rc.category_name like ? COLLATE NOCASE
        )
      )`;
      queryParams.push(`%${cuisine}%`);
      queryParams.push(`%${cuisine}%`);
    }

    // Step 3: Filter by item names (case-insensitive)
    const itemNameConditions = options.map(() => `mi.name like ? COLLATE NOCASE`).join(' OR ');
    query += ` AND (${itemNameConditions})`;
    options.forEach(option => {
      queryParams.push(`%${option}%`);
    });

    const items = await db.query<any>(query, queryParams);

    if (!items || items.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        metadata: {
          reason: 'No items found matching the criteria',
        },
      });
    }

    // Step 4: Calculate distances and filter by radius
    let itemsWithDistance = items;
    
    if (!lat || !lng) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'lat and lng are required' 
        },
        { status: 400 }
      );
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    // Calculate distances for all items
    itemsWithDistance = items.map((item: any) => ({
      ...item,
      distance: calculateDistance(
        item.restaurantLat,
        item.restaurantLng,
        userLat,
        userLng
      ),
    }));

    // Filter out restaurants beyond the radius
    itemsWithDistance = itemsWithDistance.filter((item: any) => item.distance <= maxRadius);

    if (itemsWithDistance.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        metadata: {
          reason: `No items found within ${maxRadius} miles radius`,
        },
      });
    }

    // Step 5: Apply restaurant filters
    let filteredItems = itemsWithDistance;

    if (restaurantFilters.includes('nearest')) {
      // Sort by distance and group by restaurant
      filteredItems.sort((a: any, b: any) => a.distance - b.distance);
      
      // Get the nearest restaurant
      const nearestRestaurantId = filteredItems[0].restaurantId;
      filteredItems = filteredItems.filter((item: any) => item.restaurantId === nearestRestaurantId);
    }

    if (restaurantFilters.includes('with_discounts')) {
      filteredItems = filteredItems.filter((item: any) => 
        item.restaurantDiscountPercentage > 0 || item.itemDiscountPercentage > 0
      );
    }

    if (filteredItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        metadata: {
          reason: 'No items found after applying restaurant filters',
        },
      });
    }

    // Step 6: Apply item filters
    let selectedItem = filteredItems[0];

    // Step 7: Format the response
    const result = {
      item: {
        id: String(selectedItem.itemId),
        name: selectedItem.itemName,
        price: selectedItem.itemPrice,
        effectivePrice: selectedItem.effectivePrice || selectedItem.itemPrice,
        description: selectedItem.itemDescription,
        image: selectedItem.itemImage,
        calories: selectedItem.itemCalories,
        rating: selectedItem.itemRating,
        discountPercentage: selectedItem.itemDiscountPercentage,
        discountCap: selectedItem.itemDiscountCap,
      },
      restaurant: {
        id: String(selectedItem.restaurantId),
        name: selectedItem.restaurantName,
        cuisine: selectedItem.restaurantCuisine,
        minDeliveryFee: selectedItem.restaurantMinDeliveryFee,
        latitude: selectedItem.restaurantLat,
        longitude: selectedItem.restaurantLng,
        discountPercentage: selectedItem.restaurantDiscountPercentage,
        discountCap: selectedItem.restaurantDiscountCap,
        address: {
          street: selectedItem.restaurantStreet,
          city: selectedItem.restaurantCity,
          state: selectedItem.restaurantState,
          zipCode: selectedItem.restaurantZipCode,
        },
        distance: selectedItem.distance || null,
      }
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('❌ Get item error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

