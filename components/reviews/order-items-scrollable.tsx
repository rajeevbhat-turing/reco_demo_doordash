'use client';

import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { OrderItem } from '@/types/review-types';
import MenuItemDialog from '@/components/menu-item-dialog';
import type { MenuItem } from '@/constants/menu-items';
import { useRestaurantMenu } from '@/lib/hooks/use-restaurant-menu';

interface OrderItemsScrollableProps {
  items: OrderItem[];
  liked?: boolean;
  restaurantId?: string;
}

export default function OrderItemsScrollable({
  items,
  liked,
  restaurantId,
}: OrderItemsScrollableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Fetch menu items for the restaurant from backend
  const { data: menuData } = useRestaurantMenu(restaurantId || '');
  const menuItems = menuData?.menuItems || [];

  // Find menu item by menuItemId (from order_items.menu_item_id)
  const getMenuItemByOrderItem = (orderItem: OrderItem): MenuItem | null => {
    if (!orderItem.menuItemId) {
      return null;
    }
    console.log('menuItems', menuItems, 'orderItem.menuItemId', orderItem.menuItemId);
    
    return menuItems.find(item => item.id === orderItem.menuItemId) || null;
  };

  // Open menu item dialog (similar to store page implementation)
  const openItemDialog = (orderItem: OrderItem) => {
    const restaurantIdToUse = restaurantId || orderItem.restaurantId;
    const menuItem = getMenuItemByOrderItem(orderItem);

    if (menuItem) {
      // Ensure the item has the restaurantId property
      // Create a properly typed object that matches MenuItemDialog's expected type
      const itemWithRestaurantId: MenuItem = {
        ...menuItem,
        restaurantId: restaurantIdToUse,
        image: menuItem.image || '/placeholder.svg',
      } as MenuItem;
      setSelectedItem(itemWithRestaurantId);
      setMenuItemDialogOpen(true);
    }
  };

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
  }, [items]);

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
        {items.map(item => (
          <div
            key={`order-item-${item.id}`}
            className="rounded-lg flex items-center justify-between gap-3 min-w-[150px] flex-shrink-0 border border-[#e4e4e4] 
            cursor-pointer hover:border-gray-300 transition-colors"
            onClick={() => openItemDialog(item)}
          >
            {/* Left Section - Text Content */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 px-3 py-4">
              <span className="text-sm font-bold text-[#191919ff] truncate max-w-[120px]">
                {item.name}
              </span>
              {liked && (
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-[#606060ff]" />
                  <span className="text-xs text-[#606060ff] font-medium">
                    {liked ? 'Liked' : 'Disliked'}
                  </span>
                </div>
              )}
            </div>
            {/* Right Section - Image */}
            {item.image && (
              <div className="w-20 h-20 relative rounded-r-lg overflow-hidden flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            )}
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

      {/* Menu Item Dialog */}
      <MenuItemDialog
        isOpen={menuItemDialogOpen}
        onClose={() => {
          setMenuItemDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem as any}
      />
    </div>
  );
}
