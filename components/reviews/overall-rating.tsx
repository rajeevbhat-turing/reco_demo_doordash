'use client';

import { getDefaultRating } from '@/lib/utils/rating-utils';

interface OverallRatingProps {
  averageRating: number;
  totalReviews: number;
}

export default function OverallRating({ averageRating, totalReviews }: OverallRatingProps) {
  // Calculate the percentage for the circular progress
  const percentage = (averageRating / 5) * 100;

  // SVG dimensions and calculations
  const width = 75;
  const height = 75;
  const radius = 27.5;
  const circumference = 2 * Math.PI * radius; // 172.78759594743863

  // Calculate stroke-dasharray and stroke-dashoffset based on rating
  const progressLength = (percentage / 100) * circumference;
  const strokeDasharray = `${progressLength} ${circumference}`;
  // strokeDashoffset = gap at start (27.5%)
  const strokeDashoffset = circumference * 0.275;

  // Format rating to show one decimal only if decimal is not 0
  const ratingValue = getDefaultRating(averageRating);
  const rounded = Math.round(ratingValue * 10) / 10; // Round to 1 decimal
  const formattedRating = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);

  return (
    <div className="bg-[#f7f7f7] rounded-lg p-3 flex flex-col items-center justify-center h-full">
      {/* Circular Rating */}
      <div className="relative w-20 h-20 mb-2">
        <svg width={width} height={height}>
          <circle
            stroke="#ffffff"
            strokeWidth="9"
            fill="transparent"
            r="27.5"
            cx="50%"
            cy="50%"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            style={{
              transform: 'rotate(135deg)',
              transformOrigin: 'center center',
              filter: 'drop-shadow(var(--usage-elevation-1))',
            }}
          ></circle>
          <circle
            stroke="#E8C500"
            strokeWidth="9"
            fill="transparent"
            r="27.5"
            cx="50%"
            cy="50%"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transform: 'rotate(135deg)',
              transformOrigin: 'center center',
              transition: 'stroke-dashoffset 1s',
            }}
          ></circle>
        </svg>

        {/* Rating number */}
        <div className="absolute inset-0 flex items-center justify-center left-[-3px] top-[-5px]">
          <span className="text-[18px] font-bold text-[#606060ff]">
            {formattedRating}
          </span>
        </div>

        {/* Star positioned in the gap (lower center) */}
        <div className="absolute bottom-[10px] left-1/2 transform -translate-x-1/2 translate-y-[3px]">
          <svg className="w-6 h-6 text-[#606060ff]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <p className="text-[14px] text-[#606060ff] font-bold">of 5 stars</p>
    </div>
  );
}
