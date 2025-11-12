import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Fetch menu items with their categories
    const menuItemsRaw = await db.query<any>(
      `SELECT 
        mi.id,
        mi.restaurant_id,
        mi.name,
        mi.description,
        mi.price,
        mi.image,
        mi.calories,
        mi.rating,
        mi.rating_count,
        mi.popular,
        mi.featured,
        mi.is_available,
        mi.discount_percentage,
        mi.discount_cap,
        mc.name AS category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.restaurant_id = ? AND mi.is_available = 1
      ORDER BY mc.display_order, mi.display_order`,
      [restaurantId]
    );

    // Fetch modifications for all menu items
    const modificationsRaw = await db.query<any>(
      `SELECT 
        mod.id,
        mod.menu_item_id,
        mod.description,
        mod.is_required,
        mod.select_up_to,
        mod.select_at_least,
        mod.parent_option_id
      FROM modifications mod
      WHERE mod.menu_item_id IN (
        SELECT id FROM menu_items WHERE restaurant_id = ?
      )
      ORDER BY mod.id`,
      [restaurantId]
    );

    // Fetch modification options
    const modificationOptionsRaw = await db.query<any>(
      `SELECT 
        mo.id,
        mo.modification_id,
        mo.name,
        mo.description,
        mo.price,
        mo.is_counter,
        mo.max_quantity,
        mo.is_default,
        mo.sort_order
      FROM modification_options mo
      WHERE mo.modification_id IN (
        SELECT mod.id FROM modifications mod
        JOIN menu_items mi ON mod.menu_item_id = mi.id
        WHERE mi.restaurant_id = ?
      )
      ORDER BY mo.modification_id, mo.sort_order, mo.id`,
      [restaurantId]
    );

    // Fetch menu categories
    const categoriesRaw = await db.query<any>(
      `SELECT 
        id,
        name,
        description,
        display_order
      FROM menu_categories
      WHERE restaurant_id = ? AND is_active = 1
      ORDER BY display_order`,
      [restaurantId]
    );

    // Group modification options by modification
    const modificationOptionsMap = new Map<number, any[]>();
    modificationOptionsRaw.forEach((option: any) => {
      if (!modificationOptionsMap.has(option.modification_id)) {
        modificationOptionsMap.set(option.modification_id, []);
      }
      modificationOptionsMap.get(option.modification_id)!.push({
        id: String(option.id),
        name: option.name,
        description: option.description,
        price: option.price / 100, // Convert cents to dollars
        is_counter: option.is_counter === 1,
        max_quantity: option.max_quantity,
        is_default: option.is_default === 1,
        sort_order: option.sort_order,
      });
    });

    // Group modifications by menu item
    const modificationsMap = new Map<number, any[]>();
    modificationsRaw.forEach((mod: any) => {
      if (!modificationsMap.has(mod.menu_item_id)) {
        modificationsMap.set(mod.menu_item_id, []);
      }
      modificationsMap.get(mod.menu_item_id)!.push({
        id: String(mod.id),
        description: mod.description,
        is_required: mod.is_required === 1,
        select_up_to: mod.select_up_to,
        select_at_least: mod.select_at_least,
        parent_option: mod.parent_option_id ? String(mod.parent_option_id) : undefined,
        options: modificationOptionsMap.get(mod.id) || [],
      });
    });

    // Transform menu items and attach modifications
    const menuItems = menuItemsRaw.map((item: any) => {
      // Format price
      const priceInDollars = (item.price / 100).toFixed(2);
      const priceDisplay = item.discount_percentage 
        ? `$${priceInDollars}+` 
        : `$${priceInDollars}`;

      return {
        id: String(item.id),
        restaurantId: String(item.restaurant_id),
        name: item.name,
        description: item.description || null,
        price: priceDisplay,
        image: item.image,
        category: item.category_name,
        calories: item.calories ? String(item.calories) : undefined,
        rating: item.rating || null,
        ratingCount: item.rating_count || null,
        popular: item.popular === 1,
        featured: item.featured === 1,
        discount: item.discount_percentage 
          ? `${item.discount_percentage}% off up to $${(item.discount_cap / 100).toFixed(2)}`
          : undefined,
        modifications: modificationsMap.get(item.id) || [],
      };
    });

    // Transform categories
    const categories = categoriesRaw.map((cat: any) => ({
      id: String(cat.id),
      name: cat.name,
      description: cat.description,
      displayOrder: cat.display_order,
    }));

    // Count total modifications across all items
    const totalModifications = menuItems.reduce((sum, item) => sum + (item.modifications?.length || 0), 0);
    console.log(`✅ Fetched ${menuItems.length} menu items with ${totalModifications} total modifications for restaurant ${restaurantId}`);

    return NextResponse.json({
      success: true,
      data: {
        menuItems,
        categories,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

