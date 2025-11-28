'use client';
import { useState } from 'react';

interface RatingProps {
  initialRating?: number;
  onChange?: (rating: number) => void;
}

export const Rating = ({ initialRating = 0, onChange }: RatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRating = (value: number) => {
    setRating(value);
    if (onChange) onChange(value);
  };

  const StarIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <div className="flex items-center">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className="focus:outline-none"
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <span
              className={`${
                star <= (hover || rating)
                  ? 'text-[#2563EB]' // DashDoor blue color when selected/hovered
                  : 'text-[#E6E6E6]' // Light gray for empty stars
              }`}
            >
              <StarIcon />
            </span>
          </button>
        ))}
      </div>
      <span className="ml-2 text-sm text-gray-500">• Leave a review</span>
    </div>
  );
};
