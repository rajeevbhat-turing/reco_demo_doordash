import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getImageWithFallback } from '@/constants/image-placeholders';

/**
 * GET /api/expected-state/get-carts
 * 
 * Query Parameters:
 * - userId: User ID (optional, use this OR email)
 * - email: User email (optional, use this OR userId)
 * - limit: Number of carts to return (optional, returns all if not provided)
 * - restaurant_names: JSON array of restaurant names to filter by (optional, matches any)
 * 
 * Fetches user's carts with optional filtering:
 * 1. Fetches all carts for the user
 * 2. Applies filters if provided (restaurant names)
 * 3. Returns top N carts based on limit
 * 4. Includes restaurant info and cart items with modifications
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const limitParam = searchParams.get('limit');
    const restaurantNamesParam = searchParams.get('restaurant_names');

    // Must provide either userId or email
    if (!userId && !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either userId or email is required' 
        },
        { status: 400 }
      );
    }

    // If email is provided, look up the user first
    if (email && !userId) {
      const user = await db.queryOne<any>(
        'SELECT id FROM users WHERE email = ? COLLATE NOCASE',
        [email]
      );
      
      if (!user) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      
      userId = String(user.id);
    }

    // Parse limit
    let limit: number | undefined = undefined;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'limit must be a positive integer' 
          },
          { status: 400 }
        );
      }
      limit = parsedLimit;
    }

    // Parse restaurant names filter
    let restaurantNames: string[] = [];
    if (restaurantNamesParam) {
      try {
        restaurantNames = JSON.parse(restaurantNamesParam);
        if (!Array.isArray(restaurantNames)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'restaurant_names must be an array' 
            },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid restaurant_names format' 
          },
          { status: 400 }
        );
      }
    }

    // Build query for carts
    let cartsQuery = `SELECT 
      c.id,
      c.user_id,
      c.store_id,
      c.store_category
    FROM carts c`;

    const cartsParams: any[] = [userId];

    // Add restaurant name filtering if provided
    if (restaurantNames.length > 0) {
      cartsQuery += ` INNER JOIN restaurants r ON c.store_id = r.id`;
      const namePlaceholders = restaurantNames.map(() => '?').join(',');
      cartsQuery += ` WHERE c.user_id = ? AND r.name IN (${namePlaceholders})`;
      cartsParams.push(...restaurantNames);
    } else {
      cartsQuery += ` WHERE c.user_id = ?`;
    }

    // Fetch carts for the user
    const cartsRaw = await db.query<any>(cartsQuery, cartsParams);

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
    const menuItemsRaw = menuItemIds.length > 0 ? await db.query<any>(
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
    ) : [];

    // Get unique restaurant IDs from carts
    const restaurantIds = [...new Set(cartsRaw.map(c => c.store_id).filter(id => id))];

    // Fetch restaurant details
    const restaurantsRaw = restaurantIds.length > 0 ? await db.query<any>(
      `SELECT 
        id,
        name,
        logo,
        banner,
        section
      FROM restaurants
      WHERE id IN (${restaurantIds.map(() => '?').join(',')})`,
      restaurantIds
    ) : [];

    // Fetch applied modifications for cart items
    const cartItemIds = cartItemsRaw.map(ci => ci.id);
    const appliedModsRaw = cartItemIds.length > 0 ? await db.query<any>(
      `SELECT 
        ciam.id,
        ciam.cart_item_id,
        ciam.modification_id,
        ciam.modification_desc
      FROM cart_item_applied_modifications ciam
      WHERE ciam.cart_item_id IN (${cartItemIds.map(() => '?').join(',')})`,
      cartItemIds
    ) : [];

    // Fetch applied options for modifications
    const appliedModIds = appliedModsRaw.map(mod => mod.id);
    const appliedOptionsRaw = appliedModIds.length > 0 ? await db.query<any>(
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
    ) : [];

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
    let carts = cartsRaw.map(cart => {
      const restaurant = restaurantsMap.get(cart.store_id);
      const items = cartItemsMap.get(cart.id) || [];

      return {
        storeId: String(cart.store_id),
        storeName: restaurant?.name || 'Unknown Store',
        storeLogo: restaurant?.logo ? getImageWithFallback(restaurant.logo, 'logo') : undefined,
        storeCategory: 'restaurant', // Always restaurant for carts from restaurants table
        items: items,
      };
    }).filter(cart => cart.items.length > 0); // Only return carts with items

    // Apply limit if provided
    if (limit !== undefined) {
      carts = carts.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: carts,
    });

  } catch (error) {
    console.error('❌ Get carts error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred'
      },
      { status: 500 }
    );
  }
}

