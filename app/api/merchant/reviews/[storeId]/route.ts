import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/merchant/reviews/[storeId]
 *
 * Fetches all reviews for a specific store from merchant.db
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
      return NextResponse.json({ success: false, error: 'Store ID is required' }, { status: 400 });
    }

    // Build WHERE clause
    const conditions: string[] = ['r.store_id = ?'];
    const queryParams: any[] = [storeId];

    if (approvalStatus) {
      conditions.push('r.approval_status = ?');
      queryParams.push(approvalStatus);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Fetch reviews with store information
    const reviews = await merchantDb.query<any>(
      `SELECT 
        r.id,
        r.store_id,
        r.customer_id,
        r.customer_name,
        r.rating,
        r.content,
        r.timestamp,
        r.order_id,
        r.approval_status,
        r.created_at,
        s.name AS store_name
      FROM reviews r
      LEFT JOIN stores s ON r.store_id = s.id
      ${whereClause}
      ORDER BY r.timestamp DESC`,
      queryParams
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

    // Get all review IDs for fetching related data
    const reviewIds = reviews.map((r: any) => r.id);

    // Fetch photos for all reviews
    const photos = await merchantDb.query<any>(
      `SELECT review_id, url, sort_order
       FROM review_photos
       WHERE review_id IN (${reviewIds.map(() => '?').join(',')})
       ORDER BY review_id, sort_order`,
      reviewIds
    );

    // Fetch liked items for all reviews
    const likedItems = await merchantDb.query<any>(
      `SELECT 
        rli.review_id,
        rli.menu_item_id,
        mi.name AS item_name,
        mi.image AS item_image,
        mi.store_id
      FROM review_liked_items rli
      JOIN menu_items mi ON rli.menu_item_id = mi.id
      WHERE rli.review_id IN (${reviewIds.map(() => '?').join(',')})`,
      reviewIds
    );

    // Group photos by review_id
    const photosByReview = new Map<string, string[]>();
    photos.forEach((photo: any) => {
      if (!photosByReview.has(photo.review_id)) {
        photosByReview.set(photo.review_id, []);
      }
      photosByReview.get(photo.review_id)!.push(getImageWithFallback(photo.url, 'image'));
    });

    // Group liked items by review_id
    const likedItemsByReview = new Map<string, any[]>();
    likedItems.forEach((item: any) => {
      if (!likedItemsByReview.has(item.review_id)) {
        likedItemsByReview.set(item.review_id, []);
      }
      likedItemsByReview.get(item.review_id)!.push({
        id: item.menu_item_id,
        name: item.item_name,
        image: getImageWithFallback(item.item_image, 'image'),
        storeId: item.store_id,
      });
    });

    // Transform reviews to match expected interface
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      storeId: review.store_id,
      storeName: review.store_name,
      customerId: review.customer_id,
      userName: review.customer_name,
      rating: review.rating,
      content: review.content,
      timestamp: review.timestamp,
      orderId: review.order_id || undefined,
      approvalStatus: review.approval_status,
      photos: photosByReview.get(review.id) || [],
      likedItems: likedItemsByReview.get(review.id) || [],
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
