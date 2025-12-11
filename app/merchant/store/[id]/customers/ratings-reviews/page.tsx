'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { ChevronDown, MessageSquare, Star } from 'lucide-react';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';
import { useQuery } from '@tanstack/react-query';
import { useMerchantOrdersStore } from '@/store/merchant-orders-store';

/**
 * Route: /merchant/store/[id]/customers/ratings-reviews
 *
 * Ratings & Reviews page for a specific store
 */
export default function RatingsReviewsPage() {
  const params = useParams();
  const { setCurrentStoreId, currentStoreId: contextStoreId } = useCurrentStore();
  const { data: restaurants, isLoading } = useAllRestaurants();
  const [storeSet, setStoreSet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 7 days');

  const storeIdParam = params.id as string;

  // Track mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get orders from merchant orders store
  const { orders: allOrders } = useMerchantOrdersStore();

  // Filter orders for this store
  const storeOrders = useMemo(() => {
    if (!storeIdParam) return [];
    return allOrders.filter((order: any) => {
      const orderStoreId = order.storeId || order.restaurantId;
      return String(orderStoreId) === String(storeIdParam);
    });
  }, [allOrders, storeIdParam]);

  // Fetch reviews for this store from merchant API
  const { data: apiReviewsData, isLoading: isLoadingApiReviews } = useQuery({
    queryKey: ['merchant-store-reviews', storeIdParam],
    queryFn: async () => {
      const response = await fetch(`/api/merchant/reviews/${storeIdParam}?approvalStatus=approved`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!storeIdParam && storeSet && mounted,
  });

  // Calculate date range based on selected timeframe
  const getDateRange = (timeframe: string) => {
    const now = new Date();
    let startDate: Date;

    if (timeframe === 'Last 7 days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'Last 30 days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // All time
      startDate = new Date(0);
    }

    return { startDate, endDate: now };
  };

  // Combine API reviews with recent orders from merchant store
  // Show recent orders that could have reviews
  const reviewsData = useMemo(() => {
    const apiReviews = apiReviewsData || [];
    const { startDate, endDate } = getDateRange(selectedTimeframe);

    // Filter API reviews by timeframe
    const filteredApiReviews = apiReviews.filter((review: any) => {
      if (!review.timestamp) return false;
      const reviewDate = new Date(review.timestamp);
      return reviewDate >= startDate && reviewDate <= endDate;
    });

    // Create review-like entries from recent orders
    const recentOrdersForReviews = storeOrders
      .filter((order: any) => {
        const orderDate = order.orderDate ? new Date(order.orderDate) : null;
        if (!orderDate) return false;
        return orderDate >= startDate && orderDate <= endDate;
      })
      .map((order: any) => {
        // Check if this order already has a review in API
        const hasApiReview = filteredApiReviews.some(
          (review: any) => review.orderId === order.id || review.orderId === order.orderId
        );
        if (hasApiReview) return null;

        // Get user name - prioritize userName, then businessName, fallback to Customer
        const userName = order.userName || order.deliveryAddress?.businessName || 'Customer';

        // Check if order has a review stored (rating and reviewText)
        const hasOrderReview =
          order.rating !== null && order.rating !== undefined && order.reviewText;

        if (hasOrderReview) {
          // Order has a review - show it as a review
          return {
            id: `order-review-${order.id}`,
            orderId: order.orderId || order.id,
            userName: userName,
            rating: order.rating,
            content: order.reviewText,
            timestamp: order.reviewDate
              ? new Date(order.reviewDate).toISOString()
              : order.orderDate || new Date().toISOString(),
            isRecentOrder: false, // This is a review, not just a recent order
          };
        } else {
          // No review yet - show as recent order placeholder
          return {
            id: `order-${order.id}`,
            orderId: order.orderId || order.id,
            userName: userName,
            rating: null, // No rating yet - will show empty stars
            content: `Order placed on ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'recently'}`,
            timestamp: order.orderDate || new Date().toISOString(),
            isRecentOrder: true, // Flag to indicate this is a recent order, not a review
          };
        }
      })
      .filter(Boolean); // Remove null entries

    // Combine API reviews with recent orders
    return [...filteredApiReviews, ...recentOrdersForReviews].sort((a: any, b: any) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [apiReviewsData, storeOrders, selectedTimeframe]);

  const isLoadingReviews = isLoadingApiReviews;

  // Calculate ratings statistics (count actual reviews with ratings, including reviews from orders)
  const ratingsStats = useMemo(() => {
    const actualReviews = reviewsData.filter(
      (review: any) =>
        review.rating !== null && review.rating !== undefined && !review.isRecentOrder
    );

    if (!actualReviews || actualReviews.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const totalRatings = actualReviews.length;
    const sumRatings = actualReviews.reduce(
      (sum: number, review: any) => sum + (review.rating || 0),
      0
    );
    const averageRating = sumRatings / totalRatings;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    actualReviews.forEach((review: any) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        breakdown[rating as keyof typeof breakdown]++;
      }
    });

    return {
      averageRating,
      totalRatings,
      ratingBreakdown: breakdown,
    };
  }, [reviewsData]);

  // Set the store ID when component mounts or storeIdParam changes
  useEffect(() => {
    if (isLoading || !restaurants || storeSet) return;

    // Try to find restaurant by numeric ID first
    let restaurant = restaurants.find(r => r.id === storeIdParam);

    // If not found, try to find by name (slug)
    if (!restaurant) {
      restaurant = restaurants.find(
        r =>
          r.name.toLowerCase().replace(/\s+/g, '-') === storeIdParam.toLowerCase() ||
          r.name === storeIdParam
      );
    }

    if (restaurant) {
      if (contextStoreId !== restaurant.id) {
        setCurrentStoreId(restaurant.id);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('merchant-mode', 'true');
      }
      setStoreSet(true);
    } else {
      if (contextStoreId !== '1') {
        setCurrentStoreId('1');
      }
      setStoreSet(true);
    }
  }, [storeIdParam, restaurants, isLoading, setCurrentStoreId, contextStoreId, storeSet]);

  // Show loading state while finding store or not mounted
  if (isLoading || !mounted) {
    return (
      <MerchantLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ratings & reviews</h1>
              <p className="text-sm text-gray-600 mb-4">
                Track your customer ratings and respond to their feedback. Respond to customer
                feedback within 7 days of receiving it to show your appreciation, and encourage them
                to come back.
              </p>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedTimeframe}
                    onChange={e => setSelectedTimeframe(e.target.value)}
                    className="appearance-none flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 bg-white pr-8 cursor-pointer"
                  >
                    <option value="Last 7 days">Last 7 days</option>
                    <option value="Last 30 days">Last 30 days</option>
                    <option value="All time">All time</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                </div>
              </div>
            </div>

            {/* Reviews List or Empty State */}
            {isLoadingReviews ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-lg text-gray-600">Loading reviews...</p>
              </div>
            ) : reviewsData && reviewsData.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.map((review: any) => (
                  <div
                    key={review.id}
                    className={`bg-white border rounded-lg p-6 relative ${
                      review.isRecentOrder ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Recent Order tag - top left */}
                    {review.isRecentOrder && (
                      <span className="absolute top-3 left-3 text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                        Recent Order
                      </span>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            review.isRecentOrder ? 'bg-blue-200' : 'bg-gray-200'
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {review.userName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.userName || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {mounted && review.timestamp
                              ? new Date(review.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      {/* Always show stars - filled for reviews, empty for recent orders */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              review.rating !== null && star <= Math.round(review.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={`${review.isRecentOrder ? 'text-blue-700' : 'text-gray-700'}`}>
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <MessageSquare className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  You didn&apos;t receive any ratings for the selected store(s) and timeframe.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ratings During This Period */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Ratings during this period
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedTimeframe === 'Last 7 days'
                  ? 'Data from the last 7 days.'
                  : selectedTimeframe === 'Last 30 days'
                    ? 'Data from the last 30 days.'
                    : 'Recent ratings data.'}
              </p>
              {isLoadingReviews ? (
                <div className="text-4xl font-bold text-gray-900 mb-2">...</div>
              ) : ratingsStats.totalRatings > 0 ? (
                <>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {ratingsStats.averageRating.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Average rating</p>
                  <p className="text-sm text-gray-500">
                    {ratingsStats.totalRatings}{' '}
                    {ratingsStats.totalRatings === 1 ? 'rating' : 'ratings'}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-gray-900 mb-2">NA</div>
                  <p className="text-sm text-gray-600 mb-2">Not available due to 0 ratings</p>
                  <p className="text-sm text-gray-500">0 ratings</p>
                </>
              )}
            </div>

            {/* Lifetime Rating */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifetime rating</h3>
              <p className="text-sm text-gray-600 mb-4">
                This is the rating of your store since joining DashDoor and the rating that
                customers will view in the DashDoor app.
              </p>

              {/* Overall Rating */}
              <div className="mb-4">
                {isLoadingReviews ? (
                  <div className="text-4xl font-bold text-gray-900 mb-2">...</div>
                ) : ratingsStats.totalRatings > 0 ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {ratingsStats.averageRating.toFixed(1)} / 5 stars
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= Math.round(ratingsStats.averageRating)
                              ? star <= Math.floor(ratingsStats.averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-yellow-200 text-yellow-200'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-2">0 / 5 stars</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="h-6 w-6 text-gray-300" />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Rating Breakdown */}
              {ratingsStats.totalRatings > 0 && (
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count =
                      ratingsStats.ratingBreakdown[
                        stars as keyof typeof ratingsStats.ratingBreakdown
                      ];
                    const percentage = (count / ratingsStats.totalRatings) * 100;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="text-sm text-gray-600 w-12">{stars} stars</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-700" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="text-sm text-gray-600 w-16 text-right">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
