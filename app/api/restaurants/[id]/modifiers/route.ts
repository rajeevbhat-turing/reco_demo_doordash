import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, message: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const modifiersRaw = await db.query<any>(
      `SELECT 
        mod.id,
        mod.menu_item_id,
        mod.description,
        mod.is_required,
        mod.select_up_to,
        mod.select_at_least,
        mod.parent_option_id,
        mi.name AS menu_item_name
      FROM modifications mod
      JOIN menu_items mi ON mod.menu_item_id = mi.id
      WHERE mi.restaurant_id = ?
      ORDER BY mod.id`,
      [restaurantId]
    );

    const modifierIds = modifiersRaw.map((m: any) => m.id);
    const optionsRaw =
      modifierIds.length > 0
        ? await db.query<any>(
            `SELECT 
              mo.id,
              mo.modification_id,
              mo.name,
              mo.description,
              mo.price,
              mo.is_counter,
              mo.max_quantity,
              mo.is_default,
              mo.sort_order,
              mo.image
            FROM modification_options mo
            WHERE mo.modification_id IN (${modifierIds.map(() => '?').join(',')})
            ORDER BY mo.modification_id, mo.sort_order, mo.id`,
            modifierIds
          )
        : [];

    const optionsMap = new Map<number, any[]>();
    optionsRaw.forEach((opt: any) => {
      if (!optionsMap.has(opt.modification_id)) {
        optionsMap.set(opt.modification_id, []);
      }
      optionsMap.get(opt.modification_id)!.push({
        id: String(opt.id),
        name: opt.name,
        description: opt.description,
        price: opt.price ? opt.price / 100 : 0,
        isCounter: opt.is_counter === 1,
        maxQuantity: opt.max_quantity,
        isDefault: opt.is_default === 1,
        sortOrder: opt.sort_order,
        image: opt.image || null,
      });
    });

    const modifiers = modifiersRaw.map((mod: any) => ({
      id: String(mod.id),
      menuItemId: String(mod.menu_item_id),
      menuItemName: mod.menu_item_name,
      description: mod.description,
      isRequired: mod.is_required === 1,
      selectUpTo: mod.select_up_to,
      selectAtLeast: mod.select_at_least,
      parentOptionId: mod.parent_option_id ? String(mod.parent_option_id) : null,
      options: optionsMap.get(mod.id) || [],
    }));

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
