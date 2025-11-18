import { useCartStore, Cart } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import { useAppStore, SearchResult } from '@/store/app-store';
import { useOrdersStore } from '@/store/orders-store';
import { useDealsStore } from '@/store/deals-store';
import { useReviewStore } from '@/store/review-store';
import { User, Address, PaymentMethod } from '@/lib/types/user-types';
import { Order } from '@/constants/order-data';
import { UserReview } from '@/types/review-types';
import * as expectedStateFunctions from './expected-state-functions';

interface AppState {
  cart: {
    carts: Cart[];
    totalItems: number;
    isGroupOrder: boolean;
    groupOrderId: string | null;
  };
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

export async function getStates(expected_state_functions: ExpectedStateFunction[] = []): Promise<States> {
  const cartStore = useCartStore.getState();
  const userStore = useUserStore.getState();
  const appStore = useAppStore.getState();
  const ordersStore = useOrdersStore.getState();
  const dealsStore = useDealsStore.getState();
  const reviewStore = useReviewStore.getState();

  // Build the actual state
  const actual_state: AppState = {
    cart: {
      carts: cartStore.carts,
      totalItems: cartStore.getTotalItems(),
      isGroupOrder: cartStore.isGroupOrder,
      groupOrderId: cartStore.groupOrderId,
    },
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
      
      // Call the function with args (if any)
      // Check if function expects arguments based on funcSpec.args
      const result = funcSpec.args && Object.keys(funcSpec.args).length > 0
        ? await func(funcSpec.args)
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

