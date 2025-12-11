'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import DealsModal from '../modals/deals-modal';
import DealModal from '../modals/deal-modal';
import { type Deal } from '@/types/deal-types';
import { useDealsByRestaurantId } from '@/lib/hooks/use-deals';

interface DealsProps {
  restaurantId: string;
  isRestaurantOpen: boolean;
}

export default function Deals({ restaurantId, isRestaurantOpen }: DealsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get deals for this restaurant from API
  const { allDeals: deals, isLoading } = useDealsByRestaurantId(restaurantId);

  // Update scroll button states
  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  // Update scroll buttons on mount and when deals change
  useEffect(() => {
    updateScrollButtons();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        scrollContainer.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [deals, updateScrollButtons]);

  // Scroll left by one card width
  const handlePrevious = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      const firstCard = scrollContainerRef.current.querySelector('[data-deal-card]') as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 16; // gap-4 = 1rem = 16px
        scrollContainerRef.current.scrollBy({
          left: -(cardWidth + gap),
          behavior: 'smooth',
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: -scrollContainerRef.current.clientWidth,
          behavior: 'smooth',
        });
      }
    }
  };

  // Scroll right by one card width
  const handleNext = () => {
    if (scrollContainerRef.current && canScrollRight) {
      const firstCard = scrollContainerRef.current.querySelector('[data-deal-card]') as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 16; // gap-4 = 1rem = 16px
        scrollContainerRef.current.scrollBy({
          left: cardWidth + gap,
          behavior: 'smooth',
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: scrollContainerRef.current.clientWidth,
          behavior: 'smooth',
        });
      }
    }
  };

  // Handle deal card click
  const handleDealCardClick = (deal: Deal) => {
    if (!deal.buttonText || deal.buttonText === '') {
      setSelectedDeal(deal);
      setIsDealModalOpen(true);
    }
  };

  // Handle "See items" button click
  const handleSeeItemsClick = (e: React.MouseEvent, deal: Deal) => {
    e.preventDefault();
    e.stopPropagation();
    if (deal.buttonText === 'See items') {
      setSelectedDeal(deal);
      setIsDealModalOpen(true);
    }
  };

  // Handle close deals modal
  const handleCloseDealsModal = useCallback(() => {
    setIsDealsModalOpen(false);
  }, []);

  // Handle close deal modal
  const handleCloseDealModal = useCallback(() => {
    setIsDealModalOpen(false);
    setSelectedDeal(null);
  }, []);

  // If loading or no deals exist, don't render anything
  if (isLoading || deals.length === 0) {
    return null;
  }

  return (
    <div className="my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#191919ff]">Deals & benefits</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDealsModalOpen(true)}
            className="text-sm text-[#191919ff] font-bold mr-2 hover:bg-gray-100 rounded-[28px] px-3 py-1.5"
          >
            See All
          </button>
          <div className="flex gap-1">
            <button
              onClick={handlePrevious}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 
              disabled:bg-[#f7f7f7] disabled:cursor-not-allowed text-[#191919ff] disabled:text-gray-400"
              data-testid="deals-scroll-left-button"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
            </button>
            <button
              onClick={handleNext}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center hover:bg-gray-200 
              disabled:bg-[#f7f7f7] disabled:cursor-not-allowed text-[#191919ff] disabled:text-gray-400"
              data-testid="deals-scroll-right-button"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Deals Slider */}
      <div
        ref={scrollContainerRef}
        data-testid="deals-scroll-container"
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={updateScrollButtons}
      >
        {deals.map(deal => (
          <div
            key={deal.id}
            data-deal-card
            onClick={() => handleDealCardClick(deal)}
            className={`flex-shrink-0 bg-white rounded-xl py-2 px-3 flex items-center gap-4 w-[calc(100%-1rem)] lg:w-[462px] border border-gray-200 ${
              !deal.buttonText || deal.buttonText === '' ? 'cursor-pointer' : ''
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center">
                {deal.id === 'dashpass-delivery-fee' ? (
                  <img
                    src="/dashpass-icon-green.svg"
                    alt={deal.title}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                ) : (
                  <img
                    src="/offer-icon.svg"
                    alt={deal.title}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h3
                className={`text-base font-bold text-[${
                  deal.id === 'dashpass-delivery-fee' ? '#00838aff' : '#eb1700ff'
                }] mb-1`}
              >
                {deal.title}
              </h3>
              <p className="text-sm font-medium text-[#606060ff]">{deal.description}</p>
            </div>

            {/* Button */}
            {deal.buttonText ? (
              <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                {deal.buttonText === 'See items' ? (
                  <button
                    onClick={e => handleSeeItemsClick(e, deal)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] 
                    hover:bg-gray-200 transition-colors"
                  >
                    {deal.buttonText}
                  </button>
                ) : (
                  <a
                    href={deal.buttonLink || '#'}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#f1f1f1] rounded-[28px] text-sm font-bold text-[#191919ff] 
                    hover:bg-gray-200 transition-colors"
                    target={deal.buttonLink ? '_blank' : undefined}
                  >
                    {deal.buttonText}
                    {deal.buttonLink && deal.buttonLink !== '#' && (
                      <ExternalLink className="w-4 h-4 ml-0.5" strokeWidth={3} />
                    )}
                  </a>
                )}
              </div>
            ) : (
              <div className="flex-shrink-0">
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deals Modal */}
      <DealsModal
        isOpen={isDealsModalOpen}
        onClose={handleCloseDealsModal}
        restaurantId={restaurantId}
        isRestaurantOpen={isRestaurantOpen}
      />

      {/* Deal Modal */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={handleCloseDealModal}
        deal={selectedDeal}
        isRestaurantOpen={isRestaurantOpen}
      />
    </div>
  );
}
