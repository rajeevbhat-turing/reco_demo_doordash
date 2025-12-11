import { NextRequest, NextResponse } from 'next/server';
import { merchantDb } from '@/lib/merchant-db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Fetch modifiers for this store
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
        m.created_at,
        m.updated_at
      FROM modifiers m
      WHERE m.store_id = ?
      ORDER BY m.name`,
      [storeId]
    );

    const modifierIds = modifiersRaw.map((m: any) => m.id);

    // Fetch options for all modifiers
    const optionsMap = new Map<string, any[]>();

    if (modifierIds.length > 0) {
      const optionsRaw = await merchantDb.query<any>(
        `SELECT 
          mo.id,
          mo.modifier_id,
          mo.name,
          mo.price,
          mo.is_default,
          mo.sort_order
        FROM modifier_options mo
        WHERE mo.modifier_id IN (${modifierIds.map(() => '?').join(',')})
        ORDER BY mo.modifier_id, mo.sort_order`,
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

    // Fetch menu items that use each modifier (via junction table)
    const usedInMap = new Map<string, any[]>();

    if (modifierIds.length > 0) {
      const usedInRaw = await merchantDb.query<any>(
        `SELECT 
          mim.modifier_id,
          mi.id AS menu_item_id,
          mi.name AS menu_item_name
        FROM menu_item_modifiers mim
        JOIN menu_items mi ON mim.menu_item_id = mi.id
        WHERE mim.modifier_id IN (${modifierIds.map(() => '?').join(',')})`,
        modifierIds
      );

      // Group by modifier
      usedInRaw.forEach((item: any) => {
        if (!usedInMap.has(item.modifier_id)) {
          usedInMap.set(item.modifier_id, []);
        }
        usedInMap.get(item.modifier_id)!.push({
          id: item.menu_item_id,
          name: item.menu_item_name,
        });
      });
    }

    // Transform modifiers
    const modifiers = modifiersRaw.map((mod: any) => ({
      id: mod.id,
      storeId: mod.store_id,
      name: mod.name,
      status: mod.status,
      timing: mod.timing,
      isRequired: mod.is_required === 1,
      allowMultipleOptions: mod.allow_multiple_options === 1,
      allowMultipleSame: mod.allow_multiple_same === 1,
      allowFreeOptions: mod.allow_free_options === 1,
      options: optionsMap.get(mod.id) || [],
      usedIn: usedInMap.get(mod.id) || [],
    }));

    console.log(`✅ Fetched ${modifiers.length} modifiers for store ${storeId}`);

    return NextResponse.json({
      success: true,
      data: { modifiers },
    });
  } catch (error) {
    console.error('Error fetching modifiers', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch modifiers' },
      { status: 500 }
    );
  }
}
