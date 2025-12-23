def test_orders_store_category_exists(db_connection):
    """Every store_category in orders must have a matching category_config."""
    query = """
        SELECT DISTINCT o.store_category
        FROM orders o
        LEFT JOIN category_configs cc ON cc.store_category = o.store_category
        WHERE cc.id IS NULL;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Orders with store_category that has no category_config"


def test_restaurants_have_category(db_connection):
    """Each restaurant should belong to at least one restaurant_category."""
    query = """
        SELECT r.*
        FROM restaurants r
        LEFT JOIN restaurant_categories rc ON rc.restaurant_id = r.id
        WHERE rc.restaurant_id IS NULL;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Restaurants without category found"


def test_menu_categories_have_available_items(db_connection):
    """Menu categories should have at least one available item (if business rules require it)."""
    query = """
        SELECT mc.id, mc.name, COUNT(mi.id) as total_items,
               SUM(CASE WHEN mi.is_available = 1 THEN 1 ELSE 0 END) as available_items
        FROM menu_categories mc
        JOIN menu_items mi ON mi.category_id = mc.id
        GROUP BY mc.id
        HAVING available_items = 0;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Menu categories found with zero available items"

# ==========================================================
# NEW TEST CASES - Additional Data Quality Checks (15 new tests)
# ==========================================================
import re


def test_orders_have_valid_payment_method(db_connection):
    """Every order.payment_method_id must reference a valid payment_method"""
    rows = db_connection.execute("""
        SELECT o.id, o.payment_method_id
        FROM orders o
        LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
        WHERE o.payment_method_id IS NOT NULL
          AND pm.id IS NULL;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Order {r['id']} (pm_id={r['payment_method_id']})" for r in rows[:10])
        assert False, f"Orders with invalid payment_method_id: {len(rows)} violations. Examples: {examples}"


def test_cart_items_match_cart_user(db_connection):
    """Cart items should belong to carts owned by valid users"""
    rows = db_connection.execute("""
        SELECT ci.id AS cart_item_id, ci.cart_id, c.user_id
        FROM cart_items ci
        JOIN carts c ON c.id = ci.cart_id
        LEFT JOIN users u ON u.id = c.user_id
        WHERE c.user_id IS NOT NULL
          AND u.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Cart items with invalid cart user references: {len(rows)} violations"
    )


def test_deals_have_valid_restaurant(db_connection):
    """Every deal.restaurant_id must reference a valid restaurant"""
    rows = db_connection.execute("""
        SELECT d.id, d.title, d.restaurant_id
        FROM deals d
        LEFT JOIN restaurants r ON r.id = d.restaurant_id
        WHERE d.restaurant_id IS NOT NULL
          AND r.id IS NULL;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Deal {r['id']}: {r['title']} (rest_id={r['restaurant_id']})" for r in rows[:10])
        assert False, f"Deals with invalid restaurant_id: {len(rows)} violations. Examples: {examples}"


def test_modification_options_have_valid_modification(db_connection):
    """Every modification_option.modification_id must reference a valid modification"""
    rows = db_connection.execute("""
        SELECT mo.id, mo.name, mo.modification_id
        FROM modification_options mo
        LEFT JOIN modifications m ON m.id = mo.modification_id
        WHERE mo.modification_id IS NOT NULL
          AND m.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Modification options with invalid modification_id: {len(rows)} violations"
    )


def test_review_responses_have_valid_review(db_connection):
    """Every review_response.review_id must reference a valid user_review"""
    rows = db_connection.execute("""
        SELECT rr.id, rr.review_id
        FROM review_responses rr
        LEFT JOIN user_reviews ur ON ur.id = rr.review_id
        WHERE rr.review_id IS NOT NULL
          AND ur.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Review responses with invalid review_id: {len(rows)} violations"
    )


def test_order_dates_not_in_future(db_connection):
    """Order dates should not be in the future"""
    from datetime import datetime
    
    rows = db_connection.execute("""
        SELECT id, order_date
        FROM orders
        WHERE order_date IS NOT NULL
          AND order_date != '';
    """).fetchall()
    
    today = datetime.now().date()
    bad_orders = []
    
    for row in rows:
        try:
            order_date = datetime.strptime(row['order_date'], '%Y-%m-%d').date()
            if order_date > today:
                bad_orders.append((row['id'], row['order_date']))
        except (ValueError, TypeError):
            # Skip invalid date formats
            continue
    
    assert len(bad_orders) == 0, (
        f"Orders with future dates: {len(bad_orders)} violations. "
        f"Examples: {', '.join(f'Order {o[0]} ({o[1]})' for o in bad_orders[:10])}"
    )


def test_phone_numbers_valid_format(db_connection):
    """Phone numbers should have valid format (digits only, reasonable length)"""
    rows = db_connection.execute("""
        SELECT id, phone_number, phone_country_code
        FROM orders
        WHERE phone_number IS NOT NULL
          AND TRIM(phone_number) != '';
    """).fetchall()
    
    bad_phones = []
    
    for row in rows:
        phone = str(row['phone_number']).strip()
        # Remove common separators
        phone_clean = re.sub(r'[-()\s]', '', phone)
        # Check if it's all digits and reasonable length (7-15 digits)
        if not phone_clean.isdigit() or len(phone_clean) < 7 or len(phone_clean) > 15:
            bad_phones.append((row['id'], phone))
    
    assert len(bad_phones) == 0, (
        f"Orders with invalid phone number format: {len(bad_phones)} violations. "
        f"Examples: {', '.join(f'Order {p[0]} ({p[1]})' for p in bad_phones[:10])}"
    )


def test_menu_items_price_positive(db_connection):
    """Menu item prices should be positive (>= 0)"""
    rows = db_connection.execute("""
        SELECT id, name, price
        FROM menu_items
        WHERE price < 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} (${r['price']})" for r in rows[:10])
        assert False, f"Menu items with negative prices: {len(rows)} violations. Examples: {examples}"


def test_order_items_quantity_positive(db_connection):
    """Order item quantities should be positive (> 0)"""
    rows = db_connection.execute("""
        SELECT id, order_id, menu_item_id, quantity
        FROM order_items
        WHERE quantity <= 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Item {r['id']} (order {r['order_id']}, qty={r['quantity']})" for r in rows[:10])
        assert False, f"Order items with invalid quantity (<= 0): {len(rows)} violations. Examples: {examples}"


def test_cart_items_quantity_positive(db_connection):
    """Cart item quantities should be positive (> 0)"""
    rows = db_connection.execute("""
        SELECT id, cart_id, menu_item_id, quantity
        FROM cart_items
        WHERE quantity <= 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Cart items with invalid quantity (<= 0): {len(rows)} violations"
    )


def test_review_ratings_valid_range(db_connection):
    """Review ratings should be between 1 and 5"""
    rows = db_connection.execute("""
        SELECT id, rating
        FROM user_reviews
        WHERE rating < 1 OR rating > 5;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Review {r['id']} (rating={r['rating']})" for r in rows[:10])
        assert False, f"Reviews with invalid rating (not 1-5): {len(rows)} violations. Examples: {examples}"


def test_promotionals_have_valid_restaurant(db_connection):
    """Every promotional.restaurant_id must reference a valid restaurant (if restaurant_id exists)"""
    rows = db_connection.execute("""
        SELECT p.id, p.title, p.restaurant_id
        FROM promotionals p
        LEFT JOIN restaurants r ON r.id = p.restaurant_id
        WHERE p.restaurant_id IS NOT NULL
          AND r.id IS NULL;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Promotionals with invalid restaurant_id: {len(rows)} violations"
    )


def test_orders_have_at_least_one_order_item(db_connection):
    """Every order should have at least one order_item"""
    rows = db_connection.execute("""
        SELECT o.id
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.id IS NULL;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Order {r['id']}" for r in rows[:10])
        assert False, f"Orders without any order items: {len(rows)} violations. Examples: {examples}"


def test_menu_item_discount_percentage_valid_range(db_connection):
    """Menu item discount_percentage should be between 0 and 100 (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, discount_percentage
        FROM menu_items
        WHERE discount_percentage IS NOT NULL
          AND (discount_percentage < 0 OR discount_percentage > 100);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} ({r['discount_percentage']}%)" for r in rows[:10])
        assert False, f"Menu items with invalid discount_percentage (not 0-100): {len(rows)} violations. Examples: {examples}"


# ==========================================================
# ADDITIONAL TEST CASES - 15 More Comprehensive Tests
# ==========================================================

def test_restaurant_business_hours_valid_format(db_connection):
    """Restaurant opening_hour and closing_hour should be in valid time format (HH:MM)"""
    rows = db_connection.execute("""
        SELECT id, name, opening_hour, closing_hour
        FROM restaurants
        WHERE (opening_hour IS NOT NULL AND opening_hour != ''
               AND opening_hour NOT GLOB '[0-2][0-9]:[0-5][0-9]')
           OR (closing_hour IS NOT NULL AND closing_hour != ''
               AND closing_hour NOT GLOB '[0-2][0-9]:[0-5][0-9]');
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} (open={r['opening_hour']}, close={r['closing_hour']})" for r in rows[:5])
        assert False, f"Restaurants with invalid time format: {len(rows)} violations. Expected format: HH:MM (24-hour). Examples: {examples}"


def test_restaurant_opening_before_closing(db_connection):
    """Restaurant opening_hour should be before closing_hour"""
    rows = db_connection.execute("""
        SELECT id, name, opening_hour, closing_hour
        FROM restaurants
        WHERE opening_hour IS NOT NULL AND opening_hour != ''
          AND closing_hour IS NOT NULL AND closing_hour != ''
          AND opening_hour >= closing_hour;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} (open={r['opening_hour']}, close={r['closing_hour']})" for r in rows[:5])
        assert False, f"Restaurants with opening_hour >= closing_hour: {len(rows)} violations. Examples: {examples}"


def test_user_emails_valid_format(db_connection):
    """User emails should have valid email format"""
    rows = db_connection.execute("""
        SELECT id, name, email
        FROM users
        WHERE email IS NOT NULL
          AND email != ''
          AND email NOT LIKE '%@%.%';
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"User {r['id']}: {r['name']} ({r['email']})" for r in rows[:10])
        assert False, f"Users with invalid email format: {len(rows)} violations. Examples: {examples}"


def test_zip_codes_valid_format(db_connection):
    """Zip codes should be valid (5 digits or 5+4 format)"""
    rows = db_connection.execute("""
        SELECT id, zip_code, city, state
        FROM addresses
        WHERE zip_code IS NOT NULL
          AND zip_code != ''
          AND zip_code NOT GLOB '[0-9][0-9][0-9][0-9][0-9]*';
    """).fetchall()
    
    # Also check for 5+4 format (12345-6789)
    valid_rows = []
    for row in rows:
        zip_code = str(row['zip_code']).strip()
        # Check if it's 5 digits or 5+4 format
        if not (zip_code.isdigit() and len(zip_code) == 5) and not re.match(r'^\d{5}-\d{4}$', zip_code):
            valid_rows.append(row)
    
    if len(valid_rows) > 0:
        examples = ', '.join(f"Address {r['id']} ({r['city']}, {r['state']}): {r['zip_code']}" for r in valid_rows[:10])
        assert False, f"Addresses with invalid zip code format: {len(valid_rows)} violations. Examples: {examples}"


def test_restaurant_coordinates_valid_range(db_connection):
    """Restaurant latitude should be -90 to 90, longitude should be -180 to 180"""
    rows = db_connection.execute("""
        SELECT id, name, latitude, longitude
        FROM restaurants
        WHERE (latitude IS NOT NULL AND (latitude < -90 OR latitude > 90))
           OR (longitude IS NOT NULL AND (longitude < -180 OR longitude > 180));
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} (lat={r['latitude']}, lon={r['longitude']})" for r in rows[:5])
        assert False, f"Restaurants with invalid coordinates: {len(rows)} violations. Latitude must be -90 to 90, Longitude must be -180 to 180. Examples: {examples}"


def test_deal_discount_value_positive(db_connection):
    """Deal discount_value should be positive when discount_type is percentage or fixed"""
    rows = db_connection.execute("""
        SELECT id, title, discount_type, discount_value
        FROM deals
        WHERE discount_value IS NOT NULL
          AND discount_value <= 0
          AND discount_type IN ('percentage', 'fixed', 'amount');
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Deal {r['id']}: {r['title']} (type={r['discount_type']}, value={r['discount_value']})" for r in rows[:10])
        assert False, f"Deals with non-positive discount_value: {len(rows)} violations. Examples: {examples}"


def test_menu_item_rating_valid_range(db_connection):
    """Menu item rating should be between 0 and 5 (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, rating
        FROM menu_items
        WHERE rating IS NOT NULL
          AND (rating < 0 OR rating > 5);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} (rating={r['rating']})" for r in rows[:10])
        assert False, f"Menu items with invalid rating (not 0-5): {len(rows)} violations. Examples: {examples}"


def test_cart_items_match_cart_store(db_connection):
    """Cart items should belong to menu items from the same restaurant as the cart's store"""
    rows = db_connection.execute("""
        SELECT ci.id AS cart_item_id, ci.cart_id, c.store_id AS cart_store_id,
               mi.restaurant_id AS item_restaurant_id
        FROM cart_items ci
        JOIN carts c ON c.id = ci.cart_id
        JOIN menu_items mi ON mi.id = ci.menu_item_id
        WHERE c.store_id IS NOT NULL
          AND c.store_id != mi.restaurant_id;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"CartItem {r['cart_item_id']} (cart {r['cart_id']}, cart_store={r['cart_store_id']}, item_rest={r['item_restaurant_id']})" for r in rows[:10])
        assert False, f"Cart items from different restaurant than cart store: {len(rows)} violations. Examples: {examples}"


def test_order_delivery_type_valid_values(db_connection):
    """Order delivery_type should be one of valid values: delivery, pickup, dine_in"""
    valid_types = ['delivery', 'pickup', 'dine_in']
    
    rows = db_connection.execute("""
        SELECT DISTINCT delivery_type
        FROM orders
        WHERE delivery_type IS NOT NULL
          AND LOWER(delivery_type) NOT IN (?, ?, ?);
    """, valid_types).fetchall()
    
    assert len(rows) == 0, (
        f"Invalid delivery_type values found: {', '.join(r['delivery_type'] for r in rows)}. "
        f"Valid types are: {', '.join(valid_types)}"
    )


def test_address_default_flag_consistency(db_connection):
    """Each user should have at most one default address"""
    rows = db_connection.execute("""
        SELECT user_id, COUNT(*) AS default_count
        FROM addresses
        WHERE is_default = 1
        GROUP BY user_id
        HAVING COUNT(*) > 1;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"User {r['user_id']} has {r['default_count']} default addresses" for r in rows[:10])
        assert False, f"Users with multiple default addresses: {len(rows)} violations. Examples: {examples}"


def test_restaurant_featured_has_images(db_connection):
    """Featured restaurants should have logo and banner images"""
    rows = db_connection.execute("""
        SELECT id, name
        FROM restaurants
        WHERE featured = 1
          AND ((logo IS NULL OR TRIM(logo) = '')
           OR (banner IS NULL OR TRIM(banner) = ''));
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']}" for r in rows[:10])
        assert False, f"Featured restaurants missing logo or banner: {len(rows)} violations. Examples: {examples}"


def test_menu_item_calories_positive(db_connection):
    """Menu item calories should be positive (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, calories
        FROM menu_items
        WHERE calories IS NOT NULL
          AND calories < 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} ({r['calories']} cal)" for r in rows[:10])
        assert False, f"Menu items with negative calories: {len(rows)} violations. Examples: {examples}"


def test_deal_minimum_purchase_positive(db_connection):
    """Deal minimum_purchase should be positive (if set)"""
    rows = db_connection.execute("""
        SELECT id, title, minimum_purchase
        FROM deals
        WHERE minimum_purchase IS NOT NULL
          AND minimum_purchase <= 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"Deal {r['id']}: {r['title']} (min_purchase={r['minimum_purchase']})" for r in rows[:10])
        assert False, f"Deals with non-positive minimum_purchase: {len(rows)} violations. Examples: {examples}"


def test_promotional_display_order_positive(db_connection):
    """Promotional display_order should be positive (if set)"""
    rows = db_connection.execute("""
        SELECT id, title, display_order
        FROM promotionals
        WHERE display_order IS NOT NULL
          AND display_order < 0;
    """).fetchall()
    
    assert len(rows) == 0, (
        f"Promotionals with negative display_order: {len(rows)} violations"
    )


def test_restaurant_discount_percentage_valid_range(db_connection):
    """Restaurant discount_percentage should be between 0 and 100 (if set)"""
    rows = db_connection.execute("""
        SELECT id, name, discount_percentage
        FROM restaurants
        WHERE discount_percentage IS NOT NULL
          AND (discount_percentage < 0 OR discount_percentage > 100);
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(f"{r['id']}: {r['name']} ({r['discount_percentage']}%)" for r in rows[:10])
        assert False, f"Restaurants with invalid discount_percentage (not 0-100): {len(rows)} violations. Examples: {examples}"


def test_order_scheduled_date_not_in_past(db_connection):
    """Scheduled orders should have scheduled_date in the future or today"""
    from datetime import datetime
    
    rows = db_connection.execute("""
        SELECT id, scheduled_date, order_date
        FROM orders
        WHERE scheduled_date IS NOT NULL
          AND scheduled_date != '';
    """).fetchall()
    
    today = datetime.now().date()
    bad_orders = []
    
    for row in rows:
        try:
            scheduled_date = datetime.strptime(row['scheduled_date'], '%Y-%m-%d').date()
            if scheduled_date < today:
                bad_orders.append((row['id'], row['scheduled_date']))
        except (ValueError, TypeError):
            # Skip invalid date formats
            continue
    
    if len(bad_orders) > 0:
        examples = ', '.join(f"Order {o[0]} (scheduled={o[1]})" for o in bad_orders[:10])
        assert False, f"Scheduled orders with past dates: {len(bad_orders)} violations. Examples: {examples}"


# ==========================================================
# NEW TEST CASES - Additional Data Quality Checks (10 new tests)
# ==========================================================


def test_free_delivery_restaurants_not_charging_delivery_fee(db_connection):
    """Restaurants with is_free_delivery = 1 should not charge delivery fees in orders"""
    rows = db_connection.execute("""
        SELECT o.id AS order_id, o.store_id, r.name AS restaurant_name, 
               o.delivery_fee, r.is_free_delivery
        FROM orders o
        JOIN restaurants r ON r.id = o.store_id
        WHERE r.is_free_delivery = 1
          AND o.delivery_fee IS NOT NULL
          AND o.delivery_fee > 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Order {r['order_id']} (restaurant='{r['restaurant_name']}', fee=${r['delivery_fee']})" 
            for r in rows[:10]
        )
        assert False, (
            f"Free delivery restaurants charging delivery fees: {len(rows)} violations. "
            f"Examples: {examples}"
        )



def test_cart_items_have_valid_prices(db_connection):
    """Cart items should reference menu items with valid prices"""
    rows = db_connection.execute("""
        SELECT ci.id AS cart_item_id, ci.cart_id, ci.menu_item_id,
               mi.name AS menu_item_name, mi.price AS menu_item_price
        FROM cart_items ci
        JOIN menu_items mi ON mi.id = ci.menu_item_id
        WHERE mi.price IS NULL OR mi.price < 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"CartItem {r['cart_item_id']} (item='{r['menu_item_name']}', price={r['menu_item_price']})" 
            for r in rows[:10]
        )
        assert False, (
            f"Cart items with invalid menu item prices: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_order_total_consistency(db_connection):
    """Order total should be consistent with sum of subtotal, fees, and tips"""
    rows = db_connection.execute("""
        SELECT o.id AS order_id, o.total AS order_total,
               COALESCE(o.subtotal, 0) AS subtotal,
               COALESCE(o.delivery_fee, 0) AS delivery_fee,
               COALESCE(o.service_fee, 0) AS service_fee,
               COALESCE(o.extra_fee, 0) AS extra_fee,
               COALESCE(o.tip_amount, 0) AS tip
        FROM orders o
        WHERE o.total IS NOT NULL
          AND ABS(o.total - (COALESCE(o.subtotal, 0) + COALESCE(o.delivery_fee, 0) + 
                             COALESCE(o.service_fee, 0) + COALESCE(o.extra_fee, 0) + 
                             COALESCE(o.tip_amount, 0))) > 0.01;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Order {r['order_id']} (total=${r['order_total']:.2f}, calculated=${(r['subtotal'] + r['delivery_fee'] + r['service_fee'] + r['extra_fee'] + r['tip']):.2f})" 
            for r in rows[:10]
        )
        assert False, (
            f"Orders with inconsistent totals: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_deal_discount_value_not_exceed_maximum(db_connection):
    """Deal discount_value should not exceed maximum_discount when both are set"""
    rows = db_connection.execute("""
        SELECT id, title, discount_value, maximum_discount
        FROM deals
        WHERE discount_value IS NOT NULL
          AND maximum_discount IS NOT NULL
          AND discount_value > maximum_discount;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Deal {r['id']}: '{r['title']}' (value={r['discount_value']} > max={r['maximum_discount']})" 
            for r in rows[:10]
        )
        assert False, (
            f"Deals with discount_value exceeding maximum_discount: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_promotionals_have_valid_restaurant_when_active(db_connection):
    """Active promotionals should reference valid restaurants"""
    rows = db_connection.execute("""
        SELECT p.id, p.title, p.restaurant_id, p.is_active
        FROM promotionals p
        LEFT JOIN restaurants r ON r.id = p.restaurant_id
        WHERE p.is_active = 1
          AND p.restaurant_id IS NOT NULL
          AND r.id IS NULL;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Promotional {r['id']}: '{r['title']}' (restaurant_id={r['restaurant_id']})" 
            for r in rows[:10]
        )
        assert False, (
            f"Active promotionals with invalid restaurant_id: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_users_with_orders_have_addresses(db_connection):
    """Users who have placed orders should have at least one address"""
    rows = db_connection.execute("""
        SELECT DISTINCT o.user_id, u.name AS user_name, COUNT(DISTINCT a.id) AS address_count
        FROM orders o
        JOIN users u ON u.id = o.user_id
        LEFT JOIN addresses a ON a.user_id = o.user_id
        GROUP BY o.user_id, u.name
        HAVING address_count = 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"User {r['user_id']}: {r['user_name']}" 
            for r in rows[:10]
        )
        assert False, (
            f"Users with orders but no addresses: {len(rows)} violations. "
            f"Examples: {examples}"
        )


def test_restaurant_category_consistency(db_connection):
    """Restaurants should have at least one category assignment"""
    rows = db_connection.execute("""
        SELECT r.id, r.name, COUNT(rc.restaurant_id) AS category_count
        FROM restaurants r
        LEFT JOIN restaurant_categories rc ON rc.restaurant_id = r.id
        GROUP BY r.id, r.name
        HAVING category_count = 0;
    """).fetchall()
    
    if len(rows) > 0:
        examples = ', '.join(
            f"Restaurant {r['id']}: '{r['name']}'" 
            for r in rows[:10]
        )
        assert False, (
            f"Restaurants without category assignments: {len(rows)} violations. "
            f"Examples: {examples}"
        )


