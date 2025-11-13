import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/reviews/review/[reviewId]
 * 
 * Fetches a single review by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Fetch review with user and store information
    const review = await db.queryOne<any>(
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
      WHERE ur.id = ?`,
      [reviewId]
    );

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Fetch photos for this review
    const photos = await db.query<any>(
      `SELECT url, sort_order
       FROM review_photos
       WHERE review_id = ?
       ORDER BY sort_order`,
      [reviewId]
    );

    // Fetch helpful ratings for this review
    const helpfulRatings = await db.query<any>(
      `SELECT user_id
       FROM review_helpful
       WHERE review_id = ?`,
      [reviewId]
    );

    // Fetch liked items for this review
    const likedItems = await db.query<any>(
      `SELECT 
        rli.order_item_id,
        oi.id AS order_item_id,
        oi.menu_item_id,
        mi.name AS item_name,
        mi.image AS item_image,
        mi.restaurant_id
      FROM review_liked_items rli
      JOIN order_items oi ON rli.order_item_id = oi.id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE rli.review_id = ?`,
      [reviewId]
    );

    // Transform review to match UserReview interface
    const transformedReview = {
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
      photos: photos.map((p: any) => p.url),
      ratedHelpfulBy: helpfulRatings.map((hr: any) => String(hr.user_id)),
      orderId: review.order_id ? String(review.order_id) : undefined,
      likedItems: likedItems.map((item: any) => ({
        id: String(item.order_item_id),
        name: item.item_name,
        restaurantId: String(item.restaurant_id),
        image: item.item_image,
      })),
      approvalStatus: review.approval_status as 'approved' | 'rejected' | 'pending',
    };

    console.log(`✅ Fetched review ${reviewId}`);

    return NextResponse.json({
      success: true,
      data: transformedReview,
    });
  } catch (error) {
    console.error('❌ Error fetching review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching review',
      },
      { status: 500 }
    );
  }
}

