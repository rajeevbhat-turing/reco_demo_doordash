import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDeliveryTime, checkIfOpen, formatHours } from '@/lib/utils/restaurant-utils';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/restaurants
 * 
 * Fetches restaurants within a radius of user's location
 * Calculates distance using Haversine formula
 * 
 * Query params:
 * - lat: User's latitude (required)
 * - lng: User's longitude (required)
 * - radius: Search radius in miles (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10');

    // Validate coordinates
    if (!lat || !lng) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Latitude and longitude are required' 
        },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid coordinates' 
        },
        { status: 400 }
      );
    }

    // Query restaurants with distance calculation using Haversine formula
    // Wrap in subquery to filter by calculated distance
    const restaurants = await db.query<any>(
      `SELECT * FROM (
        SELECT 
          r.id,
          r.name,
          r.logo,
          r.banner,
          r.details_banner,
          r.is_free_delivery,
          r.min_delivery_fee,
          r.price_range,
          r.cuisine,
          r.dash_pass,
          r.opening_hour,
          r.closing_hour,
          r.street,
          r.city,
          r.state,
          r.zip_code,
          r.latitude,
          r.longitude,
          r.phone,
          r.discount_percentage,
          r.discount_cap,
          r.featured,
          r.new_flag,
          r.section,
          (
            3959 * acos(
              cos(radians(?)) * cos(radians(r.latitude)) * 
              cos(radians(r.longitude) - radians(?)) + 
              sin(radians(?)) * sin(radians(r.latitude))
            )
          ) AS distance,
          -- Get categories as comma-separated string
          (
            SELECT GROUP_CONCAT(rc.category_name, ',')
            FROM restaurant_categories rc
            WHERE rc.restaurant_id = r.id
          ) AS categories_str,
          -- Get average rating from user reviews (approved only)
          (
            SELECT AVG(ur.rating)
            FROM user_reviews ur
            WHERE ur.store_id = r.id 
              AND ur.approval_status = 'approved'
          ) AS avg_rating,
          -- Get total rating count from user reviews (approved only)
          (
            SELECT COUNT(*)
            FROM user_reviews ur
            WHERE ur.store_id = r.id 
              AND ur.approval_status = 'approved'
          ) AS total_rating_count
        FROM restaurants r
      ) AS restaurants_with_distance
      WHERE distance <= ?
      ORDER BY distance ASC`,
      [lat, lng, lat, radius]
    );

    // Transform data to match Restaurant interface
    const transformedRestaurants = restaurants.map(r => {
      const distance = parseFloat(r.distance);
      const deliveryTime = calculateDeliveryTime(distance);
      const currentHour = new Date().getHours();
      const isOpen = checkIfOpen(r.opening_hour, r.closing_hour, currentHour);
      
      return {
        id: String(r.id),
        name: r.name,
        logo: getImageWithFallback(r.logo, 'logo'),
        banner: getImageWithFallback(r.banner, 'image'),
        detailsBanner: r.details_banner ? getImageWithFallback(r.details_banner, 'image') : undefined,
        rating: r.avg_rating ? parseFloat(r.avg_rating.toFixed(1)) : null,
        reviews: r.total_rating_count ? `${r.total_rating_count}+ ratings` : null,
        distance: `${distance.toFixed(1)} mi`,
        time: deliveryTime,
        deliveryFee: r.is_free_delivery === 1 
          ? '$0.00' 
          : `$${(r.min_delivery_fee / 100).toFixed(2)}`,
        priceRange: '$'.repeat(r.price_range),
        cuisine: r.cuisine,
        dashPass: r.dash_pass === 1,
        isOpen: isOpen,
        openingHours: formatHours(r.opening_hour, r.closing_hour),
        street: r.street,
        city: r.city,
        state: r.state,
        zipCode: r.zip_code,
        lat: r.latitude,
        lng: r.longitude,
        phone: r.phone,
        discount: r.discount_percentage 
          ? `${r.discount_percentage}% off${r.discount_cap ? `, up to $${(r.discount_cap / 100).toFixed(2)}` : ''}` 
          : undefined,
        featured: r.featured === 1,
        new: r.new_flag === 1,
        categories: r.categories_str ? r.categories_str.split(',') : [],
        section: r.section || undefined,
      };
    });

    console.log(`✅ Found ${transformedRestaurants.length} restaurants within ${radius} miles of (${lat}, ${lng})`);

    return NextResponse.json({
      success: true,
      data: transformedRestaurants,
      meta: {
        count: transformedRestaurants.length,
        lat,
        lng,
        radius,
      },
    });

  } catch (error) {
    console.error('❌ Error fetching restaurants:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while fetching restaurants' 
      },
      { status: 500 }
    );
  }
}




