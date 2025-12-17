import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';
import { getServerCurrentHour } from '@/lib/utils/time-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Fetch store with address
    const storeRaw = await merchantDb.queryOne<any>(
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
      WHERE s.id = ?`,
      [storeId]
    );

    if (!storeRaw) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }

    // Format opening hours
    const openingHours =
      storeRaw.opening_hour && storeRaw.closing_hour
        ? `${storeRaw.opening_hour} - ${storeRaw.closing_hour}`
        : 'Not set';

    // Check if currently open (supports bootstrap time offset)
    const cookieHeader = request.headers.get('cookie');
    const currentHour = getServerCurrentHour(cookieHeader);
    const openHour = storeRaw.opening_hour ? parseInt(storeRaw.opening_hour.split(':')[0]) : 0;
    const closeHour = storeRaw.closing_hour ? parseInt(storeRaw.closing_hour.split(':')[0]) : 24;
    const isOpen = currentHour >= openHour && currentHour < closeHour;

    const store = {
      id: storeRaw.id,
      name: storeRaw.name,
      email: storeRaw.email,
      phone: storeRaw.phone,
      businessType: storeRaw.business_type,
      ownerId: storeRaw.owner_id,
      createdAt: storeRaw.created_at,
      // Address
      street: storeRaw.street || '',
      city: storeRaw.city || '',
      state: storeRaw.state || '',
      zipCode: storeRaw.zip_code || '',
      lat: storeRaw.latitude,
      lng: storeRaw.longitude,
      // Hours
      openingHours,
      isOpen,
    };

    console.log(`✅ Fetched store ${storeId}: ${store.name}`);

    return NextResponse.json({
      success: true,
      data: store,
    });
  } catch (error: any) {
    console.error('❌ Error fetching store:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone, email } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add storeId to values for WHERE clause
    values.push(storeId);

    await merchantDb.run(
      `UPDATE stores SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    console.log(`✅ Updated store ${storeId}: ${updates.join(', ')}`);

    return NextResponse.json({
      success: true,
      message: 'Store updated successfully',
    });
  } catch (error: any) {
    console.error('❌ Error updating store:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}