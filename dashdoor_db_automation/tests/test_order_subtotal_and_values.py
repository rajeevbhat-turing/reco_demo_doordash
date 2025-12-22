def test_orders_have_valid_store(db_connection):
    rows = db_connection.execute("""
        SELECT o.*
        FROM orders o
        LEFT JOIN restaurants r ON o.store_id = r.id
        WHERE r.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} orders have invalid store_id"


def test_orders_have_at_least_one_order_item(db_connection):
    rows = db_connection.execute("""
        SELECT o.*
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.id IS NULL;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} orders have no order_items"


def test_order_subtotal_not_zero_when_items_exist(db_connection):
    rows = db_connection.execute("""
        SELECT o.*
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        HAVING o.subtotal <= 0;
    """).fetchall()
    assert len(rows) == 0, (
        f"{len(rows)} orders have non-positive subtotal despite having items"
    )


def test_order_subtotal_matches_items_sum(db_connection):
    rows = db_connection.execute("""
        SELECT
          o.id AS order_id,
          o.subtotal,
          SUM(mi.price * oi.quantity) AS calc_subtotal
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        GROUP BY o.id
        HAVING o.subtotal != SUM(mi.price * oi.quantity);
    """).fetchall()
    assert len(rows) == 0, (
        f"{len(rows)} orders have subtotal mismatch with items sum"
    )


def test_orders_have_no_negative_values(db_connection):
    rows = db_connection.execute("""
        SELECT *
        FROM orders
        WHERE subtotal < 0
           OR service_fee < 0
           OR delivery_fee < 0
           OR extra_fee < 0
           OR tip_amount < 0
           OR total < 0;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} orders contain negative monetary values"
