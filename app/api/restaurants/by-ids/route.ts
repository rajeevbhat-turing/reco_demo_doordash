import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDeliveryTime, checkIfOpen, formatHours } from '@/lib/utils/restaurant-utils';
import { getImageWithFallback } from '@/constants/image-placeholders';
import { calculateDistance } from '@/lib/utils/distance-utils';

/**
 * GET /api/restaurants/by-ids
 *
 * Fetches restaurants by their IDs
 *
 * Query params:
 * - ids: Comma-separated list of restaurant IDs (required)
 * - lat: User's latitude (optional, for distance calculation)
 * - lng: User's longitude (optional, for distance calculation)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const idsParam = searchParams.get('ids');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;

    if (!idsParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Restaurant IDs are required',
        },
        { status: 400 }
      );
    }

    // Parse comma-separated IDs
    const ids = idsParam.split(',').map(id => id.trim()).filter(id => id);

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Build placeholders for SQL IN clause
    const placeholders = ids.map(() => '?').join(',');

    // Query restaurants by IDs
    const restaurants = await db.query<any>(
      `SELECT 
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
      WHERE r.id IN (${placeholders})`,
      ids
    );

    // Transform data to match Restaurant interface
    const transformedRestaurants = restaurants.map(r => {
      // Calculate distance if user coordinates provided
      let distance: number | null = null;
      let distanceStr = '';
      
      if (lat !== null && lng !== null && r.latitude && r.longitude) {
        distance = calculateDistance(r.latitude, r.longitude, lat, lng);
        distanceStr = `${distance.toFixed(1)} mi`;
      }

      const deliveryTime = distance !== null ? calculateDeliveryTime(distance) : '25-35 min';
      const currentHour = new Date().getHours();
      const isOpen = checkIfOpen(r.opening_hour, r.closing_hour, currentHour);

      // Check if restaurant is out of delivery radius (10 miles)
      const isOutOfRadius = distance !== null && distance > 10;

      return {
        id: String(r.id),
        name: r.name,
        logo: getImageWithFallback(r.logo, 'logo'),
        banner: getImageWithFallback(r.banner, 'image'),
        detailsBanner: r.details_banner
          ? getImageWithFallback(r.details_banner, 'image')
          : undefined,
        rating: r.avg_rating ? parseFloat(r.avg_rating.toFixed(1)) : null,
        reviews: r.total_rating_count ? `${r.total_rating_count}+` : null,
        distance: distanceStr,
        time: deliveryTime,
        deliveryFee:
          r.is_free_delivery === 1
            ? '$0 delivery fee'
            : `$${(r.min_delivery_fee / 100).toFixed(2)} delivery fee`,
        isFreeDelivery: r.is_free_delivery === 1,
        minDeliveryFee: r.min_delivery_fee,
        priceRange: '$'.repeat(r.price_range),
        cuisine: r.cuisine,
        dashPass: r.dash_pass === 1,
        isOpen: isOpen,
        openingHours: formatHours(r.opening_hour, r.closing_hour),
        openingHour: r.opening_hour,
        closingHour: r.closing_hour,
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
        isOutOfRadius,
      };
    });

    // Preserve order of input IDs
    const orderedRestaurants = ids
      .map(id => transformedRestaurants.find(r => r.id === id))
      .filter(Boolean);

    console.log(`✅ Found ${orderedRestaurants.length} restaurants by IDs`);

    return NextResponse.json({
      success: true,
      data: orderedRestaurants,
    });
  } catch (error) {
    console.error('❌ Error fetching restaurants by IDs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching restaurants',
      },
      { status: 500 }
    );
  }
}

