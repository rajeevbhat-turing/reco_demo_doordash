'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { type Deal } from '@/types/deal-types';
import { useDealsStore } from '@/store/deals-store';
import { DashDoorLogoMark } from '../common/Icons';
import { checkDealCriteria } from '@/lib/utils/deal-utils';
import { useCheckoutDeals } from '@/lib/hooks/use-deals';

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: string;
  cartSubtotal?: number;
  cartItems?: Array<{ id: string | number; itemName: string; [key: string]: any }>;
  cartId?: string; // storeId + category combination
}

export default function PromoCodeModal({
  isOpen,
  onClose,
  restaurantId,
  cartSubtotal = 0,
  cartItems = [],
  cartId,
}: PromoCodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [promoCode, setPromoCode] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');
  const [error, setError] = useState<{
    promocode: string | null;
    giftCard: string | null;
    deals: { dealId: string; message: string } | null;
  }>({
    promocode: null,
    giftCard: null,
    deals: null,
  });

  const { getAppliedDealId, applyDeal, removeDeal } = useDealsStore();

  // Get applied deal ID for this cart
  const appliedDealId = cartId ? getAppliedDealId(cartId) : null;

  // Get deals from API: restaurant-specific + common deals (no DashPass deal)
  const { data: allDeals, isLoading: isLoadingDeals } = useCheckoutDeals(restaurantId);

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

  // Handle apply promo code
  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) return;

    setError({ promocode: null, giftCard: null, deals: null });

    // Find deal by promocode
    const deal = allDeals.find(d => d.promocode?.toUpperCase() === promoCode.trim().toUpperCase());

    if (!deal) {
      setError({ promocode: 'Invalid promo code', giftCard: null, deals: null });
      return;
    }

    const criteriaCheck = checkDealCriteria(deal, cartItems, cartSubtotal);
    if (!criteriaCheck.meets) {
      setError({
        promocode:
          criteriaCheck.message ||
          'To use this promotion, make sure your cart contains the required items.',
        giftCard: null,
        deals: null,
      });
      return;
    }

    // Apply the deal (for both discount and free item deals)
    if (cartId) {
      // For free item deals, get the free item IDs from cart
      let freeItemIds: string[] = [];
      if (deal.freeItems && deal.freeItems.length > 0) {
        const dealFreeItemIds = deal.freeItems.map(fi => fi.id);
        // Find matching cart items
        cartItems.forEach(item => {
          let itemId = typeof item.id === 'string' ? item.id : item.id.toString();
          const itemName = (item.itemName || '').toLowerCase().trim();

          // If item ID starts with store ID, remove it before checking
          if (deal.restaurantId && itemId.startsWith(deal.restaurantId + '-')) {
            itemId = itemId.substring(deal.restaurantId.length + 1);
          }

          dealFreeItemIds.forEach(freeId => {
            // Check if cart item matches the free item ID (by ID and name)
            const matchesById = itemId.startsWith(freeId + '-') || itemId === freeId;
            const freeItemName = deal.freeItems
              ?.find(fi => fi.id === freeId)
              ?.name.toLowerCase()
              .trim();
            const matchesByName = freeItemName && itemName === freeItemName;

            if (matchesById && matchesByName) {
              // Use the free item ID from the deal, not extracted from cart item
              if (!freeItemIds.includes(freeId)) {
                freeItemIds.push(freeId);
              }
            }
          });
        });
      }

      applyDeal(deal.id, cartId, freeItemIds.length > 0 ? freeItemIds : undefined);
      setError({ promocode: null, giftCard: null, deals: null });
      onClose(); // Close modal on successful apply
    }
  };

  // Handle apply deal
  const handleApplyDeal = (deal: Deal) => {
    setError({ promocode: null, giftCard: null, deals: null });

    const criteriaCheck = checkDealCriteria(deal, cartItems, cartSubtotal);
    if (!criteriaCheck.meets) {
      setError({
        promocode: null,
        giftCard: null,
        deals: {
          dealId: deal.id,
          message:
            criteriaCheck.message ||
            'To use this promotion, make sure your cart contains the required items.',
        },
      });
      return;
    }

    // Apply the deal (for both discount and free item deals)
    if (cartId) {
      // For free item deals, only track the FIRST free item found (only one free item should be discounted)
      let freeItemIds: string[] = [];
      if (deal.freeItems && deal.freeItems.length > 0) {
        const dealFreeItemIds = deal.freeItems.map(fi => fi.id);
        let foundFirstFreeItem = false;

        // Find the first matching free item in cart
        cartItems.forEach(item => {
          if (foundFirstFreeItem) return; // Stop after finding first free item

          let itemId = typeof item.id === 'string' ? item.id : item.id.toString();
          const itemName = (item.itemName || '').toLowerCase().trim();

          // If item ID starts with store ID, remove it before checking
          if (deal.restaurantId && itemId.startsWith(deal.restaurantId + '-')) {
            itemId = itemId.substring(deal.restaurantId.length + 1);
          }

          for (const freeId of dealFreeItemIds) {
            const matchesById = itemId.startsWith(freeId + '-') || itemId === freeId;
            const freeItemName = deal.freeItems
              ?.find(fi => fi.id === freeId)
              ?.name.toLowerCase()
              .trim();
            const matchesByName = freeItemName && itemName === freeItemName;

            if (matchesById && matchesByName) {
              // Found the first free item - only track this one
              freeItemIds.push(freeId);
              foundFirstFreeItem = true;
              break;
            }
          }
        });
      }

      applyDeal(deal.id, cartId, freeItemIds.length > 0 ? freeItemIds : undefined);
      setError({ promocode: null, giftCard: null, deals: null });
      onClose(); // Close modal on successful apply
    }
  };

  // Handle remove deal
  const handleRemoveDeal = (dealId: string) => {
    if (cartId) {
      removeDeal(cartId);
      setError({ promocode: null, giftCard: null, deals: null });
    }
  };

  // Handle redeem gift card
  const handleRedeemGiftCard = () => {
    if (!giftCardPin.trim()) return;

    setError({ promocode: null, giftCard: null, deals: null });

    // For now, always show error (as requested - no validation)
    setError({
      promocode: null,
      giftCard: 'Unable to redeem gift card. Enter your gift card PIN again.',
      deals: null,
    });
    // TODO: Implement gift card redemption
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-t-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
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
        <div className="overflow-y-auto flex-1 px-4 pt-2 mt-12 pb-6">
          {/* Title */}
          <h2 className="text-3xl font-bold text-[#191919ff] mb-6">Deals & gift cards</h2>

          {/* Enter Promo Code Section */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#191919ff] mb-1.5">Enter Promo Code</h3>
            <div className="flex relative">
              <Input
                type="text"
                value={promoCode}
                onChange={e => {
                  setPromoCode(e.target.value);
                  setError({ ...error, promocode: null });
                }}
                placeholder=""
                className={`flex-1 px-4 py-4 rounded-lg border-2 border-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
                text-[#191919ff] bg-[#f7f7f7] focus-visible:border-[#191919ff] pr-20 ${
                  error.promocode ? 'border-[#b71000ff] bg-[#fef0ed]' : ''
                }`}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleApplyPromoCode();
                  }
                }}
              />
              <button
                onClick={handleApplyPromoCode}
                disabled={!promoCode.trim()}
                className="absolute right-0 top-0 bottom-0 px-3 py-1.5 bg-transparent text-[#191919ff] disabled:text-[#b2b2b2] font-bold 
                transition-colors disabled:cursor-not-allowed text-sm"
              >
                Apply
              </button>
            </div>
            {/* Promo Code Error Message */}
            {error.promocode && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-[#b71000ff]" fill="white" strokeWidth={3} />
                <p className="text-sm text-[#b71000ff] font-medium">{error.promocode}</p>
              </div>
            )}
          </div>

          {/* Redeem Your Gift Card Section */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-[#191919ff] mb-1.5">Redeem Your Gift Card</h3>
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-red-500 rounded-sm px-1.5 py-0.5 z-10">
                <DashDoorLogoMark width={18} height={13} color="#fff" />
              </div>
              <Input
                type="text"
                value={giftCardPin}
                onChange={e => {
                  setGiftCardPin(e.target.value);
                  setError({ ...error, giftCard: null });
                }}
                placeholder="Enter gift card PIN"
                className={`w-full pl-12 pr-[88px] py-4 border-2 border-transparent focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 
                  rounded-lg text-[#191919ff] bg-[#f7f7f7] focus-visible:border-[#191919ff] ${
                    error.giftCard ? 'border-[#b71000ff] bg-[#fef0ed]' : ''
                  }`}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleRedeemGiftCard();
                  }
                }}
              />
              <button
                onClick={handleRedeemGiftCard}
                disabled={!giftCardPin.trim()}
                className="absolute right-0 top-0 bottom-0 px-3 py-1.5 bg-transparent text-[#191919ff] disabled:text-[#b2b2b2] font-bold 
                transition-colors disabled:cursor-not-allowed text-sm"
              >
                Redeem
              </button>
            </div>
            {/* Gift Card Error Message */}
            {error.giftCard && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-[#b71000ff]" fill="white" strokeWidth={3} />
                <p className="text-sm text-[#b71000ff] font-medium">{error.giftCard}</p>
              </div>
            )}
          </div>

          {/* Rewards & Deals Section */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#191919ff] mb-3">Rewards & Deals</h3>
            <div className="space-y-3">
              {allDeals.map(deal => (
                <div key={deal.id}>
                  <div
                    className={`border rounded-lg p-4 border-text-gray-200 ${
                      error.deals && error.deals.dealId === deal.id
                        ? 'border-2 border-[#b11700ff] bg-[#fef0ed]'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-[#191919ff] mb-1">{deal.title}</h4>
                        <p className="text-sm text-[#606060ff] font-medium">
                          {deal.promocode ? (
                            <>
                              {deal.freeItems && deal.freeItems.length > 0
                                ? `Add ${
                                    deal.freeItems.length === 1
                                      ? deal.freeItems[0].name
                                      : 'free items'
                                  } and code ${deal.promocode} to apply`
                                : deal.minimumPurchase
                                ? `Spend $${deal.minimumPurchase}+ and code ${deal.promocode} to apply`
                                : `Use code ${deal.promocode} to apply`}
                            </>
                          ) : (
                            deal.description
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        appliedDealId === deal.id
                          ? handleRemoveDeal(deal.id)
                          : handleApplyDeal(deal)
                      }
                      className={`mt-3 px-3 py-1.5 rounded-[28px] font-bold text-sm transition-colors ${
                        appliedDealId === deal.id
                          ? 'bg-[#191919ff] text-white hover:bg-gray-800'
                          : 'bg-[#f1f1f1] text-[#191919ff] hover:bg-gray-300'
                      }`}
                    >
                      {appliedDealId === deal.id ? 'Remove' : 'Apply'}
                    </button>
                  </div>
                  {/* Deal Error Message - only show for this specific deal */}
                  {error.deals && error.deals.dealId === deal.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle
                        className="w-4 h-4 text-[#b71000ff]"
                        fill="white"
                        strokeWidth={3}
                      />
                      <p className="text-sm text-[#b71000ff] font-medium">{error.deals.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
