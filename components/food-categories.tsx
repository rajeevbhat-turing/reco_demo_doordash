'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { foodCategorySvgs } from '@/constants/food-category-svgs';

interface FoodCategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export default function FoodCategories({
  selectedCategory,
  onCategorySelect,
}: FoodCategoriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    // Check scroll position after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScrollPosition();
    }, 100);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        clearTimeout(timeoutId);
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  useEffect(() => {
    if (selectedCategory && containerRef.current) {
      const selectedElement = containerRef.current.querySelector(
        `[data-category="${selectedCategory}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
    // Check scroll position after scrolling to selected category
    setTimeout(() => {
      checkScrollPosition();
    }, 300);
  }, [selectedCategory]);

  // Scroll functions
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mt-4 group">
      <div
        ref={containerRef}
        className="flex overflow-x-auto py-4 scrollbar-hide -mx-4 px-4 space-x-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {foodCategorySvgs.map(category => (
          <button
            key={category.id}
            data-category={category.name}
            className={`category-icon flex-shrink-0`}
            onClick={() =>
              onCategorySelect(selectedCategory === category.name ? null : category.name)
            }
          >
            <div className={`w-16 h-16 relative rounded-full bg-white`}>
              <div className="w-full h-full">{category.svg}</div>
            </div>
            <span
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.name ? 'text-blue-600' : ''
              }`}
            >
              {category.name}
            </span>
          </button>
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
