import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';

/**
 * GET /api/merchant/restaurants
 *
 * Fetches all stores from merchant database
 * Can filter by merchantId (owner_id)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const merchantId = searchParams.get('merchantId');
    const all = searchParams.get('all') === 'true';

    let stores: any[];

    if (merchantId) {
      // Fetch stores for specific merchant (via merchant_stores junction table)
      stores = await merchantDb.query<any>(
        `SELECT 
          s.id,
          s.name,
          s.email,
          s.phone,
          s.business_type,
          s.owner_id,
          s.created_at,
          s.opening_hour,
          s.closing_hour,
          a.street,
          a.city,
          a.state,
          a.zip_code,
          a.latitude,
          a.longitude,
          ms.role
        FROM stores s
        LEFT JOIN addresses a ON s.id = a.store_id AND a.is_primary = 1
        INNER JOIN merchant_stores ms ON s.id = ms.store_id
        WHERE ms.merchant_id = ?
        ORDER BY s.name ASC`,
        [merchantId]
      );
    } else if (all) {
      // Fetch all stores
      stores = await merchantDb.query<any>(
        `SELECT 
          s.id,
          s.name,
          s.email,
          s.phone,
          s.business_type,
          s.owner_id,
          s.created_at,
          s.opening_hour,
          s.closing_hour,
          a.street,
          a.city,
          a.state,
          a.zip_code,
          a.latitude,
          a.longitude
        FROM stores s
        LEFT JOIN addresses a ON s.id = a.store_id AND a.is_primary = 1
        ORDER BY s.name ASC`
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'merchantId or all=true parameter is required' },
        { status: 400 }
      );
    }

    // Transform data
    const transformedStores = stores.map(s => {
      // Format opening hours
      const openingHours =
        s.opening_hour && s.closing_hour ? `${s.opening_hour} - ${s.closing_hour}` : 'Not set';

      // Check if currently open
      const currentHour = new Date().getHours();
      const openHour = s.opening_hour ? parseInt(s.opening_hour.split(':')[0]) : 0;
      const closeHour = s.closing_hour ? parseInt(s.closing_hour.split(':')[0]) : 24;
      const isOpen = currentHour >= openHour && currentHour < closeHour;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        businessType: s.business_type,
        ownerId: s.owner_id,
        role: s.role || 'owner',
        createdAt: s.created_at,
        // Address
        street: s.street || '',
        city: s.city || '',
        state: s.state || '',
        zipCode: s.zip_code || '',
        lat: s.latitude,
        lng: s.longitude,
        // Hours
        openingHours,
        isOpen,
      };
    });

    console.log(`✅ Found ${transformedStores.length} stores`);

    return NextResponse.json({
      success: true,
      data: transformedStores,
      meta: {
        count: transformedStores.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching stores:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching stores' },
      { status: 500 }
    );
  }
}
