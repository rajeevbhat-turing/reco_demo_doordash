import { NextRequest, NextResponse } from 'next/server';
import { deliveryDb } from '@/lib/delivery-db';

/**
 * GET /api/delivery/earnings
 *
 * Fetches earnings for a delivery partner
 * Query params:
 * - partnerId: required - the delivery partner's ID
 * - limit: optional - number of weeks to return (default: 12)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Validate partnerId
    if (!partnerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Partner ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch weekly earnings
    const earnings = await deliveryDb.query<any>(
      `SELECT 
        id,
        partner_id as partnerId,
        week_start as weekStart,
        week_end as weekEnd,
        total_deliveries as totalDeliveries,
        base_pay as basePay,
        tips,
        bonuses,
        total_earnings as totalEarnings,
        hours_worked as hoursWorked
      FROM delivery_earnings
      WHERE partner_id = ?
      ORDER BY week_start DESC
      LIMIT ?`,
      [partnerId, limit]
    );

    // Calculate summary stats
    const summary = await deliveryDb.queryOne<any>(
      `SELECT 
        SUM(total_deliveries) as totalDeliveries,
        SUM(base_pay) as totalBasePay,
        SUM(tips) as totalTips,
        SUM(bonuses) as totalBonuses,
        SUM(total_earnings) as totalEarnings,
        SUM(hours_worked) as totalHours,
        COUNT(*) as weeksWorked
      FROM delivery_earnings
      WHERE partner_id = ?`,
      [partnerId]
    );

    // Get current week earnings (most recent)
    const currentWeek = earnings.length > 0 ? earnings[0] : null;

    // Transform earnings data
    const transformedEarnings = earnings.map(earning => ({
      id: earning.id,
      partnerId: earning.partnerId,
      weekStart: earning.weekStart,
      weekEnd: earning.weekEnd,
      totalDeliveries: earning.totalDeliveries,
      basePay: earning.basePay,
      tips: earning.tips,
      bonuses: earning.bonuses,
      totalEarnings: earning.totalEarnings,
      hoursWorked: earning.hoursWorked,
    }));

    return NextResponse.json({
      success: true,
      data: {
        earnings: transformedEarnings,
        currentWeek: currentWeek ? {
          weekStart: currentWeek.weekStart,
          weekEnd: currentWeek.weekEnd,
          totalDeliveries: currentWeek.totalDeliveries,
          basePay: currentWeek.basePay,
          tips: currentWeek.tips,
          bonuses: currentWeek.bonuses,
          totalEarnings: currentWeek.totalEarnings,
          hoursWorked: currentWeek.hoursWorked,
        } : null,
        summary: {
          totalDeliveries: summary?.totalDeliveries || 0,
          totalBasePay: summary?.totalBasePay || 0,
          totalTips: summary?.totalTips || 0,
          totalBonuses: summary?.totalBonuses || 0,
          totalEarnings: summary?.totalEarnings || 0,
          totalHours: summary?.totalHours || 0,
          weeksWorked: summary?.weeksWorked || 0,
          averagePerWeek: summary?.weeksWorked > 0 
            ? Math.round(summary.totalEarnings / summary.weeksWorked) 
            : 0,
          averagePerHour: summary?.totalHours > 0 
            ? Math.round(summary.totalEarnings / summary.totalHours) 
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching delivery earnings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching earnings',
      },
      { status: 500 }
    );
  }
}

