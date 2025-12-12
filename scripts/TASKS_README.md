# Task Generator Script

A Python script that generates task configurations for DashDoor by reading templates and substituting placeholders with data from the database.

## Overview

The script:
1. Reads task templates from a JSON file (`config/templates.json`)
2. Queries the SQLite database for users, restaurants, and menu items
3. Filters restaurants within a 10-mile radius of each user's address
4. Finds menu items with valid add-on modifications
5. Generates tasks by substituting template placeholders with actual values

## Usage

```bash
# Basic usage (generates diverse tasks using default template)
python scripts/generate_tasks.py

# Generate 50 tasks with a specific seed for reproducibility
python scripts/generate_tasks.py --max-total 50 --seed 42

# Use a custom template file
python scripts/generate_tasks.py --template path/to/templates.json

# Output in JSONL format
python scripts/generate_tasks.py --format jsonl --output tasks.jsonl
```

## Command-line Options

| Option | Default | Description |
|--------|---------|-------------|
| `--template` | `config/templates.json` | Path to templates JSON file |
| `--template-index` | `0` | Index of template to use from array |
| `--db` | `data/db/dashdoor.db` | Path to SQLite database |
| `--output` | `config/generated_tasks.json` | Output file path |
| `--radius` | `10.0` | Search radius in miles |
| `--max-per-user` | `1` | Max tasks per user |
| `--max-total` | unlimited | Max total tasks to generate |
| `--format` | `json` | Output format (`json` or `jsonl`) |
| `--no-diverse` | - | Disable diversity (allow repeats) |
| `--no-shuffle` | - | Disable randomization |
| `--seed` | - | Random seed for reproducibility |

## Template Placeholders

Define templates in `config/templates.json` using these placeholders:

| Placeholder | Substituted With |
|-------------|------------------|
| `{{USER_EMAIL}}` | User's email address |
| `{{USER_PASSWORD}}` | User's password |
| `{{RESTAURANT}}` | Restaurant name |
| `{{RESTAURANT_ITEM}}` | Menu item name |
| `{{ITEM_ADD_ON}}` | Add-on option name |
| `{{MODIFICATION_NAME}}` | Modification group name (lowercase) |

## Template Example

```json
[
  {
    "task_id": "001",
    "start_url": "https://dashdoor.rlgym.turing.com/home",
    "task_statement": "Log in using email '{{USER_EMAIL}}' and password '{{USER_PASSWORD}}'. Order {{RESTAURANT_ITEM}} from {{RESTAURANT}}, select the {{ITEM_ADD_ON}} add on",
    "grader_config": {
      "extract_states_config": {
        "expected_state_functions": [
          {
            "function": "get_user_address",
            "args": { "user": "{{USER_EMAIL}}" }
          }
        ]
      }
    }
  }
]
```

## Diversity Mode

By default, the script ensures diversity:
- Each user appears in only 1 task
- Each restaurant appears in only 1 task  
- Each menu item appears in only 1 task

Disable with `--no-diverse` to allow repeats.

## Output

Generated tasks include:
- All template fields with placeholders substituted
- `_metadata` field with database IDs for debugging

```json
{
  "task_id": "001",
  "task_statement": "Log in using email 'user@example.com'...",
  "_metadata": {
    "user_id": 123,
    "restaurant_id": 456,
    "menu_item_id": 789
  }
}
```

