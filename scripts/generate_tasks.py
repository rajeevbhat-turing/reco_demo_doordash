#!/usr/bin/env python3
"""
Task Generator Script for DashDoor

This script generates task JSON files based on templates by:
1. Reading templates from a JSON file
2. Reading data from the database (users, restaurants, menu items, etc.)
3. Generating task configurations by substituting template placeholders
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
from dataclasses import dataclass, field

# Fix encoding issues on Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass


@dataclass
class Address:
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
    id: int
    name: str
    email: str
    password: str
    addresses: List[Address] = field(default_factory=list)


@dataclass
class Restaurant:
    id: int
    name: str
    cuisine: str
    latitude: float
    longitude: float
    distance: float = 0.0


@dataclass
class MenuItem:
    id: int
    restaurant_id: int
    name: str
    price: int
    description: Optional[str] = None
    calories: Optional[int] = None


@dataclass
class ModificationOption:
    id: int
    modification_id: int
    name: str
    price: int


@dataclass
class Modification:
    id: int
    menu_item_id: int
    description: str
    is_required: bool
    options: List[ModificationOption] = field(default_factory=list)


@dataclass 
class PaymentMethod:
    id: int
    user_id: int
    card_number: str
    last_four: str
    cvc: str
    expiry: str


@dataclass
class Deal:
    id: str
    promocode: str
    title: str
    restaurant_id: Optional[int]


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
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
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template file not found: {template_path}")
    with open(template_path, 'r', encoding='utf-8') as f:
        templates = json.load(f)
    if not isinstance(templates, list):
        raise ValueError("Templates file must contain a JSON array")
    print(f"[OK] Loaded {len(templates)} template(s) from: {template_path}")
    return templates


def substitute_placeholders(obj: Any, variables: Dict[str, str]) -> Any:
    if isinstance(obj, str):
        result = obj
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result
    elif isinstance(obj, dict):
        return {k: substitute_placeholders(v, variables) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [substitute_placeholders(item, variables) for item in obj]
    return obj


# Calendar months (constant)
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


class TaskGenerator:
    def __init__(self, db_path: str, radius_miles: float = 10.0):
        self.db_path = db_path
        self.radius_miles = radius_miles
        self.conn: Optional[sqlite3.Connection] = None
        
    def connect(self) -> None:
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database file not found: {self.db_path}")
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        print(f"[OK] Connected to database: {self.db_path}")
        
    def close(self) -> None:
        if self.conn:
            self.conn.close()
            self.conn = None
            print("[CLOSED] Database connection closed")
            
    def get_users_with_addresses(self) -> List[User]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT u.id, u.name, u.email, u.password
            FROM users u
            INNER JOIN addresses a ON u.id = a.user_id
            WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
        """)
        users = []
        for row in cursor.fetchall():
            cursor.execute("""
                SELECT id, user_id, street, city, state, zip_code, 
                       latitude, longitude, address_type, is_default
                FROM addresses WHERE user_id = ? AND latitude IS NOT NULL
            """, (row['id'],))
            addresses = [Address(
                id=r['id'], user_id=r['user_id'], street=r['street'],
                city=r['city'], state=r['state'], zip_code=r['zip_code'],
                latitude=r['latitude'], longitude=r['longitude'],
                address_type=r['address_type'], is_default=bool(r['is_default'])
            ) for r in cursor.fetchall()]
            if addresses:
                users.append(User(id=row['id'], name=row['name'], 
                                  email=row['email'], password=row['password'], addresses=addresses))
        print(f"[INFO] Found {len(users)} users with valid addresses")
        return users
    
    def get_restaurants_in_radius(self, lat: float, lng: float) -> List[Restaurant]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, name, cuisine, latitude, longitude FROM restaurants WHERE latitude IS NOT NULL")
        restaurants = []
        for row in cursor.fetchall():
            distance = calculate_distance(lat, lng, row['latitude'], row['longitude'])
            if distance <= self.radius_miles:
                restaurants.append(Restaurant(
                    id=row['id'], name=row['name'], cuisine=row['cuisine'],
                    latitude=row['latitude'], longitude=row['longitude'], distance=round(distance, 2)
                ))
        restaurants.sort(key=lambda r: r.distance)
        return restaurants
    
    def get_restaurants_by_cuisine(self, lat: float, lng: float, cuisine: str) -> List[Restaurant]:
        restaurants = self.get_restaurants_in_radius(lat, lng)
        return [r for r in restaurants if cuisine.lower() in r.cuisine.lower()]
    
    def get_menu_items(self, restaurant_id: int, limit: int = 10) -> List[MenuItem]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, restaurant_id, name, price, description, calories
            FROM menu_items WHERE restaurant_id = ? AND is_available = 1 LIMIT ?
        """, (restaurant_id, limit))
        return [MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['name'],
                        price=r['price'], description=r['description'], calories=r['calories'])
                for r in cursor.fetchall()]
    
    def get_menu_items_with_addons(self, restaurant_id: int) -> List[Tuple[MenuItem, Modification, ModificationOption]]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT mi.id as item_id, mi.restaurant_id, mi.name as item_name, mi.price as item_price,
                   m.id as mod_id, m.description as mod_description, m.is_required,
                   mo.id as option_id, mo.name as option_name, mo.price as option_price
            FROM menu_items mi
            INNER JOIN modifications m ON mi.id = m.menu_item_id
            INNER JOIN modification_options mo ON m.id = mo.modification_id
            WHERE mi.restaurant_id = ? AND mi.is_available = 1 AND m.is_required = 0
            ORDER BY mi.id, m.id, mo.sort_order
        """, (restaurant_id,))
        results = []
        for row in cursor.fetchall():
            item = MenuItem(id=row['item_id'], restaurant_id=row['restaurant_id'], 
                           name=row['item_name'], price=row['item_price'])
            mod = Modification(id=row['mod_id'], menu_item_id=row['item_id'],
                              description=row['mod_description'], is_required=bool(row['is_required']))
            opt = ModificationOption(id=row['option_id'], modification_id=row['mod_id'],
                                    name=row['option_name'], price=row['option_price'])
            results.append((item, mod, opt))
        return results
    
    def get_user_payment_methods(self, user_id: int) -> List[PaymentMethod]:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, user_id, card_number, last_four, cvc, expiry
            FROM payment_methods WHERE user_id = ?
        """, (user_id,))
        return [PaymentMethod(id=r['id'], user_id=r['user_id'], card_number=r['card_number'],
                             last_four=r['last_four'], cvc=r['cvc'], expiry=r['expiry'])
                for r in cursor.fetchall()]
    
    def get_deals(self, restaurant_id: Optional[int] = None) -> List[Deal]:
        cursor = self.conn.cursor()
        if restaurant_id:
            cursor.execute("SELECT id, promocode, title, restaurant_id FROM deals WHERE restaurant_id = ? AND promocode IS NOT NULL", (restaurant_id,))
        else:
            cursor.execute("SELECT id, promocode, title, restaurant_id FROM deals WHERE promocode IS NOT NULL LIMIT 50")
        return [Deal(id=r['id'], promocode=r['promocode'], title=r['title'], restaurant_id=r['restaurant_id'])
                for r in cursor.fetchall()]
    
    def get_available_cuisines(self, lat: float, lng: float) -> List[str]:
        restaurants = self.get_restaurants_in_radius(lat, lng)
        cuisines = set(r.cuisine for r in restaurants if r.cuisine)
        return list(cuisines)
    
    def get_all_cuisines(self) -> List[str]:
        """Get all unique cuisines from the database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT cuisine FROM restaurants WHERE cuisine IS NOT NULL")
        return [row['cuisine'] for row in cursor.fetchall()]
    
    def get_all_address_types(self) -> List[str]:
        """Get all unique address types from the database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT address_type FROM addresses WHERE address_type IS NOT NULL")
        types = [row['address_type'] for row in cursor.fetchall()]
        return types if types else ['house', 'apartment', 'hotel', 'office', 'other']
    
    def get_spice_levels(self) -> List[str]:
        """Get spice level options from modification_options table."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT mo.name FROM modification_options mo
            INNER JOIN modifications m ON mo.modification_id = m.id
            WHERE LOWER(m.description) LIKE '%spice%' OR LOWER(m.description) LIKE '%heat%'
            ORDER BY mo.sort_order
        """)
        levels = [row['name'] for row in cursor.fetchall()]
        return levels if levels else ['Mild', 'Medium', 'Hot', 'Extra Hot']
    
    def get_delivery_time_slots(self) -> List[str]:
        """Get available delivery time slots from orders."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT scheduled_time_slot FROM orders WHERE scheduled_time_slot IS NOT NULL")
        slots = [row['scheduled_time_slot'] for row in cursor.fetchall()]
        if not slots:
            # Generate default time slots if none exist
            slots = []
            for hour in range(11, 21):
                for minute in ['00', '30']:
                    h = hour if hour <= 12 else hour - 12
                    ampm = 'AM' if hour < 12 else 'PM'
                    slots.append(f"{h}:{minute} {ampm}")
        return slots
    
    def get_complaint_keywords(self) -> List[str]:
        """Get common complaint keywords from user reviews."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT content FROM user_reviews 
            WHERE rating <= 3 AND content IS NOT NULL
            LIMIT 100
        """)
        # Extract common complaint terms from low-rated reviews
        complaints = set()
        complaint_terms = ['cold', 'late', 'wrong', 'missing', 'undercooked', 'overcooked', 
                          'salty', 'bland', 'stale', 'small', 'soggy', 'burnt', 'raw', 'dry']
        for row in cursor.fetchall():
            content = row['content'].lower()
            for term in complaint_terms:
                if term in content:
                    complaints.add(term)
        if not complaints:
            complaints = set(complaint_terms[:5])
        return list(complaints)
    
    def get_street_names(self) -> List[str]:
        """Get street names from existing addresses."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT street FROM addresses WHERE street IS NOT NULL LIMIT 50")
        streets = []
        for row in cursor.fetchall():
            # Extract just the street name part (e.g., "Main St" from "123 Main St")
            parts = row['street'].split(' ', 1)
            if len(parts) > 1:
                streets.append(parts[1])
        return streets if streets else ['Main St', 'Oak Ave', 'Park Blvd', 'Broadway']
    
    def get_cities(self) -> List[str]:
        """Get unique cities from addresses."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT city FROM addresses WHERE city IS NOT NULL")
        return [row['city'] for row in cursor.fetchall()]
    
    def generate_variables_for_template(
        self,
        template_type: str,
        user: User,
        address: Address
    ) -> Optional[Dict[str, str]]:
        """Generate variables based on template type."""
        
        variables = {
            "USER_EMAIL": user.email,
            "USER_PASSWORD": user.password,
        }
        
        restaurants = self.get_restaurants_in_radius(address.latitude, address.longitude)
        if not restaurants:
            return None
            
        if template_type == "order_with_addon":
            random.shuffle(restaurants)
            for restaurant in restaurants:
                items_with_addons = self.get_menu_items_with_addons(restaurant.id)
                if items_with_addons:
                    item, mod, option = random.choice(items_with_addons)
                    variables.update({
                        "RESTAURANT": restaurant.name,
                        "RESTAURANT_ITEM": item.name,
                        "ITEM_ADD_ON": option.name,
                        "MODIFICATION_NAME": mod.description.lower(),
                    })
                    return variables
            return None
            
        elif template_type == "order_from_cuisine":
            available_cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if not available_cuisines:
                return None
            cuisine = random.choice(available_cuisines)
            cuisine_restaurants = self.get_restaurants_by_cuisine(address.latitude, address.longitude, cuisine)
            if not cuisine_restaurants:
                return None
            restaurant = cuisine_restaurants[0]
            items = self.get_menu_items(restaurant.id, limit=20)
            if len(items) < 2:
                return None
            item1, item2 = random.sample(items, 2)
            addr_types = [a.address_type for a in user.addresses]
            variables.update({
                "CUISINE": cuisine,
                "RESTAURANT_ITEM_1": item1.name,
                "RESTAURANT_ITEM_2": item2.name,
                "ADDRESS_TYPE": random.choice(addr_types) if addr_types else "house",
            })
            return variables
            
        elif template_type == "find_restaurant":
            available_cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if len(available_cuisines) < 2:
                return None
            cuisine1, cuisine2 = random.sample(available_cuisines, 2)
            variables.update({
                "CUISINE_1": cuisine1,
                "CUISINE_2": cuisine2,
            })
            return variables
            
        elif template_type == "hotel_delivery":
            # Generate a hotel address using data from DB
            items = []
            random.shuffle(restaurants)
            for r in restaurants[:5]:
                items.extend(self.get_menu_items(r.id, limit=5))
            if not items:
                return None
            item = random.choice(items)
            street_names = self.get_street_names()
            cities = self.get_cities()
            variables.update({
                "STREET": f"{random.randint(100, 9999)} {random.choice(street_names)}",
                "CITY": random.choice(cities) if cities else address.city,
                "ITEM_KEYWORDS": item.name.split()[0] if item.name else "burger",
            })
            return variables
            
        elif template_type == "update_payment":
            # Generate card info
            card_num = ''.join([str(random.randint(0, 9)) for _ in range(16)])
            cvv = ''.join([str(random.randint(0, 9)) for _ in range(3)])
            exp_month = random.randint(1, 12)
            exp_year = random.randint(2025, 2030)
            variables.update({
                "CARD_NUMBER": card_num,
                "CARD_CVV": cvv,
                "EXPIRY_MONTH_NAME": MONTHS[exp_month - 1],
                "EXPIRY_YEAR": str(exp_year),
                "EXPIRY_MM_YY": f"{exp_month:02d}/{str(exp_year)[-2:]}",
            })
            return variables
            
        elif template_type == "rate_order":
            restaurant = random.choice(restaurants)
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            item = random.choice(items)
            complaint_keywords = self.get_complaint_keywords()
            if len(complaint_keywords) < 2:
                complaint_keywords = ['cold', 'late', 'wrong', 'missing', 'undercooked']
            complaints = random.sample(complaint_keywords, 2)
            # Rating from 1-5 as per menu_items.rating constraint
            rating = random.randint(1, 5)
            variables.update({
                "RESTAURANT": restaurant.name,
                "RATING": str(rating),
                "ITEM_NAME": item.name,
                "COMPLAINT_1": complaints[0],
                "COMPLAINT_2": complaints[1],
            })
            return variables
            
        elif template_type == "remove_carts":
            # Only needs user login
            return variables
            
        elif template_type == "modify_cart_order":
            restaurant = random.choice(restaurants)
            items = self.get_menu_items(restaurant.id, limit=20)
            if len(items) < 2:
                return None
            item1, item2 = random.sample(items, 2)
            delivery_slots = self.get_delivery_time_slots()
            variables.update({
                "RESTAURANT": restaurant.name,
                "ITEM_TO_REPLACE": item1.name,
                "ITEM_TO_ADD": item2.name,
                "DELIVERY_TIME": random.choice(delivery_slots),
            })
            return variables
            
        elif template_type == "complex_order":
            random.shuffle(restaurants)
            spice_levels = self.get_spice_levels()
            for restaurant in restaurants:
                items = self.get_menu_items(restaurant.id, limit=30)
                items_with_addons = self.get_menu_items_with_addons(restaurant.id)
                deals = self.get_deals(restaurant.id)
                payment_methods = self.get_user_payment_methods(user.id)
                
                if items and items_with_addons and deals and payment_methods:
                    item, mod, option = random.choice(items_with_addons)
                    deal = random.choice(deals)
                    payment = random.choice(payment_methods)
                    spice = random.choice(spice_levels)
                    variables.update({
                        "RESTAURANT": restaurant.name,
                        "ITEM_NAME": item.name,
                        "ITEM_KEYWORDS": item.name.split()[0] if item.name else "chicken",
                        "SPICE_LEVEL": spice,
                        "PROMO_CODE": deal.promocode,
                        "CARD_LAST_FOUR": payment.last_four,
                    })
                    return variables
            return None
        
        # Default: return basic variables
        return variables
    
    def generate_task_from_template(
        self,
        template: Dict[str, Any],
        task_id: str,
        variables: Dict[str, str]
    ) -> Dict[str, Any]:
        task = copy.deepcopy(template)
        task = substitute_placeholders(task, variables)
        task["task_id"] = task_id
        return task
    
    def generate_all_tasks(
        self,
        templates: List[Dict[str, Any]],
        max_tasks_per_template: int = 10,
        max_total_tasks: Optional[int] = None,
        shuffle: bool = True
    ) -> List[Dict[str, Any]]:
        tasks = []
        task_counter = 1
        
        used_users: Set[int] = set()
        users = self.get_users_with_addresses()
        
        if shuffle:
            random.shuffle(users)
        
        for template in templates:
            template_type = template.get("template_type", "order_with_addon")
            template_task_count = 0
            
            print(f"\n[TEMPLATE] Processing: {template_type}")
            
            for user in users:
                if max_total_tasks and len(tasks) >= max_total_tasks:
                    return tasks
                    
                if template_task_count >= max_tasks_per_template:
                    break
                    
                if user.id in used_users:
                    continue
                
                address = next((a for a in user.addresses if a.is_default), 
                              user.addresses[0] if user.addresses else None)
                if not address:
                    continue
                
                variables = self.generate_variables_for_template(template_type, user, address)
                if not variables:
                    continue
                
                task_id = f"{task_counter:03d}"
                task = self.generate_task_from_template(template, task_id, variables)
                
                tasks.append(task)
                task_counter += 1
                template_task_count += 1
                used_users.add(user.id)
                
                print(f"   [+] Task {task_id}: {user.email} | {template_type}")
        
        return tasks
    
    def save_tasks(self, tasks: List[Dict[str, Any]], output_path: str, format: str = 'json') -> None:
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
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate task configurations from DashDoor database')
    parser.add_argument('--template', default='config/templates.json', help='Path to templates JSON file')
    parser.add_argument('--template-index', type=int, default=None, help='Use specific template index only')
    parser.add_argument('--db', default='data/db/dashdoor.db', help='Path to SQLite database file')
    parser.add_argument('--output', default='config/generated_tasks.json', help='Output file path')
    parser.add_argument('--radius', type=float, default=10.0, help='Search radius in miles')
    parser.add_argument('--max-per-template', type=int, default=5, help='Max tasks per template type')
    parser.add_argument('--max-total', type=int, default=None, help='Max total tasks to generate')
    parser.add_argument('--format', choices=['json', 'jsonl'], default='json', help='Output format')
    parser.add_argument('--no-shuffle', action='store_true', help='Disable shuffling')
    parser.add_argument('--seed', type=int, default=None, help='Random seed')
    
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
    
    print("=" * 60)
    print("DashDoor Task Generator")
    print("=" * 60)
    print(f"Template file: {args.template}")
    print(f"Database: {args.db}")
    print(f"Max per template: {args.max_per_template}")
    print(f"Max total: {args.max_total or 'unlimited'}")
    print("=" * 60)
    
    try:
        all_templates = load_templates(args.template)
        
        if args.template_index is not None:
            if args.template_index >= len(all_templates):
                print(f"[ERROR] Template index {args.template_index} out of range")
                sys.exit(1)
            templates = [all_templates[args.template_index]]
            print(f"[INFO] Using template index {args.template_index}: {templates[0].get('template_type', 'unknown')}")
        else:
            templates = all_templates
            print(f"[INFO] Using all {len(templates)} templates")
            
    except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
    
    generator = TaskGenerator(db_path=args.db, radius_miles=args.radius)
    
    try:
        generator.connect()
        
        tasks = generator.generate_all_tasks(
            templates=templates,
            max_tasks_per_template=args.max_per_template,
            max_total_tasks=args.max_total,
            shuffle=not args.no_shuffle
        )
        
        if tasks:
            generator.save_tasks(tasks, args.output, format=args.format)
            print(f"\n[SUCCESS] Generated {len(tasks)} tasks!")
        else:
            print("\n[WARN] No tasks were generated.")
            
    except FileNotFoundError as e:
        print(f"[ERROR] {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        raise
    finally:
        generator.close()


if __name__ == '__main__':
    main()
