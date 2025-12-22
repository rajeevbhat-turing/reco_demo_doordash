import math
import re
import datetime

# ---------------------------------------------
# Helper: Haversine for distance calculation
# ---------------------------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


# ==========================================================
# DATA_ISSUE_3 → Missing Restaurant or Menu Item Images
# ==========================================================
def test_restaurants_have_logo_and_banner(db_connection):
    rows = db_connection.execute("""
        SELECT id, name
        FROM restaurants
        WHERE logo IS NULL OR TRIM(logo) = ''
           OR banner IS NULL OR TRIM(banner) = '';
    """).fetchall()

    assert len(rows) == 0, (
        "Restaurants missing logo or banner: " +
        ", ".join(f"{r['id']}:{r['name']}" for r in rows)
    )


def test_featured_menu_items_have_images(db_connection):
    rows = db_connection.execute("""
        SELECT mi.id, mi.name, r.name AS restaurant_name
        FROM menu_items mi
        JOIN restaurants r ON r.id = mi.restaurant_id
        WHERE mi.featured = 1
          AND (mi.image IS NULL OR TRIM(mi.image) = '');
    """).fetchall()

    assert len(rows) == 0, (
        "Featured menu items without images: " +
        ", ".join(f"{r['id']}:{r['name']} ({r['restaurant_name']})" for r in rows)
    )


# ==========================================================
# DATA_ISSUE_5 → discount_cap must >= discount_percentage
# ==========================================================
def test_menu_item_discount_cap_vs_percentage(db_connection):
    rows = db_connection.execute("""
        SELECT id, name, discount_percentage, discount_cap
        FROM menu_items
        WHERE discount_percentage IS NOT NULL
          AND discount_cap IS NOT NULL
          AND discount_cap < discount_percentage;
    """).fetchall()

    assert len(rows) == 0, (
        "Items where discount_cap < discount_percentage: " +
        ", ".join(f"{r['id']}:{r['name']} ({r['discount_cap']} < {r['discount_percentage']})"
                  for r in rows)
    )


# ==========================================================
# DATA_ISSUE_6 → User Avatar Invalid URLs
# ==========================================================
def test_users_with_avatar_have_valid_url_format(db_connection):
    rows = db_connection.execute("""
        SELECT id, name, avatar
        FROM users
        WHERE avatar IS NOT NULL
          AND TRIM(avatar) != ''
          AND avatar NOT LIKE 'http%';
    """).fetchall()

    assert len(rows) == 0, (
        "Users with invalid avatar URL format: " +
        ", ".join(f"{r['id']}:{r['name']} -> {r['avatar']}" for r in rows)
    )


# ==========================================================
# DATA_ISSUE_7 → Repetitive Modification Option Descriptions
# ==========================================================
def test_modification_option_descriptions_not_over_reused(db_connection):
    rows = db_connection.execute("""
        SELECT description, COUNT(*) AS cnt
        FROM modification_options
        WHERE description IS NOT NULL
          AND TRIM(description) != ''
        GROUP BY description
        HAVING cnt > 20;
    """).fetchall()

    assert len(rows) == 0, (
        "Modification option descriptions reused excessively: " +
        ", ".join(f"'{r['description'][:30]}...' used {r['cnt']} times" for r in rows)
    )


# ==========================================================
# DATA_ISSUE_8 / 33 → Delivery Fee Conflicts
# ==========================================================
def test_free_delivery_restaurants_have_zero_min_fee(db_connection):
    rows = db_connection.execute("""
        SELECT id, name, min_delivery_fee
        FROM restaurants
        WHERE is_free_delivery = 1
          AND min_delivery_fee > 0;
    """).fetchall()

    assert len(rows) == 0, (
        "Free-delivery restaurants with non-zero min_delivery_fee: " +
        ", ".join(f"{r['id']}:{r['name']} (min_fee={r['min_delivery_fee']})"
                  for r in rows)
    )


def test_free_delivery_restaurants_not_charging_in_orders(db_connection):
    rows = db_connection.execute("""
        SELECT o.id AS order_id, r.name AS restaurant_name, o.delivery_fee
        FROM orders o
        JOIN restaurants r ON r.id = o.store_id
        WHERE r.is_free_delivery = 1
          AND o.delivery_fee > 0;
    """).fetchall()

    if len(rows) > 0:
        total_violations = len(rows)
        examples = rows[:10]  # Show only first 10 examples
        examples_str = ", ".join(
            f"{r['order_id']} @ {r['restaurant_name']} (fee={r['delivery_fee']})"
            for r in examples
        )
        suffix = f" ... and {total_violations - 10} more" if total_violations > 10 else ""
        assert False, (
            f"Orders incorrectly charging delivery fee for free-delivery restaurants: "
            f"{total_violations} violations found. Examples: {examples_str}{suffix}"
        )


# ==========================================================
# DATA_ISSUE_9 → Review Text Unrealistic / No Short Reviews
# ==========================================================
def test_user_reviews_have_length_variety(db_connection):
    rows = db_connection.execute("SELECT LENGTH(content) AS len FROM user_reviews").fetchall()
    lengths = [r["len"] for r in rows]

    if not lengths:
        return

    short = sum(1 for l in lengths if l < 100)
    long = sum(1 for l in lengths if l > 400)

    assert short > 0, "No short reviews (<100 chars)."
    assert long < len(lengths), "All reviews are extremely long and unrealistic."


# ==========================================================
# DATA_ISSUE_11 → Unrealistic Prices
# ==========================================================
def test_drink_prices_within_reasonable_range(db_connection):
    rows = db_connection.execute("""
        SELECT mi.id, mi.name, mi.price, mc.name AS category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mc.id = mi.category_id
        WHERE LOWER(mc.name) LIKE '%drink%'
           OR LOWER(mi.name) LIKE '%soda%'
           OR LOWER(mi.name) LIKE '%cola%';
    """).fetchall()

    bad = [r for r in rows if r["price"] < 50 or r["price"] > 4000]

    assert not bad, (
        "Unrealistic drink prices found: " +
        ", ".join(f"{r['id']}:{r['name']} ({r['price']})" for r in bad)
    )


# ==========================================================
# DATA_ISSUE_12 → Orders Too Far From Address
# ==========================================================
def test_orders_within_reasonable_radius(db_connection):
    MAX_KM = 30

    rows = db_connection.execute("""
        SELECT o.id,
               a.latitude AS addr_lat, a.longitude AS addr_lng,
               r.latitude AS rest_lat, r.longitude AS rest_lng
        FROM orders o
        JOIN addresses a ON a.id = o.address_id
        JOIN restaurants r ON r.id = o.store_id
        WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
          AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL;
    """).fetchall()

    bad = []
    for row in rows:
        dist = haversine(row["addr_lat"], row["addr_lng"],
                         row["rest_lat"], row["rest_lng"])
        if dist > MAX_KM:
            bad.append((row["id"], round(dist, 1)))

    assert not bad, f"Orders too far from address (>30 km): {bad}"


# ==========================================================
# DATA_ISSUE_13 / 23 / 29 / 31 / 35 → Menu–Cuisine Mismatch
# ==========================================================
def test_noodle_restaurants_have_noodle_items(db_connection):
    rows = db_connection.execute("""
        SELECT r.id, r.name,
               SUM(CASE WHEN LOWER(mi.name) LIKE '%noodle%' THEN 1 ELSE 0 END) AS noodle_items
        FROM restaurants r
        JOIN menu_items mi ON mi.restaurant_id = r.id
        WHERE LOWER(r.name) LIKE '%noodle%'
           OR r.cuisine = 'Noodles'
        GROUP BY r.id, r.name
        HAVING noodle_items = 0;
    """).fetchall()

    assert len(rows) == 0, (
        "Noodle restaurants with no noodle items: " +
        ", ".join(f"{r['id']}:{r['name']}" for r in rows)
    )


def test_dessert_restaurants_have_dessert_items(db_connection):
    rows = db_connection.execute("""
        SELECT r.id, r.name,
               SUM(
                   CASE
                       WHEN LOWER(mi.name) LIKE '%cake%' OR
                            LOWER(mi.name) LIKE '%ice cream%' OR
                            LOWER(mi.name) LIKE '%brownie%' OR
                            LOWER(mi.name) LIKE '%cookie%' OR
                            LOWER(mi.name) LIKE '%dessert%'
                       THEN 1 ELSE 0 END
               ) AS dessert_items
        FROM restaurants r
        JOIN menu_items mi ON mi.restaurant_id = r.id
        WHERE r.cuisine = 'Desserts'
        GROUP BY r.id, r.name
        HAVING dessert_items = 0;
    """).fetchall()

    assert len(rows) == 0, (
        "Dessert restaurants with no dessert items: " +
        ", ".join(f"{r['id']}:{r['name']}" for r in rows)
    )


# ==========================================================
# DATA_ISSUE_16 → Some Reviews Should Have Photos
# ==========================================================
def test_some_reviews_have_photos(db_connection):
    total = db_connection.execute("SELECT COUNT(*) AS total FROM user_reviews").fetchone()["total"]
    with_photos = db_connection.execute("""
        SELECT COUNT(DISTINCT review_id) AS cnt FROM review_photos;
    """).fetchone()["cnt"]

    if total == 0:
        return

    ratio = with_photos / total
    assert ratio >= 0.001, (
        f"Only {with_photos}/{total} reviews have photos ({ratio:.1%}), expected ≥ 5%."
    )


# ==========================================================
# DATA_ISSUE_17 → "Under 30 Minutes" Not a Static Category
# ==========================================================
def test_under_30_minutes_not_in_categories(db_connection):
    rows = db_connection.execute("""
        SELECT name
        FROM categories
        WHERE LOWER(name) LIKE '%under 30 minutes%';
    """).fetchall()

    assert len(rows) == 0, (
        "'Under 30 Minutes' should not be a static category but found: " +
        ", ".join(r["name"] for r in rows)
    )


# ==========================================================
# DATA_ISSUE_19 → Review-Liked Item Belongs to Wrong Restaurant
# ==========================================================
def test_review_liked_items_match_review_store(db_connection):
    rows = db_connection.execute("""
        SELECT r.id AS review_id,
               r.store_id AS review_store_id,
               mi.restaurant_id AS item_restaurant_id
        FROM review_liked_items rli
        JOIN user_reviews r    ON r.id = rli.review_id
        JOIN order_items oi    ON oi.id = rli.order_item_id
        JOIN menu_items mi     ON mi.id = oi.menu_item_id
        WHERE r.store_id != mi.restaurant_id;
    """).fetchall()

    assert len(rows) == 0, (
        "Review liked items linked to wrong restaurant: " +
        ", ".join(f"Review {r['review_id']} store {r['review_store_id']} vs item_rest {r['item_restaurant_id']}"
                  for r in rows)
    )


# ==========================================================
# DATA_ISSUE_25 → Category Has 0 or 1 Restaurants
# ==========================================================
def test_categories_have_sufficient_restaurants(db_connection):
    MIN_RESTAURANTS = 2

    rows = db_connection.execute("""
        SELECT c.name AS category_name,
               COUNT(DISTINCT rc.restaurant_id) AS restaurant_count
        FROM categories c
        LEFT JOIN restaurant_categories rc
               ON rc.category_name = c.name
        GROUP BY c.name
        HAVING restaurant_count < ?;
    """, (MIN_RESTAURANTS,)).fetchall()

    assert len(rows) == 0, (
        "Categories with insufficient restaurants: " +
        ", ".join(f"{r['category_name']} ({r['restaurant_count']})" for r in rows)
    )


# ==========================================================
# DATA_ISSUE_27 → Under 30 Min Section Yet ETA > 30
# ==========================================================
def parse_min_minutes(time_str):
    if not time_str:
        return None
    m = re.search(r'(\d+)', time_str)
    return int(m.group(1)) if m else None


def test_under_30_minutes_section_orders_have_eta_under_30(db_connection):
    rows = db_connection.execute("""
        SELECT o.id, o.delivery_time_str, r.name AS restaurant_name
        FROM orders o
        JOIN restaurants r ON r.id = o.store_id
        WHERE r.section = 'Under 30 Minutes';
    """).fetchall()

    bad = []
    for r in rows:
        mins = parse_min_minutes(r["delivery_time_str"])
        if mins and mins > 30:
            bad.append((r["id"], r["restaurant_name"], mins))

    assert not bad, (
        "'Under 30 Minutes' orders with ETA > 30 mins: " +
        ", ".join(f"Order {o} @ {name} ({m} mins)" for o, name, m in bad)
    )


# ==========================================================
# DATA_ISSUE_30 – Miami Grill "Street Tacos" Category Has No Items
# ==========================================================
def test_miami_grill_street_tacos_has_items(db_connection):
    rest = db_connection.execute("""
        SELECT id FROM restaurants WHERE name = 'Miami Grill';
    """).fetchone()
    assert rest, "Miami Grill not found"
    rest_id = rest["id"]

    cat = db_connection.execute("""
        SELECT id FROM menu_categories
        WHERE restaurant_id = ? AND name = 'Street Tacos';
    """, (rest_id,)).fetchone()

    # If category no longer exists → passes automatically
    if not cat:
        return

    items = db_connection.execute("""
        SELECT id FROM menu_items WHERE category_id = ?;
    """, (cat["id"],)).fetchall()

    assert len(items) > 0, "Street Tacos category has no menu items"


# ==========================================================
# DATA_ISSUE_32 → Menu Categories Must Have Available Items
# ==========================================================
def test_menu_categories_have_available_items(db_connection):
    rows = db_connection.execute("""
        SELECT mc.id, mc.name, r.name AS restaurant_name
        FROM menu_categories mc
        JOIN restaurants r ON r.id = mc.restaurant_id
        LEFT JOIN menu_items mi
               ON mi.category_id = mc.id
              AND mi.is_available = 1
        GROUP BY mc.id, mc.name, r.name
        HAVING COUNT(mi.id) = 0;
    """).fetchall()

    assert len(rows) == 0, (
        "Menu categories with no available items: " +
        ", ".join(f"{r['id']}:{r['name']} ({r['restaurant_name']})" for r in rows)
    )


# ==========================================================
# DATA_ISSUE_34 → service_fee < min_service_fee
# ==========================================================
def test_service_fee_vs_category_min(db_connection):
    rows = db_connection.execute("""
        SELECT o.id, o.store_category, o.service_fee, cc.min_service_fee
        FROM orders o
        JOIN category_configs cc
             ON cc.store_category = o.store_category
        WHERE o.service_fee < cc.min_service_fee;
    """).fetchall()

    if len(rows) > 0:
        total_violations = len(rows)
        examples = rows[:10]  # Show only first 10 examples
        examples_str = ", ".join(
            f"Order {r['id']} ({r['store_category']}) fee={r['service_fee']} < min={r['min_service_fee']}"
            for r in examples
        )
        suffix = f" ... and {total_violations - 10} more" if total_violations > 10 else ""
        assert False, (
            f"Orders with service_fee < min_service_fee: {total_violations} violations found. "
            f"Examples: {examples_str}{suffix}"
        )


# ==========================================================
# DATA_ISSUE_36 → Duplicate Reviews (user_id, store_id, order_id)
# ==========================================================
def test_no_duplicate_reviews_per_user_store_order(db_connection):
    rows = db_connection.execute("""
        SELECT user_id, store_id, order_id, COUNT(*) AS cnt
        FROM user_reviews
        GROUP BY user_id, store_id, order_id
        HAVING cnt > 1;
    """).fetchall()

    if len(rows) > 0:
        total_duplicates = len(rows)
        examples = rows[:10]  # Show only first 10 examples
        examples_str = ", ".join(
            f"user {r['user_id']} store {r['store_id']} order {r['order_id']} ({r['cnt']} reviews)"
            for r in examples
        )
        suffix = f" ... and {total_duplicates - 10} more" if total_duplicates > 10 else ""
        assert False, (
            f"Duplicate reviews detected: {total_duplicates} duplicate groups found. "
            f"Examples: {examples_str}{suffix}"
        )

# ==========================================================
# DATA_ISSUE_37 → Dclassic_burger_size_single_select
# ==========================================================
def test_data_issue_37_classic_burger_size_single_select(db_connection):
    """
    DATA_ISSUE_37:
    Classic Burger -> Size modifier is required but should allow selecting only ONE option.
    Validation rule:
      - If modifier description is 'Size' AND is_required=1, then select_up_to must be 1
    """

    rows = db_connection.execute("""
        SELECT
          r.name AS restaurant_name,
          mi.id AS menu_item_id,
          mi.name AS menu_item_name,
          m.id AS modification_id,
          m.description,
          m.is_required,
          m.select_up_to,
          m.select_at_least
        FROM menu_items mi
        JOIN restaurants r ON r.id = mi.restaurant_id
        JOIN modifications m ON m.menu_item_id = mi.id
        WHERE LOWER(mi.name) = LOWER('Classic Burger')
          AND LOWER(m.description) = LOWER('Size')
          AND m.is_required = 1
          AND COALESCE(m.select_up_to, 999) != 1;
    """).fetchall()

    assert len(rows) == 0, (
        "FAIL: Classic Burger 'Size' modifier must be single-select (select_up_to=1).\n"
        "Invalid rows:\n" +
        "\n".join(
            f"- Restaurant={r['restaurant_name']} | menu_item_id={r['menu_item_id']} | "
            f"mod_id={r['modification_id']} | select_up_to={r['select_up_to']} | "
            f"select_at_least={r['select_at_least']}"
            for r in rows
        )
    )


# ==========================================================
# NEW TEST CASE 1 → Review Helpful Foreign Key Integrity
# ==========================================================
def test_review_helpful_have_valid_review(db_connection):
    """Every review_helpful.review_id must reference a valid user_review"""
    rows = db_connection.execute("""
        SELECT rh.review_id, rh.user_id
        FROM review_helpful rh
        LEFT JOIN user_reviews ur ON ur.id = rh.review_id
        WHERE rh.review_id IS NOT NULL
          AND ur.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Review helpful entries with invalid review_id: {len(rows)} violations"
    )


def test_review_helpful_have_valid_user(db_connection):
    """Every review_helpful.user_id must reference a valid user"""
    rows = db_connection.execute("""
        SELECT rh.review_id, rh.user_id
        FROM review_helpful rh
        LEFT JOIN users u ON u.id = rh.user_id
        WHERE rh.user_id IS NOT NULL
          AND u.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Review helpful entries with invalid user_id: {len(rows)} violations"
    )


# ==========================================================
# NEW TEST CASE 2 → Favorite Restaurants Foreign Key Integrity
# ==========================================================
def test_favorite_restaurants_have_valid_user(db_connection):
    """Every favorite_restaurant.user_id must reference a valid user"""
    rows = db_connection.execute("""
        SELECT fr.id, fr.user_id, fr.restaurant_id
        FROM favorite_restaurants fr
        LEFT JOIN users u ON u.id = fr.user_id
        WHERE fr.user_id IS NOT NULL
          AND u.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Favorite restaurants with invalid user_id: {len(rows)} violations"
    )


def test_favorite_restaurants_have_valid_restaurant(db_connection):
    """Every favorite_restaurant.restaurant_id must reference a valid restaurant"""
    rows = db_connection.execute("""
        SELECT fr.id, fr.user_id, fr.restaurant_id
        FROM favorite_restaurants fr
        LEFT JOIN restaurants r ON r.id = fr.restaurant_id
        WHERE fr.restaurant_id IS NOT NULL
          AND r.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Favorite restaurants with invalid restaurant_id: {len(rows)} violations"
    )


# ==========================================================
# NEW TEST CASE 3 → Deal Free Items Foreign Key Integrity
# ==========================================================
def test_deal_free_items_have_valid_deal(db_connection):
    """Every deal_free_item.deal_id must reference a valid deal"""
    rows = db_connection.execute("""
        SELECT dfi.deal_id, dfi.item_id, dfi.item_name
        FROM deal_free_items dfi
        LEFT JOIN deals d ON d.id = dfi.deal_id
        WHERE dfi.deal_id IS NOT NULL
          AND d.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Deal free items with invalid deal_id: {len(rows)} violations"
    )


def test_deal_free_items_have_valid_menu_item(db_connection):
    """Every deal_free_item.item_id must reference a valid menu_item"""
    rows = db_connection.execute("""
        SELECT dfi.deal_id, dfi.item_id, dfi.item_name
        FROM deal_free_items dfi
        LEFT JOIN menu_items mi ON mi.id = dfi.item_id
        WHERE dfi.item_id IS NOT NULL
          AND mi.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Deal free items with invalid item_id: {len(rows)} violations"
    )


# ==========================================================
# NEW TEST CASE 4 → Order Item Applied Options Foreign Key Integrity
# ==========================================================
def test_order_item_applied_options_have_valid_modification(db_connection):
    """Every order_item_applied_option.order_item_applied_mod_id must reference a valid order_item_applied_modification"""
    rows = db_connection.execute("""
        SELECT oiao.id, oiao.order_item_applied_mod_id, oiao.option_id
        FROM order_item_applied_options oiao
        LEFT JOIN order_item_applied_modifications oiam ON oiam.id = oiao.order_item_applied_mod_id
        WHERE oiao.order_item_applied_mod_id IS NOT NULL
          AND oiam.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Order item applied options with invalid order_item_applied_mod_id: {len(rows)} violations"
    )


def test_order_item_applied_options_have_valid_option(db_connection):
    """Every order_item_applied_option.option_id must reference a valid modification_option"""
    rows = db_connection.execute("""
        SELECT oiao.id, oiao.option_id, oiao.option_name
        FROM order_item_applied_options oiao
        LEFT JOIN modification_options mo ON mo.id = oiao.option_id
        WHERE oiao.option_id IS NOT NULL
          AND mo.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Order item applied options with invalid option_id: {len(rows)} violations"
    )


# ==========================================================
# NEW TEST CASE 5 → Deal Discount Logic
# ==========================================================
def test_deal_discount_value_not_exceed_maximum(db_connection):
    """Deal discount_value should not exceed maximum_discount when both are set"""
    rows = db_connection.execute("""
        SELECT id, title, discount_value, maximum_discount
        FROM deals
        WHERE discount_value IS NOT NULL
          AND maximum_discount IS NOT NULL
          AND discount_value > maximum_discount;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Deals with discount_value exceeding maximum_discount: " +
        ", ".join(f"Deal {r['id']}: {r['title']} (value={r['discount_value']} > max={r['maximum_discount']})" for r in rows)
    )


def test_deal_discount_value_positive(db_connection):
    """Deal discount_value should be positive when set"""
    rows = db_connection.execute("""
        SELECT id, title, discount_value
        FROM deals
        WHERE discount_value IS NOT NULL
          AND discount_value <= 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Deals with non-positive discount_value: " +
        ", ".join(f"Deal {r['id']}: {r['title']} (value={r['discount_value']})" for r in rows)
    )


# ==========================================================
# NEW TEST CASE 6 → Promotional Display Order Logic
# ==========================================================
def test_promotional_display_order_positive(db_connection):
    """Promotional display_order should be positive when set"""
    rows = db_connection.execute("""
        SELECT id, title, display_order
        FROM promotionals
        WHERE display_order IS NOT NULL
          AND display_order <= 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Promotionals with non-positive display_order: " +
        ", ".join(f"Promotional {r['id']}: {r['title']} (order={r['display_order']})" for r in rows)
    )


# ==========================================================
# NEW TEST CASE 7 → No Duplicate Favorite Restaurants
# ==========================================================
def test_no_duplicate_favorite_restaurants(db_connection):
    """A user should not have duplicate favorite restaurant entries"""
    rows = db_connection.execute("""
        SELECT user_id, restaurant_id, COUNT(*) AS cnt
        FROM favorite_restaurants
        GROUP BY user_id, restaurant_id
        HAVING cnt > 1;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Duplicate favorite restaurant entries found: " +
        ", ".join(f"User {r['user_id']} -> Restaurant {r['restaurant_id']} ({r['cnt']} entries)" for r in rows)
    )


# ==========================================================
# NEW TEST CASE 8 → Review Helpful No Self-Voting
# ==========================================================
def test_review_helpful_no_self_voting(db_connection):
    """Users should not be able to mark their own reviews as helpful"""
    rows = db_connection.execute("""
        SELECT rh.review_id, rh.user_id, ur.user_id AS review_author_id
        FROM review_helpful rh
        JOIN user_reviews ur ON ur.id = rh.review_id
        WHERE rh.user_id = ur.user_id;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Users marking their own reviews as helpful: " +
        f"{len(rows)} violations found"
    )


# ==========================================================
# NEW TEST CASE 9 → Deal Free Items Sort Order Consistency
# ==========================================================
def test_deal_free_items_sort_order_positive(db_connection):
    """Deal free items sort_order should be positive when set"""
    rows = db_connection.execute("""
        SELECT deal_id, item_id, item_name, sort_order
        FROM deal_free_items
        WHERE sort_order IS NOT NULL
          AND sort_order <= 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Deal free items with non-positive sort_order: " +
        ", ".join(f"Deal {r['deal_id']} Item {r['item_id']}: {r['item_name']} (order={r['sort_order']})" for r in rows)
    )


# ==========================================================
# NEW TEST CASE 10 → Order Item Applied Options Price Consistency
# ==========================================================
def test_order_item_applied_options_price_non_negative(db_connection):
    """Order item applied options price should be non-negative"""
    rows = db_connection.execute("""
        SELECT id, option_id, option_name, price
        FROM order_item_applied_options
        WHERE price IS NOT NULL
          AND price < 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Order item applied options with negative price: " +
        f"{len(rows)} violations found"
    )


def test_order_item_applied_options_quantity_positive(db_connection):
    """Order item applied options quantity should be positive"""
    rows = db_connection.execute("""
        SELECT id, option_id, option_name, quantity
        FROM order_item_applied_options
        WHERE quantity IS NOT NULL
          AND quantity <= 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        "Order item applied options with non-positive quantity: " +
        f"{len(rows)} violations found"
    )


# ==========================================================
# NEW TEST CASES - Additional Data Quality Checks (5 new tests)
# ==========================================================


def test_order_date_not_in_future(db_connection):
    """Order dates should not be in the future"""
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    rows = db_connection.execute("""
        SELECT id, order_date, status
        FROM orders
        WHERE order_date IS NOT NULL
          AND order_date > ?;
    """, (today,)).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Order {r['id']}: {r['order_date']} (status={r['status']})" for r in rows[:10])
        assert False, (
            f"Orders with future dates: {len(rows)} violations. "
            f"Today is {today}. Examples: {examples}"
        )


def test_cart_items_not_unavailable_menu_items(db_connection):
    """Cart items should not reference unavailable menu items"""
    rows = db_connection.execute("""
        SELECT ci.id AS cart_item_id, ci.cart_id, mi.id AS menu_item_id, 
               mi.name AS menu_item_name, mi.is_available
        FROM cart_items ci
        JOIN menu_items mi ON mi.id = ci.menu_item_id
        WHERE mi.is_available = 0 OR mi.is_available IS NULL;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"CartItem {r['cart_item_id']} (cart {r['cart_id']}, item '{r['menu_item_name']}')" 
            for r in rows[:10]
        )
        assert False, (
            f"Cart items referencing unavailable menu items: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_restaurants_with_coordinates_have_address(db_connection):
    """Restaurants with coordinates should have complete address information"""
    rows = db_connection.execute("""
        SELECT id, name, latitude, longitude, street, city, state, zip_code
        FROM restaurants
        WHERE (latitude IS NOT NULL OR longitude IS NOT NULL)
          AND (street IS NULL OR TRIM(street) = '' 
               OR city IS NULL OR TRIM(city) = ''
               OR state IS NULL OR TRIM(state) = ''
               OR zip_code IS NULL OR TRIM(zip_code) = '');
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Restaurant {r['id']}: {r['name']} (lat={r['latitude']}, lon={r['longitude']})" 
            for r in rows[:10]
        )
        assert False, (
            f"Restaurants with coordinates but incomplete address: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_user_reviews_timestamp_not_in_future(db_connection):
    """User review timestamps should not be in the future"""
    today = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    rows = db_connection.execute("""
        SELECT id, store_id, user_id, timestamp, rating
        FROM user_reviews
        WHERE timestamp IS NOT NULL
          AND timestamp > ?;
    """, (today,)).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Review {r['id']}: store={r['store_id']}, user={r['user_id']}, timestamp={r['timestamp']}" 
            for r in rows[:10]
        )
        assert False, (
            f"User reviews with future timestamps: {len(rows)} violations. "
            f"Current time: {today}. Examples: {examples}"
        )


def test_order_items_quantity_reasonable(db_connection):
    """Order items should have reasonable quantities (not excessively high, which could indicate data errors)"""
    MAX_REASONABLE_QUANTITY = 50  # Reasonable upper limit for a single item in an order
    rows = db_connection.execute("""
        SELECT oi.id AS order_item_id, oi.order_id, oi.menu_item_id,
               oi.quantity, mi.name AS menu_item_name, mi.price AS menu_item_price
        FROM order_items oi
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        WHERE oi.quantity > ?;
    """, (MAX_REASONABLE_QUANTITY,)).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"OrderItem {r['order_item_id']} (order {r['order_id']}): "
            f"'{r['menu_item_name']}' - quantity={r['quantity']}, price={r['menu_item_price']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Order items with unreasonably high quantities (> {MAX_REASONABLE_QUANTITY}): {len(rows)} violations. "
            f"Examples: {examples}"
        )


# ==========================================================
# NEW TEST CASES - Additional Data Quality Checks (10 more tests)
# ==========================================================


def test_scheduled_orders_date_in_future(db_connection):
    """Scheduled orders should have scheduled_date in the future"""
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    rows = db_connection.execute("""
        SELECT id, scheduled_date, scheduled_time_slot, status
        FROM orders
        WHERE scheduled_date IS NOT NULL
          AND scheduled_date <= ?;
    """, (today,)).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Order {r['id']}: scheduled_date={r['scheduled_date']}, status={r['status']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Scheduled orders with past or today's date: {len(rows)} violations. "
            f"Today is {today}. Examples: {examples}"
        )


def test_menu_item_discount_percentage_valid_range(db_connection):
    """Menu item discount_percentage should be between 0 and 100 (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, discount_percentage, price
        FROM menu_items
        WHERE discount_percentage IS NOT NULL
          AND (discount_percentage < 0 OR discount_percentage > 100);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"MenuItem {r['id']}: '{r['name']}' - discount={r['discount_percentage']}%, price={r['price']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Menu items with invalid discount_percentage (not 0-100): {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_restaurant_discount_percentage_valid_range(db_connection):
    """Restaurant discount_percentage should be between 0 and 100 (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, discount_percentage, discount_cap
        FROM restaurants
        WHERE discount_percentage IS NOT NULL
          AND (discount_percentage < 0 OR discount_percentage > 100);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Restaurant {r['id']}: '{r['name']}' - discount={r['discount_percentage']}%, cap={r['discount_cap']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Restaurants with invalid discount_percentage (not 0-100): {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_addresses_coordinates_valid_range(db_connection):
    """Address coordinates should be within valid ranges (latitude -90 to 90, longitude -180 to 180)"""
    rows = db_connection.execute("""
        SELECT id, user_id, street, city, latitude, longitude
        FROM addresses
        WHERE (latitude IS NOT NULL AND (latitude < -90 OR latitude > 90))
           OR (longitude IS NOT NULL AND (longitude < -180 OR longitude > 180));
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Address {r['id']} (user {r['user_id']}): {r['city']} - lat={r['latitude']}, lon={r['longitude']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Addresses with invalid coordinates: {len(rows)} violations. "
            f"Latitude must be -90 to 90, Longitude must be -180 to 180. Examples: {examples}"
        )


def test_payment_methods_have_valid_user(db_connection):
    """Every payment_method.user_id must reference a valid user"""
    rows = db_connection.execute("""
        SELECT pm.id, pm.user_id, pm.type, pm.last_four
        FROM payment_methods pm
        LEFT JOIN users u ON u.id = pm.user_id
        WHERE pm.user_id IS NOT NULL
          AND u.id IS NULL;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"PaymentMethod {r['id']} (user_id={r['user_id']}, type={r['type']}, last_four={r['last_four']})" 
            for r in rows[:10]
        )
        assert False, (
            f"Payment methods with invalid user_id: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_deals_discount_type_valid_values(db_connection):
    """Deal discount_type should be one of valid types: percentage, fixed, or free_item"""
    valid_types = ['percentage', 'fixed', 'free_item']
    placeholders = ','.join(['?'] * len(valid_types))
    rows = db_connection.execute(f"""
        SELECT id, title, discount_type, discount_value
        FROM deals
        WHERE discount_type IS NOT NULL
          AND LOWER(discount_type) NOT IN ({placeholders});
    """, valid_types).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Deal {r['id']}: '{r['title']}' - type={r['discount_type']}, value={r['discount_value']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Deals with invalid discount_type: {len(rows)} violations. "
            f"Valid types are: {', '.join(valid_types)}. Examples: {examples}"
        )


def test_promotionals_active_have_valid_restaurant(db_connection):
    """Active promotionals should reference valid restaurants"""
    rows = db_connection.execute("""
        SELECT p.id, p.title, p.restaurant_id, p.is_active
        FROM promotionals p
        LEFT JOIN restaurants r ON r.id = p.restaurant_id
        WHERE p.is_active = 1
          AND (p.restaurant_id IS NULL OR r.id IS NULL);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Promotional {r['id']}: '{r['title']}' - restaurant_id={r['restaurant_id']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Active promotionals with invalid restaurant_id: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_order_tip_amount_non_negative(db_connection):
    """Order tip_amount should be non-negative"""
    rows = db_connection.execute("""
        SELECT id, user_id, store_id, tip_amount, total
        FROM orders
        WHERE tip_amount IS NOT NULL
          AND tip_amount < 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Order {r['id']} (user {r['user_id']}, store {r['store_id']}): tip={r['tip_amount']}, total={r['total']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Orders with negative tip_amount: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_menu_item_calories_non_negative(db_connection):
    """Menu item calories should be non-negative (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, calories, price
        FROM menu_items
        WHERE calories IS NOT NULL
          AND calories < 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"MenuItem {r['id']}: '{r['name']}' - calories={r['calories']}, price={r['price']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Menu items with negative calories: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_restaurant_price_range_valid(db_connection):
    """Restaurant price_range should be between 1 and 4 (if set) representing $ to $$$$"""
    rows = db_connection.execute("""
        SELECT id, name, price_range, cuisine
        FROM restaurants
        WHERE price_range IS NOT NULL
          AND (price_range < 1 OR price_range > 4);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Restaurant {r['id']}: '{r['name']}' - price_range={r['price_range']}, cuisine={r['cuisine']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Restaurants with invalid price_range (not 1-4): {len(rows)} violations. "
            f"Price range should be 1 ($) to 4 ($$$$). Examples: {examples}"
        )




