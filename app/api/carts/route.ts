import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    // Fetch all carts for the user
    const cartsRaw = await db.query<any>(
      `SELECT 
        c.id,
        c.user_id,
        c.store_id,
        c.store_category
      FROM carts c
      WHERE c.user_id = ?`,
      [userId]
    );

    if (cartsRaw.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const cartIds = cartsRaw.map(c => c.id);

    // Fetch all cart items for these carts
    const cartItemsRaw = await db.query<any>(
      `SELECT 
        ci.id,
        ci.cart_id,
        ci.menu_item_id,
        ci.quantity,
        ci.customizations
      FROM cart_items ci
      WHERE ci.cart_id IN (${cartIds.map(() => '?').join(',')})`,
      cartIds
    );

    // Get unique menu item IDs
    const menuItemIds = [...new Set(cartItemsRaw.map(ci => ci.menu_item_id))];

    // Fetch menu items with their restaurant info
    const menuItemsRaw =
      menuItemIds.length > 0
        ? await db.query<any>(
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
        r.name AS restaurant_name,
        mc.name AS category_name
      FROM menu_items mi
      JOIN restaurants r ON mi.restaurant_id = r.id
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.id IN (${menuItemIds.map(() => '?').join(',')})`,
            menuItemIds
          )
        : [];

    // Get unique restaurant IDs from carts
    const restaurantIds = [...new Set(cartsRaw.map(c => c.store_id).filter(id => id))];

    // Fetch restaurant details
    const restaurantsRaw =
      restaurantIds.length > 0
        ? await db.query<any>(
            `SELECT 
        id,
        name,
        logo,
        banner,
        section
      FROM restaurants
      WHERE id IN (${restaurantIds.map(() => '?').join(',')})`,
            restaurantIds
          )
        : [];

    // Fetch applied modifications for cart items
    const cartItemIds = cartItemsRaw.map(ci => ci.id);
    const appliedModsRaw =
      cartItemIds.length > 0
        ? await db.query<any>(
            `SELECT 
        ciam.id,
        ciam.cart_item_id,
        ciam.modification_id,
        ciam.modification_desc
      FROM cart_item_applied_modifications ciam
      WHERE ciam.cart_item_id IN (${cartItemIds.map(() => '?').join(',')})`,
            cartItemIds
          )
        : [];

    // Fetch applied options for modifications
    const appliedModIds = appliedModsRaw.map(mod => mod.id);
    const appliedOptionsRaw =
      appliedModIds.length > 0
        ? await db.query<any>(
            `SELECT 
        ciao.id,
        ciao.cart_item_applied_mod_id,
        ciao.option_id,
        ciao.option_name,
        ciao.price,
        ciao.quantity
      FROM cart_item_applied_options ciao
      WHERE ciao.cart_item_applied_mod_id IN (${appliedModIds.map(() => '?').join(',')})`,
            appliedModIds
          )
        : [];

    // Create lookup maps
    const menuItemsMap = new Map(menuItemsRaw.map(mi => [mi.id, mi]));
    const restaurantsMap = new Map(restaurantsRaw.map(r => [r.id, r]));
    const appliedOptionsMap = new Map<number, any[]>();

    appliedOptionsRaw.forEach(opt => {
      if (!appliedOptionsMap.has(opt.cart_item_applied_mod_id)) {
        appliedOptionsMap.set(opt.cart_item_applied_mod_id, []);
      }
      appliedOptionsMap.get(opt.cart_item_applied_mod_id)!.push(opt);
    });

    const appliedModsMap = new Map<number, any[]>();
    appliedModsRaw.forEach(mod => {
      if (!appliedModsMap.has(mod.cart_item_id)) {
        appliedModsMap.set(mod.cart_item_id, []);
      }

      const options = appliedOptionsMap.get(mod.id) || [];
      appliedModsMap.get(mod.cart_item_id)!.push({
        modificationId: String(mod.modification_id),
        modificationDescription: mod.modification_desc,
        appliedOptions: options.map(opt => ({
          optionId: String(opt.option_id),
          optionName: opt.option_name,
          price: opt.price / 100, // Convert cents to dollars
          quantity: opt.quantity,
        })),
      });
    });

    // Group cart items by cart
    const cartItemsMap = new Map<number, any[]>();
    cartItemsRaw.forEach(ci => {
      if (!cartItemsMap.has(ci.cart_id)) {
        cartItemsMap.set(ci.cart_id, []);
      }

      const menuItem = menuItemsMap.get(ci.menu_item_id);
      if (!menuItem) {
        console.warn(`Menu item ${ci.menu_item_id} not found for cart item ${ci.id}`);
        return;
      }

      const appliedModifications = appliedModsMap.get(ci.id) || [];

      cartItemsMap.get(ci.cart_id)!.push({
        id: String(ci.menu_item_id), // Use menu_item_id as the cart item ID
        itemName: menuItem.name,
        price: `$${(menuItem.price / 100).toFixed(2)}`,
        image: getImageWithFallback(menuItem.image, 'image'),
        quantity: ci.quantity,
        customizations: ci.customizations,
        appliedModifications: appliedModifications,
      });
    });

    // Transform carts
    const carts = cartsRaw
      .map(cart => {
        const restaurant = restaurantsMap.get(cart.store_id);
        const items = cartItemsMap.get(cart.id) || [];

        // All carts with store_id referring to restaurants table should have category 'restaurant'
        // The store_category field in DB is actually the section (e.g., "Featured", "DashPass Favourites")
        // For now, we only support restaurant carts from the DB

        return {
          storeId: String(cart.store_id),
          storeName: restaurant?.name || 'Unknown Store',
          storeCategory: 'restaurant', // Always restaurant for carts from restaurants table
          items: items,
        };
      })
      .filter(cart => cart.items.length > 0); // Only return carts with items

    console.log(`✅ Fetched ${carts.length} carts for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: carts,
    });
  } catch (error: any) {
    console.error('❌ Error fetching carts:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
