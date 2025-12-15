import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';

/**
 * POST /api/merchant/auth/login
 *
 * Authenticates a merchant with email and password
 * Returns merchant data with their stores
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Query merchant from database
    const merchant = await merchantDb.queryOne<any>(
      `SELECT 
        m.id,
        m.email,
        m.password,
        m.first_name,
        m.last_name,
        m.user_phone,
        m.primary_store_id,
        m.primary_business_type,
        m.onboarding_completed,
        m.onboarding_step,
        m.onboarding_data,
        m.created_at,
        m.updated_at
      FROM merchants m
      WHERE m.email = ? AND m.password = ?`,
      [email, password]
    );

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Fetch merchant's stores (via junction table)
    const stores = await merchantDb.query<any>(
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
      [merchant.id]
    );

    // Get primary store details if set
    let primaryStore = null;
    if (merchant.primary_store_id) {
      primaryStore = await merchantDb.queryOne<any>(
        `SELECT 
          s.id,
          s.name,
          s.email,
          s.phone,
          s.business_type,
          a.street,
          a.city,
          a.state,
          a.zip_code
        FROM stores s
        LEFT JOIN addresses a ON s.id = a.store_id AND a.is_primary = 1
        WHERE s.id = ?`,
        [merchant.primary_store_id]
      );
    }

    // Parse onboarding data if present
    let onboardingData = null;
    if (merchant.onboarding_data) {
      try {
        onboardingData = JSON.parse(merchant.onboarding_data);
      } catch {
        onboardingData = null;
      }
    }

    // Transform data
    const merchantData = {
      id: merchant.id,
      email: merchant.email,
      password: merchant.password,
      firstName: merchant.first_name,
      lastName: merchant.last_name,
      userPhone: merchant.user_phone,
      // Primary store
      primaryStoreId: merchant.primary_store_id,
      primaryStoreName: primaryStore?.name || null,
      primaryStoreAddress: primaryStore
        ? {
            street: primaryStore.street || '',
            city: primaryStore.city || '',
            state: primaryStore.state || '',
            zipCode: primaryStore.zip_code || '',
          }
        : null,
      primaryStorePhone: primaryStore?.phone || null,
      primaryBusinessType: merchant.primary_business_type,
      // All stores
      storeIds: stores.map((s: any) => s.id),
      // Onboarding
      onboardingCompleted: merchant.onboarding_completed === 1,
      onboardingStep: merchant.onboarding_step,
      onboardingData,
      // Timestamps
      createdAt: merchant.created_at,
      updatedAt: merchant.updated_at,
    };

    // Transform stores
    const storesData = stores.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      businessType: s.business_type,
      ownerId: s.owner_id,
      role: s.role,
      createdAt: s.created_at,
      openingHour: s.opening_hour,
      closingHour: s.closing_hour,
      street: s.street || '',
      city: s.city || '',
      state: s.state || '',
      zipCode: s.zip_code || '',
      lat: s.latitude,
      lng: s.longitude,
    }));

    console.log(`✅ Merchant logged in: ${merchantData.email} (ID: ${merchantData.id})`);

    return NextResponse.json({
      success: true,
      data: {
        merchant: merchantData,
        stores: storesData,
      },
    });
  } catch (error) {
    console.error('❌ Merchant login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
