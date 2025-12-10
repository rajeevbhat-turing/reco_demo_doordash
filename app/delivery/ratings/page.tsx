'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { useDeliveryPartnerStore } from '@/store/delivery-partner-store';
import LetterAvatar from '@/components/delivery/letter-avatar';

interface Rating {
  id: number;
  partnerId: number;
  orderId: number;
  rating: number;
  feedback: string | null;
  customerName: string;
  createdAt: string;
  storeName: string;
  storeLogo: string | null;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  fiveStarCount: number;
  fiveStarPercentage: number;
}

export default function DeliveryRatingsPage() {
  const router = useRouter();
  const currentPartner = useDeliveryPartnerStore(state => state.currentPartner);
  const isAuthenticated = useDeliveryPartnerStore(state => state.isAuthenticated());
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/delivery/sign-in');
    }
  }, [isAuthenticated, router]);

  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      if (!currentPartner?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/delivery/ratings?partnerId=${currentPartner.id}&limit=${pagination.limit}&offset=${pagination.offset}`
        );
        const result = await response.json();

        if (result.success) {
          setRatings(result.data.ratings);
          setStats(result.data.stats);
          setDistribution(result.data.distribution);
          setPagination(result.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [currentPartner?.id, pagination.offset, pagination.limit]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render stars
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-6 h-6',
    };
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate max count for distribution bars
  const maxDistributionCount = Math.max(...Object.values(distribution), 1);

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
        <h1 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h1>
        <p className="text-gray-600 mt-1">See what customers are saying about your service</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4561ED]"></div>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          {stats && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Average Rating */}
                <div className="flex flex-col items-center justify-center md:w-1/3">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  {renderStars(Math.round(stats.averageRating), 'lg')}
                  <p className="text-sm text-gray-500 mt-2">
                    Based on {stats.totalRatings} ratings
                  </p>
                </div>

                {/* Distribution */}
                <div className="flex-1">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{
                              width: `${(distribution[rating] / maxDistributionCount) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">
                          {distribution[rating] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-2xl font-bold text-gray-900">{stats.fiveStarCount}</span>
                  </div>
                  <p className="text-sm text-gray-500">5-Star Ratings</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">{stats.fiveStarPercentage}%</span>
                  </div>
                  <p className="text-sm text-gray-500">5-Star Rate</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-[#4561ED]" />
                    <span className="text-2xl font-bold text-gray-900">
                      {ratings.filter(r => r.feedback).length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">With Comments</p>
                </div>
              </div>
            </div>
          )}

          {/* Ratings List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
            {ratings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No ratings yet</h3>
                <p className="text-gray-500">Complete deliveries to receive customer ratings!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map(rating => (
                  <div
                    key={rating.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <LetterAvatar name={rating.customerName} size="md" />
                        <div>
                          <p className="font-medium text-gray-900">{rating.customerName}</p>
                          <p className="text-sm text-gray-500">{rating.storeName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(rating.rating, 'sm')}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(rating.createdAt)}</p>
                      </div>
                    </div>
                    {rating.feedback && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700 italic">&ldquo;{rating.feedback}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {pagination.hasMore && !isLoading && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

