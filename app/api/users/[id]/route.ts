import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/users/[id]
 * 
 * Fetches a user by ID from the database
 * Returns user data with addresses and payment methods
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      );
    }

    // Query user from database
    const user = await db.queryOne<any>(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.phone_number as phoneNumber,
        u.password,
        u.avatar,
        u.is_restricted,
        c.code as country_code,
        c.name as country_name,
        c.dial_code as country_dial_code
      FROM users u
      LEFT JOIN countries c ON u.country_id = c.id
      WHERE u.id = ?`,
      [id]
    );

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Fetch user's addresses
    const addresses = await db.query<any>(
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
      WHERE user_id = ?`,
      [user.id]
    );

    // Fetch user's payment methods
    const paymentMethods = await db.query<any>(
      `SELECT 
        id,
        type,
        card_number as cardNumber,
        last_four as lastFour,
        cvc,
        expiry,
        zip_code as zipCode,
        is_default as "default"
      FROM payment_methods
      WHERE user_id = ?`,
      [user.id]
    );

    // Transform data to match User interface
    const userData = {
      id: String(user.id),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: user.password,
      country: {
        dialCode: user.country_dial_code,
        code: user.country_code,
        name: user.country_name,
      },
      userCountry: user.country_name,
      avatar: user.avatar,
      is_restricted: Boolean(user.is_restricted),
      addresses: addresses.map(addr => ({
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
      paymentMethods: paymentMethods.map(pm => ({
        id: String(pm.id),
        type: pm.type,
        cardNumber: pm.cardNumber,
        lastFour: pm.lastFour,
        cvc: pm.cvc,
        expiry: pm.expiry,
        zipCode: pm.zipCode,
        default: Boolean(pm.default),
      })),
    };

    console.log(`✅ User fetched: ${userData.email} (ID: ${userData.id})`);

    return NextResponse.json({
      success: true,
      data: userData,
    });

  } catch (error) {
    console.error('❌ Fetch user error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while fetching user' 
      },
      { status: 500 }
    );
  }
}

