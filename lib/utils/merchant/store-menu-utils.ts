'use client';

import { MenuCategory } from '@/store/merchant-menu-store';

interface MergeMenuCategoriesParams {
  dbCategories: MenuCategory[];
  storeCategories: MenuCategory[];
  deletedItemIds: Set<string>;
}

/**
 * Merge DB categories with locally mutated store categories.
 * - Filters out deleted item ids.
 * - Keeps store-only items.
 * - Keeps store-only categories.
 */
export function mergeMenuCategories({
  dbCategories,
  storeCategories,
  deletedItemIds,
}: MergeMenuCategoriesParams): MenuCategory[] {
  const deletedSet = deletedItemIds || new Set<string>();
  const dbMap = new Map(dbCategories.map(cat => [cat.id, cat]));

  const merged: MenuCategory[] = dbCategories.map(cat => {
    const storeCat = storeCategories.find(c => c.id === cat.id);
    const dbItems = cat.items.filter(item => !deletedSet.has(item.id));
    const storeOnly =
      storeCat?.items.filter(
        item => !deletedSet.has(item.id) && !dbItems.find(dbItem => dbItem.id === item.id)
      ) || [];
    return { ...cat, items: [...dbItems, ...storeOnly] };
  });

  // Add store-only categories not present in db (after filtering deletions)
  storeCategories.forEach(storeCat => {
    if (!dbMap.has(storeCat.id)) {
      const items = storeCat.items.filter(item => !deletedSet.has(item.id));
      if (items.length > 0) {
        merged.push({ ...storeCat, items });
      }
    }
  });

  return merged;
}


