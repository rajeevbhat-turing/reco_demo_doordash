'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Clock, Package, Gift, Wallet } from 'lucide-react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import { DeliveryEarnings } from '@/lib/types/delivery-types';

interface EarningsSummary {
  totalDeliveries: number;
  totalBasePay: number;
  totalTips: number;
  totalBonuses: number;
  totalEarnings: number;
  totalHours: number;
  weeksWorked: number;
  averagePerWeek: number;
  averagePerHour: number;
}

interface CurrentWeek {
  weekStart: string;
  weekEnd: string;
  totalDeliveries: number;
  basePay: number;
  tips: number;
  bonuses: number;
  totalEarnings: number;
  hoursWorked: number;
}

export default function DeliveryEarningsPage() {
  const router = useRouter();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());
  
  const [earnings, setEarnings] = useState<DeliveryEarnings[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [currentWeek, setCurrentWeek] = useState<CurrentWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  // Fetch earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!currentPartner?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/delivery/earnings?partnerId=${currentPartner.id}`);
        const result = await response.json();

        if (result.success) {
          setEarnings(result.data.earnings);
          setSummary(result.data.summary);
          setCurrentWeek(result.data.currentWeek);
        }
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [currentPartner?.id]);

  // Format currency (cents to dollars)
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Format date range
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600 mt-1">Track your weekly earnings and performance</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
        </div>
      ) : (
        <>
          {/* Current Week Highlight */}
          {currentWeek && (
            <div className="bg-gradient-to-r from-[#4561ED] to-[#6b82f5] rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm">This Week</p>
                  <p className="text-lg font-medium">{formatDateRange(currentWeek.weekStart, currentWeek.weekEnd)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Total Earned</p>
                  <p className="text-3xl font-bold">{formatCurrency(currentWeek.totalEarnings)}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/70 text-xs">Deliveries</p>
                  <p className="text-xl font-semibold">{currentWeek.totalDeliveries}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Base Pay</p>
                  <p className="text-xl font-semibold">{formatCurrency(currentWeek.basePay)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Tips</p>
                  <p className="text-xl font-semibold">{formatCurrency(currentWeek.tips)}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Hours</p>
                  <p className="text-xl font-semibold">{currentWeek.hoursWorked}h</p>
                </div>
              </div>
            </div>
          )}

          {/* Lifetime Stats */}
          {summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lifetime Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Earned</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.totalEarnings)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4561ED]/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#4561ED]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Deliveries</p>
                      <p className="text-lg font-bold text-gray-900">{summary.totalDeliveries}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg per Week</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.averagePerWeek)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg per Hour</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.averagePerHour)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Base Pay</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalBasePay)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-gray-500">Tips</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalTips)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <p className="text-sm text-gray-500">Bonuses</p>
                  </div>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.totalBonuses)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Breakdown */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Breakdown</h2>
            {earnings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No earnings yet</h3>
                <p className="text-gray-500">Complete deliveries to start earning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {earnings.map((week, index) => (
                  <div
                    key={week.id}
                    className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm ${
                      index === 0 ? 'ring-2 ring-[#4561ED]/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#4561ED]' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDateRange(week.weekStart, week.weekEnd)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {week.totalDeliveries} deliveries • {week.hoursWorked}h worked
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#4561ED]">{formatCurrency(week.totalEarnings)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Base Pay</p>
                        <p className="font-medium text-gray-900">{formatCurrency(week.basePay)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tips</p>
                        <p className="font-medium text-green-600">{formatCurrency(week.tips)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bonuses</p>
                        <p className="font-medium text-purple-600">{formatCurrency(week.bonuses)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

