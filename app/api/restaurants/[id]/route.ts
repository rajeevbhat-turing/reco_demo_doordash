import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDeliveryTime, checkIfOpen, formatHours } from '@/lib/utils/restaurant-utils';
import { getImageWithFallback } from '@/constants/image-placeholders';
import { getServerCurrentHour } from '@/lib/utils/time-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Get user's location from query params for distance calculation
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    // Fetch restaurant with distance calculation if lat/lng provided
    const restaurantQuery =
      lat && lng
        ? `SELECT 
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
        WHERE r.id = ?`
        : `SELECT 
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
          0 AS distance,
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
        WHERE r.id = ?`;

    const params_array = lat && lng ? [lat, lng, lat, restaurantId] : [restaurantId];

    const restaurantRaw = await db.queryOne<any>(restaurantQuery, params_array);

    if (!restaurantRaw) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Transform data to match Restaurant interface
    const distance = parseFloat(restaurantRaw.distance || '0');
    const deliveryTime = calculateDeliveryTime(distance);
    // Get time from bootstrap cookie if set (for testing)
    const cookieHeader = request.headers.get('cookie');
    const currentHour = getServerCurrentHour(cookieHeader);
    const isOpen = checkIfOpen(restaurantRaw.opening_hour, restaurantRaw.closing_hour, currentHour);

    const restaurant = {
      id: String(restaurantRaw.id),
      name: restaurantRaw.name,
      logo: getImageWithFallback(restaurantRaw.logo, 'logo'),
      banner: getImageWithFallback(restaurantRaw.banner, 'image'),
      detailsBanner: restaurantRaw.details_banner
        ? getImageWithFallback(restaurantRaw.details_banner, 'image')
        : undefined,
      rating: restaurantRaw.avg_rating ? parseFloat(restaurantRaw.avg_rating).toFixed(1) : null,
      reviews: restaurantRaw.total_rating_count
        ? `${restaurantRaw.total_rating_count}+ ratings`
        : null,
      distance: distance > 0 ? `${distance.toFixed(1)} mi` : 'Distance unavailable',
      time: deliveryTime,
      deliveryFee:
        restaurantRaw.is_free_delivery === 1
          ? '$0 delivery fee'
          : `$${(restaurantRaw.min_delivery_fee / 100).toFixed(2)} delivery fee`,
      isFreeDelivery: restaurantRaw.is_free_delivery === 1,
      minDeliveryFee: restaurantRaw.min_delivery_fee,
      priceRange: '$'.repeat(restaurantRaw.price_range),
      cuisine: restaurantRaw.cuisine,
      dashPass: restaurantRaw.dash_pass === 1,
      isOpen: isOpen,
      openingHours: formatHours(restaurantRaw.opening_hour, restaurantRaw.closing_hour),
      openingHour: restaurantRaw.opening_hour,
      closingHour: restaurantRaw.closing_hour,
      street: restaurantRaw.street,
      city: restaurantRaw.city,
      state: restaurantRaw.state,
      zipCode: restaurantRaw.zip_code,
      lat: restaurantRaw.latitude,
      lng: restaurantRaw.longitude,
      phone: restaurantRaw.phone,
      discount: restaurantRaw.discount_percentage
        ? `${restaurantRaw.discount_percentage}% off`
        : undefined,
      featured: restaurantRaw.featured === 1,
      new: restaurantRaw.new_flag === 1,
      categories: restaurantRaw.categories_str ? restaurantRaw.categories_str.split(',') : [],
      section: restaurantRaw.section,
    };

    console.log(`✅ Fetched restaurant ${restaurantId}: ${restaurant.name}`);

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error: any) {
    console.error('❌ Error fetching restaurant:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
