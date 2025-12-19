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
import csv
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


def remove_login_prefix(statement: str) -> str:
    """Remove the login instruction from the beginning of a task statement.
    
    Handles patterns like:
    - "Log in using email 'x@y.com' and password 'pass'. Do something..."
    - "Log in using the email 'x@y.com' and password 'pass'. Do something..."
    
    Returns the statement with the login instruction removed and first letter capitalized.
    """
    # Pattern to match login instructions at the start
    pattern = r"^Log in using (?:the )?email '[^']+' and password '[^']+'\.\s*"
    result = re.sub(pattern, "", statement, flags=re.IGNORECASE)
    
    # Capitalize the first letter of the remaining statement
    if result:
        result = result[0].upper() + result[1:] if len(result) > 1 else result.upper()
    
    return result


# Percentage of tasks that should use pre-authentication via simulator_config
PRE_AUTH_PERCENTAGE = 0.70


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
            ORDER BY u.id
        """)
        users = []
        for row in cursor.fetchall():
            cursor.execute("""
                SELECT id, user_id, street, city, state, zip_code, 
                       latitude, longitude, address_type, is_default
                FROM addresses WHERE user_id = ? AND latitude IS NOT NULL ORDER BY id
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
        cursor.execute("SELECT id, name, cuisine, latitude, longitude FROM restaurants WHERE latitude IS NOT NULL ORDER BY id")
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
    
    def get_menu_items(self, restaurant_id: int, limit: int = 10, exclude_with_required_mods: bool = True) -> List[MenuItem]:
        """Get menu items for a restaurant.
        
        Args:
            restaurant_id: The restaurant to fetch items from.
            limit: Maximum number of items to return.
            exclude_with_required_mods: If True, exclude items that have required modifications.
                This is useful when a template doesn't have a modification variable - we want to
                avoid items that require a modification selection to complete the order.
        """
        cursor = self.conn.cursor()
        
        if exclude_with_required_mods:
            # Exclude items that have required modifications
            cursor.execute("""
                SELECT mi.id, mi.restaurant_id, mi.name, mi.price, mi.description, mi.calories
                FROM menu_items mi
                WHERE mi.restaurant_id = ? AND mi.is_available = 1
                AND NOT EXISTS (
                    SELECT 1 FROM modifications m 
                    WHERE m.menu_item_id = mi.id AND m.is_required = 1
                )
                ORDER BY mi.id LIMIT ?
            """, (restaurant_id, limit))
        else:
            cursor.execute("""
                SELECT id, restaurant_id, name, price, description, calories
                FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY id LIMIT ?
            """, (restaurant_id, limit))
        
        return [MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['name'],
                        price=r['price'], description=r['description'], calories=r['calories'])
                for r in cursor.fetchall()]
    
    def has_required_modifications(self, menu_item_id: int) -> bool:
        """Check if a menu item has any required modifications."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) as cnt FROM modifications 
            WHERE menu_item_id = ? AND is_required = 1
        """, (menu_item_id,))
        result = cursor.fetchone()
        return result['cnt'] > 0 if result else False
    
    
    def get_menu_items_with_addons(self, restaurant_id: int, prioritize_required: bool = True) -> List[Tuple[MenuItem, Modification, ModificationOption]]:
        """Get menu items with their modifications and options.
        
        Args:
            restaurant_id: The restaurant to fetch items from.
            prioritize_required: If True, prioritize items with required modifications first.
                                If False, only get items with optional (non-required) modifications.
        """
        cursor = self.conn.cursor()
        
        if prioritize_required:
            # First try to get items with required modifications
            cursor.execute("""
                SELECT mi.id as item_id, mi.restaurant_id, mi.name as item_name, mi.price as item_price,
                       m.id as mod_id, m.description as mod_description, m.is_required,
                       mo.id as option_id, mo.name as option_name, mo.price as option_price
                FROM menu_items mi
                INNER JOIN modifications m ON mi.id = m.menu_item_id
                INNER JOIN modification_options mo ON m.id = mo.modification_id
                WHERE mi.restaurant_id = ? AND mi.is_available = 1 AND m.is_required = 1
                ORDER BY mi.id, m.id, mo.id
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
            
            # If we found items with required modifications, return them
            if results:
                return results
        
        # Fall back to items with optional modifications
        cursor.execute("""
            SELECT mi.id as item_id, mi.restaurant_id, mi.name as item_name, mi.price as item_price,
                   m.id as mod_id, m.description as mod_description, m.is_required,
                   mo.id as option_id, mo.name as option_name, mo.price as option_price
            FROM menu_items mi
            INNER JOIN modifications m ON mi.id = m.menu_item_id
            INNER JOIN modification_options mo ON m.id = mo.modification_id
            WHERE mi.restaurant_id = ? AND mi.is_available = 1 AND m.is_required = 0
            ORDER BY mi.id, m.id, mo.id
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
            FROM payment_methods WHERE user_id = ? ORDER BY id
        """, (user_id,))
        return [PaymentMethod(id=r['id'], user_id=r['user_id'], card_number=r['card_number'],
                             last_four=r['last_four'], cvc=r['cvc'], expiry=r['expiry'])
                for r in cursor.fetchall()]
    
    def get_deals(self, restaurant_id: Optional[int] = None) -> List[Deal]:
        cursor = self.conn.cursor()
        if restaurant_id:
            cursor.execute("SELECT id, promocode, title, restaurant_id FROM deals WHERE restaurant_id = ? AND promocode IS NOT NULL ORDER BY id", (restaurant_id,))
        else:
            cursor.execute("SELECT id, promocode, title, restaurant_id FROM deals WHERE promocode IS NOT NULL ORDER BY id LIMIT 50")
        return [Deal(id=r['id'], promocode=r['promocode'], title=r['title'], restaurant_id=r['restaurant_id'])
                for r in cursor.fetchall()]
    
    def get_available_cuisines(self, lat: float, lng: float) -> List[str]:
        restaurants = self.get_restaurants_in_radius(lat, lng)
        cuisines = set(r.cuisine for r in restaurants if r.cuisine)
        return sorted(list(cuisines))  # Sort for reproducibility
    
    def get_all_cuisines(self) -> List[str]:
        """Get all unique cuisines from the database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT cuisine FROM restaurants WHERE cuisine IS NOT NULL ORDER BY cuisine")
        return [row['cuisine'] for row in cursor.fetchall()]
    
    def get_all_address_types(self) -> List[str]:
        """Get all unique address types from the database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT address_type FROM addresses WHERE address_type IS NOT NULL ORDER BY address_type")
        types = [row['address_type'] for row in cursor.fetchall()]
        return types if types else ['apartment', 'hotel', 'house', 'office', 'other']  # Sorted default
    
    def get_spice_levels(self) -> List[str]:
        """Get spice level options from modification_options table."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT mo.name FROM modification_options mo
            INNER JOIN modifications m ON mo.modification_id = m.id
            WHERE LOWER(m.description) LIKE '%spice%' OR LOWER(m.description) LIKE '%heat%'
            ORDER BY mo.sort_order, mo.id
        """)
        levels = [row['name'] for row in cursor.fetchall()]
        return levels if levels else ['Mild', 'Medium', 'Hot', 'Extra Hot']
    
    def get_delivery_time_slots(self) -> List[str]:
        """Get available delivery time slots from orders."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT scheduled_time_slot FROM orders WHERE scheduled_time_slot IS NOT NULL ORDER BY scheduled_time_slot")
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
        return sorted(list(complaints))  # Sort for reproducibility
    
    def get_street_names(self) -> List[str]:
        """Get street names from existing addresses."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT street FROM addresses WHERE street IS NOT NULL ORDER BY street LIMIT 50")
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
        cursor.execute("SELECT DISTINCT city FROM addresses WHERE city IS NOT NULL ORDER BY city")
        return [row['city'] for row in cursor.fetchall()]
    
    def get_user_orders(self, user_id: int) -> List[Dict[str, Any]]:
        """Get orders for a user with restaurant and item details."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT o.id as order_id, o.store_id, r.name as restaurant_name,
                   mi.name as item_name, mi.id as item_id
            FROM orders o
            INNER JOIN restaurants r ON o.store_id = r.id
            INNER JOIN order_items oi ON o.id = oi.order_id
            INNER JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC, o.id, mi.id
        """, (user_id,))
        orders = []
        for row in cursor.fetchall():
            orders.append({
                'order_id': row['order_id'],
                'store_id': row['store_id'],
                'restaurant_name': row['restaurant_name'],
                'item_name': row['item_name'],
                'item_id': row['item_id']
            })
        return orders
    
    def get_user_carts(self, user_id: int) -> List[Dict[str, Any]]:
        """Get carts for a user with restaurant details."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT c.id as cart_id, c.store_id, r.name as restaurant_name,
                   r.latitude, r.longitude
            FROM carts c
            INNER JOIN restaurants r ON c.store_id = r.id
            INNER JOIN cart_items ci ON c.id = ci.cart_id
            WHERE c.user_id = ?
            ORDER BY c.id
        """, (user_id,))
        carts = []
        seen = set()
        for row in cursor.fetchall():
            if row['cart_id'] not in seen:
                carts.append({
                    'cart_id': row['cart_id'],
                    'store_id': row['store_id'],
                    'restaurant_name': row['restaurant_name'],
                    'latitude': row['latitude'],
                    'longitude': row['longitude']
                })
                seen.add(row['cart_id'])
        return carts
    
    def get_cart_items(self, cart_id: int) -> List[Dict[str, Any]]:
        """Get items in a cart."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT ci.id, mi.name as item_name, mi.id as item_id, ci.quantity
            FROM cart_items ci
            INNER JOIN menu_items mi ON ci.menu_item_id = mi.id
            WHERE ci.cart_id = ?
            ORDER BY ci.id
        """, (cart_id,))
        return [{'id': r['id'], 'item_name': r['item_name'], 
                 'item_id': r['item_id'], 'quantity': r['quantity']} 
                for r in cursor.fetchall()]
    
    def get_users_with_orders(self) -> List[User]:
        """Get users who have at least one order."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT u.id, u.name, u.email, u.password
            FROM users u
            INNER JOIN orders o ON u.id = o.user_id
            INNER JOIN addresses a ON u.id = a.user_id
            WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
            ORDER BY u.id
        """)
        users = []
        for row in cursor.fetchall():
            cursor.execute("""
                SELECT id, user_id, street, city, state, zip_code, 
                       latitude, longitude, address_type, is_default
                FROM addresses WHERE user_id = ? AND latitude IS NOT NULL ORDER BY id
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
        return users
    
    def get_users_with_carts(self) -> List[User]:
        """Get users who have items in cart."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT u.id, u.name, u.email, u.password
            FROM users u
            INNER JOIN carts c ON u.id = c.user_id
            INNER JOIN cart_items ci ON c.id = ci.cart_id
            INNER JOIN addresses a ON u.id = a.user_id
            WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
            ORDER BY u.id
        """)
        users = []
        for row in cursor.fetchall():
            cursor.execute("""
                SELECT id, user_id, street, city, state, zip_code, 
                       latitude, longitude, address_type, is_default
                FROM addresses WHERE user_id = ? AND latitude IS NOT NULL ORDER BY id
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
        return users
    
    def get_chicken_items(self, restaurant_id: int, exclude_with_required_mods: bool = True) -> List[MenuItem]:
        """Get chicken items from the menu.
        
        Args:
            restaurant_id: The restaurant to fetch items from.
            exclude_with_required_mods: If True, exclude items that have required modifications.
        """
        cursor = self.conn.cursor()
        
        if exclude_with_required_mods:
            cursor.execute("""
                SELECT mi.id, mi.restaurant_id, mi.name, mi.price, mi.description, mi.calories
                FROM menu_items mi
                WHERE mi.restaurant_id = ? AND mi.is_available = 1 
                AND (LOWER(mi.name) LIKE '%chicken%' OR LOWER(mi.description) LIKE '%chicken%')
                AND NOT EXISTS (
                    SELECT 1 FROM modifications m 
                    WHERE m.menu_item_id = mi.id AND m.is_required = 1
                )
                ORDER BY mi.id
                LIMIT 10
            """, (restaurant_id,))
        else:
            cursor.execute("""
                SELECT id, restaurant_id, name, price, description, calories
                FROM menu_items 
                WHERE restaurant_id = ? AND is_available = 1 
                AND (LOWER(name) LIKE '%chicken%' OR LOWER(description) LIKE '%chicken%')
                ORDER BY id
                LIMIT 10
            """, (restaurant_id,))
        
        return [MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['name'],
                        price=r['price'], description=r['description'], calories=r['calories'])
                for r in cursor.fetchall()]
    
    def get_dessert_items(self, restaurant_id: int, exclude_with_required_mods: bool = True) -> List[MenuItem]:
        """Get dessert items from the menu.
        
        Args:
            restaurant_id: The restaurant to fetch items from.
            exclude_with_required_mods: If True, exclude items that have required modifications.
        """
        cursor = self.conn.cursor()
        
        if exclude_with_required_mods:
            cursor.execute("""
                SELECT mi.id, mi.restaurant_id, mi.name, mi.price, mi.description, mi.calories
                FROM menu_items mi
                INNER JOIN menu_categories mc ON mi.category_id = mc.id
                WHERE mi.restaurant_id = ? AND mi.is_available = 1 
                AND (LOWER(mc.name) LIKE '%dessert%' OR LOWER(mi.name) LIKE '%cake%' 
                     OR LOWER(mi.name) LIKE '%ice cream%' OR LOWER(mi.name) LIKE '%brownie%')
                AND NOT EXISTS (
                    SELECT 1 FROM modifications m 
                    WHERE m.menu_item_id = mi.id AND m.is_required = 1
                )
                ORDER BY mi.calories ASC NULLS LAST, mi.id
                LIMIT 10
            """, (restaurant_id,))
        else:
            cursor.execute("""
                SELECT mi.id, mi.restaurant_id, mi.name, mi.price, mi.description, mi.calories
                FROM menu_items mi
                INNER JOIN menu_categories mc ON mi.category_id = mc.id
                WHERE mi.restaurant_id = ? AND mi.is_available = 1 
                AND (LOWER(mc.name) LIKE '%dessert%' OR LOWER(mi.name) LIKE '%cake%' 
                     OR LOWER(mi.name) LIKE '%ice cream%' OR LOWER(mi.name) LIKE '%brownie%')
                ORDER BY mi.calories ASC NULLS LAST, mi.id
                LIMIT 10
            """, (restaurant_id,))
        
        return [MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['name'],
                        price=r['price'], description=r['description'], calories=r['calories'])
                for r in cursor.fetchall()]
    
    def get_menu_categories(self, restaurant_id: int) -> List[str]:
        """Get menu categories for a restaurant."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT DISTINCT mc.name FROM menu_categories mc
            WHERE mc.restaurant_id = ? AND mc.is_active = 1
            ORDER BY mc.name
        """, (restaurant_id,))
        return [row['name'] for row in cursor.fetchall()]
    
    def get_restaurant_categories(self) -> List[str]:
        """Get restaurant categories from the database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT name FROM categories ORDER BY name LIMIT 20")
        cats = [row['name'] for row in cursor.fetchall()]
        return cats if cats else ["Burgers", "Coffee", "Mexican", "Pizza", "Sushi"]  # Sorted default
    
    def get_items_by_category(self, restaurant_id: int, category: str, limit: int = 5, exclude_with_required_mods: bool = True) -> List[MenuItem]:
        """Get menu items from a specific category.
        
        Args:
            restaurant_id: The restaurant to fetch items from.
            category: The category name to filter by.
            limit: Maximum number of items to return.
            exclude_with_required_mods: If True, exclude items that have required modifications.
        """
        cursor = self.conn.cursor()
        
        if exclude_with_required_mods:
            cursor.execute("""
                SELECT mi.id, mi.restaurant_id, mi.name, mi.price, mi.description, mi.calories
                FROM menu_items mi
                INNER JOIN menu_categories mc ON mi.category_id = mc.id
                WHERE mi.restaurant_id = ? AND mi.is_available = 1 
                AND LOWER(mc.name) LIKE ?
                AND NOT EXISTS (
                    SELECT 1 FROM modifications m 
                    WHERE m.menu_item_id = mi.id AND m.is_required = 1
                )
                ORDER BY mi.price ASC, mi.id ASC
                LIMIT ?
            """, (restaurant_id, f"%{category.lower()}%", limit))
        else:
            cursor.execute("""
                SELECT mi.id, mi.restaurant_id, mi.name, mi.price, mi.description, mi.calories
                FROM menu_items mi
                INNER JOIN menu_categories mc ON mi.category_id = mc.id
                WHERE mi.restaurant_id = ? AND mi.is_available = 1 
                AND LOWER(mc.name) LIKE ?
                ORDER BY mi.price ASC, mi.id ASC
                LIMIT ?
            """, (restaurant_id, f"%{category.lower()}%", limit))
        
        return [MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['name'],
                        price=r['price'], description=r['description'], calories=r['calories'])
                for r in cursor.fetchall()]
    
    def get_items_with_sauce_options(self, restaurant_id: int, prioritize_required: bool = True) -> List[Tuple[MenuItem, str]]:
        """Get items that have sauce modification options.
        
        Args:
            restaurant_id: The restaurant to fetch items from.
            prioritize_required: If True, prioritize items with required sauce modifications first.
        """
        cursor = self.conn.cursor()
        
        if prioritize_required:
            # First try to get items with required sauce modifications
            cursor.execute("""
                SELECT DISTINCT mi.id, mi.restaurant_id, mi.name as item_name, mi.price, 
                       mi.description, mi.calories, mo.name as sauce_name
                FROM menu_items mi
                INNER JOIN modifications m ON mi.id = m.menu_item_id
                INNER JOIN modification_options mo ON m.id = mo.modification_id
                WHERE mi.restaurant_id = ? AND mi.is_available = 1
                AND (LOWER(m.description) LIKE '%sauce%' OR LOWER(mo.name) LIKE '%sauce%')
                AND m.is_required = 1
                ORDER BY mi.id, mo.id
                LIMIT 10
            """, (restaurant_id,))
            results = []
            for r in cursor.fetchall():
                item = MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['item_name'],
                               price=r['price'], description=r['description'], calories=r['calories'])
                results.append((item, r['sauce_name']))
            
            # If we found items with required sauce modifications, return them
            if results:
                return results
        
        # Fall back to items with optional sauce modifications
        cursor.execute("""
            SELECT DISTINCT mi.id, mi.restaurant_id, mi.name as item_name, mi.price, 
                   mi.description, mi.calories, mo.name as sauce_name
            FROM menu_items mi
            INNER JOIN modifications m ON mi.id = m.menu_item_id
            INNER JOIN modification_options mo ON m.id = mo.modification_id
            WHERE mi.restaurant_id = ? AND mi.is_available = 1
            AND (LOWER(m.description) LIKE '%sauce%' OR LOWER(mo.name) LIKE '%sauce%')
            ORDER BY mi.id, mo.id
            LIMIT 10
        """, (restaurant_id,))
        results = []
        for r in cursor.fetchall():
            item = MenuItem(id=r['id'], restaurant_id=r['restaurant_id'], name=r['item_name'],
                           price=r['price'], description=r['description'], calories=r['calories'])
            results.append((item, r['sauce_name']))
        return results
    
    def generate_phone_number(self) -> str:
        """Generate a random US phone number."""
        return f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}"
    
    def get_restaurant_sections(self) -> List[str]:
        """Get available restaurant sections."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT DISTINCT section FROM restaurants WHERE section IS NOT NULL ORDER BY section")
        sections = [row['section'] for row in cursor.fetchall()]
        return sections if sections else ["Featured", "Nearby", "New", "Popular"]  # Sorted default

    def generate_variables_for_template(
        self,
        template_id: str,
        user: User,
        address: Address
    ) -> Optional[Dict[str, str]]:
        """Generate variables based on template_id."""
        
        variables = {
            "USER_EMAIL": user.email,
            "USER_PASSWORD": user.password,
        }
        
        restaurants = self.get_restaurants_in_radius(address.latitude, address.longitude)
        if not restaurants:
            return None
        
        addr_types = sorted([a.address_type for a in user.addresses])  # Sort for reproducibility
        addr_type = random.choice(addr_types) if addr_types else "house"
        
        # ================================================================
        # 1. item-addon-order
        # ================================================================
        if template_id == "item-addon-order":
            random.shuffle(restaurants)
            for restaurant in restaurants:
                items_with_addons = self.get_menu_items_with_addons(restaurant.id)
                if items_with_addons:
                    item, mod, option = random.choice(items_with_addons)
                    variables.update({
                        "RESTAURANT": restaurant.name,
                        "RESTAURANT_ITEM": item.name,
                        "ITEM_ADD_ON": option.name,
                    })
                    return variables
            return None
        
        # ================================================================
        # 2. nearest-cheapest-choice
        # ================================================================
        elif template_id == "nearest-cheapest-choice":
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
            variables.update({
                "CUISINE": cuisine,
                "RESTAURANT_ITEM_1": item1.name,
                "RESTAURANT_ITEM_2": item2.name,
                "ADDRESS_TYPE": addr_type,
            })
            return variables
        
        # ================================================================
        # 3. new-cheapest-restaurant
        # ================================================================
        elif template_id == "new-cheapest-restaurant":
            available_cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if len(available_cuisines) < 2:
                return None
            cuisine1, cuisine2 = random.sample(available_cuisines, 2)
            variables.update({
                "DIETARY_PREFERENCE_1": cuisine1,
                "DIETARY_PREFERENCE_2": cuisine2,
            })
            return variables
        
        # ================================================================
        # 4. replace-payment-card
        # ================================================================
        elif template_id == "replace-payment-card":
            # User must have a house address for this template
            house_address = next((a for a in user.addresses if a.address_type == 'house'), None)
            if not house_address:
                return None
            
            card_num = ''.join([str(random.randint(0, 9)) for _ in range(16)])
            cvv = ''.join([str(random.randint(0, 9)) for _ in range(3)])
            exp_month = random.randint(1, 12)
            exp_year = random.randint(2028, 2035)
            variables.update({
                "CARD_NUMBER": card_num,
                "CARD_CVV": cvv,
                "EXPIRY_MONTH_NAME": MONTHS[exp_month - 1],
                "EXPIRY_YEAR": str(exp_year),
                "EXPIRY_MM_YY": f"{exp_month:02d}/{str(exp_year)[-2:]}",
            })
            return variables
        
        # ================================================================
        # 5. rate-last-order
        # ================================================================
        elif template_id == "rate-last-order":
            user_orders = self.get_user_orders(user.id)
            if not user_orders:
                return None
            
            in_range_ids = {r.id for r in restaurants}
            valid_orders = [o for o in user_orders if o['store_id'] in in_range_ids]
            if not valid_orders:
                return None
            
            order = random.choice(valid_orders)
            rating = random.randint(1, 5)
            
            if rating <= 2:
                feedback_1 = random.choice(['cold', 'late', 'wrong', 'stale', 'undercooked'])
                feedback_2 = random.choice(['soggy', 'bland', 'dry', 'overcooked', 'missing'])
            elif rating == 3:
                feedback_1 = random.choice(['just okay', 'average', 'nothing special', 'mediocre'])
                feedback_2 = random.choice(['arrived lukewarm', 'a bit pricey', 'smaller than expected'])
            elif rating == 4:
                feedback_1 = random.choice(['tasty', 'good', 'fresh', 'well-made', 'flavorful'])
                feedback_2 = random.choice(['a bit slow', 'slightly cold', 'packaging could be better'])
            else:
                feedback_1 = random.choice(['delicious', 'amazing', 'perfect', 'excellent', 'fantastic'])
                feedback_2 = random.choice(['fresh', 'hot', 'well-packaged', 'fast delivery', 'great portion'])
            
            variables.update({
                "RESTAURANT_NAME": order['restaurant_name'],
                "RATING_NUM": str(rating),
                "ITEM_NAME": order['item_name'],
                "COMPLAINT_1": feedback_1,
                "COMPLAINT_2": feedback_2,
            })
            return variables
        
        # ================================================================
        # 6. clear-invalid-carts
        # ================================================================
        elif template_id == "clear-invalid-carts":
            user_carts = self.get_user_carts(user.id)
            if not user_carts:
                return None
            in_range_ids = {r.id for r in restaurants}
            out_of_range_carts = [c for c in user_carts if c['store_id'] not in in_range_ids]
            if not out_of_range_carts:
                return None
            return variables
        
        # ================================================================
        # 7. replace-cart-item
        # ================================================================
        elif template_id == "replace-cart-item":
            user_carts = self.get_user_carts(user.id)
            if not user_carts:
                return None
            
            in_range_ids = {r.id for r in restaurants}
            valid_carts = [c for c in user_carts if c['store_id'] in in_range_ids]
            if not valid_carts:
                return None
            
            cart = random.choice(valid_carts)
            cart_items = self.get_cart_items(cart['cart_id'])
            if not cart_items:
                return None
            
            other_items = self.get_menu_items(cart['store_id'], limit=20)
            cart_item_ids = {ci['item_id'] for ci in cart_items}
            available_to_add = [i for i in other_items if i.id not in cart_item_ids]
            if not available_to_add:
                return None
            
            item_to_replace = random.choice(cart_items)
            item_to_add = random.choice(available_to_add)
            delivery_slots = self.get_delivery_time_slots()
            
            variables.update({
                "RESTAURANT_NAME": cart['restaurant_name'],
                "ITEM_TO_REPLACE": item_to_replace['item_name'],
                "ITEM_TO_ADD": item_to_add.name,
                "DELIVERY_TIME": random.choice(delivery_slots),
            })
            return variables
            
        # ================================================================
        # 8. reorder-with-addons
        # ================================================================
        elif template_id == "reorder-with-addons":
            # Needs: user orders, restaurant, item, apartment address, promo code
            user_orders = self.get_user_orders(user.id)
            if not user_orders:
                return None
            
            in_range_ids = {r.id for r in restaurants}
            valid_orders = [o for o in user_orders if o['store_id'] in in_range_ids]
            if not valid_orders:
                return None
            
            order = random.choice(valid_orders)
            restaurant = next((r for r in restaurants if r.id == order['store_id']), None)
            if not restaurant:
                return None
            
            items = self.get_menu_items(restaurant.id, limit=20)
            if not items:
                return None
            
            deals = self.get_deals(restaurant.id)
            if not deals:
                return None
            
            # Find apartment address
            apt_addr = next((a for a in user.addresses if a.address_type == 'apartment'), None)
            if not apt_addr:
                return None
            
            item = random.choice(items)
            deal = random.choice(deals)
            
            variables.update({
                "RESTAURANT_NAME": restaurant.name,
                "RESTAURANT_ITEM": item.name,
                "RESTAURANT_ITEM_KEYWORDS": item.name.split()[0] if item.name else "food",
                "ITEM_QTY": str(random.randint(2, 4)),
                "STREET": apt_addr.street,
                "APARTMENT_NUMBER": str(random.randint(100, 999)),
                "ENTRY_CODE": str(random.randint(1000, 9999)),
                "PROMO_CODE": deal.promocode,
            })
            return variables
        
        # ================================================================
        # 9. express-nearest-order
        # ================================================================
        elif template_id == "express-nearest-order":
            deals = self.get_deals()
            if not deals:
                return None
            
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "ADDRESS_TYPE": addr_type,
                "DELIVERY_OPTION": random.choice(["express", "priority"]),
                "MEMBERSHIP_TYPE": "DashPass",
                "PROMO_CODE": random.choice(deals).promocode,
            })
            return variables
        
        # ================================================================
        # 10. cheapest-item-filter
        # ================================================================
        elif template_id == "cheapest-item-filter":
            if len(restaurants) < 2:
                return None
            restaurant = random.choice(restaurants[:5])
            excluded = random.choice([r for r in restaurants if r.id != restaurant.id])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "EXCLUDED_RESTAURANT": excluded.name,
            })
            return variables
        
        # ================================================================
        # 11. top-rated-category
        # ================================================================
        elif template_id == "top-rated-category":
            restaurant = random.choice(restaurants[:5])
            menu_cats = self.get_menu_categories(restaurant.id)
            if not menu_cats:
                menu_cats = ["entrees", "appetizers", "desserts"]
            
            variables.update({
                "RESTAURANT": restaurant.name,
                "MENU_CATEGORY": random.choice(menu_cats),
            })
            return variables
        
        # ================================================================
        # 12. best-deal-order
        # ================================================================
        elif template_id == "best-deal-order":
            random.shuffle(restaurants)
            for restaurant in restaurants:
                menu_cats = self.get_menu_categories(restaurant.id)
                if not menu_cats:
                    continue
                
                variables.update({
                    "ADDRESS_TYPE": addr_type,
                    "MENU_CATEGORY": random.choice(menu_cats),
                })
                return variables
            return None
        
        # ================================================================
        # 13. bulk-simple-order
        # ================================================================
        elif template_id == "bulk-simple-order":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=20)
            menu_cats = self.get_menu_categories(restaurant.id)
            if len(items) < 2 or not menu_cats:
                return None
            
            main_item = random.choice(items)
            drink_cats = [c for c in menu_cats if 'drink' in c.lower() or 'beverage' in c.lower()]
            drink_cat = random.choice(drink_cats) if drink_cats else random.choice(menu_cats)
            
            variables.update({
                "RESTAURANT": restaurant.name,
                "MAIN_ITEM": main_item.name,
                "MAIN_ITEM_NAME": main_item.name,  # Alias for grader
                "MAIN_ITEM_QTY": str(random.randint(2, 4)),
                "DRINK_CATEGORY": drink_cat,
                "DRINK_QTY": str(random.randint(1, 3)),
                "CONTACT_NUMBER": self.generate_phone_number(),
            })
            return variables
        
        # ================================================================
        # 14. update-delivery-instructions
        # ================================================================
        elif template_id == "update-delivery-instructions":
            locations = ["lobby", "front door", "mailroom", "gate", "reception"]
            variables.update({
                "ADDRESS_TYPE": addr_type,
                "ENTRY_CODE": str(random.randint(1000, 9999)),
                "DELIVERY_LOCATION": random.choice(locations),
            })
            return variables
        
        # ================================================================
        # 15. lowest-calorie-dessert
        # ================================================================
        elif template_id == "lowest-calorie-dessert":
            random.shuffle(restaurants)
            rest_cats = self.get_restaurant_categories()
            for restaurant in restaurants:
                menu_cats = self.get_menu_categories(restaurant.id)
                sauce_items = self.get_items_with_sauce_options(restaurant.id)
                
                if menu_cats and sauce_items:
                    item, sauce_name = random.choice(sauce_items)
                    variables.update({
                        "RESTAURANT_CATEGORY": random.choice(rest_cats),
                        "ADDRESS_TYPE": addr_type,
                        "TOTAL_SERVINGS": str(random.randint(2, 4)),
                        "MENU_CATEGORY": random.choice(menu_cats),
                        "SAUCE_OPTION": sauce_name,
                    })
                    return variables
            return None
        
        # ================================================================
        # 16. top-rated-history
        # ================================================================
        elif template_id == "top-rated-history":
            user_orders = self.get_user_orders(user.id)
            if not user_orders:
                return None
            
            item_filters = ["chicken", "pasta", "salad", "burger", "pizza", "sandwich"]
            variables.update({
                "ITEM_FILTER": random.choice(item_filters),
            })
            return variables
        
        # ================================================================
        # 17. helpful-review-items
        # ================================================================
        elif template_id == "helpful-review-items":
            restaurant = random.choice(restaurants[:10])
            variables.update({
                "RESTAURANT": restaurant.name,
            })
            return variables
        
        # ================================================================
        # 18. cheapest-rated-slices
        # ================================================================
        elif template_id == "cheapest-rated-slices":
            cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if not cuisines:
                return None
            
            restaurant = random.choice(restaurants[:5])
            menu_cats = self.get_menu_categories(restaurant.id)
            
            variables.update({
                "CUISINE": random.choice(cuisines),
                "ADDRESS_TYPE": addr_type,
                "MENU_CATEGORY": random.choice(menu_cats) if menu_cats else "entrees",
                "MIN_RATING": str(random.choice([3, 3.5, 4, 4.5])),
            })
            return variables
        
        # ================================================================
        # 19. cheapest-liked-combo
        # ================================================================
        elif template_id == "cheapest-liked-combo":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=20)
            menu_cats = self.get_menu_categories(restaurant.id)
            if len(items) < 2 or not menu_cats:
                return None
            
            additional_item = random.choice(items)
            variables.update({
                "RESTAURANT": restaurant.name,
                "MENU_CATEGORY": random.choice(menu_cats),
                "ADDITIONAL_ITEM": additional_item.name,
                "ADDITIONAL_ITEM_KEYWORDS": additional_item.name.split()[0] if additional_item.name else "item",
            })
            return variables
        
        # ================================================================
        # 20. cheapest-nearby-item
        # ================================================================
        elif template_id == "cheapest-nearby-item":
            cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if not cuisines:
                return None
            
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            menu_cats = self.get_menu_categories(restaurant.id)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "CUISINE": random.choice(cuisines),
                "ADDRESS_TYPE": addr_type,
                "MENU_CATEGORY": random.choice(menu_cats) if menu_cats else "entrees",
            })
            return variables
        
        # ================================================================
        # 21. multi-express-orders
        # ================================================================
        elif template_id == "multi-express-orders":
            if len(restaurants) < 2:
                return None
            
            cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            r1, r2 = random.sample(restaurants[:10], 2)
            items1 = self.get_menu_items(r1.id, limit=10)
            items2 = self.get_menu_items(r2.id, limit=10)
            
            if len(items1) < 2 or not items2 or not cuisines:
                return None
            
            i1, i2 = random.sample(items1, 2)
            variables.update({
                "RESTAURANT_1": r1.name,
                "RESTAURANT_1_ITEM_1": i1.name,
                "RESTAURANT_1_ITEM_2": i2.name,
                "RESTAURANT_2_ITEM": random.choice(items2).name,
                "CUISINE": random.choice(cuisines),
                "DELIVERY_OPTION": random.choice(["express", "priority"]),
            })
            return variables
        
        # ================================================================
        # 22. gift-coffee-order
        # ================================================================
        elif template_id == "gift-coffee-order":
            cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            coffee_cuisines = [c for c in cuisines if 'coffee' in c.lower() or 'cafe' in c.lower()]
            cuisine = random.choice(coffee_cuisines) if coffee_cuisines else random.choice(cuisines) if cuisines else "Coffee"
            
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "ADDRESS_TYPE": addr_type,
                "CUISINE": cuisine,
                "ITEM_QUANTITY": str(random.randint(1, 3)),
            })
            return variables
        
        # ================================================================
        # 23. list-affordable-cuisine
        # ================================================================
        elif template_id == "list-affordable-cuisine":
            cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if not cuisines:
                return None
            
            variables.update({
                "CUISINE": random.choice(cuisines),
                "RESULT_COUNT": str(random.randint(3, 5)),
            })
            return variables
        
        # ================================================================
        # 24. positive-order-review
        # ================================================================
        elif template_id == "positive-order-review":
            user_orders = self.get_user_orders(user.id)
            if not user_orders:
                return None
            
            order = random.choice(user_orders)
            review_keywords = ["delicious", "amazing", "fresh", "excellent", "fantastic", "perfect"]
            review_texts = [
                "The food was absolutely delicious and fresh!",
                "Great service and amazing taste!",
                "Best order I've had in a long time!",
                "Highly recommend, exceeded expectations!",
                "Perfect portion size and fantastic flavor!",
            ]
            
            variables.update({
                "RESTAURANT": order['restaurant_name'],
                "RATING": str(random.choice([4, 5])),
                "REVIEW_TEXT": random.choice(review_texts),
                "REVIEW_KEYWORDS": random.choice(review_keywords),
            })
            return variables
        
        # ================================================================
        # 25. nearest-coffee-cart
        # ================================================================
        elif template_id == "nearest-coffee-cart":
            rest_types = ["coffee shop", "cafe", "bakery", "breakfast spot"]
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_TYPE": random.choice(rest_types),
                "RESTAURANT_ITEM": random.choice(items).name,
            })
            return variables
        
        # ================================================================
        # 26. search-express-order
        # ================================================================
        elif template_id == "search-express-order":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "DELIVERY_OPTION": random.choice(["express", "priority"]),
            })
            return variables
        
        # ================================================================
        # 27. list-cheapest-items
        # ================================================================
        elif template_id == "list-cheapest-items":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "RESULT_COUNT": str(random.randint(3, 5)),
            })
            return variables
        
        # ================================================================
        # 28. find-matching-restaurant
        # ================================================================
        elif template_id == "find-matching-restaurant":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=20)
            if len(items) < 2:
                return None
            
            item1, item2 = random.sample(items, 2)
            variables.update({
                "RESTAURANT_ITEM_1": item1.name,
                "RESTAURANT_ITEM_2": item2.name,
            })
            return variables
        
        # ================================================================
        # 29. top-liked-entrees
        # ================================================================
        elif template_id == "top-liked-entrees":
            restaurant = random.choice(restaurants[:5])
            menu_cats = self.get_menu_categories(restaurant.id)
            
            variables.update({
                "RESTAURANT": restaurant.name,
                "MENU_CATEGORY": random.choice(menu_cats) if menu_cats else "entrees",
                "ITEM_COUNT": str(random.randint(2, 5)),
                "ADDRESS_TYPE": addr_type,
            })
            return variables
        
        # ================================================================
        # 30. scheduled-best-item
        # ================================================================
        elif template_id == "scheduled-best-item":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            delivery_slots = self.get_delivery_time_slots()
            if not items:
                return None
            
            base_times = ["12:00 PM", "1:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"]
            time_offsets = ["30 minutes", "1 hour", "1.5 hours", "2 hours"]
            
            variables.update({
                "RESTAURANT_ITEM": random.choice(items).name,
                "ADDRESS_TYPE": addr_type,
                "BASE_TIME": random.choice(base_times),
                "TIME_OFFSET": random.choice(time_offsets),
                "SCHEDULED_TIME": random.choice(delivery_slots) if delivery_slots else "6:00 PM",
            })
            return variables
        
        # ================================================================
        # 31. healthy-fixed-order
        # ================================================================
        elif template_id == "healthy-fixed-order":
            sections = self.get_restaurant_sections()
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=20)
            if len(items) < 3:
                return None
            
            i1, i2, i3 = random.sample(items, 3)
            variables.update({
                "SECTION": random.choice(sections),
                "RESTAURANT": restaurant.name,
                "ITEM_1": i1.name,
                "ITEM_1_NAME": i1.name,  # Alias for grader
                "ITEM_1_QTY": str(random.randint(1, 2)),
                "ITEM_2": i2.name,
                "ITEM_2_NAME": i2.name,  # Alias for grader
                "ITEM_2_QTY": str(random.randint(1, 2)),
                "ITEM_3": i3.name,
                "ITEM_3_NAME": i3.name,  # Alias for grader
                "ITEM_3_QTY": str(random.randint(1, 2)),
            })
            return variables
        
        # ================================================================
        # 32. scheduled-group-order
        # ================================================================
        elif template_id == "scheduled-group-order":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            delivery_slots = self.get_delivery_time_slots()
            if not items or not delivery_slots:
                return None
            
            variables.update({
                "RESTAURANT": restaurant.name,
                "RESTAURANT_ITEM": random.choice(items).name,
                "ITEM_QUANTITY": str(random.randint(2, 6)),
                "SCHEDULED_TIME": random.choice(delivery_slots),
            })
            return variables
        
        # ================================================================
        # 33. update-cart-quantity
        # ================================================================
        elif template_id == "update-cart-quantity":
            user_carts = self.get_user_carts(user.id)
            if not user_carts:
                return None
            in_range_ids = {r.id for r in restaurants}
            valid_carts = [c for c in user_carts if c['store_id'] in in_range_ids]
            if not valid_carts:
                return None
            cart = random.choice(valid_carts)
            variables.update({
                "RESTAURANT": cart['restaurant_name'],
                "TARGET_QUANTITY": str(random.randint(2, 5)),
            })
            return variables
        
        elif template_id == "build-specific-cart":
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=20)
            if len(items) < 3:
                return None
            i1, i2, i3 = random.sample(items, 3)
            variables.update({
                "RESTAURANT": restaurant.name,
                "ITEM_1": i1.name, "ITEM_1_QTY": str(random.randint(1, 2)),
                "ITEM_2": i2.name, "ITEM_2_QTY": str(random.randint(1, 2)),
                "ITEM_3": i3.name, "ITEM_3_QTY": str(random.randint(1, 2)),
            })
            return variables
        
        elif template_id == "list-menu-options":
            restaurant = random.choice(restaurants[:5])
            menu_cats = self.get_menu_categories(restaurant.id)
            variables.update({
                "RESTAURANT": restaurant.name,
                "ITEM_CATEGORY": random.choice(menu_cats) if menu_cats else "entrees",
            })
            return variables
        
        elif template_id == "list-rated-restaurants":
            cuisines = self.get_available_cuisines(address.latitude, address.longitude)
            if not cuisines:
                return None
            restaurant = random.choice(restaurants[:5])
            items = self.get_menu_items(restaurant.id, limit=10)
            if not items:
                return None
            variables.update({
                "CUISINE": random.choice(cuisines),
                "RESTAURANT_ITEM": random.choice(items).name,
                "MIN_RATING": str(random.choice([3, 3.5, 4, 4.5])),
                "MAX_DISTANCE": str(random.choice([5, 10, 15])),
            })
            return variables
        
        # Default fallback
        restaurant = random.choice(restaurants[:5]) if restaurants else None
        if restaurant:
            items = self.get_menu_items(restaurant.id, limit=10)
            menu_cats = self.get_menu_categories(restaurant.id)
            if items:
                variables.update({
                    "RESTAURANT_NAME": restaurant.name,
                    "RESTAURANT": restaurant.name,
                    "RESTAURANT_ITEM": random.choice(items).name,
                    "ADDRESS_TYPE": addr_type,
                    "MENU_CATEGORY": random.choice(menu_cats) if menu_cats else "entrees",
                })
        return variables
    
    def generate_pre_auth_assignments(self, count: int) -> List[bool]:
        """Generate a shuffled list of pre-auth assignments for exact percentage split.
        
        Args:
            count: Number of tasks to generate assignments for.
            
        Returns:
            A shuffled list of booleans where True means pre-auth, False means explicit-login.
            The ratio of True values matches PRE_AUTH_PERCENTAGE as closely as possible.
        """
        num_pre_auth = round(count * PRE_AUTH_PERCENTAGE)
        assignments = [True] * num_pre_auth + [False] * (count - num_pre_auth)
        random.shuffle(assignments)
        return assignments
    
    def generate_task_from_template(
        self,
        template: Dict[str, Any],
        task_id: str,
        variables: Dict[str, str],
        use_pre_auth: bool = False
    ) -> Dict[str, Any]:
        """Generate a task from a template with variable substitution.
        
        Args:
            template: The template dict to use.
            task_id: The unique task identifier.
            variables: Variables to substitute in the template.
            use_pre_auth: If True, use simulator_config for pre-authentication.
                          If False, keep explicit login in task_statement.
        """
        task = copy.deepcopy(template)
        task = substitute_placeholders(task, variables)
        task["task_id"] = task_id
        
        if use_pre_auth and "USER_EMAIL" in variables:
            # Add user to bootstrap_data for pre-authentication
            if "simulator_config" not in task:
                task["simulator_config"] = {}
            if "bootstrap_data" not in task["simulator_config"]:
                task["simulator_config"]["bootstrap_data"] = {}
            
            task["simulator_config"]["bootstrap_data"]["user"] = variables["USER_EMAIL"]
            
            # Remove login instruction from task_statement
            if "task_statement" in task:
                task["task_statement"] = remove_login_prefix(task["task_statement"])
        
        return task
    
    def get_users_for_template(self, template_id: str) -> List[User]:
        """Get appropriate user pool based on template requirements."""
        # Templates requiring order history
        order_templates = {
            "rate-last-order", "reorder-with-addons", "top-rated-history",
            "helpful-review-items", "positive-order-review"
        }
        # Templates requiring cart data
        cart_templates = {
            "replace-cart-item", "clear-invalid-carts", "update-cart-quantity"
        }
        
        if template_id in order_templates:
            users = self.get_users_with_orders()
            print(f"   [INFO] Found {len(users)} users with orders")
        elif template_id in cart_templates:
            users = self.get_users_with_carts()
            print(f"   [INFO] Found {len(users)} users with carts")
        else:
            users = self.get_users_with_addresses()
        return users
    
    def load_predefined_tasks(self, path: str = "config/predefined_tasks.json") -> Dict[str, Dict]:
        """Load predefined tasks indexed by template_id."""
        predefined = {}
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                tasks = json.load(f)
            for task in tasks:
                tid = task.get('template_id', task.get('task_id', '').split('-')[0])
                if tid:
                    predefined[tid] = task
            print(f"[OK] Loaded {len(predefined)} predefined tasks from: {path}")
        return predefined
    
    def generate_all_tasks(
        self,
        templates: List[Dict[str, Any]],
        max_tasks_per_template: int = 10,
        max_total_tasks: Optional[int] = None,
        include_predefined: bool = True
    ) -> List[Dict[str, Any]]:
        tasks = []
        
        # Load predefined tasks (these become the -001 tasks)
        predefined_tasks = self.load_predefined_tasks() if include_predefined else {}
        
        # Track which predefined tasks have been added
        added_predefined_template_ids: Set[str] = set()
        
        used_users: Set[int] = set()
        
        for template in templates:
            # Extract template_id from template_settings
            template_settings = template.get("template_settings", {})
            template_id = template_settings.get("template_id", "unknown")
            template_task_count = 0
            
            print(f"\n[TEMPLATE] Processing: {template_id}")
            
            # Add predefined task as -001 if it exists
            if template_id in predefined_tasks:
                predefined = copy.deepcopy(predefined_tasks[template_id])
                predefined['task_id'] = f"{template_id}-001"
                
                # If predefined task has simulator_config.bootstrap_data.user, remove login prefix
                if predefined.get("simulator_config", {}).get("bootstrap_data", {}).get("user"):
                    if "task_statement" in predefined:
                        predefined["task_statement"] = remove_login_prefix(predefined["task_statement"])
                    auth_mode = "pre-auth"
                else:
                    auth_mode = "explicit-login"
                
                tasks.append(predefined)
                template_task_count = 1
                added_predefined_template_ids.add(template_id)
                print(f"   [+] Task {template_id}-001: (predefined, {auth_mode})")
            
            # Get appropriate user pool for this template
            users = self.get_users_for_template(template_id)
            
            # Pre-compute pre-auth assignments for exact percentage split
            # Account for predefined task if it exists (it takes slot 1)
            slots_available = max_tasks_per_template - template_task_count
            pre_auth_assignments = self.generate_pre_auth_assignments(slots_available)
            assignment_index = 0
            
            for user in users:
                if max_total_tasks and len(tasks) >= max_total_tasks:
                    # Before returning, add any remaining predefined tasks
                    tasks = self._add_remaining_predefined_tasks(
                        tasks, predefined_tasks, added_predefined_template_ids
                    )
                    return tasks
                    
                if template_task_count >= max_tasks_per_template:
                    break
                    
                if user.id in used_users:
                    continue
                
                address = next((a for a in user.addresses if a.is_default), 
                              user.addresses[0] if user.addresses else None)
                if not address:
                    continue
                
                variables = self.generate_variables_for_template(template_id, user, address)
                if not variables:
                    continue
                
                # Get pre-auth assignment from pre-computed list
                use_pre_auth = pre_auth_assignments[assignment_index] if assignment_index < len(pre_auth_assignments) else False
                assignment_index += 1
                
                # Task ID: template_id-001, template_id-002, etc.
                template_task_count += 1
                task_id = f"{template_id}-{template_task_count:03d}"
                task = self.generate_task_from_template(template, task_id, variables, use_pre_auth)
                
                tasks.append(task)
                used_users.add(user.id)
                
                # Determine auth mode for logging
                auth_mode = "pre-auth" if task.get("simulator_config", {}).get("bootstrap_data", {}).get("user") else "explicit-login"
                print(f"   [+] Task {task_id}: {user.email} ({auth_mode})")
            
            if template_task_count == 0:
                print(f"   [WARN] No tasks generated - insufficient data for this template")
        
        # After processing all templates, add any remaining predefined tasks
        # that weren't matched to a template
        tasks = self._add_remaining_predefined_tasks(
            tasks, predefined_tasks, added_predefined_template_ids
        )
        
        return tasks
    
    def _add_remaining_predefined_tasks(
        self,
        tasks: List[Dict[str, Any]],
        predefined_tasks: Dict[str, Dict],
        added_predefined_template_ids: Set[str]
    ) -> List[Dict[str, Any]]:
        """Add any predefined tasks that haven't been added yet."""
        remaining_predefined = set(predefined_tasks.keys()) - added_predefined_template_ids
        
        if remaining_predefined:
            print(f"\n[PREDEFINED] Adding {len(remaining_predefined)} predefined task(s) without matching templates:")
            
            for template_id in sorted(remaining_predefined):
                predefined = copy.deepcopy(predefined_tasks[template_id])
                predefined['task_id'] = f"{template_id}-001"
                
                # If predefined task has simulator_config.bootstrap_data.user, remove login prefix
                if predefined.get("simulator_config", {}).get("bootstrap_data", {}).get("user"):
                    if "task_statement" in predefined:
                        predefined["task_statement"] = remove_login_prefix(predefined["task_statement"])
                    auth_mode = "pre-auth"
                else:
                    auth_mode = "explicit-login"
                
                tasks.append(predefined)
                print(f"   [+] Task {template_id}-001: (predefined, no template, {auth_mode})")
        
        return tasks
    
    def save_tasks(self, tasks: List[Dict[str, Any]], output_path: str) -> None:
        """Save tasks to a CSV file with the specified columns."""
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
        
        # CSV columns
        columns = [
            'full_task_json',
            'task_category_L1',
            'task_category_L2', 
            'task_capability',
            'task',
            'policy_model',
            'sumpass@10',
            'difficulty',
            'grader_summary'
        ]
        
        with open(output_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(columns)
            
            for task in tasks:
                # Extract template_settings for category info
                template_settings = task.get('template_settings', {})
                template_id = template_settings.get("template_id", "unknown")
                
                # Get categories from template_settings
                task_category_L1 = template_settings.get("task_category_L1", [])
                task_category_L2 = template_settings.get("task_category_L2", [])
                task_capability = template_settings.get("capability", [])
                
                # Create a clean task object without template_settings and with template_id
                clean_task = {k: v for k, v in task.items() if k != 'template_settings'}
                clean_task['template_id'] = template_id
                
                # Get task statement
                task_statement = task.get("task_statement", "")
                
                row = [
                    json.dumps(clean_task, ensure_ascii=False, indent=2),  # full_task_json
                    json.dumps(task_category_L1),                # task_category_L1
                    json.dumps(task_category_L2),                # task_category_L2
                    json.dumps(task_capability),                 # task_capability
                    task_statement,                              # task
                    "",  # policy_model (empty)
                    "",  # sumpass@10 (empty)
                    "",  # difficulty (empty)
                    "",  # grader_summary (empty)
                ]
                writer.writerow(row)
        
        print(f"\n[SAVED] {len(tasks)} tasks to: {output_path}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate task configurations from DashDoor database')
    parser.add_argument('--template', default='config/templates.json', help='Path to templates JSON file')
    parser.add_argument('--template-index', type=int, default=None, help='Use specific template index only')
    parser.add_argument('--db', default='data/db/dashdoor.db', help='Path to SQLite database file')
    parser.add_argument('--output', default='config/generated_tasks.csv', help='Output CSV file path')
    parser.add_argument('--radius', type=float, default=10.0, help='Search radius in miles')
    parser.add_argument('--max-per-template', type=int, default=5, help='Max tasks per template type')
    parser.add_argument('--max-total', type=int, default=None, help='Max total tasks to generate')
    parser.add_argument('--seed', type=int, default=None, help='Random seed')
    parser.add_argument('--pre-auth-pct', type=float, default=0.70, 
                        help='Percentage of tasks to use pre-authentication via simulator_config (0.0-1.0, default: 0.70)')
    
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
    
    # Update the global pre-auth percentage
    global PRE_AUTH_PERCENTAGE
    PRE_AUTH_PERCENTAGE = args.pre_auth_pct
    
    print("=" * 60)
    print("DashDoor Task Generator")
    print("=" * 60)
    print(f"Template file: {args.template}")
    print(f"Database: {args.db}")
    print(f"Max per template: {args.max_per_template}")
    print(f"Max total: {args.max_total or 'unlimited'}")
    print(f"Pre-auth percentage: {args.pre_auth_pct * 100:.0f}%")
    print("=" * 60)
    
    try:
        all_templates = load_templates(args.template)
        
        if args.template_index is not None:
            if args.template_index >= len(all_templates):
                print(f"[ERROR] Template index {args.template_index} out of range")
                sys.exit(1)
            templates = [all_templates[args.template_index]]
            print(f"[INFO] Using template index {args.template_index}: {templates[0].get('template_settings', {}).get('template_id', 'unknown')}")
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
            max_total_tasks=args.max_total
        )
        
        if tasks:
            generator.save_tasks(tasks, args.output)
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