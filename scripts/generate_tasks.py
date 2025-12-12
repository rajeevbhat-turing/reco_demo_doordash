#!/usr/bin/env python3
"""
Task Generator Script for DashDoor

This script generates task JSON files based on a template by:
1. Reading templates from a JSON file
2. Reading valid users from the database
3. Finding restaurants within a 10-mile radius of each user's address
4. Selecting menu items with valid add-ons from those restaurants
5. Generating task configurations by substituting template placeholders
"""

import sqlite3
import json
import math
import os
import sys
import random
import copy
import re
from typing import Optional, List, Dict, Any, Set, Tuple
from dataclasses import dataclass

# Fix encoding issues on Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass  # Python < 3.7


@dataclass
class Address:
    """Represents a user's address with coordinates"""
    id: int
    user_id: int
    street: str
    city: str
    state: str
    zip_code: str
    latitude: float
    longitude: float
    address_type: str
    is_default: bool


@dataclass
class User:
    """Represents a user with their credentials"""
    id: int
    name: str
    email: str
    password: str
    addresses: List[Address]


@dataclass
class Restaurant:
    """Represents a restaurant with location"""
    id: int
    name: str
    latitude: float
    longitude: float
    distance: float = 0.0


@dataclass
class MenuItem:
    """Represents a menu item"""
    id: int
    restaurant_id: int
    name: str
    price: int
    description: Optional[str] = None


@dataclass
class ModificationOption:
    """Represents a modification option (add-on)"""
    id: int
    modification_id: int
    name: str
    price: int
    description: Optional[str] = None


@dataclass
class Modification:
    """Represents a modification group"""
    id: int
    menu_item_id: int
    description: str
    is_required: bool
    options: List[ModificationOption]


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the distance between two coordinates using the Haversine formula.
    
    Args:
        lat1: Latitude of first point
        lng1: Longitude of first point
        lat2: Latitude of second point
        lng2: Longitude of second point
        
    Returns:
        Distance in miles
    """
    R = 3958.8
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(d_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(d_lng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def load_templates(template_path: str) -> List[Dict[str, Any]]:
    """
    Load templates from a JSON file.
    
    Args:
        template_path: Path to the templates JSON file
        
    Returns:
        List of template dictionaries
    """
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template file not found: {template_path}")
    
    with open(template_path, 'r', encoding='utf-8') as f:
        templates = json.load(f)
    
    if not isinstance(templates, list):
        raise ValueError("Templates file must contain a JSON array")
    
    print(f"[OK] Loaded {len(templates)} template(s) from: {template_path}")
    return templates


def substitute_placeholders(obj: Any, variables: Dict[str, str]) -> Any:
    """
    Recursively substitute {{PLACEHOLDER}} patterns in an object with actual values.
    
    Args:
        obj: Object to process (dict, list, str, or other)
        variables: Dictionary mapping placeholder names to values
        
    Returns:
        Object with placeholders substituted
    """
    if isinstance(obj, str):
        # Replace all {{PLACEHOLDER}} patterns
        result = obj
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result
    elif isinstance(obj, dict):
        return {k: substitute_placeholders(v, variables) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [substitute_placeholders(item, variables) for item in obj]
    else:
        return obj


class TaskGenerator:
    """Generates task configurations from database data"""
    
    def __init__(self, db_path: str, radius_miles: float = 10.0):
        """
        Initialize the task generator.
        
        Args:
            db_path: Path to the SQLite database file
            radius_miles: Maximum distance in miles for restaurant filtering
        """
        self.db_path = db_path
        self.radius_miles = radius_miles
        self.conn: Optional[sqlite3.Connection] = None
        
    def connect(self) -> None:
        """Establish database connection"""
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database file not found: {self.db_path}")
        
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        print(f"[OK] Connected to database: {self.db_path}")
        
    def close(self) -> None:
        """Close database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None
            print("[CLOSED] Database connection closed")
            
    def get_users_with_addresses(self) -> List[User]:
        """
        Get all users who have at least one address with valid coordinates.
        
        Returns:
            List of User objects with their addresses
        """
        cursor = self.conn.cursor()
        
        # Get all users
        cursor.execute("""
            SELECT DISTINCT u.id, u.name, u.email, u.password
            FROM users u
            INNER JOIN addresses a ON u.id = a.user_id
            WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
        """)
        
        users = []
        for row in cursor.fetchall():
            user_id = row['id']
            
            # Get addresses for this user
            cursor.execute("""
                SELECT id, user_id, street, city, state, zip_code, 
                       latitude, longitude, address_type, is_default
                FROM addresses
                WHERE user_id = ? AND latitude IS NOT NULL AND longitude IS NOT NULL
            """, (user_id,))
            
            addresses = []
            for addr_row in cursor.fetchall():
                addresses.append(Address(
                    id=addr_row['id'],
                    user_id=addr_row['user_id'],
                    street=addr_row['street'],
                    city=addr_row['city'],
                    state=addr_row['state'],
                    zip_code=addr_row['zip_code'],
                    latitude=addr_row['latitude'],
                    longitude=addr_row['longitude'],
                    address_type=addr_row['address_type'],
                    is_default=bool(addr_row['is_default'])
                ))
            
            if addresses:
                users.append(User(
                    id=row['id'],
                    name=row['name'],
                    email=row['email'],
                    password=row['password'],
                    addresses=addresses
                ))
        
        print(f"[INFO] Found {len(users)} users with valid addresses")
        return users
    
    def get_restaurants_in_radius(self, lat: float, lng: float) -> List[Restaurant]:
        """
        Get all restaurants within the specified radius from a location.
        
        Args:
            lat: User's latitude
            lng: User's longitude
            
        Returns:
            List of Restaurant objects within the radius, sorted by distance
        """
        cursor = self.conn.cursor()
        
        cursor.execute("""
            SELECT id, name, latitude, longitude
            FROM restaurants
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        """)
        
        restaurants = []
        for row in cursor.fetchall():
            distance = calculate_distance(lat, lng, row['latitude'], row['longitude'])
            
            if distance <= self.radius_miles:
                restaurants.append(Restaurant(
                    id=row['id'],
                    name=row['name'],
                    latitude=row['latitude'],
                    longitude=row['longitude'],
                    distance=round(distance, 2)
                ))
        
        restaurants.sort(key=lambda r: r.distance)
        return restaurants
    
    def get_menu_items_with_addons(self, restaurant_id: int) -> List[tuple]:
        """
        Get menu items that have add-on modifications from a restaurant.
        
        Args:
            restaurant_id: The restaurant ID
            
        Returns:
            List of tuples: (MenuItem, Modification, ModificationOption)
        """
        cursor = self.conn.cursor()
        
        # Find menu items with modifications that are add-ons (not required, allow selection)
        # Add-ons typically have description containing 'add-on' or are optional modifications
        cursor.execute("""
            SELECT 
                mi.id as item_id,
                mi.restaurant_id,
                mi.name as item_name,
                mi.price as item_price,
                mi.description as item_description,
                m.id as mod_id,
                m.description as mod_description,
                m.is_required as mod_required,
                mo.id as option_id,
                mo.name as option_name,
                mo.price as option_price,
                mo.description as option_description
            FROM menu_items mi
            INNER JOIN modifications m ON mi.id = m.menu_item_id
            INNER JOIN modification_options mo ON m.id = mo.modification_id
            WHERE mi.restaurant_id = ?
              AND mi.is_available = 1
              AND (
                  LOWER(m.description) LIKE '%add%on%' 
                  OR LOWER(m.description) LIKE '%addon%'
                  OR LOWER(m.description) LIKE '%extra%'
                  OR LOWER(m.description) LIKE '%topping%'
                  OR LOWER(m.description) LIKE '%side%'
                  OR m.is_required = 0
              )
            ORDER BY mi.id, m.id, mo.sort_order
        """, (restaurant_id,))
        
        results = []
        for row in cursor.fetchall():
            menu_item = MenuItem(
                id=row['item_id'],
                restaurant_id=row['restaurant_id'],
                name=row['item_name'],
                price=row['item_price'],
                description=row['item_description']
            )
            
            modification = Modification(
                id=row['mod_id'],
                menu_item_id=row['item_id'],
                description=row['mod_description'],
                is_required=bool(row['mod_required']),
                options=[]
            )
            
            option = ModificationOption(
                id=row['option_id'],
                modification_id=row['mod_id'],
                name=row['option_name'],
                price=row['option_price'],
                description=row['option_description']
            )
            
            results.append((menu_item, modification, option))
        
        return results
    
    def generate_task_from_template(
        self,
        template: Dict[str, Any],
        task_id: str,
        user: User,
        restaurant: Restaurant,
        menu_item: MenuItem,
        modification: Modification,
        option: ModificationOption
    ) -> Dict[str, Any]:
        """
        Generate a task by substituting placeholders in a template.
        
        Args:
            template: Template dictionary with placeholders
            task_id: Unique task identifier
            user: User object
            restaurant: Restaurant object
            menu_item: Menu item object
            modification: Modification object
            option: Modification option (add-on)
            
        Returns:
            Task configuration dictionary with placeholders substituted
        """
        variables = {
            "USER_EMAIL": user.email,
            "USER_PASSWORD": user.password,
            "RESTAURANT": restaurant.name,
            "RESTAURANT_ITEM": menu_item.name,
            "ITEM_ADD_ON": option.name,
            "MODIFICATION_NAME": modification.description.lower(),
        }
        
        task = copy.deepcopy(template)
        
        task = substitute_placeholders(task, variables)
        
        # Override task_id
        task["task_id"] = task_id
        
        task["_metadata"] = {
            "user_id": user.id,
            "restaurant_id": restaurant.id,
            "restaurant_distance_miles": restaurant.distance,
            "menu_item_id": menu_item.id,
            "modification_id": modification.id,
            "option_id": option.id,
            "option_price_cents": option.price
        }
        
        return task
    
    def generate_all_tasks(
        self,
        template: Dict[str, Any],
        max_tasks_per_user: int = 1,
        max_total_tasks: Optional[int] = None,
        diverse: bool = True,
        shuffle: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Generate all possible task configurations.
        
        Args:
            template: Template dictionary with placeholders
            max_tasks_per_user: Maximum number of tasks to generate per user
            max_total_tasks: Maximum total number of tasks to generate
            diverse: If True, ensures diversity (1 task per user, unique restaurants/items)
            shuffle: If True, randomize order of users and selections
            
        Returns:
            List of task configuration dictionaries
        """
        tasks = []
        task_counter = 1
        
        # Track used combinations globally for diversity
        used_restaurants: Set[int] = set()
        used_items: Set[int] = set()
        used_users: Set[int] = set()
        
        users = self.get_users_with_addresses()
        
        if shuffle:
            random.shuffle(users)
        
        for user in users:
            # In diverse mode, skip if user already used
            if diverse and user.id in used_users:
                continue
                
            user_task_count = 0
            
            # Get the default address or first available
            default_address = next(
                (addr for addr in user.addresses if addr.is_default),
                user.addresses[0] if user.addresses else None
            )
            
            if not default_address:
                continue
            
            restaurants = self.get_restaurants_in_radius(
                default_address.latitude,
                default_address.longitude
            )
            
            if not restaurants:
                continue
            
            # Shuffle restaurants for diversity
            if shuffle:
                random.shuffle(restaurants)
            
            for restaurant in restaurants:
                if user_task_count >= max_tasks_per_user:
                    break
                    
                if max_total_tasks and len(tasks) >= max_total_tasks:
                    return tasks
                
                # In diverse mode, skip if restaurant already used
                if diverse and restaurant.id in used_restaurants:
                    continue
                
                items_with_addons = self.get_menu_items_with_addons(restaurant.id)
                
                if not items_with_addons:
                    continue
                
                # Shuffle items for diversity
                if shuffle:
                    random.shuffle(items_with_addons)
                
                # Group by menu item to avoid duplicates within same task generation
                seen_items_local = set()
                
                for menu_item, modification, option in items_with_addons:
                    if user_task_count >= max_tasks_per_user:
                        break
                        
                    if max_total_tasks and len(tasks) >= max_total_tasks:
                        return tasks
                    
                    # In diverse mode, skip if item already used globally
                    if diverse and menu_item.id in used_items:
                        continue
                    
                    # Create a unique key for this combination
                    item_key = (menu_item.id, option.id)
                    if item_key in seen_items_local:
                        continue
                    seen_items_local.add(item_key)
                    
                    task_id = f"{task_counter:03d}"
                    task = self.generate_task_from_template(
                        template=template,
                        task_id=task_id,
                        user=user,
                        restaurant=restaurant,
                        menu_item=menu_item,
                        modification=modification,
                        option=option
                    )
                    
                    tasks.append(task)
                    task_counter += 1
                    user_task_count += 1
                    
                    # Track used combinations
                    used_users.add(user.id)
                    used_restaurants.add(restaurant.id)
                    used_items.add(menu_item.id)
                    
                    print(f"[+] Task {task_id}: {user.email} | {restaurant.name} | {menu_item.name} + {option.name}")
                    
                    # In diverse mode, move to next user after one task
                    if diverse:
                        break
                
                # In diverse mode, move to next user after finding a task
                if diverse and user_task_count > 0:
                    break
        
        return tasks
    
    def save_tasks(
        self,
        tasks: List[Dict[str, Any]],
        output_path: str,
        format: str = 'json'
    ) -> None:
        """
        Save generated tasks to a file.
        
        Args:
            tasks: List of task configurations
            output_path: Path to output file
            format: Output format ('json' or 'jsonl')
        """
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
        
        if format == 'jsonl':
            with open(output_path, 'w', encoding='utf-8') as f:
                for task in tasks:
                    f.write(json.dumps(task, ensure_ascii=False) + '\n')
        else:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(tasks, f, indent=2, ensure_ascii=False)
        
        print(f"\n[SAVED] {len(tasks)} tasks to: {output_path}")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate task configurations from DashDoor database')
    parser.add_argument(
        '--template',
        default='config/templates.json',
        help='Path to templates JSON file (default: config/templates.json)'
    )
    parser.add_argument(
        '--template-index',
        type=int,
        default=0,
        help='Index of template to use from templates array (default: 0)'
    )
    parser.add_argument(
        '--db', 
        default='data/db/dashdoor.db',
        help='Path to SQLite database file (default: data/db/dashdoor.db)'
    )
    parser.add_argument(
        '--output', 
        default='config/generated_tasks.json',
        help='Output file path (default: config/generated_tasks.json)'
    )
    parser.add_argument(
        '--radius', 
        type=float, 
        default=10.0,
        help='Search radius in miles (default: 10.0)'
    )
    parser.add_argument(
        '--max-per-user', 
        type=int, 
        default=1,
        help='Maximum tasks per user (default: 1)'
    )
    parser.add_argument(
        '--max-total', 
        type=int, 
        default=None,
        help='Maximum total tasks to generate (default: unlimited)'
    )
    parser.add_argument(
        '--format', 
        choices=['json', 'jsonl'], 
        default='json',
        help='Output format (default: json)'
    )
    parser.add_argument(
        '--no-diverse',
        action='store_true',
        help='Disable diversity mode (allow same restaurants/items across tasks)'
    )
    parser.add_argument(
        '--no-shuffle',
        action='store_true',
        help='Disable shuffling (use deterministic order)'
    )
    parser.add_argument(
        '--seed',
        type=int,
        default=None,
        help='Random seed for reproducible shuffling'
    )
    
    args = parser.parse_args()
    
    # Set random seed if provided
    if args.seed is not None:
        random.seed(args.seed)
    
    diverse = not args.no_diverse
    shuffle = not args.no_shuffle
    
    print("=" * 60)
    print("DashDoor Task Generator")
    print("=" * 60)
    print(f"Template file: {args.template}")
    print(f"Template index: {args.template_index}")
    print(f"Database: {args.db}")
    print(f"Radius: {args.radius} miles")
    print(f"Max tasks per user: {args.max_per_user}")
    print(f"Max total tasks: {args.max_total or 'unlimited'}")
    print(f"Diverse mode: {diverse}")
    print(f"Shuffle: {shuffle}")
    if args.seed is not None:
        print(f"Random seed: {args.seed}")
    print(f"Output format: {args.format}")
    print("=" * 60)
    
    try:
        # Load templates
        templates = load_templates(args.template)
        
        if args.template_index >= len(templates):
            print(f"\n[ERROR] Template index {args.template_index} out of range (0-{len(templates)-1})")
            sys.exit(1)
        
        template = templates[args.template_index]
        print(f"[INFO] Using template at index {args.template_index}")
        
    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"\n[ERROR] Invalid template file: {e}")
        sys.exit(1)
    
    generator = TaskGenerator(db_path=args.db, radius_miles=args.radius)
    
    try:
        generator.connect()
        
        tasks = generator.generate_all_tasks(
            template=template,
            max_tasks_per_user=args.max_per_user,
            max_total_tasks=args.max_total,
            diverse=diverse,
            shuffle=shuffle
        )
        
        if tasks:
            generator.save_tasks(tasks, args.output, format=args.format)
            print(f"\n[SUCCESS] Generated {len(tasks)} tasks!")
        else:
            print("\n[WARN] No tasks were generated. Check if:")
            print("   - Users have valid addresses with coordinates")
            print("   - Restaurants exist within the specified radius")
            print("   - Menu items have add-on modifications")
            
    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}")
        print("Make sure the database file exists at the specified path.")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        raise
    finally:
        generator.close()


if __name__ == '__main__':
    main()
