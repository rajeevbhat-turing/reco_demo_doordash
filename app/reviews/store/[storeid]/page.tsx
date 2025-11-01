'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import ReviewDialog from '@/components/review-dialog';
import ReviewsInfoModal from '@/components/modals/reviews-info-modal';
import PhotoViewerModal from '@/components/modals/photo-viewer-modal';
import OrderItemsScrollable from '@/components/reviews/order-items-scrollable';
import CustomerPhotosScrollable from '@/components/reviews/customer-photos-scrollable';
import { useReviewStore } from '@/store/review-store';
import { generateAvatarColor } from '@/lib/utils/helperFunctions';
import { LightbulbIcon } from '@/lib/utils/icons';

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

  const { getVendorReviews, getApprovedReviews, getUserReviewCount, calculateAverageRating } =
    useReviewStore();
  const vendorReviews = getVendorReviews(storeId);
  const approvedReviews = getApprovedReviews(storeId);

  if (vendorReviews.length === 0) {
    // Redirect to vendor page if no review data exists
    router.replace(`/store/${storeId}`);
    return null;
  }

  // Get vendor name from first review (all reviews for a vendor should have the same vendorName)
  const vendorName = vendorReviews[0].vendorName;
  const averageRating = calculateAverageRating(storeId);
  const totalReviews = approvedReviews.length;

  // Collect all photos from all approved reviews with user info
  const allCustomerPhotos = useMemo(() => {
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
                  <button
                    onClick={() => setReviewsInfoModalOpen(true)}
                    aria-label="Learn about public reviews"
                  >
                    <Info className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Add Review Button */}
              <button
                className="px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] hover:bg-gray-200"
                onClick={handleStartReview}
              >
                Add a Review
              </button>
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

                    {/* Order Details */}
                    {review.orderDetails && review.orderDetails.items.length > 0 && (
                      <OrderItemsScrollable
                        items={review.orderDetails.items}
                        liked={review.orderDetails.liked}
                        restaurantId={storeId}
                      />
                    )}

                    {/* Review Photos - Only show if review has photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="mb-4">
                        <div className="flex gap-2 flex-wrap">
                          {review.photos.map((photo, index) => (
                            <div
                              key={`review-photo-${index}`}
                              className="w-[103px] h-[103px] relative rounded-lg overflow-hidden cursor-pointer"
                              onClick={() => {
                                handlePhotoClick({
                                  photo,
                                  userName: review.userName,
                                  timestamp: review.timestamp,
                                });
                              }}
                            >
                              <Image
                                src={photo}
                                alt={`Review photo ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Helpful Count */}
                    <button
                      className="px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] 
                    hover:bg-gray-200 flex items-center gap-2"
                    >
                      <LightbulbIcon />
                      <span>Helpful ({review.helpfulCount})</span>
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
