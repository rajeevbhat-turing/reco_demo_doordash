'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import OverallRating from './overall-rating';
import ReviewCard from './review-card';
import ReviewDialog from '@/components/review-dialog';
import { useReviewStore } from '@/store/review-store';

interface ReviewsProps {
  vendorId: string;
  vendorName: string;
}

export default function Reviews({ vendorId, vendorName }: ReviewsProps) {
  const router = useRouter();
  const { getVendorReviews, getApprovedReviews } = useReviewStore();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get reviews for this vendor
  const vendorReviews = getVendorReviews(vendorId);
  const approvedReviews = getApprovedReviews(vendorId);

  // Calculate average rating and total reviews from approved reviews
  const averageRating = useMemo(() => {
    if (approvedReviews.length === 0) return 0;
    const sum = approvedReviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / approvedReviews.length) * 10) / 10;
  }, [approvedReviews]);

  const totalReviews = approvedReviews.length;

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

  // If no reviews exist, show empty state
  if (vendorReviews.length === 0 || approvedReviews.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Be the first to review</h3>
          <div className="flex mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`h-8 w-8 cursor-pointer ${
                  star <= (hoverRating || selectedRating)
                    ? 'fill-gray-700 text-gray-700'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                onClick={() => handleStarClick(star)}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <button
            className="text-gray-600 font-medium hover:text-gray-800"
            onClick={handleStartReview}
          >
            Start your review
          </button>
        </div>
      </div>
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
          <h2 className="text-xl font-bold text=[#191919ff]">Reviews</h2>
          <p className="text-sm text-[#606060ff] font-medium">
            {totalReviews}+ ratings • {approvedReviews.length}+ public reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] hover:bg-gray-300"
            onClick={handleStartReview}
          >
            Add Review
          </button>
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
          <OverallRating averageRating={averageRating} totalReviews={totalReviews} />
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
        onClose={() => setReviewDialogOpen(false)}
        restaurantName={vendorName}
      />
    </div>
  );
}
