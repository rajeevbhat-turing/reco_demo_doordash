'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { X, Star, Info } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useReviewStore } from '@/store/review-store';
import { FilledLightbulbIcon } from '@/lib/utils/icons';
import Image from 'next/image';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  vendorId?: string;
  vendorLogo?: string;
  onSubmit?: (rating: number, reviewText: string) => void;
  defaultRating?: number;
}

export default function ReviewDialog({
  isOpen,
  onClose,
  restaurantName,
  vendorId,
  vendorLogo,
  defaultRating,
  onSubmit,
}: ReviewDialogProps) {
  const currentUser = useUserStore(state => state.currentUser);
  const { addReview } = useReviewStore();
  const [rating, setRating] = useState<number>(defaultRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<{ type: string | null; message: string | null }>({
    type: null,
    message: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<number>(0);
  const [submittedText, setSubmittedText] = useState<string>('');

  // Format user name: FirstName L. (first name + first letter of last name)
  const getUserDisplayName = () => {
    if (!currentUser?.name) return 'User';
    const nameParts = currentUser.name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0];
    const firstName = nameParts[0];
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (showSuccess) {
            // If showing success, call handleDone to trigger onSubmit callback
            if (onSubmit) {
              onSubmit(submittedRating, submittedText);
            }
            onClose();
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
            if (onSubmit) {
              onSubmit(submittedRating, submittedText);
            }
            onClose();
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
  }, [isOpen, onClose, showSuccess, onSubmit, submittedRating, submittedText]);

  // Reset rating and form state when dialog opens with a new defaultRating
  useEffect(() => {
    if (isOpen) {
      setRating(defaultRating || 0);
      setHoverRating(0);
      setReviewText('');
      setError({ type: null, message: null });
      setShowSuccess(false);
    }
  }, [isOpen, defaultRating]);

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
    setReviewText(e.target.value);
    // Clear input error if text is valid
    if (e.target.value.length >= 10 && error.type === 'input') {
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

    // Clear any errors if validation passes
    setError({ type: null, message: null });

    // Store submitted data for success message FIRST
    setSubmittedRating(rating);
    setSubmittedText(reviewText.trim());
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

  const handleDone = () => {
    // If onSubmit callback was provided, call it now (after showing success message)
    if (onSubmit) {
      onSubmit(submittedRating, submittedText);
    }
    onClose();
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
                    <div className="flex items-center gap-1 p-1 bg-[#e7e7e7] rounded-md flex-shrink-0">
                      {/* <Info className="h-4 w-4 text-[#191919ff]" /> */}
                      <span className="text-xs font-bold text-[#191919ff]">Pending</span>
                    </div>
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
                      <Image
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
              <p className="text-base font-medium text-[#191919ff] mb-2 px-4">
                Your review has been submitted. We'll check your store review to ensure it meets our{' '}
                <span className="text-red-600">Review Guidelines</span>. You'll receive an email
                when your store review is approved and added to this store's page.
              </p>

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
              <h2 className="text-3xl font-bold mb-4 mt-8 text-[#191919ff] px-6">
                Add a Public Review
              </h2>
              <h3 className="text-base font-medium text-[#494949] mb-4 px-6">{restaurantName}</h3>

              <div className="bg-gray-50 rounded-md mb-2 mx-6">
            <div
              className={
                    error?.type === 'rating'
                      ? 'border-2 border-red-700 rounded-lg bg-[#fef0ed]'
                      : ''
              }
            >
              <div className="flex justify-between items-center mb-2 pt-5 px-5">
                    <div className="text-base font-bold text-[#191919ff]">
                      {getUserDisplayName()}
                    </div>
                <div className="flex items-center bg-gray-200 rounded-md px-1 py-2">
                  <span className="mr-1 text-sm font-medium text-[#191919ff]">Everyone</span>
                  {/* <Info className="h-5 w-5 text-[#191919ff]" /> */}
                </div>
              </div>

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
              placeholder="Write a review, it's helpful to include details about taste, quality, and portions."
              className={`w-full p-4 border-2 bg-[#f7f7f7] border-[#f7f7f7] rounded-lg focus:border-[#191919ff] 
              focus:ring-0 focus:outline-none min-h-[120px] ${
                error?.type === 'input' ? 'border-red-700 bg-[#fef0ed]' : ''
              }`}
            />
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

              <div className="flex justify-end border-t border-gray-200 pt-4 mt-4 px-6">
            <button
              onClick={handleSubmit}
              className="px-3 py-2 rounded-full text-white font-bold text-base bg-red-500 hover:bg-red-600"
            >
              Submit
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
