import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-user-address
 *
 * Query Parameters:
 * - type: Address type (optional) - e.g., "house", "apartment", "hotel", "office", "other"
 *         If not provided, returns the default address.
 * - userId: User ID (optional, use this OR email)
 * - email: User email (optional, use this OR userId)
 *
 * Gets a user's address by type from the database.
 * If email is provided, looks up the user by email first.
 * If type is not provided, returns the default address.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const type = searchParams.get('type');

    // Must provide either userId or email
    if (!userId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either userId or email is required',
        },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: 'type is required',
        },
        { status: 400 }
      );
    }

=======
>>>>>>> 097930f2c88c7a871529672a96c657f79fb0a0e0
    // If email is provided, look up the user first
    if (email && !userId) {
      const user = await db.queryOne<any>('SELECT id FROM users WHERE email = ? COLLATE NOCASE', [
        email,
      ]);

      if (!user) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      userId = String(user.id);
    }

<<<<<<< HEAD
    const address = await db.queryOne<any>(
      `SELECT 
        id,
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
      WHERE user_id = ? AND address_type = ? COLLATE NOCASE
      LIMIT 1`,
      [userId, type]
    );

=======
    // Build query based on whether type is provided
    let query = `SELECT 
      id,
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
    WHERE user_id = ?`;
    
    const params: any[] = [userId];
    
    if (type) {
      // If type is provided, filter by type
      query += ' AND address_type = ? COLLATE NOCASE';
      params.push(type);
    } else {
      // If no type provided, get default address
      query += ' AND is_default = 1';
    }
    
    query += ' LIMIT 1';
    
    const address = await db.queryOne<any>(query, params);
    
>>>>>>> 097930f2c88c7a871529672a96c657f79fb0a0e0
    if (!address) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const result: any = {
      id: String(address.id),
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      lat: address.lat,
      lng: address.lng,
      addressType: address.addressType,
      default: Boolean(address.default),
    };

    // Add optional fields if they exist
    if (address.gateCode) result.gateCode = address.gateCode;
    if (address.apartmentSuite) result.apartmentSuite = address.apartmentSuite;
    if (address.entryCode) result.entryCode = address.entryCode;
    if (address.roomSuite) result.roomSuite = address.roomSuite;
    if (address.hotelName) result.hotelName = address.hotelName;
    if (address.suiteFloor) result.suiteFloor = address.suiteFloor;
    if (address.businessName) result.businessName = address.businessName;
    if (address.buildingName) result.buildingName = address.buildingName;
    if (address.deliveryPreference) result.deliveryPreference = address.deliveryPreference;
    if (address.meetLocation) result.meetLocation = address.meetLocation;
    if (address.deliveryInstructions) result.deliveryInstructions = address.deliveryInstructions;
    if (address.personalLabel) result.personalLabel = address.personalLabel;

    return NextResponse.json({
      success: true,
      data: {
        address: result,
      },
    });
  } catch (error) {
    console.error('❌ Get user address error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
