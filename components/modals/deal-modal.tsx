'use client';

import { useEffect, useRef, useMemo } from 'react';
import { X, Plus, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { type Deal } from '@/types/deal-types';
import { type MenuItem } from '@/constants/menu-items';
import { useCartStore } from '@/store/cart-store';
import { getRestaurantById } from '@/lib/utils/restaurant-utils';
import { useGlobalContext } from '@/app/global-context';
import { useRestaurantMenu } from '@/lib/hooks/use-restaurant-menu';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useUserStore } from '@/store/user-store';
import MenuItemDialog from '@/components/menu-item-dialog';
import { useState } from 'react';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
}

export default function DealModal({ isOpen, onClose, deal }: DealModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { addItem, setCategory } = useCartStore();
  const { setSnackbar } = useGlobalContext();
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set cart category to restaurant
      setCategory('restaurant');

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
  }, [isOpen, onClose, setCategory]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Fetch menu items from API if restaurantId is available
  const { data: menuData } = useRestaurantMenu(
    deal?.restaurantId || undefined,
    !!deal?.restaurantId
  );

  // Get free items menu data
  const freeItemsMenuData = useMemo(() => {
    if (!deal?.freeItems || deal.freeItems.length === 0) return [];
    if (!menuData?.menuItems) return [];
    
    return deal.freeItems
      .map(freeItem => {
        // Match by ID (both are strings)
        const menuItem = menuData.menuItems.find(
          item => item.id === freeItem.id
        );
        return menuItem ? { ...menuItem, freeItemId: freeItem.id } : null;
      })
      .filter((item): item is MenuItem & { freeItemId: string } => item !== null);
  }, [deal?.freeItems, menuData?.menuItems]);

  // Get user's address for fetching restaurants
  const currentUser = useUserStore(state => state.currentUser);
  const defaultAddress = currentUser?.addresses.find(a => a.default);

  // Fetch restaurants from API
  const { data: restaurants } = useRestaurants(
    defaultAddress?.lat,
    defaultAddress?.lng,
    10 // 10 mile radius
  );

  // Get restaurant name
  const restaurant = useMemo(() => {
    if (!deal?.restaurantId || !restaurants) return null;
    return getRestaurantById(restaurants, deal.restaurantId);
  }, [deal?.restaurantId, restaurants]);

  // Handle add to cart
  const handleAddToCart = (item: MenuItem) => {
    if (!deal) return;

    // Check if item has modifications
    if (item.modifications && item.modifications.length > 0) {
      // Item has modifications - open dialog instead
      setSelectedItem(item);
      setMenuItemDialogOpen(true);
      return;
    }

    // No modifications - add directly to cart
    const cartItem = {
      id: item.id, // Use database ID directly
      itemName: item.name,
      price: item.price,
      image: item.image || '',
    };

    const restaurantId = item.restaurantId || deal.restaurantId;
    addItem(cartItem, 'restaurant', restaurant?.name, restaurantId || undefined);

    // Display snackbar
    setSnackbar({
      message: 'Item added',
      autoHideDuration: 3000,
    });
  };

  if (!isOpen || !deal) return null;

  // Format the offer text based on discount type or free items
  const getOfferText = () => {
    if (deal.freeItems && deal.freeItems.length > 0 && deal.minimumPurchase) {
      return `Free item on $${deal.minimumPurchase}+`;
    }
    if (deal.discountType === 'percentage' && deal.discountValue && deal.maximumDiscount) {
      return `${deal.discountValue}% off, up to $${deal.maximumDiscount}`;
    } else if (deal.discountType === 'percentage' && deal.discountValue) {
      return `${deal.discountValue}% off`;
    } else if (deal.discountType === 'fixed' && deal.discountValue) {
      return `$${deal.discountValue} off`;
    }
    return deal.title;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full 
          transition-colors shadow-xl bg-white"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-[#191919ff]" strokeWidth={2} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 pt-5 pb-5">
          {/* Title */}
          <h2 className="text-3xl font-bold text-[#191919ff] mb-4">{getOfferText()}</h2>

          {/* Conditions */}
          <div className="space-y-1 mb-5">
            {deal.minimumPurchase && (
              <div className="flex items-center gap-2">
                <span className="text-[#606060ff] text-xs">•</span>
                <p className="text-base font-medium text-[#606060ff]">
                  Spend ${deal.minimumPurchase}+ (excluding fees) to apply
                </p>
              </div>
            )}
            {deal.freeItems && deal.freeItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[#606060ff] text-xs">•</span>
                <p className="text-base font-medium text-[#606060ff]">
                  Limit 1 eligible free item per order
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[#606060ff] text-xs">•</span>
              <p className="text-base font-medium text-[#606060ff]">Fees apply</p>
            </div>
          </div>

          {/* Terms and Conditions Link */}
          <a
            href="#"
            className="text-xs font-medium text-[#313131ff] underline mb-6 block"
            onClick={e => {
              e.preventDefault();
              // Handle terms and conditions navigation
            }}
          >
            Terms and Conditions
          </a>

          {/* Free Items List */}
          {freeItemsMenuData.length > 0 && (
            <div className="space-y-4">
              {freeItemsMenuData.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-4 py-2 bg-white border border-gray-200 rounded-lg relative"
                >
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#191919ff] mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-[#606060ff] font-medium line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-[#606060ff]">{item.price}</span>
                      {item.rating && item.rating != 0 && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4 text-[#606060ff]" strokeWidth={2} />
                          <span className="text-sm text-[#606060ff] font-medium">
                            {typeof item.rating === 'string' ? item.rating : `${item.rating}%`}
                            {item.ratingCount && ` (${item.ratingCount})`}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Free Tag */}
                    <div className="inline-block p-0.5 bg-[#fef0ed] text-[#d91400ff] text-xs font-bold">
                      Free on ${deal.minimumPurchase}+
                    </div>
                  </div>

                  {/* Item Image */}
                  <div className="flex-shrink-0 w-[100px] h-[100px] relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-[100px] h-[100px] bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Add Button */}
                  <div className="flex-shrink-0 absolute right-1 bottom-1">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-xl"
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus className="w-4 h-4 text-[#191919ff]" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
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

      {/* Menu Item Dialog */}
      {selectedItem && (
        <MenuItemDialog
          isOpen={menuItemDialogOpen}
          onClose={() => setMenuItemDialogOpen(false)}
          item={{
            ...selectedItem,
            image: selectedItem.image || '',
            description: selectedItem.description || undefined,
            rating:
              typeof selectedItem.rating === 'number'
                ? selectedItem.rating
                : typeof selectedItem.rating === 'string'
                ? parseFloat(selectedItem.rating) || undefined
                : undefined,
            ratingCount: selectedItem.ratingCount ?? undefined,
          }}
        />
      )}
    </div>
  );
}
