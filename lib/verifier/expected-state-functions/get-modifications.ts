import { useUserStore } from '@/store/user-store';

export interface ModificationOptionResult {
  id: string;
  name: string;
  description: string | null;
  price: number; // In cents
  isCounter: boolean;
  maxQuantity: number | null;
  isDefault: boolean;
  sortOrder: number;
  image: string | null;
}

export interface ModificationResult {
  id: string;
  menuItemId: string;
  description: string; // The modification name/title (e.g., "Choose your size")
  isRequired: boolean;
  selectUpTo: number;
  selectAtLeast: number | null;
  parentOptionId: string | null;
  options: ModificationOptionResult[];
}

export interface GetModificationsArgs {
  item_id: string; // Required: Menu item ID
  modification_name: string; // Required: Modification description/name to search for
  option_name?: string; // Optional: Specific option name to filter by
}

export interface GetModificationsResult {
  modification: ModificationResult | null;
}

/**
 * Get modifications for a specific menu item
 *
 * @param args - Object containing item_id, modification_name, and optional option_name
 * @returns Object with modification details and options
 */
export async function get_modifications(
  args: GetModificationsArgs
): Promise<GetModificationsResult | null> {
  const userStore = useUserStore.getState();
  const currentUser = userStore.currentUser;

  if (!currentUser) {
    return null;
  }

  const { item_id, modification_name, option_name } = args;

  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('userId', currentUser.id);
    params.append('item_id', item_id);
    params.append('modification_name', modification_name);

    if (option_name) {
      params.append('option_name', option_name);
    }

    // Call API route
    const response = await fetch(`/api/expected-state/get-modifications?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch modifications');
    }

    return { modification: result.data };
  } catch (error) {
    console.error('Error fetching modifications:', error);
    return null;
  }
}

