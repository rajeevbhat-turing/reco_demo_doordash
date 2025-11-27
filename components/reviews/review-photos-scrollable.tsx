'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoInfo {
  photo: string;
  userName: string;
  timestamp: string;
}

interface ReviewPhotosScrollableProps {
  photos: string[];
  userName: string;
  timestamp: string;
  onPhotoClick: (photoInfo: PhotoInfo) => void;
}

export default function ReviewPhotosScrollable({
  photos,
  userName,
  timestamp,
  onPhotoClick,
}: ReviewPhotosScrollableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    // Check scroll position after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScrollPosition();
    }, 100);

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        clearTimeout(timeoutId);
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [photos]);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-4 relative group">
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.map((photo, index) => (
          <div
            key={`review-photo-${index}`}
            className="w-[103px] h-[103px] relative rounded-lg overflow-hidden cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity"
            onClick={() => {
              onPhotoClick({
                photo,
                userName,
                timestamp,
              });
            }}
          >
            <img src={photo} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-[#191919ff]" strokeWidth={2} />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-[#191919ff]" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
