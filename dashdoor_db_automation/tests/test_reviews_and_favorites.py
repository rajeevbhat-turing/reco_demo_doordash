def test_review_liked_items_match_restaurant(db_connection):
    """Liked items in a review should belong to the same restaurant as the review."""
    query = """
        SELECT *
        FROM review_liked_items rli
        JOIN user_reviews ur ON ur.id = rli.review_id
        JOIN order_items oi ON oi.id = rli.order_item_id
        JOIN menu_items mi ON mi.id = oi.menu_item_id
        WHERE mi.restaurant_id != ur.store_id;
    """
    result = db_connection.execute(query).fetchall()
    assert len(result) == 0, "Review liked items mismatch restaurant"


def test_reviews_valid_user_and_store(db_connection):
    """Each review must reference an existing user and store."""
    invalid_store = db_connection.execute("""
        SELECT ur.*
        FROM user_reviews ur
        LEFT JOIN restaurants r ON ur.store_id = r.id
        WHERE r.id IS NULL;
    """).fetchall()

    invalid_user = db_connection.execute("""
        SELECT ur.*
        FROM user_reviews ur
        LEFT JOIN users u ON ur.user_id = u.id
        WHERE u.id IS NULL;
    """).fetchall()

    assert len(invalid_store) == 0, "Reviews with invalid store_id found"
    assert len(invalid_user) == 0, "Reviews with invalid user_id found"

def test_review_rating_range(db_connection):
    rows = db_connection.execute("""
        SELECT *
        FROM user_reviews
        WHERE rating < 1 OR rating > 5;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} user_reviews have invalid ratings"


def test_no_duplicate_reviews_per_user_store_order(db_connection):
    rows = db_connection.execute("""
        SELECT user_id, store_id, order_id, COUNT(*) AS cnt
        FROM user_reviews
        GROUP BY user_id, store_id, order_id
        HAVING cnt > 1;
    """).fetchall()
    assert len(rows) == 0, f"{len(rows)} duplicate user_reviews found"

