import sqlite3
from pathlib import Path

# Direct database file in project root
DB_FILE = Path("dashdoor-dev-fixed-dec-19.db")


def get_connection() -> sqlite3.Connection:
    """Returns a SQLite connection to the Dashdoor DB.

    Expects a file named 'dashdoor.db' in the project root.
    """
    if not DB_FILE.exists():
        raise FileNotFoundError(
            f"Database file {DB_FILE} not found in project root! "
            "Copy your SQLite DB here and rename it to 'dashdoor.db'."
        )

    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn
