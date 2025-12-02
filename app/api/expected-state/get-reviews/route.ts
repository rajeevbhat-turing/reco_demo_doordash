import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/expected-state/get-reviews
 * 
 * Query Parameters:
 * - email: User email (optional if restaurant_id provided)
 * - restaurant_id: Filter by restaurant ID (optional if email provided)
 * - has_liked_items: Filter by whether review has liked items (optional, "true" or "false")
 * - sort_type: JSON array of sort specifications (optional)
 *   Example: [{ "key": "rating", "order": "desc" }, { "key": "timestamp", "order": "asc" }]
 * - limit: Number of reviews to return (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const restaurantId = searchParams.get('restaurant_id');
    const approvalStatus = searchParams.get('approval_status');
    const hasLikedItemsParam = searchParams.get('has_liked_items');
    const sortTypeParam = searchParams.get('sort_type');
    const limit = searchParams.get('limit');

    // Email is only required if restaurant_id is not provided
    if (!email && !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Either email or restaurant_id is required' },
        { status: 400 }
      );
    }

    // Parse sort_type or use default
    let sortSpecs: Array<{ key: string; order?: string }> = [{ key: 'timestamp', order: 'desc' }];
    if (sortTypeParam) {
      try {
        sortSpecs = JSON.parse(sortTypeParam);
        if (!Array.isArray(sortSpecs)) {
          return NextResponse.json(
            { success: false, error: 'sort_type must be an array' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid sort_type JSON' },
          { status: 400 }
        );
      }
    }

    // Validate sort fields
    const validSortFields = ['timestamp', 'rating', 'id', 'helpfulCount'];
    for (const spec of sortSpecs) {
      if (!validSortFields.includes(spec.key)) {
        return NextResponse.json(
          { success: false, error: `Invalid sort field: ${spec.key}` },
          { status: 400 }
        );
      }
      if (spec.order && !['asc', 'desc'].includes(spec.order.toLowerCase())) {
        return NextResponse.json(
          { success: false, error: `Invalid sort order: ${spec.order}` },
          { status: 400 }
        );
      }
    }

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    // If email is provided, filter by user
    if (email) {
      const userResult = await db.query<any>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (userResult.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          meta: {
            message: 'User not found',
            email,
          },
        });
      }

      const userId = userResult[0].id;
      conditions.push('ur.user_id = ?');
      params.push(userId);
    }

    // If restaurant_id is provided, filter by restaurant
    if (restaurantId) {
      conditions.push('ur.store_id = ?');
      params.push(restaurantId);
    }

    // Filter by approval status (defaults to "approved" on client side)
    if (approvalStatus) {
      conditions.push('ur.approval_status = ?');
      params.push(approvalStatus);
    }

    // If has_liked_items is provided, filter by reviews with/without liked items
    if (hasLikedItemsParam !== null) {
      const hasLikedItems = hasLikedItemsParam.toLowerCase() === 'true';
      if (hasLikedItems) {
        // Only reviews that have liked items (and the order items still exist)
        conditions.push('EXISTS (SELECT 1 FROM review_liked_items rli JOIN order_items oi ON rli.order_item_id = oi.id WHERE rli.review_id = ur.id)');
      } else {
        // Only reviews that don't have liked items
        conditions.push('NOT EXISTS (SELECT 1 FROM review_liked_items rli JOIN order_items oi ON rli.order_item_id = oi.id WHERE rli.review_id = ur.id)');
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';
    
    // Build ORDER BY clause from sort_type
    // For helpfulCount, we need to use a subquery since it's calculated
    const orderByClauses = sortSpecs.map(spec => {
      const order = (spec.order || 'asc').toUpperCase();
      if (spec.key === 'helpfulCount') {
        return `(SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = ur.id) ${order}`;
      }
      return `ur.${spec.key} ${order}`;
    });
    const orderByClause = `ORDER BY ${orderByClauses.join(', ')}`;

    const fullQuery = `SELECT 
        ur.id,
        ur.store_id,
        ur.store_category,
        ur.user_id,
        ur.rating,
        ur.content,
        ur.timestamp,
        ur.order_id,
        ur.approval_status,
        u.name AS user_name,
        u.email AS user_email,
        u.avatar AS user_avatar,
        r.name AS store_name,
        r.logo AS store_logo,
        (SELECT COUNT(*) FROM review_helpful rh WHERE rh.review_id = ur.id) AS helpful_count
      FROM user_reviews ur
      JOIN users u ON ur.user_id = u.id
      JOIN restaurants r ON ur.store_id = r.id
      ${whereClause}
      ${orderByClause}
      ${limitClause}`;

    // Fetch reviews with user and store information
    const reviews = await db.query<any>(fullQuery, params);

    if (reviews.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          email,
        },
      });
    }

    // Get all review IDs
    const reviewIds = reviews.map((r: any) => r.id);

    // Fetch photos for all reviews
    const photos = await db.query<any>(
      `SELECT review_id, url, sort_order
       FROM review_photos
       WHERE review_id IN (${reviewIds.map(() => '?').join(',')})
       ORDER BY review_id, sort_order`,
      reviewIds
    );

    // Fetch helpful ratings for all reviews
    const helpfulRatings = await db.query<any>(
      `SELECT review_id, user_id
       FROM review_helpful
       WHERE review_id IN (${reviewIds.map(() => '?').join(',')})`,
      reviewIds
    );

    // Fetch liked items for all reviews
    const likedItems = await db.query<any>(
      `SELECT 
        rli.review_id,
        oi.id AS order_item_id,
        oi.menu_item_id,
        mi.name AS item_name,
        mi.image AS item_image
      FROM review_liked_items rli
      JOIN order_items oi ON rli.order_item_id = oi.id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE rli.review_id IN (${reviewIds.map(() => '?').join(',')})`,
      reviewIds
    );

    // Group photos by review_id
    const photosByReview = new Map<number, string[]>();
    photos.forEach((photo: any) => {
      if (!photosByReview.has(photo.review_id)) {
        photosByReview.set(photo.review_id, []);
      }
      photosByReview.get(photo.review_id)!.push(photo.url);
    });

    // Group helpful ratings by review_id
    const helpfulByReview = new Map<number, string[]>();
    helpfulRatings.forEach((helpful: any) => {
      if (!helpfulByReview.has(helpful.review_id)) {
        helpfulByReview.set(helpful.review_id, []);
      }
      helpfulByReview.get(helpful.review_id)!.push(String(helpful.user_id));
    });

    // Group liked items by review_id
    const likedItemsByReview = new Map<number, any[]>();
    likedItems.forEach((item: any) => {
      if (!likedItemsByReview.has(item.review_id)) {
        likedItemsByReview.set(item.review_id, []);
      }
      likedItemsByReview.get(item.review_id)!.push({
        orderItemId: String(item.order_item_id),
        menuItemId: String(item.menu_item_id),
        itemName: item.item_name,
        itemImage: getImageWithFallback(item.item_image, 'image'),
      });
    });

    // Transform reviews to match the expected format
    const transformedReviews = reviews.map((review: any) => {
      const reviewPhotos = photosByReview.get(review.id) || [];
      const helpfulUsers = helpfulByReview.get(review.id) || [];
      const reviewLikedItems = likedItemsByReview.get(review.id) || [];

      const transformed = {
        id: String(review.id),
        storeId: String(review.store_id),
        storeName: review.store_name,
        storeLogo: getImageWithFallback(review.store_logo, 'logo'),
        storeCategory: review.store_category,
        userId: String(review.user_id),
        userName: review.user_name,
        userEmail: review.user_email,
        userAvatar: review.user_avatar ? getImageWithFallback(review.user_avatar, 'user') : null,
        rating: review.rating,
        content: review.content,
        timestamp: review.timestamp,
        orderId: review.order_id ? String(review.order_id) : null,
        approvalStatus: review.approval_status,
        photos: reviewPhotos,
        helpfulCount: helpfulUsers.length,
        ratedHelpfulBy: helpfulUsers,
        likedItems: reviewLikedItems,
      };
      
      console.log(`📝 Review ${review.id}: has ${reviewLikedItems.length} liked items`);
      return transformed;
    });

    console.log(`✅ Fetched ${transformedReviews.length} reviews for user ${email}`);

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      meta: {
        count: transformedReviews.length,
        email,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    );
  }
}

