import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-default-payment-method?userId=123
 *
 * Gets the default payment method for a user from the database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    const defaultPaymentMethod = await db.queryOne<any>(
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
      WHERE user_id = ? AND is_default = 1`,
      [userId]
    );

    if (!defaultPaymentMethod) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const result = {
      id: String(defaultPaymentMethod.id),
      type: defaultPaymentMethod.type,
      cardNumber: defaultPaymentMethod.cardNumber,
      lastFour: defaultPaymentMethod.lastFour,
      cvc: defaultPaymentMethod.cvc,
      expiry: defaultPaymentMethod.expiry,
      zipCode: defaultPaymentMethod.zipCode,
      default: Boolean(defaultPaymentMethod.default),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Get default payment method error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
