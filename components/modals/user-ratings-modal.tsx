'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { UserReview } from '@/types/review-types';

interface UserRatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  reviews: UserReview[];
}

type RatingFilter = 'top-rated' | 'low-rated';

export default function UserRatingsModal({
  isOpen,
  onClose,
  userName,
  reviews,
}: UserRatingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const topRatedTabRef = useRef<HTMLButtonElement>(null);
  const lowRatedTabRef = useRef<HTMLButtonElement>(null);
  const [activeFilter, setActiveFilter] = useState<RatingFilter>('top-rated');
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number;
    left: number;
  }>({ width: 0, left: 0 });

  // Update indicator position when activeFilter changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    const updateIndicator = () => {
      const activeTabRef = activeFilter === 'top-rated' ? topRatedTabRef : lowRatedTabRef;
      if (activeTabRef.current) {
        const rect = activeTabRef.current.getBoundingClientRect();
        const container = activeTabRef.current.parentElement?.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          setIndicatorStyle({
            width: rect.width,
            left: rect.left - containerRect.left,
          });
        }
      }
    };

    // Use setTimeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateIndicator, 0);
    window.addEventListener('resize', updateIndicator);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeFilter, isOpen]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Filter and group reviews by vendor
  const vendorRatings = useMemo(() => {
    const vendorMap = new Map<
      string,
      {
        vendorId: string;
        vendorName: string;
        vendorLogo?: string;
        ratings: number[];
        avgRating: number;
      }
    >();

    reviews.forEach(review => {
      if (!vendorMap.has(review.vendorId)) {
        vendorMap.set(review.vendorId, {
          vendorId: review.vendorId,
          vendorName: review.vendorName,
          vendorLogo: review.vendorLogo,
          ratings: [],
          avgRating: 0,
        });
      }

      const vendor = vendorMap.get(review.vendorId)!;
      vendor.ratings.push(review.rating);
    });

    // Calculate average rating for each vendor
    Array.from(vendorMap.values()).forEach(vendor => {
      const sum = vendor.ratings.reduce((acc, rating) => acc + rating, 0);
      vendor.avgRating = sum / vendor.ratings.length;
    });

    return Array.from(vendorMap.values());
  }, [reviews]);

  // Filter vendors based on active filter
  const filteredVendors = useMemo(() => {
    if (activeFilter === 'top-rated') {
      return vendorRatings.filter(vendor => vendor.avgRating >= 4);
    } else {
      return vendorRatings.filter(vendor => vendor.avgRating >= 1 && vendor.avgRating < 4);
    }
  }, [vendorRatings, activeFilter]);

  // Sort by average rating (highest first)
  const sortedVendors = useMemo(() => {
    return [...filteredVendors].sort((a, b) => b.avgRating - a.avgRating);
  }, [filteredVendors]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl w-full max-w-xl mx-4 h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-[22px] h-[22px] text-[#191919ff]" strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="pt-12 px-6">
          <h2 className="text-3xl font-bold text-[#191919ff]">{userName}'s ratings</h2>
        </div>

        {/* Tabs */}
        <div className="relative px-6 pt-5 border-b border-[#e5e5e5]">
          <div className="flex gap-6">
            <button
              ref={topRatedTabRef}
              onClick={() => setActiveFilter('top-rated')}
              className={`pb-3 text-base transition-colors ${
                activeFilter === 'top-rated'
                  ? 'text-[#191919ff] font-bold'
                  : 'text-[#767676] font-medium'
              }`}
            >
              Top rated (4-5 stars)
            </button>
            <button
              ref={lowRatedTabRef}
              onClick={() => setActiveFilter('low-rated')}
              className={`pb-3 text-base transition-colors ${
                activeFilter === 'low-rated'
                  ? 'text-[#191919ff] font-bold'
                  : 'text-[#767676] font-medium'
              }`}
            >
              1-3 stars
            </button>
          </div>
          {/* Animated Indicator */}
          <div
            className="absolute bottom-0 h-1 bg-[#191919ff] rounded-t-sm transition-all duration-300 ease-in-out"
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
            }}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {sortedVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-base font-bold text-[#191919ff] mb-3">No ratings</p>
              <p className="text-base font-medium text-[#191919ff]">Nothing to see here</p>
            </div>
          ) : (
            <div>
              {sortedVendors.map(vendor => {
                const fullStars = Math.floor(vendor.avgRating);
                const hasHalfStar = vendor.avgRating % 1 >= 0.5;

                return (
                  <Link
                    key={vendor.vendorId}
                    href={`/store/${vendor.vendorId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-4 border-b border-[#e5e5e5]"
                  >
                    {/* Vendor Logo */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0 border border-[#e5e5e5]">
                      {vendor.vendorLogo ? (
                        <img
                          src={vendor.vendorLogo}
                          alt={vendor.vendorName}
                          width={48}
                          height={48}
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

                    {/* Vendor Name */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="text-base font-medium text-[#191919ff] truncate">
                        {vendor.vendorName}
                      </p>
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => {
                          if (star <= fullStars) {
                            return (
                              <Star
                                key={star}
                                className="w-4 h-4 fill-[#191919ff] text-[#191919ff]"
                              />
                            );
                          } else if (star === fullStars + 1 && hasHalfStar) {
                            return (
                              <div key={star} className="relative w-4 h-4">
                                <Star
                                  className="w-4 h-4 absolute fill-none text-gray-300 stroke-gray-300"
                                  strokeWidth={1}
                                />
                                <div className="absolute left-0 top-0 w-2 h-4 overflow-hidden">
                                  <Star className="w-4 h-4 fill-[#191919ff] text-[#191919ff]" />
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <Star
                                key={star}
                                className="w-4 h-4 text-[#191919ff] fill-none stroke-[#191919ff]"
                                strokeWidth={2}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
