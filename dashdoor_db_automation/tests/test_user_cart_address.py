def test_orders_have_valid_user(db_connection):
    rows = db_connection.execute("""
        SELECT o.*
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE u.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} orders have invalid user_id"


def test_carts_have_valid_user(db_connection):
    rows = db_connection.execute("""
        SELECT c.*
        FROM carts c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE u.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} carts have invalid user_id"


def test_addresses_have_valid_user(db_connection):
    rows = db_connection.execute("""
        SELECT a.*
        FROM addresses a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE u.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} addresses have invalid user_id"


def test_cart_items_have_valid_cart(db_connection):
    rows = db_connection.execute("""
        SELECT ci.*
        FROM cart_items ci
        LEFT JOIN carts c ON ci.cart_id = c.id
        WHERE c.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} cart_items have invalid cart_id"


def test_cart_items_have_valid_menu_item(db_connection):
    rows = db_connection.execute("""
        SELECT ci.*
        FROM cart_items ci
        LEFT JOIN menu_items mi ON ci.menu_item_id = mi.id
        WHERE mi.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} cart_items have invalid menu_item_id"
