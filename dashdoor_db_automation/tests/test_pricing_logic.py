def test_order_totals_match_sum(db_connection):
    """total should equal subtotal + service_fee + delivery_fee + extra_fee + tip_amount"""
    query = """
        SELECT id, subtotal, service_fee, delivery_fee, extra_fee, tip_amount, total,
               (subtotal + service_fee + delivery_fee + extra_fee + tip_amount) AS calc
        FROM orders
        WHERE total != (subtotal + service_fee + delivery_fee + extra_fee + tip_amount);
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Mismatch found in order totals"


def test_free_delivery_flag_vs_min_fee(db_connection):
    """Free-delivery restaurants should not have a positive min_delivery_fee."""
    query = """
        SELECT *
        FROM restaurants
        WHERE is_free_delivery = 1 AND min_delivery_fee > 0;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Free-delivery restaurants have min_delivery_fee > 0"


def test_free_delivery_restaurants_not_charging(db_connection):
    """Free-delivery restaurants should not charge delivery_fee in orders."""
    query = """
        SELECT *
        FROM orders o
        JOIN restaurants r ON o.store_id = r.id
        WHERE r.is_free_delivery = 1 AND o.delivery_fee > 0;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Free-delivery restaurants charged delivery_fee"


def test_service_fee_vs_category_config(db_connection):
    """service_fee should be >= min_service_fee from category_configs for the store_category."""
    query = """
        SELECT o.id, o.service_fee, cc.min_service_fee
        FROM orders o
        JOIN category_configs cc ON o.store_category = cc.store_category
        WHERE o.service_fee < cc.min_service_fee;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "service_fee < min_service_fee found"

def test_deal_free_items_valid_references(db_connection):
    invalid_deal = db_connection.execute("""
        SELECT dfi.*
        FROM deal_free_items dfi
        LEFT JOIN deals d ON dfi.deal_id = d.id
        WHERE d.id IS NULL;
    """).fetchall()

    invalid_item = db_connection.execute("""
        SELECT dfi.*
        FROM deal_free_items dfi
        LEFT JOIN menu_items mi ON dfi.item_id = mi.id
        WHERE mi.id IS NULL;
    """).fetchall()

    assert len(invalid_deal) == 0, f"{len(invalid_deal)} deal_free_items rows have invalid deal_id"
    assert len(invalid_item) == 0, f"{len(invalid_item)} deal_free_items rows have invalid menu_item_id"
