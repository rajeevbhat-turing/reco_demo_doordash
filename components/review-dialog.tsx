'use client';

import type React from 'react';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Star, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useReviewStore } from '@/store/review-store';
import { FilledLightbulbIcon } from '@/lib/utils/icons';
import { OrderItem } from '@/types/review-types';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  vendorId?: string;
  vendorLogo?: string;
  onSubmit?: (rating: number, reviewText: string, likedItems?: OrderItem[]) => void;
  defaultRating?: number;
  orderItems?: OrderItem[]; // Order items for selection (only for order reviews)
  orderDate?: string; // Order date/time for order reviews (e.g., "Oct 29, 2025, 4:39 PM")
}

export default function ReviewDialog({
  isOpen,
  onClose,
  restaurantName,
  vendorId,
  vendorLogo,
  defaultRating,
  onSubmit,
  orderItems,
  orderDate,
}: ReviewDialogProps) {
  const currentUser = useUserStore(state => state.currentUser);
  const { addReview } = useReviewStore();
  const [rating, setRating] = useState<number>(defaultRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  // Track item recommendations: 'liked' | 'disliked' | null
  const [itemRecommendations, setItemRecommendations] = useState<Map<string, 'liked' | 'disliked'>>(
    new Map()
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<{ type: string | null; message: string | null }>({
    type: null,
    message: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<number>(0);
  const [submittedText, setSubmittedText] = useState<string>('');
  const [submittedLikedItems, setSubmittedLikedItems] = useState<OrderItem[]>([]);

  // Format user name: FirstName L. (first name + first letter of last name)
  const getUserDisplayName = () => {
    if (!currentUser?.name) return 'User';
    const nameParts = currentUser.name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0];
    const firstName = nameParts[0];
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  const handleDone = useCallback(() => {
    if (onSubmit) {
      if (vendorId && currentUser) {
        // Add review to review store
        addReview({
          vendorId: vendorId,
          vendorName: restaurantName,
          vendorLogo: vendorLogo,
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userAvatar: currentUser.avatar ?? null,
          rating: rating,
          content: reviewText.trim(),
          photos: [],
          ratedHelpfulBy: [],
          likedItems: submittedLikedItems,
        });
      }

      // If onSubmit callback was provided, call it now (after showing success message)
      onSubmit(submittedRating, submittedText, submittedLikedItems);
    }
    onClose();
  }, [onSubmit, submittedRating, submittedText, submittedLikedItems, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (showSuccess) {
            // If showing success, call handleDone to trigger onSubmit callback
            handleDone();
          } else {
            onClose();
          }
        }
      };

      // Add event listener for outside click
      const handleClickOutside = (event: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
          if (showSuccess) {
            // If showing success, call handleDone to trigger onSubmit callback
            handleDone();
          } else {
            onClose();
          }
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);

      // Focus the textarea when the dialog opens (if not showing success)
      if (textareaRef.current && !showSuccess) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose, showSuccess, handleDone]);

  // Reset rating and form state when dialog opens with a new defaultRating
  useEffect(() => {
    if (isOpen) {
      setRating(defaultRating || 0);
      setHoverRating(0);
      setReviewText('');
      setItemRecommendations(new Map());
      setError({ type: null, message: null });
      setShowSuccess(false);
    }
  }, [isOpen, defaultRating]);

  // Set item recommendation (liked or disliked)
  const setItemRecommendation = (itemId: string, recommendation: 'liked' | 'disliked') => {
    setItemRecommendations(prev => {
      const newMap = new Map(prev);
      // If clicking the same button, remove the recommendation (toggle off)
      if (newMap.get(itemId) === recommendation) {
        newMap.delete(itemId);
      } else {
        // Otherwise, set the new recommendation
        newMap.set(itemId, recommendation);
      }
      return newMap;
    });
  };

  if (!isOpen) return null;

  // Highlights stars on hover for better UX
  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  // Removes star highlight when mouse leaves
  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setHoverRating(0); // Clear hover when rating is selected
    // Clear rating error if rating is selected
    if (newRating > 0 && error.type === 'rating') {
      setError({ type: null, message: null });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setReviewText(newValue);

    // Check for max character limit
    if (newValue.length > 2000) {
      setError({ type: 'input', message: 'Max character limit' });
    } else if (newValue.length >= 10 && error.type === 'input') {
      // Clear input error if text is valid
      setError({ type: null, message: null });
    } else if (newValue.length < 2000 && error.message === 'Max character limit') {
      // Clear max character limit error if text is less than 2000 characters and previous error was max character limit
      setError({ type: null, message: null });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate rating
    if (rating === 0) {
      setError({ type: 'rating', message: 'Rating required' });
      return;
    }

    // Validate review text
    if (reviewText.trim().length < 10) {
      setError({ type: 'input', message: 'Min characters: 10' });
      return;
    }

    // Validate max character limit
    if (reviewText.length > 2000) {
      setError({ type: 'input', message: 'Max character limit' });
      return;
    }

    // Clear any errors if validation passes
    setError({ type: null, message: null });

    // Get liked items array from orderItems if orderItems is provided
    const likedItemsArray: OrderItem[] = orderItems
      ? orderItems.filter(item => itemRecommendations.get(item.id) === 'liked')
      : [];

    // Store submitted data for success message FIRST
    setSubmittedRating(rating);
    setSubmittedText(reviewText.trim());
    setSubmittedLikedItems(likedItemsArray);
    setShowSuccess(true);

    // If no onSubmit callback, add to review store immediately
    if (!onSubmit && vendorId && currentUser) {
      // Legacy behavior: Add review to store if vendorId is provided
      addReview({
        vendorId: vendorId,
        vendorName: restaurantName,
        vendorLogo: vendorLogo,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userAvatar: currentUser.avatar,
        rating: rating,
        content: reviewText.trim(),
        photos: [],
        ratedHelpfulBy: [],
        likedItems: [],
      });
    }
    // Note: onSubmit callback will be called when user clicks "Done" on success screen
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-auto"
      >
        <div className="pt-6 pb-4">
          <button
            onClick={showSuccess ? handleDone : onClose}
            className={`absolute top-6 ${showSuccess ? 'left-4' : 'left-6'}`}
            aria-label="Close dialog"
          >
            <X className="h-6 w-6 text-[#191919ff]" />
          </button>

          {showSuccess ? (
            // Success Message View
            <>
              <h2 className="text-3xl font-bold mb-6 mt-8 text-[#191919ff] px-4">
                Thanks for leaving a review!
              </h2>

              {/* Review Preview Card */}
              <div
                className="mx-auto mb-6 max-w-[400px] bg-white rounded-lg px-4 py-6"
                style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 4px' }}
              >
                {/* User Info and Status */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[16px] text-[#191919ff]">
                      {getUserDisplayName()}
                    </span>
                    {/* Pending Badge */}
                    {/* <div className="flex items-center gap-1 p-1 bg-[#e7e7e7] rounded-md flex-shrink-0">
                      <span className="text-xs font-bold text-[#191919ff]">Pending</span>
                    </div> */}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= submittedRating
                              ? 'fill-[#494949] text-[#494949]'
                              : 'text-[#494949]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#191919ff] font-medium">
                      today • Reviewed on{' '}
                      <img
                        src="/dashpass-icon.svg"
                        alt="DoorDash"
                        width={24}
                        height={24}
                        className="inline-block ml-1"
                      />
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="text-sm font-medium text-[#191919ff] leading-relaxed">
                  {submittedText}
                </div>
              </div>

              {/* Information Text */}
              {/* <p className="text-base font-medium text-[#191919ff] mb-2 px-4">
                Your review has been submitted. We'll check your store review to ensure it meets our{' '}
                <span className="text-red-600">Review Guidelines</span>. You'll receive an email
                when your store review is approved and added to this store's page.
              </p> */}

              {/* Done Button */}
              <div className="flex justify-end px-4 border-t border-gray-200 pt-4">
                <button
                  onClick={handleDone}
                  className="px-3 py-2 rounded-full text-white font-bold text-base bg-red-500 hover:bg-red-600"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            // Review Form View
            <>
              {/* Get Help button - Only show when orderItems is provided */}
              {/* Get Help button hidden for now. */}
              {/* {orderItems && orderItems.length > 0 && (
                <button className="text-sm font-medium text-[#191919ff] hover:underline absolute right-6 top-8">
                  Get Help
                </button>
              )} */}

              {/* Store Details Header - Only show when orderItems is provided */}
              {orderItems && orderItems.length > 0 && (
                <div className="px-6 pt-12 pb-2 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#191919ff] mb-1">
                        {restaurantName}
                      </h3>
                      {orderDate && <p className="text-sm text-[#494949]">{orderDate}</p>}
                    </div>
                    {vendorLogo && (
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={vendorLogo}
                          alt={restaurantName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-bold text-[#191919ff] px-6 mt-4">
                {orderItems && orderItems.length > 0 ? 'Review this store' : 'Add a Public Review'}
              </h2>

              {/* "How was your food?" question - Only show when orderItems is provided */}
              {orderItems && orderItems.length > 0 && (
                <p className="text-[15px] font-medium text-[#191919ff] px-6 mt-2 mb-3">
                  How was your food?
                </p>
              )}

              {(!orderItems || orderItems.length === 0) && (
                <h3 className="text-base font-medium text-[#494949] mb-4 px-6">{restaurantName}</h3>
              )}

              <div className="bg-gray-50 rounded-md mb-2 mx-6">
                <div
                  className={`pt-5 ${
                    error?.type === 'rating'
                      ? 'border-2 border-red-700 rounded-lg bg-[#fef0ed]'
                      : ''
                  }`}
                >
                  {(!orderItems || orderItems?.length === 0) && (
                    <div className="flex justify-between items-center mb-2 px-5">
                      <div className="text-base font-bold text-[#191919ff]">
                        {getUserDisplayName()}
                      </div>
                      <div className="flex items-center bg-gray-200 rounded-md px-1 py-2">
                        <span className="mr-1 text-sm font-medium text-[#191919ff]">Everyone</span>
                        {/* <Info className="h-5 w-5 text-[#191919ff]" /> */}
                      </div>
                    </div>
                  )}

                  <div className="flex mb-6 px-5">
                    {[1, 2, 3, 4, 5].map(star => {
                      const displayRating = hoverRating || rating;
                      return (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer ${
                            star <= displayRating
                              ? 'fill-[#191919ff] text-[#191919ff]'
                              : 'text-[#b2b2b2]'
                          }`}
                          onMouseEnter={() => handleStarHover(star)}
                          onMouseLeave={handleStarLeave}
                          onClick={() => handleRatingChange(star)}
                        />
                      );
                    })}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={reviewText}
                  onChange={handleTextChange}
                  placeholder={
                    orderItems && orderItems.length > 0
                      ? 'How was your food? You may want to mention specific items like the Kimchi Fried Rice.'
                      : "Write a review, it's helpful to include details about taste, quality, and portions."
                  }
                  className={`w-full p-4 border-2 bg-[#f7f7f7] border-[#f7f7f7] rounded-lg focus:border-[#191919ff] 
              focus:ring-0 focus:outline-none min-h-[120px] ${
                error?.type === 'input' ? 'border-red-700 bg-[#fef0ed]' : ''
              }`}
                />

                {/* Note about review approval - Only show when orderItems is provided */}
                {orderItems && orderItems.length > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-2 pt-5 px-5">
                      <div className="text-base font-bold text-[#191919ff]">
                        {getUserDisplayName()}
                      </div>
                      <div className="flex items-center bg-gray-200 rounded-md px-1 py-2">
                        <span className="mr-1 text-sm font-medium text-[#191919ff]">Everyone</span>
                        {/* <Info className="h-5 w-5 text-[#191919ff]" /> */}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#191919ff] px-5 mt-4 pb-4">
                      Once approved, your review will appear on the store and on your public
                      profile.
                    </p>
                  </>
                )}
              </div>

              {error?.message ? (
                <div className="flex items-center gap-2 px-6">
                  <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="text-[#b71000ff] text-sm font-medium">{error.message}</div>
                </div>
              ) : reviewText.length >= 10 ? (
                <div className="flex items-center gap-2 px-6 text-[#00838a]">
                  <FilledLightbulbIcon />
                  <div className="text-[#00838a] text-sm font-medium">
                    Adding more details helps out fellow customers
                  </div>
                </div>
              ) : (
                <div className="text-[#767676] text-sm font-medium px-6">Min characters: 10</div>
              )}

              {/* Order Items Selection - Only show when orderItems prop is provided */}
              {orderItems && orderItems.length > 0 && (
                <div className="px-6 mb-4 mt-2">
                  <p className="text-base font-bold text-[#191919ff] mb-4">
                    Do you recommend these dishes?
                  </p>
                  <div className="space-y-3">
                    {orderItems.map(item => {
                      const recommendation = itemRecommendations.get(item.id);
                      const isLiked = recommendation === 'liked';
                      const isDisliked = recommendation === 'disliked';

                      return (
                        <div key={`order-item-${item.id}`} className="flex items-center gap-3">
                          {/* Item Image */}
                          {item.image && (
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#191919ff] mb-1">
                              {item.name}
                            </p>
                            {item.price !== undefined && (
                              <p className="text-sm text-[#494949]">${item.price.toFixed(2)}</p>
                            )}
                          </div>

                          {/* Like/Dislike Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setItemRecommendation(item.id, 'disliked');
                              }}
                              className={`p-2.5 rounded-full border transition-colors ${
                                isDisliked ? 'bg-[#191919ff]' : 'bg-gray-200'
                              }`}
                            >
                              <ThumbsDown
                                className={`w-5 h-5 ${
                                  isDisliked ? 'text-white' : 'text-[#191919ff]'
                                }`}
                              />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setItemRecommendation(item.id, 'liked');
                              }}
                              className={`p-2.5 rounded-full border transition-colors ${
                                isLiked ? 'bg-[#191919ff]' : 'bg-gray-200'
                              }`}
                            >
                              <ThumbsUp
                                className={`w-5 h-5 ${isLiked ? 'text-white' : 'text-[#191919ff]'}`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-gray-200 pt-4 mt-4 px-6">
                <button
                  onClick={handleSubmit}
                  className="px-3 py-2 rounded-full text-white font-bold text-base bg-red-500 hover:bg-red-600"
                >
                  {orderItems && orderItems.length > 0 ? 'Submit Review' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
