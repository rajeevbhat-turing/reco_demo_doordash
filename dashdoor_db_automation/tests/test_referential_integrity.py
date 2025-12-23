def test_menu_items_have_valid_restaurant(db_connection):
    """Every menu_items.restaurant_id must exist in restaurants.id"""
    query = """
        SELECT mi.*
        FROM menu_items mi
        LEFT JOIN restaurants r ON mi.restaurant_id = r.id
        WHERE r.id IS NULL;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, f"{len(result)} menu_items have invalid restaurant_id"


def test_restaurants_have_menu_items(db_connection):
    """Every restaurant should have at least one menu item (if business rules require it)."""
    query = """
        SELECT r.*
        FROM restaurants r
        LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
        WHERE mi.id IS NULL;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, f"{len(result)} restaurants have no menu items"


def test_order_items_have_valid_order(db_connection):
    """Every order_items.order_id must exist in orders.id"""
    query = """
        SELECT oi.*
        FROM order_items oi
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.id IS NULL;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, f"{len(result)} order_items have invalid order_id"


def test_order_items_have_valid_menu_item(db_connection):
    """Every order_items.menu_item_id must exist in menu_items.id"""
    query = """
        SELECT oi.*
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE mi.id IS NULL;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, f"{len(result)} order_items have invalid menu_item_id"


def test_no_duplicate_favorites(db_connection):
    """A user should not favorite the same restaurant multiple times."""
    query = """
        SELECT user_id, restaurant_id, COUNT(*) as cnt
        FROM favorite_restaurants
        GROUP BY user_id, restaurant_id
        HAVING cnt > 1;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, f"{len(result)} duplicate favorites found"
