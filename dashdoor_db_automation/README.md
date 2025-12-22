# Dashdoor Database Tests

Automated database integrity and pricing tests for a DoorDash-style dataset using **pytest** and **SQLite**.

## Project Structure

- `dashdoor.db` → Your SQLite database file (you must copy it here yourself)
- `src/db_utils.py` → Database connection helper
- `conftest.py` → Pytest fixture for DB connection
- `tests/` → All test files

## Prerequisites

- Python 3.10+ installed
- `pip` available
- (Optional but recommended) A virtual environment

## Setup & Run

1. **Download and unzip the project**

   Unzip this archive somewhere on your computer, for example:

   ```bash
   C:\projects\dashdoor_db_tests   # Windows
   /Users/you/projects/dashdoor_db_tests   # macOS / Linux
   ```

2. **Copy your database file**

   Put your SQLite file in the project root **next to** `README.md` and rename it to:

   ```text
   dashdoor.db
   ```

   Final structure should look like:

   ```text
   dashdoor_db_tests/
   ├─ dashdoor.db
   ├─ README.md
   ├─ requirements.txt
   ├─ conftest.py
   ├─ src/
   │  └─ db_utils.py
   └─ tests/
      ├─ test_referential_integrity.py
      ├─ test_pricing_logic.py
      ├─ test_reviews_and_favorites.py
      └─ test_catalog_consistency.py
   ```

3. **Create and activate a virtual environment (recommended)**

   **On macOS / Linux:**
   ```bash
   cd dashdoor_db_tests
   python -m venv venv
   source venv/bin/activate
   ```

   **On Windows (Command Prompt):**
   ```bat
   cd dashdoor_db_tests
   python -m venv venv
   venv\Scripts\activate
   ```

4. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Run the tests**

   ```bash
   pytest -v
   ```

   - If all tests show `PASSED` → your data satisfies the rules.
   - If any test shows `FAILED` → read the error message to see which rule was broken.

6. (Optional) **Generate an HTML report**

   ```bash
   pip install pytest-html
   pytest --html=report.html
   ```

   Then open `report.html` in a browser.

## Using in Cursor AI

1. Open the `dashdoor_db_tests` folder as a project in **Cursor**.
2. Use the built-in terminal to run:

   ```bash
   pytest -v
   ```

3. You can ask Cursor to:
   - Generate more tests
   - Modify existing tests
   - Add new rules for your database

