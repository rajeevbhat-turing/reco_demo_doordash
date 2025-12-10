import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/reviews
 *
 * Fetches reviews with optional filters
 *
 * Query params:
 * - storeId: Filter by store ID (optional)
 * - userId: Filter by user ID (optional)
 * - approvalStatus: Filter by approval status ('approved', 'rejected', 'pending') (optional)
 * - limit: Limit number of results (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const storeId = searchParams.get('storeId');
    const userId = searchParams.get('userId');
    const approvalStatus = searchParams.get('approvalStatus');
    const limit = searchParams.get('limit');

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (storeId) {
      conditions.push('ur.store_id = ?');
      params.push(storeId);
    }

    if (userId) {
      conditions.push('ur.user_id = ?');
      params.push(userId);
    }

    if (approvalStatus) {
      conditions.push('ur.approval_status = ?');
      params.push(approvalStatus);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';

    // Fetch reviews with user and store information
    const reviews = await db.query<any>(
      `SELECT 
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
        r.logo AS store_logo
      FROM user_reviews ur
      JOIN users u ON ur.user_id = u.id
      JOIN restaurants r ON ur.store_id = r.id
      ${whereClause}
      ORDER BY ur.timestamp DESC
      ${limitClause}`,
      params
    );

    if (reviews.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
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
        mi.image AS item_image,
        mi.restaurant_id
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
      const validUrl = getImageWithFallback(photo.url, 'image');
      photosByReview.get(photo.review_id)!.push(validUrl);
    });

    // Group helpful ratings by review_id
    const helpfulByReview = new Map<number, string[]>();
    helpfulRatings.forEach((hr: any) => {
      if (!helpfulByReview.has(hr.review_id)) {
        helpfulByReview.set(hr.review_id, []);
      }
      helpfulByReview.get(hr.review_id)!.push(String(hr.user_id));
    });

    // Group liked items by review_id
    const likedItemsByReview = new Map<number, any[]>();
    likedItems.forEach((item: any) => {
      if (!likedItemsByReview.has(item.review_id)) {
        likedItemsByReview.set(item.review_id, []);
      }
      likedItemsByReview.get(item.review_id)!.push({
        id: String(item.order_item_id),
        name: item.item_name,
        restaurantId: String(item.restaurant_id),
        image: getImageWithFallback(item.item_image, 'image'),
        menuItemId: String(item.menu_item_id),
      });
    });

    // Transform reviews to match UserReview interface
    const transformedReviews = reviews.map((review: any) => ({
      id: String(review.id),
      vendorId: String(review.store_id),
      vendorName: review.store_name,
      vendorLogo: getImageWithFallback(review.store_logo, 'logo'),
      userId: String(review.user_id),
      userName: review.user_name,
      userEmail: review.user_email,
      userAvatar: getImageWithFallback(review.user_avatar, 'user'),
      rating: review.rating,
      content: review.content,
      timestamp: review.timestamp,
      photos: photosByReview.get(review.id) || [],
      ratedHelpfulBy: helpfulByReview.get(review.id) || [],
      orderId: review.order_id ? String(review.order_id) : undefined,
      likedItems: likedItemsByReview.get(review.id) || [],
      approvalStatus: review.approval_status as 'approved' | 'rejected' | 'pending',
    }));

    console.log(`✅ Fetched ${transformedReviews.length} reviews`);

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      meta: {
        count: transformedReviews.length,
        storeId: storeId || null,
        userId: userId || null,
        approvalStatus: approvalStatus || null,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching reviews',
      },
      { status: 500 }
    );
  }
}