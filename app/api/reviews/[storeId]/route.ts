import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/reviews/[storeId]
 * 
 * Fetches all reviews for a specific store
 * 
 * Query params:
 * - approvalStatus: Filter by approval status ('approved', 'rejected', 'pending') (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = request.nextUrl;
    const approvalStatus = searchParams.get('approvalStatus');

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Build WHERE clause
    const conditions: string[] = ['ur.store_id = ?'];
    const params_array: any[] = [storeId];

    if (approvalStatus) {
      conditions.push('ur.approval_status = ?');
      params_array.push(approvalStatus);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Fetch reviews with user and store information
    const reviews = db.query<any>(
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
      ORDER BY ur.timestamp DESC`,
      params_array
    );

    if (reviews.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          storeId,
        },
      });
    }

    // Get all review IDs
    const reviewIds = reviews.map((r: any) => r.id);

    // Fetch photos for all reviews
    const photos = db.query<any>(
      `SELECT review_id, url, sort_order
       FROM review_photos
       WHERE review_id IN (${reviewIds.map(() => '?').join(',')})
       ORDER BY review_id, sort_order`,
      reviewIds
    );

    // Fetch helpful ratings for all reviews
    const helpfulRatings = db.query<any>(
      `SELECT review_id, user_id
       FROM review_helpful
       WHERE review_id IN (${reviewIds.map(() => '?').join(',')})`,
      reviewIds
    );

    // Fetch liked items for all reviews
    const likedItems = db.query<any>(
      `SELECT 
        rli.review_id,
        rli.order_item_id,
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
      photosByReview.get(photo.review_id)!.push(photo.url);
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
        image: item.item_image,
      });
    });

    // Transform reviews to match UserReview interface
    const transformedReviews = reviews.map((review: any) => ({
      id: String(review.id),
      vendorId: String(review.store_id),
      vendorName: review.store_name,
      vendorLogo: review.store_logo || undefined,
      userId: String(review.user_id),
      userName: review.user_name,
      userEmail: review.user_email,
      userAvatar: review.user_avatar || null,
      rating: review.rating,
      content: review.content,
      timestamp: review.timestamp,
      photos: photosByReview.get(review.id) || [],
      ratedHelpfulBy: helpfulByReview.get(review.id) || [],
      orderId: review.order_id ? String(review.order_id) : undefined,
      likedItems: likedItemsByReview.get(review.id) || [],
      approvalStatus: review.approval_status as 'approved' | 'rejected' | 'pending',
    }));

    console.log(`✅ Fetched ${transformedReviews.length} reviews for store ${storeId}`);

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      meta: {
        count: transformedReviews.length,
        storeId,
        approvalStatus: approvalStatus || null,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching store reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching store reviews',
      },
      { status: 500 }
    );
  }
}

