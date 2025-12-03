import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-user-payment-method
 * 
 * Query Parameters:
 * - userId: User ID (optional, use this OR email)
 * - email: User email (optional, use this OR userId)
 * - default: Filter by default status (optional, "true" or "false")
 * - last_four_digits: Filter by last four digits (optional)
 * 
 * Gets a user's payment method with optional filtering.
 * If email is provided, looks up the user by email first.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const defaultFilter = searchParams.get('default');
    const lastFourDigits = searchParams.get('last_four_digits');

    // Must provide either userId or email
    if (!userId && !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either userId or email is required' 
        },
        { status: 400 }
      );
    }

    // If email is provided, look up the user first
    if (email && !userId) {
      const user = await db.queryOne<any>(
        'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
        [email]
      );
      
      if (!user) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }
      
      userId = String(user.id);
    }

    // Build query with filters
    let query = `
      SELECT 
        id,
        type,
        card_number as cardNumber,
        last_four as lastFour,
        cvc,
        expiry,
        zip_code as zipCode,
        is_default as "default"
      FROM payment_methods
      WHERE user_id = ?
    `;
    
    const queryParams: any[] = [userId];

    // Apply default filter if provided
    if (defaultFilter !== null) {
      const isDefault = defaultFilter === 'true' ? 1 : 0;
      query += ' AND is_default = ?';
      queryParams.push(isDefault);
    }

    // Apply last four digits filter if provided
    if (lastFourDigits) {
      query += ' AND last_four = ?';
      queryParams.push(lastFourDigits);
    }

    query += ' LIMIT 1';

    const paymentMethod = await db.queryOne<any>(query, queryParams);
    
    if (!paymentMethod) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }
    
    const result = {
      id: String(paymentMethod.id),
      type: paymentMethod.type,
      cardNumber: paymentMethod.cardNumber,
      lastFour: paymentMethod.lastFour,
      cvc: paymentMethod.cvc,
      expiry: paymentMethod.expiry,
      zipCode: paymentMethod.zipCode,
      default: Boolean(paymentMethod.default),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('❌ Get user payment method error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

