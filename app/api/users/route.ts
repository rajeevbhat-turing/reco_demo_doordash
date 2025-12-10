import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/users
 * 
 * Fetches multiple users from the database
 * Query params:
 *   - count: number of users to fetch (default: 10, max: 50)
 * 
 * Returns user data with addresses in the same format as /api/users/[id]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get('count');
    
    // Parse count with default of 10 and max of 50
    let count = 10;
    if (countParam) {
      const parsed = parseInt(countParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        count = Math.min(parsed, 50);
      }
    }

    // Fetch users from database
    const usersRaw = await db.query<any>(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.phone_number as phoneNumber,
        u.avatar,
        c.code as country_code,
        c.name as country_name,
        c.dial_code as country_dial_code
      FROM users u
      LEFT JOIN countries c ON u.country_id = c.id
      LIMIT ?`,
      [count]
    );

    if (usersRaw.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get all user IDs for fetching addresses
    const userIds = usersRaw.map((u: any) => u.id);

    // Fetch all addresses for these users in one query
    const addressesRaw = await db.query<any>(
      `SELECT 
        id,
        user_id,
        street,
        city,
        state,
        zip_code as zipCode,
        latitude as lat,
        longitude as lng,
        address_type as addressType,
        is_default as "default",
        gate_code as gateCode,
        apartment_suite as apartmentSuite,
        entry_code as entryCode,
        room_suite as roomSuite,
        hotel_name as hotelName,
        suite_floor as suiteFloor,
        business_name as businessName,
        building_name as buildingName,
        delivery_preference as deliveryPreference,
        meet_location as meetLocation,
        delivery_instructions as deliveryInstructions,
        personal_label as personalLabel
      FROM addresses
      WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    );

    // Group addresses by user_id
    const addressesByUser = new Map<number, any[]>();
    addressesRaw.forEach((addr: any) => {
      if (!addressesByUser.has(addr.user_id)) {
        addressesByUser.set(addr.user_id, []);
      }
      addressesByUser.get(addr.user_id)!.push(addr);
    });

    // Transform users to match User interface
    const users = usersRaw.map((user: any) => {
      const userAddresses = addressesByUser.get(user.id) || [];
      
      return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: {
          dialCode: user.country_dial_code,
          code: user.country_code,
          name: user.country_name,
        },
        userCountry: user.country_name,
        avatar: getImageWithFallback(user.avatar, 'user'),
        addresses: userAddresses.map((addr: any) => ({
          id: String(addr.id),
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          lat: addr.lat,
          lng: addr.lng,
          addressType: addr.addressType,
          default: Boolean(addr.default),
          ...(addr.gateCode && { gateCode: addr.gateCode }),
          ...(addr.apartmentSuite && { apartmentSuite: addr.apartmentSuite }),
          ...(addr.entryCode && { entryCode: addr.entryCode }),
          ...(addr.roomSuite && { roomSuite: addr.roomSuite }),
          ...(addr.hotelName && { hotelName: addr.hotelName }),
          ...(addr.suiteFloor && { suiteFloor: addr.suiteFloor }),
          ...(addr.businessName && { businessName: addr.businessName }),
          ...(addr.buildingName && { buildingName: addr.buildingName }),
          ...(addr.deliveryPreference && { deliveryPreference: addr.deliveryPreference }),
          ...(addr.meetLocation && { meetLocation: addr.meetLocation }),
          ...(addr.deliveryInstructions && { deliveryInstructions: addr.deliveryInstructions }),
          ...(addr.personalLabel && { personalLabel: addr.personalLabel }),
        })),
      };
    });

    console.log(`✅ Fetched ${users.length} users`);

    return NextResponse.json({
      success: true,
      data: users,
    });

  } catch (error) {
    console.error('❌ Fetch users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while fetching users' 
      },
      { status: 500 }
    );
  }
}

