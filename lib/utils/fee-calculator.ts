import type { CartCategory } from '@/store/cart-store';
import type { Restaurant } from '@/constants/restaurants';
import type { Address } from '@/lib/types/user-types';
import type { Deal } from '@/types/deal-types';
import { calculateDistance } from './distance-utils';
import { getTaxRate } from './tax-calculator';

// Category-specific configurations
interface CategoryConfig {
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  serviceFeePercentage: number;
  minServiceFee: number;
}

// Default configuration by category
const categoryConfigs: Record<CartCategory, CategoryConfig> = {
  restaurant: {
    freeDeliveryThreshold: 30,
    defaultDeliveryFee: 5.99,
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  grocery: {
    freeDeliveryThreshold: 30,
    defaultDeliveryFee: 5.99,
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  retail: {
    freeDeliveryThreshold: 30,
    defaultDeliveryFee: 5.99,
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  convenience: {
    freeDeliveryThreshold: 30,
    defaultDeliveryFee: 5.99,
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  pets: {
    freeDeliveryThreshold: 30,
    defaultDeliveryFee: 5.99,
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
};

// Distance-based surcharge tiers
interface DistanceTier {
  max: number | null; // null means no max
  rate: number; // rate per mile
}

const distanceTiers: Record<CartCategory, { free: number; tiers: DistanceTier[] }> = {
  restaurant: {
    free: 2, // Free delivery within 2 miles
    tiers: [
      { max: 5, rate: 0.5 }, // $0.50/mile for 2-5 miles
      { max: 10, rate: 0.75 }, // $0.75/mile for 5-10 miles
      { max: null, rate: 1.0 }, // $1.00/mile for 10+ miles
    ],
  },
  grocery: {
    free: 2,
    tiers: [
      { max: 5, rate: 0.5 },
      { max: 10, rate: 0.75 },
      { max: null, rate: 1.0 },
    ],
  },
  retail: {
    free: 2,
    tiers: [
      { max: 5, rate: 0.5 },
      { max: 10, rate: 0.75 },
      { max: null, rate: 1.0 },
    ],
  },
  convenience: {
    free: 2,
    tiers: [
      { max: 5, rate: 0.5 },
      { max: 10, rate: 0.75 },
      { max: null, rate: 1.0 },
    ],
  },
  pets: {
    free: 2,
    tiers: [
      { max: 5, rate: 0.5 },
      { max: 10, rate: 0.75 },
      { max: null, rate: 1.0 },
    ],
  },
};

export interface FeeCalculationParams {
  subtotal: number;
  distance: number; // in miles
  restaurant?: {
    id: string;
    isFreeDelivery: boolean;
    minDeliveryFee: number; // in cents
    dashPass: boolean;
  } | null;
  customerAddress?: Address | null;
  appliedDeal?: Deal | null;
  deliveryOption: 'standard' | 'express' | 'schedule';
  category: CartCategory;
}

export interface FeeCalculationResult {
  deliveryFee: number;
  serviceFee: number;
  estimatedTax: number;
  total: number;
  breakdown: {
    baseDeliveryFee: number;
    distanceSurcharge: number;
    expressSurcharge: number;
    dealDiscount: number;
  };
}

/**
 * Calculate distance-based surcharge for delivery
 */
function calculateDistanceSurcharge(distance: number, category: CartCategory): number {
  const config = distanceTiers[category];

  // No surcharge for free distance
  if (distance <= config.free) return 0;

  let surcharge = 0;
  let remainingDistance = distance - config.free;
  let currentThreshold = config.free;

  for (const tier of config.tiers) {
    if (remainingDistance <= 0) break;

    if (tier.max === null) {
      // No max - apply rate to all remaining distance
      surcharge += remainingDistance * tier.rate;
      break;
    } else {
      const tierMaxDistance = tier.max - currentThreshold;
      const tierDistance = Math.min(remainingDistance, tierMaxDistance);
      surcharge += tierDistance * tier.rate;
      remainingDistance -= tierDistance;
      currentThreshold = tier.max;
    }
  }

  return surcharge;
}

/**
 * Calculate delivery fee with all dynamic factors
 */
export function calculateDeliveryFee(params: FeeCalculationParams): {
  fee: number;
  breakdown: {
    baseDeliveryFee: number;
    distanceSurcharge: number;
    expressSurcharge: number;
    dealDiscount: number;
  };
} {
  const config = categoryConfigs[params.category];
  let baseDeliveryFee = 0;
  let distanceSurcharge = 0;
  let expressSurcharge = 0;
  const dealDiscount = 0;

  // Priority 1: Restaurant offers free delivery
  // Free delivery only applies to standard delivery, not express
  if (params.restaurant?.isFreeDelivery) {
    // If express delivery, still charge the express surcharge
    if (params.deliveryOption === 'express') {
      expressSurcharge = 2.99;
      return {
        fee: expressSurcharge,
        breakdown: {
          baseDeliveryFee: 0,
          distanceSurcharge: 0,
          expressSurcharge,
          dealDiscount: 0,
        },
      };
    }
    // Standard delivery is free
    return {
      fee: 0,
      breakdown: {
        baseDeliveryFee: 0,
        distanceSurcharge: 0,
        expressSurcharge: 0,
        dealDiscount: 0,
      },
    };
  }

  // Priority 2: Subtotal threshold (category-specific)
  // Free delivery only applies to standard delivery, not express
  if (params.subtotal >= config.freeDeliveryThreshold) {
    // Free delivery, but express surcharge still applies
    if (params.deliveryOption === 'express') {
      expressSurcharge = 2.99;
      return {
        fee: expressSurcharge,
        breakdown: {
          baseDeliveryFee: 0,
          distanceSurcharge: 0,
          expressSurcharge,
          dealDiscount: 0,
        },
      };
    }
    // Standard delivery is free
    return {
      fee: 0,
      breakdown: {
        baseDeliveryFee: 0,
        distanceSurcharge: 0,
        expressSurcharge: 0,
        dealDiscount: 0,
      },
    };
  }

  // Priority 3: Base fee (restaurant min OR category default)
  if (params.restaurant) {
    baseDeliveryFee = Math.max(
      params.restaurant.minDeliveryFee / 100, // Convert cents to dollars
      config.defaultDeliveryFee
    );
  } else {
    baseDeliveryFee = config.defaultDeliveryFee;
  }

  // Priority 4: Distance-based surcharge
  if (params.distance > 0) {
    distanceSurcharge = calculateDistanceSurcharge(params.distance, params.category);
  }

  // Priority 5: Express delivery surcharge
  if (params.deliveryOption === 'express') {
    expressSurcharge = 2.99;
  }

  // Priority 6: Deal-based discounts (if deal waives delivery fee)
  // Note: Currently deals don't have freeDelivery flag, but we can check for specific deal IDs
  if (params.appliedDeal?.id === 'dashpass-delivery-fee') {
    // This deal would waive delivery fee, but we're skipping DashPass for now
    // Placeholder for future implementation
  }

  const totalFee = baseDeliveryFee + distanceSurcharge + expressSurcharge - dealDiscount;

  return {
    fee: Math.max(0, totalFee), // Ensure fee is never negative
    breakdown: {
      baseDeliveryFee,
      distanceSurcharge,
      expressSurcharge,
      dealDiscount,
    },
  };
}

/**
 * Calculate service fee with dynamic factors
 */
function calculateServiceFee(params: FeeCalculationParams): number {
  const config = categoryConfigs[params.category];

  // Base service fee
  let serviceFee = Math.max(params.subtotal * config.serviceFeePercentage, config.minServiceFee);

  // Distance-based adjustment (optional - longer distances might have slightly higher service fees)
  if (params.distance > 5) {
    serviceFee = serviceFee * 1.1; // 10% increase for >5 miles
  }

  return serviceFee;
}

/**
 * Calculate estimated tax
 * Note: This is a simplified version. In production, you'd want to use a tax service API
 */
export function calculateEstimatedTax(
  subtotal: number,
  deliveryFee: number,
  serviceFee: number,
  address?: Address | null
): number {
  // Get tax rate based on state/zip code
  const taxRate = address ? getTaxRate(address.state, address.zipCode) : 0.06; // Default 6%

  // Tax applies to subtotal + delivery fee + service fee
  const taxableAmount = subtotal + deliveryFee + serviceFee;

  return taxableAmount * taxRate;
}

/**
 * Main fee calculation function
 */
export function calculateFees(params: FeeCalculationParams): FeeCalculationResult {
  // Calculate delivery fee
  const deliveryFeeResult = calculateDeliveryFee(params);

  // Calculate service fee
  const serviceFee = calculateServiceFee(params);

  // Calculate estimated tax
  const estimatedTax = calculateEstimatedTax(
    params.subtotal,
    deliveryFeeResult.fee,
    serviceFee,
    params.customerAddress
  );

  // Calculate total
  const total = params.subtotal + deliveryFeeResult.fee + serviceFee + estimatedTax;

  return {
    deliveryFee: deliveryFeeResult.fee,
    serviceFee,
    estimatedTax,
    total,
    breakdown: deliveryFeeResult.breakdown,
  };
}

/**
 * Get category configuration
 */
export function getCategoryConfig(category: CartCategory): CategoryConfig {
  return categoryConfigs[category];
}
