import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';
import { getImageWithFallback } from '@/constants/image-placeholders';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: storeId } = await params;
    const { searchParams } = new URL(request.url);
    const includeUnavailable = searchParams.get('includeUnavailable') === 'true';

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Build WHERE clause - include unavailable items for merchant view
    const availabilityFilter = includeUnavailable ? '' : "AND mi.status = 'In stock'";

    // Fetch menu items with their categories
    const menuItemsRaw = await merchantDb.query<any>(
      `SELECT 
        mi.id,
        mi.store_id,
        mi.category_id,
        mi.name,
        mi.description,
        mi.image,
        mi.pickup_price,
        mi.delivery_price,
        mi.status,
        mi.calories,
        mi.display_order,
        mi.is_available,
        mc.name AS category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.store_id = ? ${availabilityFilter}
      ORDER BY mc.display_order, mi.display_order`,
      [storeId]
    );

    // Fetch menu categories
    const categoriesRaw = await merchantDb.query<any>(
      `SELECT 
        id,
        name,
        description,
        display_order
      FROM menu_categories
      WHERE store_id = ? AND is_active = 1
      ORDER BY display_order`,
      [storeId]
    );

    // Fetch modifiers for this store's menu items
    const menuItemIds = menuItemsRaw.map(mi => mi.id);

    const modifiersMap = new Map<string, any[]>();

    if (menuItemIds.length > 0) {
      // Get modifiers linked to menu items via menu_item_modifiers junction
      const modifiersRaw = await merchantDb.query<any>(
        `SELECT 
          m.id,
          m.store_id,
          m.name,
          m.status,
          m.timing,
          m.is_required,
          m.allow_multiple_options,
          m.allow_multiple_same,
          m.allow_free_options,
          mim.menu_item_id
        FROM modifiers m
        INNER JOIN menu_item_modifiers mim ON m.id = mim.modifier_id
        WHERE mim.menu_item_id IN (${menuItemIds.map(() => '?').join(',')})
        ORDER BY m.name`,
        menuItemIds
      );

      // Get modifier options
      const modifierIds = [...new Set(modifiersRaw.map(m => m.id))];

      const optionsMap = new Map<string, any[]>();

      if (modifierIds.length > 0) {
        const optionsRaw = await merchantDb.query<any>(
          `SELECT 
            id,
            modifier_id,
            name,
            price,
            is_default,
            sort_order
          FROM modifier_options
          WHERE modifier_id IN (${modifierIds.map(() => '?').join(',')})
          ORDER BY sort_order`,
          modifierIds
        );

        // Group options by modifier
        optionsRaw.forEach((opt: any) => {
          if (!optionsMap.has(opt.modifier_id)) {
            optionsMap.set(opt.modifier_id, []);
          }
          optionsMap.get(opt.modifier_id)!.push({
            id: opt.id,
            name: opt.name,
            price: opt.price / 100, // Convert cents to dollars
            isDefault: opt.is_default === 1,
            sortOrder: opt.sort_order,
          });
        });
      }

      // Group modifiers by menu item
      modifiersRaw.forEach((mod: any) => {
        if (!modifiersMap.has(mod.menu_item_id)) {
          modifiersMap.set(mod.menu_item_id, []);
        }
        modifiersMap.get(mod.menu_item_id)!.push({
          id: mod.id,
          name: mod.name,
          status: mod.status,
          timing: mod.timing,
          isRequired: mod.is_required === 1,
          allowMultipleOptions: mod.allow_multiple_options === 1,
          allowMultipleSame: mod.allow_multiple_same === 1,
          allowFreeOptions: mod.allow_free_options === 1,
          options: optionsMap.get(mod.id) || [],
        });
      });
    }

    // Transform menu items
    const menuItems = menuItemsRaw.map((item: any) => ({
      id: item.id,
      storeId: item.store_id,
      categoryId: item.category_id,
      name: item.name,
      description: item.description || null,
      image: getImageWithFallback(item.image, 'image'),
      pickupPrice: `$${(item.pickup_price / 100).toFixed(2)}`,
      deliveryPrice: `$${(item.delivery_price / 100).toFixed(2)}`,
      status: item.status,
      calories: item.calories ? String(item.calories) : undefined,
      displayOrder: item.display_order,
      isAvailable: item.is_available === 1,
      category: item.category_name,
      modifications: modifiersMap.get(item.id) || [],
    }));

    // Transform categories
    const categories = categoriesRaw.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      displayOrder: cat.display_order,
    }));

    console.log(`✅ Fetched ${menuItems.length} menu items for store ${storeId}`);

    return NextResponse.json({
      success: true,
      data: {
        menuItems,
        categories,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch menu' }, { status: 500 });
  }
}
