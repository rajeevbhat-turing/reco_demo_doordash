import { NextRequest, NextResponse } from 'next/server';
import { deliveryDb } from '@/lib/delivery-db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * POST /api/delivery/auth/login
 *
 * Authenticates a delivery partner with email and password
 * Returns partner data with stats
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, deletedPartnerIds = [] } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Query delivery partner from database
    const partner = await deliveryDb.queryOne<any>(
      `SELECT 
        dp.id,
        dp.email,
        dp.password,
        dp.name,
        dp.phone_number as phoneNumber,
        dp.avatar,
        dp.lifetime_deliveries as lifetimeDeliveries,
        dp.average_rating as averageRating,
        dp.acceptance_rate as acceptanceRate,
        dp.completion_rate as completionRate,
        dp.on_time_rate as onTimeRate,
        dp.created_at as createdAt,
        c.code as country_code,
        c.name as country_name,
        c.dial_code as country_dial_code
      FROM delivery_partners dp
      LEFT JOIN delivery_countries c ON dp.country_id = c.id
      WHERE LOWER(dp.email) = LOWER(?) AND dp.password = ?`,
      [email, password]
    );

    if (!partner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if partner is in deletedPartnerIds
    const deletedIdsSet = new Set(deletedPartnerIds.map((id: string) => String(id)));
    if (deletedIdsSet.has(String(partner.id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Transform data to match DeliveryPartner interface
    const partnerData = {
      id: String(partner.id),
      email: partner.email,
      password: partner.password,
      name: partner.name,
      phoneNumber: partner.phoneNumber,
      country: {
        dialCode: partner.country_dial_code || '+1',
        code: partner.country_code || 'US',
        name: partner.country_name || 'United States',
      },
      avatar: getImageWithFallback(partner.avatar, 'user'),
      lifetimeDeliveries: partner.lifetimeDeliveries || 0,
      averageRating: partner.averageRating || 0,
      acceptanceRate: partner.acceptanceRate || 0,
      completionRate: partner.completionRate || 0,
      onTimeRate: partner.onTimeRate || 0,
      createdAt: partner.createdAt,
    };

    console.log(`✅ Delivery partner logged in: ${partnerData.email} (ID: ${partnerData.id})`);

    return NextResponse.json({
      success: true,
      data: partnerData,
    });
  } catch (error) {
    console.error('❌ Delivery partner login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      },
      { status: 500 }
    );
  }
}

