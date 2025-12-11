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

  const merged: MenuCategory[] = storeCategories.map(storeCat => {
    const dbCat = dbMap.get(storeCat.id);
    const storeItems = (storeCat.items || []).filter(item => !deletedSet.has(item.id));
    const storeIds = new Set(storeItems.map(item => item.id));

    const missingDbItems =
      dbCat?.items.filter(item => !deletedSet.has(item.id) && !storeIds.has(item.id)) || [];

    return {
      ...(dbCat || storeCat),
      id: storeCat.id,
      name: storeCat.name,
      items: [...storeItems, ...missingDbItems],
    };
  });

  dbCategories.forEach(dbCat => {
    const exists = storeCategories.find(cat => cat.id === dbCat.id);
    if (exists) return;
    const items = dbCat.items.filter(item => !deletedSet.has(item.id));
    merged.push({ ...dbCat, items });
  });

  return merged;
}


