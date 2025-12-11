'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, DollarSign, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  if (!currentPartner) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#4561ED] to-[#6b82f5] rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {currentPartner.name.split(' ')[0]}!</h1>
        <p className="text-white/80">Here's your delivery overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Lifetime Deliveries */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentPartner.lifetimeDeliveries.toLocaleString()}</p>
          <p className="text-sm text-gray-500 font-medium">Lifetime Deliveries</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(currentPartner.averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currentPartner.averageRating > 0 ? currentPartner.averageRating.toFixed(2) : '-'}
          </p>
          <p className="text-sm text-gray-500 font-medium">Average Rating</p>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currentPartner.acceptanceRate > 0 ? `${currentPartner.acceptanceRate}%` : '-'}
          </p>
          <p className="text-sm text-gray-500 font-medium">Acceptance Rate</p>
        </div>

        {/* On-Time Rate */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {currentPartner.onTimeRate > 0 ? `${currentPartner.onTimeRate}%` : '-'}
          </p>
          <p className="text-sm text-gray-500 font-medium">On-Time Rate</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/delivery/orders"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Orders</h3>
              <p className="text-sm text-gray-500">See your delivery history</p>
            </div>
          </div>
        </Link>

        <Link
          href="/delivery/earnings"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Earnings</h3>
              <p className="text-sm text-gray-500">Track your income</p>
            </div>
          </div>
        </Link>

        <Link
          href="/delivery/ratings"
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Ratings</h3>
              <p className="text-sm text-gray-500">Customer feedback</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
