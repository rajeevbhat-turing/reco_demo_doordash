'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import ReviewDialog from '@/components/review-dialog';
import ReviewsInfoModal from '@/components/modals/reviews-info-modal';
import PhotoViewerModal from '@/components/modals/photo-viewer-modal';
import OrderItemsScrollable from '@/components/reviews/order-items-scrollable';
import CustomerPhotosScrollable from '@/components/reviews/customer-photos-scrollable';
import ReviewPhotosScrollable from '@/components/reviews/review-photos-scrollable';
import { useStoreReviews } from '@/lib/hooks/use-reviews';
import { useReviewStore } from '@/store/review-store';
import { useUserStore } from '@/store/user-store';
import { useAppStore } from '@/store/app-store';
import { useCartStore } from '@/store/cart-store';
import { useRestaurant } from '@/lib/hooks/use-restaurant';
import { generateAvatarColor } from '@/lib/utils/helperFunctions';
import { LightbulbIcon } from '@/lib/utils/icons';
import { mergeReviewsWithChanges } from '@/lib/utils/review-utils';

export default function StoreReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeid as string;
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewsInfoModalOpen, setReviewsInfoModalOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photo: string;
    userName: string;
    timestamp: string;
  } | null>(null);

  // Fetch reviews from API and merge with store changes
  const { vendorReviews, approvedReviews, averageRating, isLoading, apiData } =
    useStoreReviews(storeId);

  // Get store review changes for merging - using individual selectors to prevent object recreation
  const newReviews = useReviewStore(state => state.newReviews);
  const helpfulChanges = useReviewStore(state => state.helpfulChanges);
  const approvalChanges = useReviewStore(state => state.approvalChanges);
  const deletedReviewIds = useReviewStore(state => state.deletedReviewIds);

  const storeReviewChanges = useMemo(
    () => ({
      newReviews,
      helpfulChanges,
      approvalChanges,
      deletedReviewIds,
    }),
    [newReviews, helpfulChanges, approvalChanges, deletedReviewIds]
  );

  const toggleHelpfulRating = useReviewStore(state => state.toggleHelpfulRating);
  const currentUser = useUserStore(state => state.currentUser);
  const { setCurrentStore, clearCurrentStore } = useAppStore();
  const cartStore = useCartStore();

  // Fetch restaurant data to set current store
  const { data: restaurantData } = useRestaurant(storeId);

  // Set current store and category when restaurant data is available
  useEffect(() => {
    // Set the category to restaurant when the page loads
    cartStore.setCategory('restaurant');

    if (restaurantData) {
      setCurrentStore(restaurantData, 'restaurant');
    }

    return () => {
      clearCurrentStore();
    };
  }, [restaurantData, setCurrentStore, clearCurrentStore, cartStore]);

  // Pre-compute user review counts once for all users (performance optimization)
  // This prevents O(n²) complexity from calling getUserReviewCount for each review
  const userReviewCountsMap = useMemo(() => {
    if (!apiData) return new Map<string, number>();

    const merged = mergeReviewsWithChanges(apiData, storeReviewChanges);
    const countsMap = new Map<string, number>();

    // Count reviews per user in a single pass
    merged.forEach(review => {
      const currentCount = countsMap.get(review.userId) || 0;
      countsMap.set(review.userId, currentCount + 1);
    });

    return countsMap;
  }, [apiData, storeReviewChanges]);

  // Helper function to get user review count from pre-computed map
  const getUserReviewCount = useCallback(
    (userId: string) => {
      return userReviewCountsMap.get(userId) || 0;
    },
    [userReviewCountsMap]
  );

  // Collect all photos from all approved reviews with user info
  const allCustomerPhotos = useMemo(() => {
    if (!approvedReviews) return [];
    const photosWithInfo: Array<{ photo: string; userName: string; timestamp: string }> = [];
    approvedReviews.forEach(review => {
      if (review.photos && review.photos.length > 0) {
        review.photos.forEach(photo => {
          photosWithInfo.push({
            photo,
            userName: review.userName,
            timestamp: review.timestamp,
          });
        });
      }
    });
    return photosWithInfo;
  }, [approvedReviews]);

  // Get vendor name from first review
  const vendorName = useMemo(() => {
    return vendorReviews && vendorReviews.length > 0 ? vendorReviews[0].vendorName : '';
  }, [vendorReviews]);

  const totalReviews = approvedReviews?.length || 0;

  // If loading
  if (isLoading) {
    return <div className="min-h-screen bg-white mt-[60px] p-6" />;
  }

  if (!vendorReviews || vendorReviews.length === 0) {
    // Redirect to vendor page if no review data exists
    router.replace(`/store/${storeId}`);
    return null;
  }

  // Handle photo click
  const handlePhotoClick = (photoInfo: { photo: string; userName: string; timestamp: string }) => {
    setSelectedPhoto(photoInfo);
    setPhotoViewerOpen(true);
  };

  // Go back to vendor page
  const handleGoBack = () => {
    router.replace(`/store/${storeId}`);
  };

  // Opens review modal for new review
  const handleStartReview = () => {
    setReviewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white mt-[60px] p-6">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 bg-[#f1f1f1] rounded-full hover:bg-gray-200 hover:cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
            </button>
            <h1
              className="text-sm font-medium text-[#191919ff] underline hover:cursor-pointer"
              onClick={handleGoBack}
            >
              {vendorName}
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Ratings and reviews</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overall Rating */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg">
              {/* Overall Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-3xl font-bold text-[#191919ff]">
                  {averageRating.toFixed(1)}
                </div>
                <Star className="w-7 h-7 text-[#e8c501] fill-[#e8c501]" />
              </div>

              {/* Ratings and Reviews Summary */}
              <p className="text-sm text-[#494949] font-medium mb-4">
                {totalReviews}+ ratings, {approvedReviews.length} public reviews
              </p>

              {/* Public Reviews Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#767676]">
                  <span>What are public reviews?</span>
                  {/* <button
                    onClick={() => setReviewsInfoModalOpen(true)}
                    aria-label="Learn about public reviews"
                  >
                    <Info className="w-5 h-5" strokeWidth={2} />
                  </button> */}
                </div>
              </div>

              {/* Add Review Button */}
              {currentUser && (
                <button
                  className="px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] hover:bg-gray-200"
                  onClick={handleStartReview}
                >
                  Add a Review
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-2">
            {/* Customer Photos Section - Only show if there are photos */}
            {allCustomerPhotos.length > 0 && (
              <CustomerPhotosScrollable
                photos={allCustomerPhotos.map(p => p.photo)}
                photosWithInfo={allCustomerPhotos}
                title="Customer photos"
                onPhotoClick={handlePhotoClick}
              />
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {approvedReviews.map(review => {
                const contributions = getUserReviewCount(review.userId);
                return (
                  <div key={review.id} className="bg-white rounded-lg p-4 border border-[#e4e4e4]">
                    {/* Review Header */}
                    <div className="flex items-center mb-3">
                      <div
                        className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-medium text-[18px] mr-3"
                        style={{ backgroundColor: generateAvatarColor(review.userName) }}
                      >
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <Link
                        href={`/consumer/profile/${review.userId}?source=reviews_list`}
                        className="flex-1 hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-center">
                          <span className="font-bold text-[16px] text-[#191919ff]">
                            {review.userName}
                          </span>
                          <ChevronRight className="w-4 h-4 ml-3 text-[#191919ff]" strokeWidth={3} />
                        </div>
                        <p className="text-xs text-[#767676] font-medium">
                          {contributions} contributions
                        </p>
                      </Link>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-[#494949] text-[#494949]'
                                : 'text-[#494949]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#767676] font-medium">
                        {'• '}
                        {format(new Date(review.timestamp), 'M/d/yy')}
                        {review.orderId ? ' • DoorDash order' : ''}
                      </span>
                    </div>

                    {/* Review Content */}
                    <p className="text-[#191919ff] font-medium text-[16px] mb-3">
                      {review.content}
                    </p>

                    {/* Liked Items */}
                    {review.likedItems && review.likedItems.length > 0 && (
                      <OrderItemsScrollable
                        items={review.likedItems}
                        liked={true}
                        restaurantId={storeId}
                      />
                    )}

                    {/* Review Photos - Only show if review has photos */}
                    {review.photos && review.photos.length > 0 && (
                      <ReviewPhotosScrollable
                        photos={review.photos}
                        userName={review.userName}
                        timestamp={review.timestamp}
                        onPhotoClick={handlePhotoClick}
                      />
                    )}

                    {/* Helpful Count */}
                    <button
                      onClick={() => {
                        if (currentUser) {
                          toggleHelpfulRating(review.id, currentUser.id, review.ratedHelpfulBy);
                        }
                      }}
                      disabled={!currentUser}
                      className={`px-3 py-1.5 rounded-[28px] text-sm font-bold flex items-center gap-2 transition-colors ${
                        currentUser && review.ratedHelpfulBy.includes(currentUser.id)
                          ? 'bg-[#191919ff] text-white hover:bg-[#2a2a2a]'
                          : currentUser
                            ? 'bg-[#f1f1f1] text-[#191919ff] hover:bg-gray-200'
                            : 'bg-[#f1f1f1] text-[#191919ff] cursor-not-allowed'
                      } ${!currentUser ? 'pointer-events-none' : ''}`}
                    >
                      <LightbulbIcon />
                      <span>
                        Helpful{' '}
                        {review.ratedHelpfulBy.length > 0
                          ? `(${review.ratedHelpfulBy.length})`
                          : ''}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        restaurantName={vendorName}
        vendorId={storeId}
        vendorLogo={
          vendorReviews && vendorReviews.length > 0 ? vendorReviews[0]?.vendorLogo : undefined
        }
      />

      {/* Reviews Info Modal */}
      <ReviewsInfoModal
        isOpen={reviewsInfoModalOpen}
        onClose={() => setReviewsInfoModalOpen(false)}
      />

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <PhotoViewerModal
          isOpen={photoViewerOpen}
          onClose={() => {
            setPhotoViewerOpen(false);
            setSelectedPhoto(null);
          }}
          photo={selectedPhoto.photo}
          userName={selectedPhoto.userName}
          timestamp={selectedPhoto.timestamp}
        />
      )}
    </div>
  );
}
