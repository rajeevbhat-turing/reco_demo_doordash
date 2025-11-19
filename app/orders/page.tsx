'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Order } from '@/constants/order-data';
import { useOrdersStore } from '@/store/orders-store';
import { useState, useEffect } from 'react';
import { ChevronRight, ShoppingCart, Receipt, Star } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { prepareOrderForReorder } from '@/lib/reorder-utils';
import { useRouter } from 'next/navigation';
import ReviewDialog from '@/components/review-dialog';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import { useRestaurant } from '@/lib/hooks/use-restaurant';
import { useRestaurantMenu } from '@/lib/hooks/use-restaurant-menu';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';
import { OrderItem as ReviewOrderItem } from '@/types/review-types';

export default function Orders() {
  const router = useRouter();
  const { orders, updateOrderReview } = useOrdersStore();
  const { startReorder } = useCartStore();
  const [activeTab, setActiveTab] = useState<'Personal' | 'Business'>('Personal');
  const [mounted, setMounted] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  // Get restaurant ID for the order being reviewed
  const reviewingRestaurantId =
    reviewingOrder?.storeId || reviewingOrder?.restaurantId || undefined;

  // Fetch restaurant and menu data (hooks automatically skip fetching when ID is undefined)
  const { data: orderRestaurant } = useRestaurant(reviewingRestaurantId);
  const { data: orderMenuData } = useRestaurantMenu(reviewingRestaurantId);

  // Get user address for fetching restaurants
  const currentUser = useUserStore(state => state.currentUser);
  const tempAddress = useUserStore(state => state.getTempAddress());
  const defaultAddress = currentUser?.addresses?.find(a => a.default);
  const activeAddress = defaultAddress || tempAddress;

  // Fetch restaurants from backend
  const { data: restaurants = [], isLoading: isLoadingRestaurants } = useRestaurants(
    activeAddress?.lat,
    activeAddress?.lng
  );

  // Fix hydration by only rendering orders on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to get store name (support both old and new field names)
  const getStoreName = (order: Order) => {
    return order.storeName || order.restaurantName || 'Store';
  };

  // Helper function to get total (support both old and new field names)
  const getTotal = (order: Order) => {
    return order.total || order.totalAmount || 0;
  };

  // Convert order items to review OrderItem format
  const convertOrderItemsToReviewItems = (order: Order): ReviewOrderItem[] => {
    if (!order.items || order.items.length === 0) return [];
    const restaurantId = order.storeId || order.restaurantId || '';

    return order.items.map(item => {
      // Try to find matching menu item by name to get image
      const menuItem = orderMenuData?.menuItems.find(
        mi => mi.id?.toString() === item.id?.toString()
      );

      return {
        id: item.id,
        name: item.name,
        restaurantId: restaurantId,
        image: menuItem?.image || (item as any).image || null,
        menuItemId: menuItem?.id || (item as any).menuItemId,
        price: item.price, // Include price for display
      };
    });
  };

  // Format order date for display
  const formatOrderDate = (order: Order): string => {
    if (order.orderDate) {
      // If orderDate is already formatted, return it
      if (order.orderDate.includes(',')) {
        return order.orderDate;
      }
      // Otherwise, try to format it
      try {
        const date = new Date(order.orderDate);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      } catch {
        return order.orderDate;
      }
    }
    return '';
  };

  // Filter orders by the active tab
  const filteredOrders = orders.filter(order => (order.orderType || 'Personal') === activeTab);

  // Handle reorder functionality
  const handleReorder = async (order: Order) => {
    console.log('[ORDERS] Reorder button clicked for order:', order.id);

    try {
      // Get the restaurant ID from the order
      const restaurantId = order.storeId || order.restaurantId;
      if (!restaurantId) {
        throw new Error('No restaurant ID found in order');
      }

      // Fetch menu items for this restaurant
      let menuItems: any[] = [];
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}/menu`);
        const data = await response.json();
        if (data.success && data.data?.menuItems) {
          menuItems = data.data.menuItems;
        }
      } catch (error) {
        console.warn('[ORDERS] Could not fetch menu items for reorder:', error);
        // Continue without menu items - will use placeholder images
      }

      // Prepare the order for reordering
      const { orderId, items, category, storeId, storeName } = prepareOrderForReorder(
        order,
        restaurants,
        menuItems
      );

      console.log('[ORDERS] Prepared reorder data:', {
        orderId,
        itemCount: items.length,
        category,
        storeId,
        storeName,
      });

      // Start reorder (adds a cart with isReorder flag)
      startReorder(items, category, storeId, storeName);

      // Navigate to the store page (only restaurant category is supported)
      const storePath = `/store/${storeId}`;

      console.log('[ORDERS] Navigating to store page:', storePath);

      // Add a flag to URL to indicate we should open the cart
      router.push(`${storePath}?openCart=true`);
    } catch (error) {
      console.error('[ORDERS] Error during reorder:', error);
      alert('Unable to reorder this order. Please try again.');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-24 pb-12">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Completed</h2>

        {/* Personal/Business Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('Personal')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'Personal'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('Business')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'Business'
                ? 'bg-black text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Business
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-600 mb-2">No {activeTab.toLowerCase()} orders yet</p>
            <p className="text-sm text-gray-500">Your completed orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const totalItems = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
              const itemText = totalItems === 1 ? 'item' : 'items';

              // Check if order is from today
              const today = new Date();
              const todayStr = today.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const isToday = order.orderDate === todayStr;
              const dateDisplay = isToday
                ? `Today, ${order.orderDate.split(', ')[1]}`
                : order.orderDate
                ? new Date(order.orderDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Date Header */}
                  <h3 className="text-base font-semibold px-4 pt-4 pb-3">{dateDisplay}</h3>

                  {/* Hoverable Content Area */}
                  <div
                    className="px-4 pb-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      router.push(`/orders/${order.id}`);
                    }}
                  >
                    {/* Restaurant Name and Arrow */}
                    {order.storeId || order.restaurantId ? (
                      <Link
                        href={`/store/${order.storeId || order.restaurantId}`}
                        className="flex items-center justify-between mb-3 border-b border-gray-200 py-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">{getStoreName(order)}</h4>
                          {order.isDashPass && (
                            <Image src="/dashpass-icon.svg" alt="DashPass" width={16} height={16} />
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">{getStoreName(order)}</h4>
                          {order.isDashPass && (
                            <Image src="/dashpass-icon.svg" alt="DashPass" width={16} height={16} />
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    {/* Order Details - Single Line */}
                    <p className="text-gray-600 text-sm mb-2">
                      ${getTotal(order).toFixed(2)} • {totalItems} {itemText} •{' '}
                      {order.orderType || 'Personal'}
                    </p>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <p className="text-gray-900 text-sm mb-3">
                        {order.items.map((item, idx) => (
                          <span key={item.id}>
                            {item.name}
                            {idx < order.items!.length - 1 && ', '}
                          </span>
                        ))}
                      </p>
                    )}

                    {/* Star Rating and Buttons Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(starNum => (
                          <button
                            key={starNum}
                            onClick={e => {
                              if (order.rating && order.reviewDate) {
                                return; // If order has already been reviewed, don't allow rating again
                              }
                              e.stopPropagation();
                              setSelectedRating(starNum);
                              setReviewingOrder(order);
                            }}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                order.rating && starNum <= order.rating
                                  ? 'text-gray-900 fill-gray-900'
                                  : 'text-gray-300 fill-gray-200'
                              }`}
                            />
                          </button>
                        ))}
                        {order.rating && order.reviewDate ? (
                          <span className="text-gray-900 text-sm ml-1">
                            • <span className="font-semibold">Reviewed on {order.reviewDate}</span>
                          </span>
                        ) : (
                          <button
                            className="text-gray-600 text-sm ml-1 underline underline-offset-2"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedRating(0);
                              setReviewingOrder(order);
                            }}
                          >
                            • Leave a review
                          </button>
                        )}
                      </div>

                      {/* Action Buttons on the Right */}
                      <div className="flex gap-3">
                        <Button
                          variant="secondary"
                          className="rounded-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 py-2 text-sm h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={e => {
                            e.stopPropagation();
                            handleReorder(order);
                          }}
                          disabled={
                            isLoadingRestaurants || !restaurants || restaurants.length === 0
                          }
                        >
                          <ShoppingCart className="w-4 h-4 mr-1.5" />
                          {isLoadingRestaurants ? 'Loading...' : 'Reorder'}
                        </Button>
                        <Button
                          variant="secondary"
                          className="rounded-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 py-2 text-sm h-auto"
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/orders/${order.id}`);
                          }}
                        >
                          <Receipt className="w-4 h-4 mr-1.5" />
                          View Receipt
                        </Button>
                      </div>
                    </div>

                    {/* Inline review text (if any) */}
                    {order.reviewText && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{order.reviewText}"</p>
                    )}

                    {/* Tags */}
                    {order.tags && order.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {order.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Dialog for inline order review */}
      {reviewingOrder && (
        <ReviewDialog
          isOpen={true}
          onClose={() => {
            setReviewingOrder(null);
            setSelectedRating(0);
          }}
          restaurantName={getStoreName(reviewingOrder)}
          vendorId={reviewingOrder.storeId || reviewingOrder.restaurantId}
          defaultRating={selectedRating}
          orderItems={convertOrderItemsToReviewItems(reviewingOrder)}
          orderDate={formatOrderDate(reviewingOrder)}
          vendorLogo={orderRestaurant?.logo || undefined}
          onSubmit={(rating, text, likedItems) => {
            updateOrderReview(reviewingOrder.id, rating, text);
            setReviewingOrder(null);
            setSelectedRating(0);
          }}
        />
      )}
    </div>
  );
}
