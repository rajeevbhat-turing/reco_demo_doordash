import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-user-address?userId=123&type=house
 * 
 * Gets a user's address by type from the database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'type is required' 
        },
        { status: 400 }
      );
    }

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
        address: result
      },
    });

  } catch (error) {
    console.error('❌ Get user address error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

