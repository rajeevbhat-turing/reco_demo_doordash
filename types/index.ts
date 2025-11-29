export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  type: string;
  isActive: boolean;
}
export interface Product {
  id: number | string;
  name: string;
  price: number | string;
  quantity?: string;
  image: string;
  category?: string | string[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface ProductSection {
  id: number;
  title: string;
  products: Product[];
}

// ========================================
// Menu Item Modification Definitions
// ========================================

export interface Modification {
  id: string;
  description: string;
  is_required: boolean;
  select_up_to: number; // maximum number of options that can be selected
  select_at_least?: number; // minimum number of options that must be selected (optional, defaults to 0, or 1 if is_required)
  options: ModificationOption[];
  parent_option?: string; // id of a ModificationOption that must be selected for this modification to show
}

export interface ModificationOption {
  id: string;
  name: string;
  description?: string;
  price: number; // additional cost for this option (can be 0 for free options, or negative for discounts)
  is_counter: boolean; // if true, shows +/- controls for quantity selection
  max_quantity?: number; // only relevant if is_counter is true, defines maximum quantity (e.g., max 5 shots)
  is_default: boolean; // whether this option is pre-selected
  sort_order: number; // controls display order of options
  image?: string; // optional image URL for the option
}

// ========================================
// Cart Modification Storage
// ========================================

export interface AppliedModification {
  modificationId: string;
  modificationDescription: string; // e.g., "Choose Size"
  appliedOptions: AppliedModificationOption[];
}

export interface AppliedModificationOption {
  optionId: string;
  optionName: string; // e.g., "Large"
  price: number; // price at time of selection
  quantity: number; // 1 for regular options, 1+ for counter options (e.g., 3 shots)
}

// ========================================
// Order Modification Storage (Denormalized)
// ========================================

export interface OrderModification {
  modificationId: string;
  modificationDescription: string;
  isRequired: boolean; // snapshot for historical context
  options: OrderModificationOption[];
}

export interface OrderModificationOption {
  optionId: string;
  optionName: string;
  optionDescription?: string;
  price: number; // price at time of order
  quantity: number; // how many of this option (1 for regular, 1+ for counter)
  isCounter: boolean; // to help with display
}
