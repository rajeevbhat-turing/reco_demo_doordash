'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronRight,
  X,
  Trash2,
  Home,
  Package,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { useCartStore, type CartCategory } from '@/store/cart-store';
import { useVerifierStore } from '@/store/verifier-store';
import { useUserStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useDealsStore } from '@/store/deals-store';
import { Address } from '@/lib/types/user-types';
import OrderConfirmationModal from '@/components/modals/order-confirmation-modal';
import AddCardModal from '@/components/modals/add-card-modal';
import EditPhoneModal from '@/components/modals/edit-phone-modal';
import AddressesModal from '@/components/modals/addresses-modal';
import AddressDetailsModal from '@/components/modals/address-details-modal';
import AddAddressModal from '@/components/modals/add-address-modal';
import AddressReviewErrorModal from '@/components/modals/address-review-error-modal';
import AddressTypeModal from '@/components/modals/address-type-modal';
import ScheduleDeliveryModal from '@/components/modals/schedule-delivery-modal';
import ChooseAddressLabelModal from '@/components/modals/choose-address-label-modal';
import ChooseLabelModal from '@/components/modals/choose-label-modal';
import SignIn from '@/components/authentication/sign-in';
import SignUp from '@/components/authentication/sign-up';
import OTPVerificationModal from '@/components/modals/otp-verification-modal';
import CountryCodeDropdown from '@/components/modals/country-code-dropdown';
import PromoCodeModal from '@/components/modals/promocode-modal';
import { useRestaurants } from '@/lib/hooks/use-restaurants';
import {
  getRestaurantById,
  calculateDeliveryTime,
  parseDistance,
} from '@/lib/utils/restaurant-utils';
import { calculateDistance } from '@/lib/utils/distance-utils';
import { calculateFees, calculateEstimatedTax } from '@/lib/utils/fee-calculator';
import { useDeals } from '@/lib/hooks/use-deals';
import { Deal } from '@/types/deal-types';
import { stores } from '@/data/store-data';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get cart identifier from query params
  const categoryParam = searchParams.get('category') as CartCategory | null;
  const storeIdParam = searchParams.get('storeId');

  const {
    findCart,
    getSubtotal,
    getServiceFee,
    getDeliveryFee,
    getTotal,
    getTotalItems,
    setSelectedCard,
    removeItem,
    updateQuantity,
  } = useCartStore();
  const { recordCheckoutNavigation, recordDeliveryTimeSelection } = useVerifierStore();
  const {
    currentUser,
    getPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    getAddresses,
    updateAddress,
    setDefaultAddress,
    updateUser,
    addAddress,
    getTempAddress,
    isAuthenticated,
  } = useUserStore();
  const { addOrder } = useOrdersStore();
  const { getAppliedDealId, getFreeItemIds } = useDealsStore();

  // Find the cart using query params first (before fetching restaurants)
  const currentCart = categoryParam && storeIdParam ? findCart(storeIdParam, categoryParam) : null;
  const items = currentCart?.items || [];
  const currentCategory = currentCart?.storeCategory || categoryParam; // Use categoryParam as fallback for faster access
  const currentStoreId = currentCart?.storeId || null;

  // Only fetch restaurants if this is a restaurant order (optimization: avoid unnecessary API calls)
  // Use categoryParam directly for faster check without waiting for cart lookup
  const defaultAddress = currentUser?.addresses.find(a => a.default);
  const shouldFetchRestaurants =
    categoryParam === 'restaurant' && defaultAddress?.lat && defaultAddress?.lng;
  const { data: restaurants } = useRestaurants(
    shouldFetchRestaurants ? defaultAddress?.lat : undefined,
    shouldFetchRestaurants ? defaultAddress?.lng : undefined,
    10 // 10 mile radius
  );

  const savedPaymentMethods = getPaymentMethods();
  const addresses = getAddresses();
  const tempAddress = getTempAddress();
  const userIsAuthenticated = isAuthenticated();

  // Auth state for non-authenticated users
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // OTP state for sign up
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [signUpUser, setSignUpUser] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'US',
    dial_code: '+1',
    name: 'United States',
    emoji: '🇺🇸',
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Get applied deal for this cart
  const cartId = currentStoreId && currentCategory ? `${currentStoreId}-${currentCategory}` : null;
  const appliedDealId = cartId ? getAppliedDealId(cartId) : null;

  // Only fetch deals if there's an applied deal (optimization: avoid unnecessary API calls)
  const shouldFetchDeals = !!appliedDealId && !!currentStoreId;
  const { data: allDeals } = useDeals(shouldFetchDeals ? currentStoreId : undefined);

  // Find the applied deal by ID
  const appliedDeal: Deal | null =
    appliedDealId && allDeals ? allDeals.find(deal => deal.id === appliedDealId) || null : null;

  // Calculate values for this specific cart
  const baseSubtotal = getSubtotal(currentStoreId || undefined, currentCategory || undefined);

  // Calculate free item discount (only one quantity of ONE free item total)
  const freeItemDiscount = useMemo(() => {
    if (!cartId || !appliedDeal) return 0;
    const freeItemIds = getFreeItemIds(cartId);
    if (freeItemIds.length === 0) return 0;

    // Track if ANY free item from the deal has been applied (only one free item total)
    let hasAppliedFreeItem = false;
    let discount = 0;

    items.forEach(item => {
      let itemId = typeof item.id === 'string' ? item.id : item.id.toString();
      const itemName = (item.itemName || '').toLowerCase().trim();

      // If item ID starts with store ID, remove it before checking
      if (appliedDeal.restaurantId && itemId.startsWith(appliedDeal.restaurantId + '-')) {
        itemId = itemId.substring(appliedDeal.restaurantId.length + 1);
      }

      // Check if this item matches any free item (by ID and name)
      let matchedFreeItemId: string | null = null;
      for (const freeId of freeItemIds) {
        const matchesById = itemId.startsWith(freeId + '-') || itemId === freeId;
        const freeItemName = appliedDeal.freeItems
          ?.find((fi: any) => fi.id === freeId)
          ?.name.toLowerCase()
          .trim();
        const matchesByName = freeItemName && itemName === freeItemName;

        if (matchesById && matchesByName) {
          matchedFreeItemId = freeId;
          break;
        }
      }

      if (matchedFreeItemId) {
        // This is a free item - only discount one quantity from the FIRST free item found
        if (!hasAppliedFreeItem) {
          // First free item from the deal - discount one quantity
          hasAppliedFreeItem = true;

          // Parse price
          let itemPrice = 0;
          if (typeof item.price === 'number') {
            itemPrice = item.price;
          } else if (typeof item.price === 'string') {
            const priceStr = item.price.replace(/[^0-9.]/g, '');
            itemPrice = parseFloat(priceStr) || 0;
          }

          // Only discount one quantity
          discount += itemPrice;
        }
        // If another free item from the deal, don't add any discount
      }
    });

    return discount;
  }, [cartId, appliedDeal, items, getFreeItemIds]);

  const subtotal = baseSubtotal - freeItemDiscount;
  const totalItems = getTotalItems(currentStoreId || undefined, currentCategory || undefined);

  // Check if restaurant is outside delivery area
  const isOutsideDeliveryArea = Boolean(
    currentCategory === 'restaurant' &&
      currentStoreId &&
      restaurants &&
      !restaurants.some((r: any) => r.id === currentStoreId)
  );

  // Get restaurant and calculate distance for delivery time calculation
  const currentRestaurant = useMemo(() => {
    if (currentCategory === 'restaurant' && currentStoreId && restaurants) {
      return getRestaurantById(restaurants, currentStoreId);
    }
    return null;
  }, [currentCategory, currentStoreId, restaurants]);

  const restaurantDistance = useMemo(() => {
    if (currentRestaurant?.distance) {
      return parseDistance(currentRestaurant.distance);
    }
    // Default to 2 miles if distance not available
    return 2;
  }, [currentRestaurant]);

  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleTime, setSelectedScheduleTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Delivery options
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('standard');
  const [deliveryTime, setDeliveryTime] = useState('45-60 min');
  // Note: extraDeliveryFee is now handled in dynamic fee calculation

  // Update delivery time when restaurant distance or delivery option changes
  useEffect(() => {
    if (restaurantDistance > 0) {
      if (selectedDeliveryOption === 'standard') {
        setDeliveryTime(calculateDeliveryTime(restaurantDistance, 'standard'));
      } else if (selectedDeliveryOption === 'express') {
        setDeliveryTime(calculateDeliveryTime(restaurantDistance, 'express'));
      }
    } else {
      // Fallback to default times if distance not available
      if (selectedDeliveryOption === 'standard') {
        setDeliveryTime('45-60 min');
      } else if (selectedDeliveryOption === 'express') {
        setDeliveryTime('25-35 min');
      }
    }
  }, [restaurantDistance, selectedDeliveryOption]);

  // Payment details
  const [showExpandedPayment, setShowExpandedPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => {
    // Find default payment method or use first payment method
    const defaultPaymentMethod = savedPaymentMethods.find(pm => pm.default);
    return defaultPaymentMethod?.id || savedPaymentMethods[0]?.id || '';
  });

  // Shipping details edit state
  const [showExpandedShipping, setShowExpandedShipping] = useState(true);

  // Add card modal state
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Edit phone modal state
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);

  // Addresses modal state
  const [showAddressesModal, setShowAddressesModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showChooseLabelModal, setShowChooseLabelModal] = useState(false);
  const [addressToLabel, setAddressToLabel] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    // Find default address or use first address
    const defaultAddress = addresses.find(a => a.default);
    return defaultAddress?.id || addresses[0]?.id || '';
  });

  // Get the selected address object (needed for fee calculation)
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || tempAddress || null;

  // Calculate actual distance from customer address to restaurant
  const deliveryDistance = useMemo(() => {
    if (!selectedAddress || !currentRestaurant) {
      // Fallback to restaurant distance from API if available
      return restaurantDistance;
    }

    // Calculate actual distance using coordinates
    try {
      return calculateDistance(
        selectedAddress.lat,
        selectedAddress.lng,
        currentRestaurant.lat,
        currentRestaurant.lng
      );
    } catch (error) {
      // Fallback to restaurant distance
      return restaurantDistance;
    }
  }, [selectedAddress, currentRestaurant, restaurantDistance]);

  // Calculate dynamic fees
  const fees = useMemo(() => {
    // If we don't have restaurant data, fall back to old calculation
    if (!currentRestaurant || !selectedAddress) {
      const oldServiceFee = getServiceFee(
        currentStoreId || undefined,
        currentCategory || undefined
      );
      const oldDeliveryFee = getDeliveryFee(
        currentStoreId || undefined,
        currentCategory || undefined
      );

      // Calculate tax even in fallback mode
      const fallbackTax = calculateEstimatedTax(
        subtotal,
        oldDeliveryFee,
        oldServiceFee,
        selectedAddress || tempAddress || null
      );

      return {
        deliveryFee: oldDeliveryFee,
        serviceFee: oldServiceFee,
        estimatedTax: fallbackTax,
        total: subtotal + oldServiceFee + oldDeliveryFee + fallbackTax,
      };
    }

    // Use dynamic fee calculator
    const feeResult = calculateFees({
      subtotal,
      distance: deliveryDistance,
      restaurant: {
        id: currentRestaurant.id,
        isFreeDelivery: currentRestaurant.isFreeDelivery,
        minDeliveryFee: currentRestaurant.minDeliveryFee,
        dashPass: currentRestaurant.dashPass,
      },
      customerAddress: selectedAddress,
      appliedDeal: appliedDeal || null,
      deliveryOption: selectedDeliveryOption as 'standard' | 'express' | 'schedule',
      category: currentCategory || 'restaurant',
    });

    return {
      deliveryFee: feeResult.deliveryFee,
      serviceFee: feeResult.serviceFee,
      estimatedTax: feeResult.estimatedTax,
      total: feeResult.total,
    };
  }, [
    subtotal,
    deliveryDistance,
    currentRestaurant,
    selectedAddress,
    appliedDeal,
    selectedDeliveryOption,
    currentCategory,
    currentStoreId,
  ]);

  // Extract fees for backward compatibility
  const serviceFee = fees.serviceFee;
  const deliveryFee = fees.deliveryFee;
  const estimatedTax = fees.estimatedTax;

  // Address details modal state
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false);

  // Add address modal state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showReviewErrorModal, setShowReviewErrorModal] = useState(false);
  const [pendingAddressData, setPendingAddressData] = useState<Omit<Address, 'id'> | null>(null);

  // Address type modal state
  const [showAddressTypeModal, setShowAddressTypeModal] = useState(false);
  const [tempAddressData, setTempAddressData] = useState<Omit<Address, 'id'> | null>(null);

  // Order summary accordion state
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Promo code modal state
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false);

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true);
    // Record checkout navigation for verifiers
    recordCheckoutNavigation();
  }, [recordCheckoutNavigation]);

  // Always sync with default address when addresses change
  useEffect(() => {
    if (addresses.length > 0) {
      // Find default address
      const defaultAddress = addresses.find(a => a.default);
      const defaultAddressId = defaultAddress?.id || addresses[0].id;

      // If there's a default address and it's different from current selection, update it
      if (defaultAddressId !== selectedAddressId) {
        setSelectedAddressId(defaultAddressId);
      }
    }
  }, [addresses]);

  // Update selected payment method when payment methods change
  useEffect(() => {
    if (savedPaymentMethods.length > 0 && !selectedPaymentMethod) {
      // Find default payment method or use first payment method
      const defaultPaymentMethod = savedPaymentMethods.find(pm => pm.default);
      updateSelectedPaymentMethod(defaultPaymentMethod?.id || savedPaymentMethods[0].id);
    }
  }, [savedPaymentMethods, selectedPaymentMethod]);

  // Redirect if cart not found or empty
  useEffect(() => {
    if (isClient) {
      // If no cart params, redirect to home
      if (!categoryParam || !storeIdParam) {
        router.push('/home');
        return;
      }

      // If cart doesn't exist or is empty, redirect to home
      if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        router.push('/home');
        return;
      }
    }
  }, [isClient, currentCart, categoryParam, storeIdParam, router]);

  // Generate order ID
  const generateOrderId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handlePlaceOrder = () => {
    const newOrderId = generateOrderId();

    // Get validated store name (ensures it's not a number)
    const validatedStoreName = getStoreName();

    const orderData = {
      // 1. Order ID
      id: newOrderId,

      // 2. Cart fields extracted to root level (support both old and new field names)
      storeId: currentCart?.storeId,
      storeName: validatedStoreName, // Use validated store name
      restaurantId: currentCart?.storeId, // Old field name for backward compatibility
      restaurantName: validatedStoreName, // Use validated store name for backward compatibility
      storeCategory: currentCart?.storeCategory,
      items: (() => {
        // Track if ANY free item from the deal has been applied (only one free item total)
        let hasAppliedFreeItem = false;
        const freeItemIds = cartId ? getFreeItemIds(cartId) : [];

        return currentCart?.items?.map(item => {
          const { isFreeItem, originalPrice, matchedFreeItemId } = getItemPricingInfo(
            item,
            cartId,
            freeItemIds,
            appliedDeal
          );

          // Check if this is the first free item from the deal
          let isFirstFreeItem = false;
          if (isFreeItem && matchedFreeItemId && !hasAppliedFreeItem) {
            hasAppliedFreeItem = true;
            isFirstFreeItem = true;
          }

          // Calculate final_price: price per item after free item discount
          let finalPrice = originalPrice;
          if (isFreeItem && isFirstFreeItem) {
            // First free item from deal: one quantity is free
            if (item.quantity > 1) {
              // Total price for remaining quantities divided by total quantity
              finalPrice = (originalPrice * (item.quantity - 1)) / item.quantity;
            } else {
              // Only one quantity, so it's completely free
              finalPrice = 0;
            }
          }
          // If it's another free item or not a free item, finalPrice = originalPrice

          return {
            id: item.id.toString(),
            name: item.itemName,
            quantity: item.quantity,
            price:
              typeof item.price === 'number'
                ? item.price
                : parseFloat(item.price.toString().replace(/[^0-9.]/g, '')),
            final_price: finalPrice,
            modifications: item.appliedModifications?.map(appliedMod => ({
              modificationId: appliedMod.modificationId,
              modificationDescription: appliedMod.modificationDescription,
              isRequired: false, // We don't have this info in cart, but it's historical so it's ok
              options: appliedMod.appliedOptions?.map(opt => ({
                optionId: opt.optionId,
                optionName: opt.optionName,
                optionDescription: undefined,
                price: opt.price,
                quantity: opt.quantity,
                isCounter: opt.quantity > 1, // Infer from quantity
              })),
            })),
          };
        });
      })(),

      // 3. Payment card as object
      paymentCard: {
        type: selectedPaymentMethodObj?.type,
        cardNumber: selectedPaymentMethodObj?.cardNumber,
        lastFour: selectedPaymentMethodObj?.lastFour,
        expiry: selectedPaymentMethodObj?.expiry,
        cvc: selectedPaymentMethodObj?.cvc,
        zipCode: selectedPaymentMethodObj?.zipCode,
      },

      // 4. Address
      deliveryAddress: selectedAddress,

      // 5. Delivery option and related info
      deliveryOption: {
        type: selectedDeliveryOption,
        deliveryTime: deliveryTime,
        extraFee: 0,
        scheduledDate: scheduledDate,
        scheduledTimeSlot: scheduledTimeSlot,
      },

      // Additional order details
      phoneNumber: currentUser
        ? {
            countryCode: `${currentUser.country.dialCode} (${currentUser.country.code})`,
            number: currentUser.phoneNumber,
          }
        : {
            countryCode: '+1 (US)',
            number: '',
          },
      tipAmount: 0,
      subtotal: subtotal,
      serviceFee: serviceFee,
      deliveryFee: deliveryFee, // Already includes express surcharge if applicable
      discount: discountAmount,
      total: getTotalWithExtras(),
      totalAmount: getTotalWithExtras(), // Old field name for backward compatibility
      // Deal/Promotion info
      appliedDeal: appliedDeal
        ? {
            id: appliedDeal.id,
            title: appliedDeal.title,
            promoCode: appliedDeal.promocode,
            discountType: appliedDeal.discountType,
            discountValue: appliedDeal.discountValue,
          }
        : null,
      // Order metadata
      orderDate: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      status: 'Confirmed',
      orderType: 'Personal' as const, // Default to Personal
    };

    console.log('ORDER DATA:', orderData);

    // Save order to store
    addOrder(orderData);

    setOrderId(newOrderId);
    setShowOrderConfirmation(true);
  };

  const getItemPrice = (item: any) => {
    return typeof item.price === 'number'
      ? item.price
      : parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
  };

  // Helper function to check if item is free and get pricing info
  // Only one quantity per free item should be free
  const getItemPricingInfo = (
    item: any,
    cartId: string | null,
    freeItemIds: string[],
    appliedDeal: any
  ) => {
    let itemId = typeof item.id === 'string' ? item.id : item.id.toString();
    const itemName = (item.itemName || '').toLowerCase().trim();

    // If item ID starts with store ID, remove it before checking
    if (appliedDeal?.restaurantId && itemId.startsWith(appliedDeal.restaurantId + '-')) {
      itemId = itemId.substring(appliedDeal.restaurantId.length + 1);
    }

    // Check if this item matches any free item (by ID and name)
    let matchedFreeItemId: string | null = null;
    for (const freeId of freeItemIds) {
      const matchesById = itemId.startsWith(freeId + '-') || itemId === freeId;
      const freeItemName = appliedDeal?.freeItems
        ?.find((fi: any) => fi.id === freeId)
        ?.name.toLowerCase()
        .trim();
      const matchesByName = freeItemName && itemName === freeItemName;

      if (matchesById && matchesByName) {
        matchedFreeItemId = freeId;
        break;
      }
    }

    const originalPrice =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));

    // If it's a free item, we need to check if this is the first occurrence
    // For now, we'll mark it as free item and handle the quantity logic in display
    const isFreeItem = matchedFreeItemId !== null;

    // Calculate display price: if free item with quantity > 1, only first one is free
    // We'll handle this in the UI by showing the correct price per item
    const displayPrice = isFreeItem ? 0 : originalPrice;

    return { isFreeItem, originalPrice, displayPrice, matchedFreeItemId };
  };

  // Get store/restaurant name
  const getStoreName = () => {
    // First, try to get store name from the cart itself
    if (currentCart) {
      const storeName = currentCart.storeName;
      // Validate storeName - check if it's valid (not empty, not a number, not "Unknown Store")
      if (storeName && storeName.trim() !== '' && storeName !== 'Unknown Store' && !/^\d+$/.test(storeName)) {
        return storeName;
      }
      
      // If storeName is invalid or missing, try to look up from restaurants array
      if (currentCart.storeCategory === 'restaurant' && currentCart.storeId && restaurants) {
        const foundRestaurant = restaurants.find(r => r.id === currentCart.storeId);
        if (foundRestaurant?.name) {
          return foundRestaurant.name;
        }
      }
    }

    // Fallback to looking up by ID if we have the params
    if (currentCategory === 'restaurant' && currentStoreId) {
      const restaurant = getRestaurantById(restaurants, currentStoreId);
      if (restaurant?.name) {
        return restaurant.name;
      }
    }

    return currentCategory === 'restaurant' ? 'Restaurant' : 'Store';
  };

  // Navigate back to store page
  const handleBackToStore = () => {
    if (currentStoreId && currentCategory) {
      router.push(`/store/${currentStoreId}?category=${currentCategory}`);
    } else {
      router.back();
    }
  };

  // Generate schedule times for the rest of the day
  const generateScheduleTimes = () => {
    const times = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Start from next 30-minute window
    let startHour = currentHour;
    let startMinute = currentMinute < 30 ? 30 : 0;
    if (currentMinute >= 30) {
      startHour += 1;
    }

    // Generate times until 11:30 PM
    for (let hour = startHour; hour < 24; hour++) {
      const startMin = hour === startHour ? startMinute : 0;
      for (let minute = startMin; minute < 60; minute += 30) {
        if (hour === 23 && minute === 30) break; // Stop at 11:30 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const displayTime = new Date(2024, 0, 1, hour, minute).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        times.push({ value: timeString, display: displayTime });
      }
    }

    return times;
  };

  const handleDeliveryOptionChange = (optionId: string) => {
    // Clear scheduled date and time when switching away from schedule option
    if (optionId !== 'schedule') {
      setScheduledDate(null);
      setScheduledTimeSlot('');
    }

    setSelectedDeliveryOption(optionId);

    switch (optionId) {
      case 'express':
        setDeliveryTime(
          restaurantDistance > 0
            ? calculateDeliveryTime(restaurantDistance, 'express')
            : '25-35 min'
        );
        break;
      case 'standard':
        setDeliveryTime(
          restaurantDistance > 0
            ? calculateDeliveryTime(restaurantDistance, 'standard')
            : '45-60 min'
        );
        break;
      case 'schedule':
        setDeliveryTime('Choose a time');
        setShowScheduleModal(true);
        break;
      default:
        setDeliveryTime(
          restaurantDistance > 0
            ? calculateDeliveryTime(restaurantDistance, 'standard')
            : '45-60 min'
        );
    }
  };

  const handleScheduleTimeSelect = (
    date: string,
    timeType: 'asap' | 'later',
    timeSlot?: string,
    fullDate?: Date,
    timeSlotDisplay?: string
  ) => {
    if (timeType === 'asap' || !timeSlot) {
      // Revert to standard option
      setSelectedDeliveryOption('standard');
      setDeliveryTime(
        restaurantDistance > 0 ? calculateDeliveryTime(restaurantDistance, 'standard') : '45-60 min'
      );
      setScheduledDate(null);
      setScheduledTimeSlot('');
    } else {
      // Save scheduled time
      setSelectedDeliveryOption('schedule');
      setScheduledDate(fullDate || null);
      setScheduledTimeSlot(timeSlotDisplay || timeSlot);

      // Format display
      const formattedDate = fullDate
        ? `${fullDate.getDate().toString().padStart(2, '0')}/${(fullDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`
        : date;
      setDeliveryTime(`${formattedDate} at ${timeSlotDisplay || timeSlot}`);

      // Record for verifiers
      recordDeliveryTimeSelection(
        `Scheduled for ${formattedDate} at ${timeSlotDisplay || timeSlot}`
      );
    }
    setShowScheduleModal(false);
  };

  // Helper to update selected payment method and cart store
  const updateSelectedPaymentMethod = (paymentMethodId: string) => {
    const paymentMethod = savedPaymentMethods.find(m => m.id === paymentMethodId);
    setSelectedPaymentMethod(paymentMethodId);
    if (paymentMethod && currentStoreId && currentCategory) {
      setSelectedCard(currentStoreId, currentCategory, paymentMethod);
    }
  };

  // Handle section expansion with mutual exclusivity
  const handleShippingEdit = () => {
    setShowExpandedShipping(true);
    setShowExpandedPayment(false);
  };

  const handlePaymentEdit = () => {
    setShowExpandedPayment(true);
    setShowExpandedShipping(false);
  };

  // Handle add card
  const handleAddCard = (cardData: {
    cardNumber: string;
    cvc: string;
    expiration: string;
    zipCode: string;
  }) => {
    const newCard = addPaymentMethod({
      cardNumber: cardData.cardNumber,
      cvc: cardData.cvc,
      expiry: cardData.expiration,
      zipCode: cardData.zipCode,
    });
    updateSelectedPaymentMethod(newCard.id);
    setShowAddCardModal(false);
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = (e: React.MouseEvent, methodId: string) => {
    e.stopPropagation(); // Prevent card selection when clicking trash
    removePaymentMethod(methodId);
    // If deleted card was selected, select the first remaining card
    if (selectedPaymentMethod === methodId && savedPaymentMethods.length > 1) {
      const remainingMethods = savedPaymentMethods.filter(m => m.id !== methodId);
      if (remainingMethods.length > 0) {
        updateSelectedPaymentMethod(remainingMethods[0].id);
      }
    }
  };

  // Handle save phone number
  const handleSavePhoneNumber = (phoneData: { countryCode: string; number: string }) => {
    if (currentUser) {
      // Extract dial code and country code from the countryCode string (format: "+1 (US)")
      const match = phoneData.countryCode.match(/^(\+\d+)\s*\(([A-Z]{2})\)$/);
      if (match) {
        const dialCode = match[1];
        const countryCode = match[2];
        updateUser(currentUser.id, {
          phoneNumber: phoneData.number,
          country: {
            dialCode,
            code: countryCode,
            name: currentUser.country.name, // Keep existing name
          },
        });
      } else {
        // Fallback: just update the phone number
        updateUser(currentUser.id, {
          phoneNumber: phoneData.number,
        });
      }
    }
  };

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setDefaultAddress(addressId); // Set as default address
    setShowAddressesModal(false);
  };

  // Handle select address from search results
  const handleSelectSearchAddress = (address: Address) => {
    // Store the search result temporarily (without id)
    const { id, ...addressWithoutId } = address;
    setTempAddressData(addressWithoutId);
    setShowAddressesModal(false);
    setShowAddressTypeModal(true);
  };

  // Handle address type selection
  const handleAddressTypeNext = (addressType: Address['addressType']) => {
    if (tempAddressData) {
      const addressWithType = { ...tempAddressData, addressType };
      setTempAddressData(addressWithType);
      setShowAddressTypeModal(false);
      setShowAddressDetailsModal(true);
    }
  };

  // Handle manual address entry
  const handleManualEntry = () => {
    setShowAddressesModal(false);
    setShowAddAddressModal(true);
  };

  // Handle adding new address - show review error modal
  const handleAddAddress = (addressData: Omit<Address, 'id'>) => {
    setPendingAddressData(addressData);
    setShowAddAddressModal(false);
    setShowReviewErrorModal(true);
  };

  // Handle review address - go back to add address modal with pre-filled data
  const handleReviewAddress = () => {
    setShowReviewErrorModal(false);
    if (pendingAddressData) {
      // Extract apartment/suite from street if it exists
      const streetParts = pendingAddressData.street.split(',').map(s => s.trim());
      const initialData = {
        street: pendingAddressData.street,
        apartmentSuite: streetParts[1] || '',
        city: pendingAddressData.city,
        state: pendingAddressData.state,
        zipCode: pendingAddressData.zipCode,
      };
      // Store in a state that AddAddressModal can use
      setShowAddAddressModal(true);
      // The initialData will be passed via the modal's initialData prop
    }
  };

  // Handle enter new address - open add address modal with empty state
  const handleEnterNewAddress = () => {
    setPendingAddressData(null);
    setShowReviewErrorModal(false);
    setShowAddAddressModal(true);
  };

  // Handle edit address from addresses modal
  const handleEditAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressesModal(false);
    setShowAddressDetailsModal(true);
  };

  // Handle saving address details
  const handleSaveAddressDetails = (addressData: any) => {
    if (tempAddressData) {
      // This is from search results - save as new address
      const newAddress = addAddress({
        ...tempAddressData,
        ...addressData,
        addressType: addressData.addressType || tempAddressData.addressType || 'house',
      });
      setSelectedAddressId(newAddress.id);
      setTempAddressData(null);
    } else if (selectedAddress) {
      // This is editing an existing address
      updateAddress(selectedAddress.id, {
        ...addressData,
      });
    }
    setShowAddressDetailsModal(false);
  };

  // Calculate total with extra delivery fee
  // Calculate discount amount (for percentage/fixed discounts, not free items)
  const discountAmount = useMemo(() => {
    if (!appliedDeal || !cartId) return 0;

    // Free item discounts are already applied to subtotal
    if (appliedDeal.freeItems && appliedDeal.freeItems.length > 0) {
      return 0; // Free items are handled separately
    }

    if (appliedDeal.discountType === 'percentage' && appliedDeal.discountValue) {
      const discount = (baseSubtotal * appliedDeal.discountValue) / 100;
      if (appliedDeal.maximumDiscount) {
        return Math.min(discount, appliedDeal.maximumDiscount);
      }
      return discount;
    } else if (appliedDeal.discountType === 'fixed' && appliedDeal.discountValue) {
      return appliedDeal.discountValue;
    }

    return 0;
  }, [appliedDeal, cartId, baseSubtotal]);

  const getTotalWithExtras = () => {
    // Use the adjusted subtotal (which already has freeItemDiscount subtracted)
    // All fees (delivery, service, tax) are calculated dynamically
    return subtotal + serviceFee + deliveryFee + estimatedTax - discountAmount;
  };

  const deliveryOptions = useMemo(
    () => [
      {
        id: 'express',
        name: 'Express',
        time:
          restaurantDistance > 0
            ? calculateDeliveryTime(restaurantDistance, 'express')
            : '25-35 min',
        description: 'Direct to you',
        price: 2.99,
      },
      {
        id: 'standard',
        name: 'Standard',
        time:
          restaurantDistance > 0
            ? calculateDeliveryTime(restaurantDistance, 'standard')
            : '45-60 min',
        description: '',
        price: 0,
      },
      {
        id: 'schedule',
        name: 'Schedule for later',
        time: 'Choose a time',
        description: '',
        price: 0,
      },
    ],
    [restaurantDistance]
  );

  // Calculate extra delivery fee based on selected delivery option
  const extraDeliveryFee = useMemo(() => {
    const selectedOption = deliveryOptions.find(opt => opt.id === selectedDeliveryOption);
    return selectedOption?.price || 0;
  }, [selectedDeliveryOption, deliveryOptions]);

  // Get the selected payment method object
  const selectedPaymentMethodObj = savedPaymentMethods.find(m => m.id === selectedPaymentMethod);

  // Handler for successful authentication
  const handleAuthSuccess = () => {
    // After successful authentication, the user will be set in the store
    // Component will re-render with authenticated state
  };

  // Handler for changing auth mode
  const handleSetMode = (mode: 'signin' | 'signup' | 'forgot-password') => {
    if (mode !== 'forgot-password') {
      setAuthMode(mode);
    }
  };

  // Generate OTP
  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    console.log('Generated OTP:', newOtp);
    return newOtp;
  };

  // Handler for showing OTP during sign up
  const handleShowOTP = (user: any) => {
    setSignUpUser(user);
    generateOTP();
    setShowOtpModal(true);
  };

  // Handler for OTP verification
  const handleOTPVerification = (
    enteredOtp: string,
    generatedOtp: string,
    setOtpError: (error: string) => void,
    setAttemptsLeft: (attempts: number) => void,
    attemptsLeft: number,
    setShowTooManyAttempts: (show: boolean) => void
  ) => {
    // Accept any 6-digit OTP for development/testing
    if (enteredOtp.length === 6) {
      // OTP is correct - create user
      if (signUpUser) {
        const { addUser } = useUserStore.getState();
        const newUser = {
          id: `user-${Date.now().toString()}`,
          name: signUpUser.name,
          email: signUpUser.email,
          phoneNumber: signUpUser.phoneNumber,
          password: signUpUser.password,
          country: signUpUser.country,
          userCountry: signUpUser.userCountry,
          avatar: null,
          paymentMethods: [],
          addresses: [],
          is_restricted: false,
          reviews: [],
        };
        addUser(newUser, true);
        setShowOtpModal(false);
        setSignUpUser(null);
        // Stay on checkout page - component will re-render with authenticated state
      }
    } else {
      // OTP is incorrect
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);
      setOtpError('Invalid or incorrect code');

      if (newAttemptsLeft <= 0) {
        setShowTooManyAttempts(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 pt-20 pr-[450px]">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Form */}
          <div className="flex-1 space-y-6">
            {/* Sign In / Sign Up Section - Only for non-authenticated users */}
            {!userIsAuthenticated && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300">
                <h2 className="text-lg font-semibold mb-4">1. Sign in or sign up to place order</h2>

                {/* Info banner */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 text-cyan-600 mr-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-sm text-gray-900">
                    Sign in to access your credits and discounts
                  </span>
                </div>

                {/* Sign In / Sign Up Tabs */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setAuthMode('signin')}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                        authMode === 'signin'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                        authMode === 'signup'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Authentication Forms */}
                {authMode === 'signin' ? (
                  <SignIn onSuccess={handleAuthSuccess} setMode={handleSetMode} />
                ) : (
                  <SignUp
                    onShowOTP={handleShowOTP}
                    selectedCountry={selectedCountry}
                    setShowCountryDropdown={setShowCountryDropdown}
                  />
                )}
              </div>
            )}

            {/* Account Details - Only for authenticated users */}
            {userIsAuthenticated && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">1. Account details</h2>
                  <span className="text-gray-600">{currentUser?.email || 'abc@xyz.com'}</span>
                </div>
              </div>
            )}

            {/* Shipping Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300">
              {!userIsAuthenticated || !showExpandedShipping ? (
                // Collapsed View (always for non-authenticated users)
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">2. Shipping details</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 text-sm">
                        {userIsAuthenticated
                          ? selectedAddress
                            ? `${selectedAddress.street.substring(0, 23)}${
                                selectedAddress.street.length > 23 ? '...' : ''
                              }`
                            : 'No address selected'
                          : tempAddress
                          ? `${tempAddress.street.substring(0, 23)}${
                              tempAddress.street.length > 23 ? '...' : ''
                            }`
                          : 'No address selected'}
                      </span>
                      {userIsAuthenticated && (
                        <button
                          onClick={handleShippingEdit}
                          className="text-blue-600 font-medium text-lg"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Expanded View
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-6">2. Shipping details</h2>

                  {/* Map Placeholder */}
                  {/* <div className="mb-6">
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="black">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <button className="bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium hover:bg-gray-50 transition-colors">
                          Adjust pin
                        </button>
                      </div>
                    </div>
                  </div> */}

                  {/* Delivery Time */}
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <span className="font-medium">Delivery Time</span>
                      <span className="ml-auto text-gray-600">{deliveryTime}</span>
                    </div>

                    {/* Delivery Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {deliveryOptions.map(option => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedDeliveryOption === option.id
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200'
                          }`}
                          style={{ height: 'min-content' }}
                          onClick={() => handleDeliveryOptionChange(option.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{option.name}</h3>
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                selectedDeliveryOption === option.id
                                  ? 'border-black bg-black'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedDeliveryOption === option.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          {option.id === 'schedule' && scheduledDate && scheduledTimeSlot ? (
                            <div className="flex items-center gap-1">
                              <p className="text-sm text-gray-600">
                                {`${scheduledDate.getDate().toString().padStart(2, '0')}/${(
                                  scheduledDate.getMonth() + 1
                                )
                                  .toString()
                                  .padStart(2, '0')}`}
                              </p>
                              <p className="text-sm text-gray-600">{scheduledTimeSlot}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 mb-1">{option.time}</p>
                          )}
                          {option.description && (
                            <p className="text-sm text-gray-500">{option.description}</p>
                          )}
                          {option.price > 0 && (
                            <p className="text-sm font-medium">+${option.price.toFixed(2)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    {selectedAddress ? (
                      <div
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                        onClick={() => setShowAddressesModal(true)}
                      >
                        <div className="flex items-center flex-1">
                          <Home className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <div>
                            {selectedAddress.personalLabel ? (
                              <>
                                <p className="font-medium text-sm">
                                  {selectedAddress.personalLabel.charAt(0).toUpperCase() +
                                    selectedAddress.personalLabel.slice(1)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {selectedAddress.street}, {selectedAddress.city},{' '}
                                  {selectedAddress.state} {selectedAddress.zipCode}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-sm">{selectedAddress.street}</p>
                                <p className="text-xs text-gray-600">
                                  {selectedAddress.city}, {selectedAddress.state}{' '}
                                  {selectedAddress.zipCode}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                        onClick={() => setShowAddressesModal(true)}
                      >
                        <div className="flex items-center flex-1">
                          <Home className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">No address selected</p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}

                    {selectedAddress && (
                      <div
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                        onClick={() => setShowAddressDetailsModal(true)}
                      >
                        <div className="flex items-center flex-1">
                          <Package className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">
                              {selectedAddress.deliveryPreference === 'location'
                                ? 'Meet at a location'
                                : 'Leave it at my door'}
                            </p>
                            {selectedAddress.deliveryInstructions && (
                              <p className="text-xs text-gray-600">
                                {selectedAddress.deliveryInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => setShowEditPhoneModal(true)}
                  >
                    <div className="flex items-center flex-1">
                      <Phone className="w-5 h-5 text-gray-600 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{currentUser?.phoneNumber || ''}</p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-300">
              {!userIsAuthenticated ? (
                // Simple view for non-authenticated users
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-2">3. Payment details</h2>
                  <svg
                    className="w-8 h-6 ml-5"
                    viewBox="0 0 48 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="48" height="32" rx="4" fill="#E5E7EB" />
                    <rect x="4" y="4" width="40" height="6" rx="2" fill="#9CA3AF" />
                    <rect x="4" y="14" width="16" height="4" rx="2" fill="#9CA3AF" />
                    <rect x="4" y="22" width="12" height="4" rx="2" fill="#9CA3AF" />
                  </svg>
                </div>
              ) : !showExpandedPayment && savedPaymentMethods.length > 0 ? (
                // Collapsed View for authenticated users
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">3. Payment details</h2>
                    {selectedPaymentMethodObj && (
                      <div className="flex items-center">
                        <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-2 flex items-center justify-center">
                          <div className="flex space-x-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <span className="text-sm">...{selectedPaymentMethodObj.lastFour}</span>
                        <button
                          onClick={handlePaymentEdit}
                          className="text-blue-600 ml-6 font-medium text-bold text-lg"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  {selectedPaymentMethodObj && (
                    <div className="flex items-center pl-4">
                      <div className="flex items-center">
                        <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-2 flex items-center justify-center">
                          <div className="flex space-x-0.5">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <span className="text-sm">
                          {selectedPaymentMethodObj.type}...{selectedPaymentMethodObj.lastFour}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Expanded View
                <div className="py-6">
                  <h2 className="text-lg font-semibold mb-6 px-6">3. Payment details</h2>

                  <div className="ml-4 px-6">
                    {/* Saved Payment Methods - only shown if they exist */}
                    {savedPaymentMethods.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Saved Payment Methods
                        </h3>
                        <div className="space-y-3">
                          {savedPaymentMethods.map(method => (
                            <div
                              key={method.id}
                              className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                              style={{ marginInline: '-12px' }}
                              onClick={() => updateSelectedPaymentMethod(method.id)}
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded mr-3 flex items-center justify-center">
                                  <div className="flex space-x-0.5">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {method.type}....{method.lastFour}
                                  </p>
                                  <p className="text-xs text-gray-600">Exp. {method.expiry}</p>
                                </div>
                              </div>
                              {selectedPaymentMethod === method.id ? (
                                <svg
                                  className="w-6 h-6 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <button
                                  onClick={e => handleDeletePaymentMethod(e, method.id)}
                                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                  aria-label="Delete payment method"
                                >
                                  <Trash2 className="w-5 h-5 text-gray-600" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {savedPaymentMethods.length > 0 && (
                    <div
                      className="w-full h-2 bg-gray-200 my-4 border-b border-t border-gray-200 "
                      style={{ marginRight: '-10000px' }}
                    />
                  )}

                  {/* Add New Payment Method */}
                  <div className="ml-4 px-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Add New Payment Method
                    </h3>
                    <div className="space-y-3">
                      {/* Credit/Debit Card Option */}
                      <div
                        className="flex items-center justify-between py-4 px-3 cursor-pointer hover:bg-gray-100"
                        style={{ marginInline: '-12px' }}
                        onClick={() => setShowAddCardModal(true)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-7 bg-gray-800 rounded mr-3 flex items-center justify-center">
                            <svg
                              className="w-6 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" />
                              <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2" />
                            </svg>
                          </div>
                          <span className="font-medium text-sm">Credit/Debit Card</span>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedPaymentMethodObj || isOutsideDeliveryArea}
              className={`w-full font-medium py-4 rounded-lg text-lg ${
                selectedPaymentMethodObj && !isOutsideDeliveryArea
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Place Order
            </button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="fixed top-16 right-0 w-[434px] h-[calc(100vh-4rem)] overflow-y-auto border-l border-gray-200">
            <div className="bg-white h-full flex flex-col">
              {/* Store Header - Clickable */}
              <button
                onClick={handleBackToStore}
                className="w-full flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold text-lg">
                      {getStoreName().charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-600">Your cart from</p>
                    <p className="font-semibold text-gray-900">{getStoreName()}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Out of Delivery Area Warning */}
              {isOutsideDeliveryArea && (
                <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-0.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z"
                          stroke="#D97706"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 9V13"
                          stroke="#D97706"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 17H12.01"
                          stroke="#D97706"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 leading-tight">
                        Sorry! This address is out of the delivery area for this store.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddressesModal(true)}
                    className="ml-2 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Place Order Button */}
              <div className="px-4 pt-4">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedPaymentMethodObj || isOutsideDeliveryArea}
                  className={`w-full font-semibold py-3 rounded-full transition-colors ${
                    selectedPaymentMethodObj && !isOutsideDeliveryArea
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Place Order
                </button>
              </div>

              {/* Savings UI */}
              {appliedDeal && (discountAmount > 0 || freeItemDiscount > 0) && (
                <div className="mx-6 my-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg">
                  <div className="flex items-start justify-between gap-1">
                    {/* Piggy Bank Icon */}
                    <div className="flex items-center justify-center flex-shrink-0">
                      <Image src="/piggy-bank.png" alt="Piggy Bank" width={80} height={100} />
                    </div>
                    <div className="py-4 flex-1 flex flex-col items-center">
                      <div className="text-sm text-[#191919ff]">You're saving</div>
                      <div className="text-[40px] font-bold text-[#eb1700ff]">
                        ${(discountAmount + freeItemDiscount).toFixed(2)}
                      </div>
                      <hr className="border-gray-200 border-t-2 w-full" />
                      <div className="text-xs text-[#191919ff] pt-1 font-medium">
                        with promotions
                      </div>
                    </div>
                    {/* Person with coins icon */}
                    <div className="w-16 h-16 flex items-center justify-center mt-4">
                      <Image src="/coins.png" alt="Coins" width={80} height={100} />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary Accordion */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2 text-gray-700" />
                    <span className="font-medium text-gray-900">
                      Order Summary ({totalItems} Items)
                    </span>
                  </div>
                  {showOrderSummary ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {showOrderSummary && (
                  <div className="px-4 pb-4">
                    {/* Items Header with Add More Button */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-900">Items</span>
                      <button
                        onClick={handleBackToStore}
                        className="flex items-center text-sm text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-full px-2 py-1"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add more items
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-4 mb-4">
                      {(() => {
                        // Track if ANY free item from the deal has been applied (only one free item total, not one of each type)
                        let hasAppliedFreeItem = false;
                        return items.map(item => {
                          const freeItemIds = cartId ? getFreeItemIds(cartId) : [];
                          const { isFreeItem, originalPrice, displayPrice, matchedFreeItemId } =
                            getItemPricingInfo(item, cartId, freeItemIds, appliedDeal);

                          // Check if this is the first free item from the deal
                          let isFirstFreeItem = false;
                          if (isFreeItem && matchedFreeItemId && !hasAppliedFreeItem) {
                            hasAppliedFreeItem = true;
                            isFirstFreeItem = true;
                          }

                          // Calculate the actual price to display
                          // If it's a free item and it's the first one from the deal, show $0.00 for one quantity
                          // If quantity > 1, show price for remaining quantities
                          let totalDisplayPrice = 0;
                          if (isFreeItem && isFirstFreeItem) {
                            // First free item from deal: $0.00 for 1 quantity, full price for remaining
                            if (item.quantity > 1) {
                              totalDisplayPrice = originalPrice * (item.quantity - 1);
                            } else {
                              totalDisplayPrice = 0;
                            }
                          } else if (isFreeItem && !isFirstFreeItem) {
                            // Another free item from the deal: full price for all quantities
                            totalDisplayPrice = originalPrice * item.quantity;
                          } else {
                            // Not a free item: full price
                            totalDisplayPrice = originalPrice * item.quantity;
                          }

                          return (
                            <div key={item.id} className="flex gap-3">
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={item.image || '/placeholder.svg'}
                                  alt={item.itemName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex w-full gap-2 justify-between">
                                <div className="flex flex-col flex-1">
                                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                                    {item.itemName}
                                  </h4>
                                  {item.customizations && (
                                    <p className="text-xs text-gray-600 mb-2">
                                      {item.customizations}
                                    </p>
                                  )}
                                  <div className="flex flex-col gap-2 items-start">
                                    <div className="flex items-center gap-2">
                                      {isFreeItem && isFirstFreeItem ? (
                                        <>
                                          <span className="text-sm font-medium text-[#eb1700ff]">
                                            ${totalDisplayPrice.toFixed(2)}
                                          </span>
                                          <span className="text-sm text-[#606060ff] line-through">
                                            ${(originalPrice * item.quantity).toFixed(2)}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-sm font-medium text-gray-900">
                                          ${totalDisplayPrice.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    {isFreeItem &&
                                      isFirstFreeItem &&
                                      appliedDeal?.minimumPurchase && (
                                        <span className="inline-block px-1 py-0.5 bg-[#fef0ed] text-[#d91400ff] text-xs font-bold rounded-sm">
                                          Free on ${appliedDeal.minimumPurchase}+
                                        </span>
                                      )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center bg-gray-100 rounded-full">
                                    {item.quantity <= 1 ? (
                                      <button
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                                        onClick={() => removeItem(item.id)}
                                        aria-label="Remove item"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-gray-600" />
                                      </button>
                                    ) : (
                                      <button
                                        className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        aria-label="Decrease quantity"
                                      >
                                        <Minus className="h-3.5 w-3.5 text-gray-600" />
                                      </button>
                                    )}
                                    <span className="mx-3 text-sm font-medium">
                                      {item.quantity}×
                                    </span>
                                    <button
                                      className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="h-3.5 w-3.5 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Deals & Gift Cards */}
              <div className="px-6 py-4">
                <button
                  className="w-full flex items-center justify-between py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPromoCodeModal(true)}
                >
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 mr-2.5 text-gray-700" strokeWidth={1.5} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-gray-900">Deals & gift cards</span>
                      {appliedDeal && (
                        <span className="text-sm text-[#606060ff] font-medium">
                          {appliedDeal.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#191919ff]" />
                </button>
              </div>

              {/* Pricing Summary */}
              <div className="p-4 space-y-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal</span>
                  <div className="flex items-center gap-2">
                    {freeItemDiscount > 0 && (
                      <span className="text-[#606060ff] font-medium line-through text-sm">
                        ${baseSubtotal.toFixed(2)}
                      </span>
                    )}
                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-700">Delivery Fee</span>
                    <svg
                      className="w-4 h-4 ml-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 16v-4m0-4h.01"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-700">Fees & Estimated Tax</span>
                    <svg
                      className="w-4 h-4 ml-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 16v-4m0-4h.01"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">
                    ${(serviceFee + estimatedTax).toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Discount</span>
                    <span className="text-gray-900 font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <div className="flex items-center gap-2">
                    {(discountAmount > 0 || freeItemDiscount > 0) && (
                      <span className="text-[#606060ff] line-through text-sm">
                        ${(baseSubtotal + serviceFee + deliveryFee + estimatedTax).toFixed(2)}
                      </span>
                    )}
                    <span className="text-[#eb1700ff] font-bold text-lg">
                      ${getTotalWithExtras().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Delivery Modal */}
      <ScheduleDeliveryModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          // Revert to standard if modal is closed without selection
          if (selectedDeliveryOption === 'schedule' && !scheduledTimeSlot) {
            setSelectedDeliveryOption('standard');
            setDeliveryTime(
              restaurantDistance > 0
                ? calculateDeliveryTime(restaurantDistance, 'standard')
                : '45-60 min'
            );
          }
        }}
        onSelectTime={handleScheduleTimeSelect}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={() => setShowOrderConfirmation(false)}
        orderId={orderId}
        total={getTotalWithExtras()}
        tipAmount={0}
        scheduledTime={selectedDeliveryOption === 'schedule' ? selectedScheduleTime : undefined}
        deliveryTime={deliveryTime}
        storeName={getStoreName()}
        storeId={currentStoreId || 'unknown'}
        category={currentCategory || undefined}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAddCard={handleAddCard}
      />

      {/* Edit Phone Modal */}
      <EditPhoneModal
        isOpen={showEditPhoneModal}
        onClose={() => setShowEditPhoneModal(false)}
        onSave={handleSavePhoneNumber}
        initialCountryCode={
          currentUser ? `${currentUser.country.dialCode} (${currentUser.country.code})` : '+1 (US)'
        }
        initialNumber={currentUser?.phoneNumber || ''}
      />

      {/* Addresses Modal */}
      <AddressesModal
        isOpen={showAddressesModal}
        onClose={() => setShowAddressesModal(false)}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={handleSelectAddress}
        onEditAddress={handleEditAddress}
        onManualEntry={handleManualEntry}
        onSelectSearchAddress={handleSelectSearchAddress}
        onAddLabel={() => setShowLabelModal(true)}
      />

      {/* Choose Address to Label Modal */}
      <ChooseAddressLabelModal
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        addresses={addresses}
        onSelectAddress={addressId => {
          setAddressToLabel(addressId);
          setShowLabelModal(false);
          setShowChooseLabelModal(true);
        }}
        onSelectSearchAddress={address => {
          // Store the search result temporarily (without id)
          const { id, ...addressWithoutId } = address;
          setTempAddressData(addressWithoutId);
          setShowLabelModal(false);
          setShowAddressTypeModal(true);
        }}
        onManualEntry={() => {
          setShowLabelModal(false);
          setShowAddAddressModal(true);
        }}
      />

      {/* Choose Label Modal */}
      <ChooseLabelModal
        isOpen={showChooseLabelModal}
        onClose={() => setShowChooseLabelModal(false)}
        currentLabel={addresses.find(a => a.id === addressToLabel)?.personalLabel}
        onSave={label => {
          if (addressToLabel) {
            updateAddress(addressToLabel, { personalLabel: label });
          }
          setShowChooseLabelModal(false);
          setAddressToLabel('');
        }}
      />

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => {
          setShowAddAddressModal(false);
          setPendingAddressData(null);
        }}
        onContinue={handleAddAddress}
        onBack={() => {
          setShowAddAddressModal(false);
          setShowAddressesModal(true);
          setPendingAddressData(null);
        }}
        initialData={
          pendingAddressData
            ? (() => {
                // Extract apartment/suite from street if it exists
                const streetParts = pendingAddressData.street.split(',').map(s => s.trim());
                return {
                  street: pendingAddressData.street,
                  apartmentSuite: streetParts[1] || '',
                  city: pendingAddressData.city,
                  state: pendingAddressData.state,
                  zipCode: pendingAddressData.zipCode,
                };
              })()
            : undefined
        }
      />

      {/* Address Review Error Modal */}
      <AddressReviewErrorModal
        isOpen={showReviewErrorModal}
        onClose={() => {
          setShowReviewErrorModal(false);
          setPendingAddressData(null);
        }}
        onReviewAddress={handleReviewAddress}
        onEnterNewAddress={handleEnterNewAddress}
      />

      {/* Address Type Modal */}
      <AddressTypeModal
        isOpen={showAddressTypeModal}
        onClose={() => {
          setShowAddressTypeModal(false);
          setTempAddressData(null);
        }}
        addressData={
          tempAddressData || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            addressType: 'house',
            lat: 0,
            lng: 0,
          }
        }
        onNext={handleAddressTypeNext}
        onBack={() => {
          setShowAddressTypeModal(false);
          setShowAddressesModal(true);
        }}
      />

      {/* Address Details Modal */}
      <AddressDetailsModal
        isOpen={showAddressDetailsModal}
        onClose={() => {
          setShowAddressDetailsModal(false);
          if (!tempAddressData) {
            // If not from search, just close
            return;
          }
          // If from search, clear temp data
          setTempAddressData(null);
        }}
        address={(tempAddressData || selectedAddress) as Address | Omit<Address, 'id'> | undefined}
        onSave={handleSaveAddressDetails}
        hideAddressType={!!tempAddressData} // Hide type dropdown when coming from search flow
        onBack={
          tempAddressData
            ? () => {
                setShowAddressDetailsModal(false);
                setShowAddressTypeModal(true);
              }
            : undefined
        }
      />

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setSignUpUser(null);
        }}
        onVerify={handleOTPVerification}
        phoneNumber={signUpUser?.phoneNumber || ''}
        countryCode={selectedCountry.dial_code}
        generatedOTP={generatedOtp}
      />

      {/* Country Code Dropdown */}
      <CountryCodeDropdown
        isOpen={showCountryDropdown}
        onClose={() => setShowCountryDropdown(false)}
        onSelect={setSelectedCountry}
        selectedCountry={selectedCountry}
        userCountry={selectedCountry}
      />

      {/* Promo Code Modal */}
      {showPromoCodeModal && (
        <PromoCodeModal
          isOpen={showPromoCodeModal}
          onClose={() => setShowPromoCodeModal(false)}
          restaurantId={currentCategory === 'restaurant' ? currentStoreId || undefined : undefined}
          cartSubtotal={subtotal}
          cartItems={items}
          cartId={
            currentStoreId && currentCategory ? `${currentStoreId}-${currentCategory}` : undefined
          }
        />
      )}
    </div>
  );
}
