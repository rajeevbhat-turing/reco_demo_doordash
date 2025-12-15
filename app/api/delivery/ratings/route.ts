import { NextRequest, NextResponse } from 'next/server';
import { deliveryDb } from '@/lib/delivery-db';

/**
 * GET /api/delivery/ratings
 *
 * Fetches ratings for a delivery partner
 * Query params:
 * - partnerId: required - the delivery partner's ID
 * - limit: optional - number of ratings to return (default: 50)
 * - offset: optional - pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate partnerId
    if (!partnerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch ratings with order details
    const ratings = await deliveryDb.query<any>(
      `SELECT 
        r.id,
        r.partner_id as partnerId,
        r.order_id as orderId,
        r.rating,
        r.feedback,
        r.customer_name as customerName,
        r.created_at as createdAt,
        o.store_name as storeName,
        o.store_logo as storeLogo
      FROM delivery_ratings r
      LEFT JOIN delivery_orders o ON r.order_id = o.id
      WHERE r.partner_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [partnerId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await deliveryDb.queryOne<{ total: number }>(
      'SELECT COUNT(*) as total FROM delivery_ratings WHERE partner_id = ?',
      [partnerId]
    );
    const total = countResult?.total || 0;

    // Get rating distribution
    const distribution = await deliveryDb.query<{ rating: number; count: number }>(
      `SELECT rating, COUNT(*) as count 
       FROM delivery_ratings 
       WHERE partner_id = ? 
       GROUP BY rating 
       ORDER BY rating DESC`,
      [partnerId]
    );

    // Calculate stats
    const statsResult = await deliveryDb.queryOne<any>(
      `SELECT 
        AVG(rating) as averageRating,
        COUNT(*) as totalRatings,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStarCount
      FROM delivery_ratings
      WHERE partner_id = ?`,
      [partnerId]
    );

    // Build distribution map (1-5 stars)
    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distribution.forEach(d => {
      ratingDistribution[d.rating] = d.count;
    });

    // Transform ratings data
    const transformedRatings = ratings.map(rating => ({
      id: rating.id,
      partnerId: rating.partnerId,
      orderId: rating.orderId,
      rating: rating.rating,
      feedback: rating.feedback,
      customerName: rating.customerName,
      createdAt: rating.createdAt,
      storeName: rating.storeName,
      storeLogo: rating.storeLogo,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ratings: transformedRatings,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + ratings.length < total,
        },
        stats: {
          averageRating: statsResult?.averageRating ? parseFloat(statsResult.averageRating.toFixed(2)) : 0,
          totalRatings: statsResult?.totalRatings || 0,
          fiveStarCount: statsResult?.fiveStarCount || 0,
          fiveStarPercentage: statsResult?.totalRatings > 0 
            ? Math.round((statsResult.fiveStarCount / statsResult.totalRatings) * 100) 
            : 0,
        },
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching delivery ratings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching ratings',
      },
      { status: 500 }
    );
  }
}

