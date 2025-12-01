import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface SortSpec {
  key: string;
  order?: 'asc' | 'desc';
}

/**
 * GET /api/expected-state/get-items
 *
 * Query Parameters:
 * - userId: User ID (required)
 * - restaurant_id: Filter by restaurant ID (optional, searches all restaurants if not provided)
 * - keywords: JSON array of keywords to match against item name (optional)
 * - sort_type: JSON array of sort specifications (optional)
 *   - Each spec: { key: string, order?: "asc" | "desc" }
 *   - Example: [{ "key": "price", "order": "asc" }, { "key": "rating", "order": "desc" }]
 *   - Sorts by first spec, then uses subsequent specs as tiebreakers
 *   - order defaults to "asc" if not provided
 * - limit: Number of items to return (optional, returns all if not provided)
 *
 * Finds menu items with optional filtering and sorting:
 * 1. Fetches menu items from database (all or from specific restaurant)
 * 2. Filters by keywords if provided (matches against item name only)
 * 3. Applies multi-level sorting based on sort_type array
 * 4. Returns top N items based on limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurant_id');
    const keywordsParam = searchParams.get('keywords');
    const sortTypeParam = searchParams.get('sort_type');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Parse keywords if provided
    let keywords: string[] = [];
    if (keywordsParam) {
      try {
        keywords = JSON.parse(keywordsParam);
        if (!Array.isArray(keywords)) {
          return NextResponse.json(
            {
              success: false,
              error: 'keywords must be an array',
            },
            { status: 400 }
          );
        }
      } catch (_error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid keywords format',
          },
          { status: 400 }
        );
      }
    }

    // Parse sort_type if provided
    let sortSpecs: SortSpec[] = [];
    if (sortTypeParam) {
      try {
        sortSpecs = JSON.parse(sortTypeParam);
        if (!Array.isArray(sortSpecs)) {
          return NextResponse.json(
            {
              success: false,
              error: 'sort_type must be an array',
            },
            { status: 400 }
          );
        }

        // Validate each sort spec
        for (const spec of sortSpecs) {
          if (!spec.key || typeof spec.key !== 'string') {
            return NextResponse.json(
              {
                success: false,
                error: 'Each sort_type entry must have a "key" field',
              },
              { status: 400 }
            );
          }

          // Default order to "asc" if not provided
          if (!spec.order) {
            spec.order = 'asc';
          }

          if (spec.order !== 'asc' && spec.order !== 'desc') {
            return NextResponse.json(
              {
                success: false,
                error: 'sort_type "order" must be "asc" or "desc"',
              },
              { status: 400 }
            );
          }
        }
      } catch (_error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid sort_type format',
          },
          { status: 400 }
        );
      }
    }

    // Build SQL query
    let query = `
      SELECT 
        id,
        restaurant_id,
        category_id,
        name,
        description,
        price,
        image,
        calories,
        rating,
        rating_count,
        popular,
        featured
      FROM menu_items
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Filter by restaurant if provided
    if (restaurantId) {
      query += ' AND restaurant_id = ?';
      queryParams.push(restaurantId);
    }

    // Filter by keywords if provided (match against name only)
    if (keywords.length > 0) {
      // Create OR conditions for each keyword
      const keywordConditions = keywords.map(() => 'LOWER(name) LIKE ?').join(' OR ');
      query += ` AND (${keywordConditions})`;

      // Add each keyword as a parameter with wildcard matching
      keywords.forEach(keyword => {
        queryParams.push(`%${keyword.toLowerCase()}%`);
      });
    }

    const menuItems = await db.query<any>(query, queryParams);

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Transform to result format
    const results = menuItems.map((item: any) => ({
      id: String(item.id),
      restaurantId: String(item.restaurant_id),
      categoryId: String(item.category_id),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      calories: item.calories,
      rating: item.rating,
      ratingCount: item.rating_count,
      popular: item.popular === 1,
      featured: item.featured === 1,
    }));

    // Apply multi-level sorting if sort_type is provided
    if (sortSpecs.length > 0) {
      results.sort((a: any, b: any) => {
        // Apply each sort spec in order
        for (const spec of sortSpecs) {
          const aValue = a[spec.key];
          const bValue = b[spec.key];

          // Handle null/undefined values (put them at the end)
          if (aValue == null && bValue == null) continue;
          if (aValue == null) return 1;
          if (bValue == null) return -1;

          let comparison = 0;

          // Compare based on type
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
          } else {
            // String comparison
            comparison = String(aValue).localeCompare(String(bValue));
          }

          // If values are different, apply order and return
          if (comparison !== 0) {
            return spec.order === 'desc' ? -comparison : comparison;
          }

          // If values are equal, continue to next sort spec
        }

        // Final fallback: item ID (for deterministic results)
        return a.id.localeCompare(b.id);
      });
    }

    // Apply limit if provided
    const limitedResults = limit ? results.slice(0, limit) : results;

    return NextResponse.json({
      success: true,
      data: limitedResults,
    });
  } catch (error) {
    console.error('❌ Get items error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
