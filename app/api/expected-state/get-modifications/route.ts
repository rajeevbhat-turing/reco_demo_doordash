import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/expected-state/get-modifications
 *
 * Query Parameters:
 * - userId: User ID (required)
 * - item_id: Menu item ID (required)
 * - modification_name: Modification description/name to search for (required, partial match, case-insensitive). Can be empty string to match any modification.
 * - option_name: Specific option name to filter by (optional, partial match, case-insensitive)
 * - is_required: Filter for only required modifications (optional, 'true' or 'false')
 * - sort_options_by_price: Sort options by price ascending (cheapest first) instead of sort_order (optional, 'true' or 'false')
 *
 * Fetches modification details for a specific menu item:
 * 1. Finds the modification matching the name for the given item
 * 2. If is_required is true, only returns required modifications
 * 3. If option_name is provided, returns only the matching option
 * 4. If option_name is not provided, returns all options for the modification
 * 5. Options are ordered by sort_order ascending (or by price if sort_options_by_price is true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('item_id');
    const modificationName = searchParams.get('modification_name');
    const optionName = searchParams.get('option_name');
    const isRequired = searchParams.get('is_required') === 'true';
    const sortOptionsByPrice = searchParams.get('sort_options_by_price') === 'true';

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: 'item_id is required',
        },
        { status: 400 }
      );
    }

    if (!modificationName && modificationName !== '') {
      return NextResponse.json(
        {
          success: false,
          error: 'modification_name is required',
        },
        { status: 400 }
      );
    }

    // Build the modification query
    let modQuery = `SELECT
        id,
        menu_item_id,
        description,
        is_required,
        select_up_to,
        select_at_least,
        parent_option_id
      FROM modifications
      WHERE menu_item_id = ?`;
    
    const modParams: any[] = [itemId];

    // Filter by modification name if provided (empty string matches any)
    if (modificationName !== '') {
      modQuery += ` AND LOWER(description) LIKE ?`;
      modParams.push(`%${modificationName.toLowerCase()}%`);
    }

    // Filter by is_required if specified
    if (isRequired) {
      modQuery += ` AND is_required = 1`;
    }

    modQuery += ` LIMIT 1`;

    const modifications = await db.query<any>(modQuery, modParams);

    if (!modifications || modifications.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const modification = modifications[0];

    // Now fetch options for this modification
    let optionsQuery = `
      SELECT
        id,
        name,
        description,
        price,
        is_counter,
        max_quantity,
        is_default,
        sort_order,
        image
      FROM modification_options
      WHERE modification_id = ?
    `;

    const optionsParams: any[] = [modification.id];

    // Filter by option name if provided
    if (optionName) {
      optionsQuery += ' AND LOWER(name) LIKE ?';
      optionsParams.push(`%${optionName.toLowerCase()}%`);
    }

    // Sort by price (cheapest first) or by sort_order
    if (sortOptionsByPrice) {
      optionsQuery += ' ORDER BY price ASC, sort_order ASC';
    } else {
      optionsQuery += ' ORDER BY sort_order ASC';
    }

    const options = await db.query<any>(optionsQuery, optionsParams);

    // Transform to result format
    const result = {
      id: String(modification.id),
      menuItemId: String(modification.menu_item_id),
      description: modification.description,
      isRequired: modification.is_required === 1,
      selectUpTo: modification.select_up_to,
      selectAtLeast: modification.select_at_least,
      parentOptionId: modification.parent_option_id ? String(modification.parent_option_id) : null,
      options: options.map((option: any) => ({
        id: String(option.id),
        name: option.name,
        description: option.description,
        price: option.price,
        isCounter: option.is_counter === 1,
        maxQuantity: option.max_quantity,
        isDefault: option.is_default === 1,
        sortOrder: option.sort_order,
        image: option.image,
      })),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Get modifications error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

