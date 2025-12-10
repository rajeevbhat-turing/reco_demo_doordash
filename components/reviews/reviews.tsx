'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, ArrowRight, Star } from 'lucide-react';
import OverallRating from './overall-rating';
import ReviewCard from './review-card';
import ReviewDialog from '@/components/review-dialog';
import { useStoreReviews } from '@/lib/hooks/use-reviews';
import { useReviewStore } from '@/store/review-store';
import { useUserStore } from '@/store/user-store';
import { getMergedUserReviewForVendor } from '@/lib/utils/review-utils';

interface ReviewsProps {
  vendorId: string;
  vendorName: string;
}

export default function Reviews({ vendorId, vendorName }: ReviewsProps) {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch reviews from API and merge with store changes
  const { vendorReviews, approvedReviews, averageRating, isLoading, apiData } =
    useStoreReviews(vendorId);

  // Get store changes for merging - using individual selectors to prevent object recreation
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

  // Get current user's review for this vendor (if exists)
  const userReview =
    currentUser && apiData
      ? getMergedUserReviewForVendor(apiData, vendorId, currentUser.id, storeReviewChanges) ||
        useReviewStore.getState().getNewReviewForVendor(vendorId, currentUser.id)
      : null;

  const totalReviews = approvedReviews?.length || 0;

  // Update scroll button states on mount and when reviews change
  useEffect(() => {
    updateScrollButtons();
  }, [approvedReviews]);

  // Event handlers
  // Highlights stars on hover for better UX
  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  // Removes star highlight when mouse leaves
  const handleStarLeave = () => {
    setHoverRating(0);
  };

  // Opens review modal with selected rating
  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setReviewDialogOpen(true);
  };

  // Opens review modal for new review
  const handleStartReview = () => {
    setReviewDialogOpen(true);
  };

  // Updates arrow button states based on scroll position
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    }
  };

  // Scrolls left by one card width smoothly
  const handlePrevious = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      const cardWidth = 308 + 16; // card width + gap
      scrollContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth',
      });
    }
  };

  // Scrolls right by one card width smoothly
  const handleNext = () => {
    if (scrollContainerRef.current && canScrollRight) {
      const cardWidth = 308 + 16; // card width + gap
      scrollContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth',
      });
    }
  };

  // Navigate to full reviews page
  const handleSeeAll = () => {
    router.push(`/reviews/store/${vendorId}`);
  };

  // Handle closing review dialog
  const handleCloseReviewDialog = useCallback(() => {
    setReviewDialogOpen(false);
  }, []);

  // Show loading state
  if (isLoading) {
    return null;
  }

  // If no reviews exist, show empty state
  if (
    !vendorReviews ||
    vendorReviews.length === 0 ||
    !approvedReviews ||
    approvedReviews.length === 0
  ) {
    // If no reviews exist and no user is logged in, show nothing
    if (!currentUser) return null;

    // Check if user has a pending review
    const hasPendingReview = userReview && userReview.approvalStatus === 'pending';

    const displayRating = hoverRating || selectedRating;

    return (
      <>
        {!hasPendingReview && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-[#191919ff]">Reviews</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-w-[400px]">
              <h3 className="text-base font-medium mb-4">Be the first to review</h3>
              <div className="flex mb-4 items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer ${
                      star <= displayRating ? 'fill-[#191919ff] text-[#191919ff]' : 'text-gray-300'
                    }`}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    onClick={() => handleStarClick(star)}
                    data-testid={`rating-star-${star}`}
                  />
                ))}

                <button
                  className="text-[#606060ff] font-medium text-sm hover:text-[#191919ff] ml-6"
                  onClick={handleStartReview}
                >
                  Start your review
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Review Dialog */}
        {reviewDialogOpen && (
          <ReviewDialog
            isOpen={reviewDialogOpen}
            onClose={handleCloseReviewDialog}
            restaurantName={vendorName}
            vendorId={vendorId}
            vendorLogo={
              vendorReviews && vendorReviews.length > 0 ? vendorReviews[0]?.vendorLogo : undefined
            }
            defaultRating={selectedRating}
          />
        )}
      </>
    );
  }

  // Show only first 5 reviews, rest will be handled by "See All" button
  const maxVisibleReviews = 5;
  const visibleReviews = approvedReviews.slice(0, maxVisibleReviews);

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#191919ff]">Reviews</h2>
          <p className="text-sm text-[#606060ff] font-medium">
            {totalReviews}+ ratings • {approvedReviews.length}+ public reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              className="px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] hover:bg-gray-300"
              onClick={handleStartReview}
            >
              Add Review
            </button>
          )}
          <div className="flex gap-1">
            <button
              onClick={handlePrevious}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 
              disabled:bg-[#f7f7f7] disabled:cursor-not-allowed text-[#191919ff] disabled:text-gray-400"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
            </button>
            <button
              onClick={handleNext}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 
              disabled:bg-[#f7f7f7] disabled:cursor-not-allowed text-[#191919ff] disabled:text-gray-400"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Cards */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={updateScrollButtons}
      >
        {/* Overall Rating */}
        <div className="flex-shrink-0">
          <OverallRating averageRating={averageRating} />
        </div>

        {visibleReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {/* See All Button */}
        <div
          className="bg-[#f7f7f7] rounded-lg py-2 px-3 flex-shrink-0 flex flex-col items-center 
          justify-center cursor-pointer mr-2"
          onClick={handleSeeAll}
        >
          <ArrowRight className="w-6 h-6 text-[#191919ff] mb-2" />
          <span className="text-sm font-bold text-[#191919ff]">See All</span>
        </div>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
        restaurantName={vendorName}
        vendorId={vendorId}
        vendorLogo={
          vendorReviews && vendorReviews.length > 0 ? vendorReviews[0]?.vendorLogo : undefined
        }
      />
    </div>
  );
}
