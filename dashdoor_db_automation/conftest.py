import pytest
from src.db_utils import get_connection


@pytest.fixture(scope="session")
def db_connection():
    """Session-scoped SQLite connection reused for all tests."""
    conn = get_connection()
    yield conn
    conn.close()
