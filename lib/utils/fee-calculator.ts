import type { CartCategory } from '@/store/cart-store';
import type { Address } from '@/lib/types/user-types';
import type { Deal } from '@/types/deal-types';
import { getTaxRate } from './tax-calculator';

// Category-specific configurations
interface CategoryConfig {
  serviceFeePercentage: number;
  minServiceFee: number;
}

// Default configuration by category (only restaurant for now)
const categoryConfigs: Record<CartCategory, CategoryConfig> = {
  restaurant: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  // Placeholder configs for other categories (not currently used)
  grocery: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  retail: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  convenience: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
  pets: {
    serviceFeePercentage: 0.15,
    minServiceFee: 4.99,
  },
};

// Distance-based delivery fee tiers
interface DistanceTier {
  max: number | null; // null means no max
  rate: number; // rate per mile
}

// Distance tiers for calculating distance surcharge
const distanceTiers: DistanceTier[] = [
  { max: 2, rate: 0 }, // No extra charge within 2 miles
  { max: 5, rate: 0.5 }, // $0.50/mile for 2-5 miles
  { max: 10, rate: 0.75 }, // $0.75/mile for 5-10 miles
  { max: null, rate: 1.0 }, // $1.00/mile for 10+ miles
];

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
 * Calculate distance surcharge based on distance tiers
 * Returns the surcharge to add on top of base fee
 */
function calculateDistanceSurcharge(distance: number): number {
  let surcharge = 0;
  let currentThreshold = 0;

  for (const tier of distanceTiers) {
    if (distance <= currentThreshold) break;

    if (tier.max === null) {
      // No max - apply rate to all remaining distance beyond current threshold
      const distanceInTier = distance - currentThreshold;
      if (distanceInTier > 0) {
        surcharge += distanceInTier * tier.rate;
      }
      break;
    } else {
      if (distance <= tier.max) {
        // We're in this tier - calculate surcharge for distance in this tier
        const distanceInTier = Math.max(0, distance - currentThreshold);
        surcharge += distanceInTier * tier.rate;
        break;
      } else {
        // Distance exceeds this tier, calculate for the full tier and continue
        const tierDistance = tier.max - currentThreshold;
        surcharge += tierDistance * tier.rate;
        currentThreshold = tier.max;
      }
    }
  }

  return surcharge;
}

/**
 * Calculate delivery fee with all dynamic factors
 * Fee = restaurant.minDeliveryFee + distanceSurcharge + expressSurcharge
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

  // Priority 2: Base fee is the restaurant's minDeliveryFee
  if (params.restaurant?.minDeliveryFee) {
    baseDeliveryFee = params.restaurant.minDeliveryFee / 100; // Convert cents to dollars
  }

  // Priority 3: Calculate distance surcharge
  if (params.distance > 0) {
    distanceSurcharge = calculateDistanceSurcharge(params.distance);
  }

  // Priority 4: Express delivery surcharge
  if (params.deliveryOption === 'express') {
    expressSurcharge = 2.99;
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
  const config = categoryConfigs[params.category] || categoryConfigs.restaurant;

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
