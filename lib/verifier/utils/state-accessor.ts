import { useCartStore, Cart } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import { useAppStore, SearchResult } from '@/store/app-store';
import { useOrdersStore } from '@/store/orders-store';
import { useDealsStore } from '@/store/deals-store';
import { useReviewStore } from '@/store/review-store';
import { User, Address, PaymentMethod } from '@/lib/types/user-types';
import { Order } from '@/constants/order-data';
import { UserReview } from '@/types/review-types';
import * as expectedStateFunctions from '../expected-state-functions';
import { JSONPath } from 'jsonpath-plus';

interface AppState {
  carts: Cart[];
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    tempAddress: Address | null;
  };
  app: {
    searchResults: SearchResult[];
    currentStore: Record<string, any>;
    currentCategory: string | null;
    visitedStores: string[];
  };
  orders: Order[];
  deals: {
    appliedDeals: Array<{
      dealId: string;
      cartId: string;
      appliedAt: number;
      freeItemIds?: string[];
    }>;
  };
  reviews: {
    newReviews: UserReview[];
    helpfulChanges: Record<string, string[]>;
    approvalChanges: Record<string, 'approved' | 'rejected' | 'pending'>;
    deletedReviewIds: string[];
  };
  timestamp: number;
}

interface ExpectedStateFunction {
  function: string;
  args: Record<string, any>;
}

interface States {
  actual_state: AppState;
  expected_states: any[];
}

/**
 * Checks if a string is a valid JSONPath expression
 * @param value - The string to check
 * @returns True if the string is a JSONPath expression
 */
function isJSONPath(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Valid JSONPath patterns:
  // - Starts with $[ (array access): $[0], $[0].prop, $[*]
  // - Starts with $. (property access): $.prop, $.prop.nested
  // - Starts with $.. (recursive descent): $..prop
  // - Exactly $ (root)
  return value.startsWith('$[') || value.startsWith('$.') || value.startsWith('$..');
}

/**
 * Resolves JSONPath expressions in function arguments
 * @param args - The arguments object that may contain JSONPath strings
 * @param expectedStates - The array of expected states to resolve paths from
 * @returns Resolved arguments with JSONPath expressions replaced with actual values
 */
function getResolvedArgs(args: Record<string, any>, expectedStates: any[]): Record<string, any> {
  if (!args || typeof args !== 'object') {
    return args;
  }

  const resolvedArgs: Record<string, any> = {};

  for (const [key, value] of Object.entries(args)) {
    // Check if the value is a JSONPath expression
    // Valid JSONPath patterns: $[...], $., $.., or exactly $
    if (typeof value === 'string' && isJSONPath(value)) {
      try {
        const result = JSONPath({ path: value, json: expectedStates });

        if (result.length === 0) {
          console.error(`JSONPath not found: ${value}`);
          resolvedArgs[key] = undefined;
        } else {
          resolvedArgs[key] = result[0];
        }
      } catch (error) {
        console.error(`Error resolving JSONPath "${value}":`, error);
        resolvedArgs[key] = undefined;
      }
    } else if (Array.isArray(value)) {
      // Recursively resolve arrays (keep as array)
      resolvedArgs[key] = value.map(item => {
        if (typeof item === 'string' && isJSONPath(item)) {
          try {
            const result = JSONPath({ path: item, json: expectedStates });
            return result.length === 0 ? undefined : result[0];
          } catch (error) {
            console.error(`Error resolving JSONPath "${item}":`, error);
            return undefined;
          }
        } else if (typeof item === 'object' && item !== null) {
          return getResolvedArgs(item, expectedStates);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      // Recursively resolve nested objects
      resolvedArgs[key] = getResolvedArgs(value, expectedStates);
    } else {
      // Keep non-JSONPath values as is
      resolvedArgs[key] = value;
    }
  }

  return resolvedArgs;
}

export async function getStates(
  expected_state_functions: ExpectedStateFunction[] = []
): Promise<States> {
  const cartStore = useCartStore.getState();
  const userStore = useUserStore.getState();
  const appStore = useAppStore.getState();
  const ordersStore = useOrdersStore.getState();
  const dealsStore = useDealsStore.getState();
  const reviewStore = useReviewStore.getState();

  // Build the actual state
  const actual_state: AppState = {
    carts: cartStore.carts,
    user: {
      currentUser: userStore.currentUser,
      isAuthenticated: userStore.isAuthenticated(),
      tempAddress: userStore.getTempAddress(),
    },
    app: {
      searchResults: appStore.searchResults,
      currentStore: appStore.currentStore,
      currentCategory: appStore.currentCategory,
      visitedStores: appStore.visitedStores,
    },
    orders: ordersStore.orders,
    deals: {
      appliedDeals: dealsStore.appliedDeals,
    },
    reviews: {
      newReviews: reviewStore.newReviews,
      helpfulChanges: reviewStore.helpfulChanges,
      approvalChanges: reviewStore.approvalChanges,
      deletedReviewIds: reviewStore.deletedReviewIds,
    },
    timestamp: Date.now(),
  };

  // Execute expected state functions
  const expected_states: any[] = [];

  for (const funcSpec of expected_state_functions) {
    try {
      const func = (expectedStateFunctions as any)[funcSpec.function];

      if (typeof func !== 'function') {
        console.error(`Expected state function not found: ${funcSpec.function}`);
        expected_states.push({
          error: `Function '${funcSpec.function}' not found`,
          args: funcSpec.args,
        });
        continue;
      }

      // Resolve any JSONPath expressions in the arguments
      const resolvedArgs =
        funcSpec.args && Object.keys(funcSpec.args).length > 0
          ? getResolvedArgs(funcSpec.args, expected_states)
          : funcSpec.args;

      // Call the function with resolved args (if any)
      const result =
        resolvedArgs && Object.keys(resolvedArgs).length > 0
          ? await func(resolvedArgs)
          : await func();
      expected_states.push(result);
    } catch (error) {
      console.error(`Error executing expected state function '${funcSpec.function}':`, error);
      expected_states.push({
        error: error instanceof Error ? error.message : 'Unknown error',
        function: funcSpec.function,
        args: funcSpec.args,
      });
    }
  }

  return {
    actual_state,
    expected_states,
  };
}
