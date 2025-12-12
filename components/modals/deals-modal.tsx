'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ExternalLink, ChevronRight } from 'lucide-react';
import DealModal from './deal-modal';
import { type Deal } from '@/types/deal-types';
import { useDealsByRestaurantId } from '@/lib/hooks/use-deals';

interface DealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  isRestaurantOpen: boolean;
}

export default function DealsModal({
  isOpen,
  onClose,
  restaurantId,
  isRestaurantOpen,
}: DealsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Get all deals for this restaurant from API
  const { dashpassDeal, restaurantDeals, isLoading } = useDealsByRestaurantId(restaurantId);

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

  // Handle closing deal modal
  const handleCloseDealModal = useCallback(() => {
    setIsDealModalOpen(false);
    setSelectedDeal(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      data-testid="deals-modal-backdrop"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-[#191919ff]" strokeWidth={2} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 mt-16 pb-4">
          {/* Header */}
          <div className="mb-3">
            <h2 className="text-xl font-bold text-[#191919ff] mb-1">Deals</h2>
            <p className="text-sm font-medium text-[#606060ff]">
              Applied at checkout. Limit 1 per order. Terms apply.
            </p>
          </div>

          {/* Deals Section */}
          <div className="mb-6">
            {isLoading ? (
              <div className="text-center">
                <p className="text-[#8b8b8bff] text-base font-bold">Loading deals...</p>
              </div>
            ) : restaurantDeals.length > 0 ? (
              <div className="space-y-4">
                {restaurantDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDealClick={handleDealCardClick}
                    onSeeItemsClick={handleSeeItemsClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[#8b8b8bff] text-base font-bold">There are no deals available</p>
              </div>
            )}
          </div>

          {/* More Ways to Save Section */}
          {dashpassDeal && (
            <div className="mb-1">
              <h3 className="text-xl font-bold text-[#191919ff] mb-2">More ways to save</h3>
              <DealCard
                deal={dashpassDeal}
                onDealClick={handleDealCardClick}
                onSeeItemsClick={handleSeeItemsClick}
              />
            </div>
          )}
        </div>

        {/* Footer with Close Button */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-[#eb1700ff] text-white rounded-[28px] font-bold text-base hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

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

// Deal Card Component
function DealCard({
  deal,
  onDealClick,
  onSeeItemsClick,
}: {
  deal: Deal;
  onDealClick: (deal: Deal) => void;
  onSeeItemsClick: (e: React.MouseEvent, deal: Deal) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    // Only handle click if there's no buttonText (empty button)
    if (!deal.buttonText || deal.buttonText === '') {
      e.preventDefault();
      onDealClick(deal);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl py-2 px-3 flex items-center gap-4 border border-gray-200 ${
        !deal.buttonText || deal.buttonText === '' ? 'cursor-pointer' : ''
      }`}
      data-testid={`deal-card-${deal.id}`}
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
              onClick={e => onSeeItemsClick(e, deal)}
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
              target={deal.buttonLink && deal.buttonLink !== '#' ? '_blank' : undefined}
              rel={deal.buttonLink && deal.buttonLink !== '#' ? 'noopener noreferrer' : undefined}
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
  );
}
