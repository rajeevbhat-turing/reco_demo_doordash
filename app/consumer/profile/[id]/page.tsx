'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import UserRatingsModal from '@/components/modals/user-ratings-modal';
import { useUserStore } from '@/store/user-store';
import { useReviewStore } from '@/store/review-store';
import { generateAvatarColor } from '@/lib/utils/helperFunctions';
import { getRestaurantById } from '@/constants/restaurants';
import {
  LockIcon,
  VerificationIcon,
  SupportHistoryIcon,
  MedalIcon,
  GiftIcon,
  OfferIcon,
} from '@/lib/utils/icons';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [ratingsModalOpen, setRatingsModalOpen] = useState(false);

  const { getUser } = useUserStore();
  const { getUserReviewCount } = useReviewStore();

  const user = getUser(userId);

  if (!user) {
    router.replace('/');
    return null;
  }

  const contributions = getUserReviewCount(userId);

  // Get all reviews by this user
  const allReviews = useMemo(() => {
    const store = useReviewStore.getState();
    return store.reviews.filter(
      review => review.userId === userId && review.approvalStatus === 'approved'
    );
  }, [userId]);

  // Get unique vendors rated by this user (top rated)
  const topRatedVendors = useMemo(() => {
    const vendorMap = new Map<
      string,
      { vendorId: string; vendorName: string; vendorLogo?: string; avgRating: number }
    >();

    allReviews.forEach(review => {
      if (!vendorMap.has(review.vendorId)) {
        const vendorReviews = allReviews.filter(r => r.vendorId === review.vendorId);
        const avgRating =
          vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;
        vendorMap.set(review.vendorId, {
          vendorId: review.vendorId,
          vendorName: review.vendorName,
          vendorLogo: review.vendorLogo,
          avgRating,
        });
      }
    });

    // Sort by average rating (highest first) and return top vendors
    return Array.from(vendorMap.values())
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [allReviews]);

  // Calculate total ratings count
  const totalRatings = allReviews.length;

  // Get user initials for avatar
  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white pt-[90px] pb-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* User Profile Header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: generateAvatarColor(user.name) }}
          >
            {userInitials}
          </div>
          <h1 className="text-3xl font-bold text-[#191919ff]">{user.name}</h1>
        </div>

        <p className="text-base text-[#191919ff] font-bold">
          {contributions} contributions
          {user.is_restricted ? '' : <span>, {totalRatings} ratings</span>}
        </p>

        {/* Restricted Profile Message */}
        {user.is_restricted ? (
          <div className="flex flex-col items-center justify-center py-12 mt-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-xl">
              <LockIcon />
            </div>
            <h2 className="text-base font-bold text-[#191919ff] mb-2">Restricted profile</h2>
            <p className="text-sm text-[#191919ff] font-medium">Contributions are hidden</p>
          </div>
        ) : (
          <>
            {/* Top Rated Section */}
            {topRatedVendors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm px-3.5 py-4 mb-6 border border-[#e5e5e5] mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#191919ff]">Top rated by {user.name}</h2>
                  <button
                    onClick={() => setRatingsModalOpen(true)}
                    className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200"
                  >
                    <ArrowRight className="w-6 h-4 text-[#191919ff]" strokeWidth={3} />
                  </button>
                </div>
                <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
                  {topRatedVendors.map(vendor => (
                    <Link
                      key={vendor.vendorId}
                      href={`/store/${vendor.vendorId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex flex-col items-center hover:opacity-70 transition-opacity"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border border-[#e5e5e5]">
                        {vendor.vendorLogo ? (
                          <Image
                            src={vendor.vendorLogo}
                            alt={vendor.vendorName}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-xs font-medium text-gray-500">
                              {vendor.vendorName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-[#191919ff] text-center max-w-[80px] line-clamp-2">
                        {vendor.vendorName}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* User Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm flex flex-col gap-6 mt-6">
              {allReviews.map(review => {
                const restaurant = getRestaurantById(review.vendorId);
                return (
                  <div key={review.id} className="border border-[#e5e5e5] rounded-2xl px-3.5 py-4">
                    {/* Review Header */}
                    <div className="flex items-center mb-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-[13px] mr-2"
                        style={{ backgroundColor: generateAvatarColor(user.name) }}
                      >
                        {userInitials}
                      </div>
                      <span className="text-sm font-bold text-[#191919ff]">
                        {user.name} <span className="font-medium">shared a review</span>
                      </span>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-[#191919] text-[#191919]'
                                : 'text-[#191919'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-[#191919ff]">
                        {'• '}
                        {format(new Date(review.timestamp), 'M/d/yy')}
                        <span className="text-[#767676ff]">
                          {review.orderId ? ' • DoorDash order' : ''}
                        </span>
                      </span>
                    </div>

                    {/* Review Content */}
                    <p className="text-base text-[#191919ff] font-medium mb-4">{review.content}</p>

                    {/* Reviewed Vendor Card */}
                    <Link
                      href={`/store/${review.vendorId}`}
                      className="flex items-center gap-3 pl-1 pr-3 py-3 bg-[#f7f7f7] rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="text-[#00838a]">
                            <OfferIcon width={20} height={20} />
                          </div>

                          <p className="font-bold text-sm text-[#191919ff] truncate">
                            {review.vendorName}
                          </p>
                        </div>
                        {restaurant && (
                          <p className="text-sm text-[#191919ff] font-medium flex items-center gap-1">
                            <span className="font-bold">
                              {restaurant.rating?.toFixed(1) || 'N/A'}
                            </span>
                            <Star className="w-3 h-3 text-[#e8c501] fill-[#e8c501]" />(
                            {restaurant.reviews || '0'}) {restaurant.cuisine}
                            <span className="text-xs"> • </span>
                            {restaurant.priceRange}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className="w-5 h-5 text-[#191919ff] flex-shrink-0"
                        strokeWidth={3}
                      />
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* User Ratings Modal */}
        <UserRatingsModal
          isOpen={ratingsModalOpen}
          onClose={() => setRatingsModalOpen(false)}
          userName={user.name}
          reviews={allReviews}
        />
      </div>
    </div>
  );
}
