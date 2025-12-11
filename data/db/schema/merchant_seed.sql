-- ===========================================
-- SEED DATA FOR MERCHANT DATABASE
-- ===========================================

-- Note: Insert merchants first (without primary_store_id), then stores, then update merchants with primary_store_id

-- ===========================================
-- MERCHANTS
-- ===========================================
INSERT INTO merchants (id, email, password, first_name, last_name, user_phone, primary_store_id, primary_business_type, onboarding_completed, onboarding_step, onboarding_data, created_at, updated_at) VALUES
('merchant-1', 'portland.grill@dashdoor.merchant', 'merchant@123', 'John', 'Smith', '17649975265', NULL, 'Restaurant', 1, 5, '{"orderProtocol":{"orderMethod":"pos","posPartner":"Toast"},"storeHours":{"applyToAllDays":true,"allDaysOpen":"08:00 AM","allDaysClose":"10:00 PM"},"menuCompleted":true,"pricing":{"selectedPlan":"premier"},"payout":{"bankAccount":{"accountNumber":"4532198760","financialInstitutionNumber":"003","transitNumber":"12345"},"company":{"legalBusinessName":"Portland Grill Inc.","registeredBusinessAddress":"Forcella, 33 N Square, Boston, MA 02113","sameAsStoreAddress":true,"entityType":"COMPANY","businessType":"LOCAL","numberOfLocations":"TWO_FIVE","hasFranchiseeLocations":"no","gstNumber":"123456789"},"representative":{"firstName":"John","lastName":"Smith","personalAddress":"45 Harbor View Dr, Boston, MA 02110","dateOfBirth":"15/03/1985","email":"john.smith@portlandgrill.com","phone":"1 (764) 997-5265"}}}', '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('merchant-2', 'talias.kitchen@dashdoor.merchant', 'merchant@456', 'Talia', 'Rodriguez', '16923491437', NULL, 'Restaurant', 0, 2, '{"orderProtocol":{"orderMethod":"tablet"},"storeHours":{"applyToAllDays":true,"allDaysOpen":"09:00 AM","allDaysClose":"09:00 PM"}}', '2024-02-20T14:30:00.000Z', '2024-02-20T14:30:00.000Z'),
('merchant-3', 'urban.grill@dashdoor.merchant', 'merchant@789', 'Marcus', 'Chen', '19906139699', NULL, 'Restaurant', 1, 5, '{"orderProtocol":{"orderMethod":"pos","posPartner":"Square"},"storeHours":{"applyToAllDays":true,"allDaysOpen":"10:00 AM","allDaysClose":"11:00 PM"},"menuCompleted":true,"pricing":{"selectedPlan":"plus"},"payout":{"bankAccount":{"accountNumber":"7891234560","financialInstitutionNumber":"006","transitNumber":"54321"},"company":{"legalBusinessName":"Urban Grill LLC","registeredBusinessAddress":"100 Atlantic Ave, Boston, MA 02110","sameAsStoreAddress":true,"entityType":"COMPANY","businessType":"LOCAL","numberOfLocations":"TWO_FIVE","hasFranchiseeLocations":"no","gstNumber":"987654321"},"representative":{"firstName":"Marcus","lastName":"Chen","personalAddress":"88 Beacon St, Boston, MA 02108","dateOfBirth":"22/07/1982","email":"marcus.chen@urbangrill.com","phone":"1 (990) 613-9699"}}}', '2024-03-10T09:15:00.000Z', '2024-03-10T09:15:00.000Z');

-- ===========================================
-- STORES
-- ===========================================
INSERT INTO stores (id, name, email, phone, business_type, owner_id, created_at, opening_hour, closing_hour) VALUES
('store-1', 'Portland Grill', 'portland.grill@dashdoor.merchant', '17649975265', 'Restaurant', 'merchant-1', '2024-01-15T10:00:00.000Z', '08:00', '22:00'),
('store-2', 'Urban Grill', 'urban.grill@dashdoor.merchant', '19906139699', 'Restaurant', 'merchant-3', '2024-03-10T09:15:00.000Z', '10:00', '23:00'),
('store-3', 'Talia''s Kitchen', 'talias.kitchen@dashdoor.merchant', '16923491437', 'Restaurant', 'merchant-2', '2024-02-20T14:30:00.000Z', '09:00', '21:00'),
('store-4', 'Seafood Market', 'seafood.market@dashdoor.merchant', '13056827799', 'Restaurant', 'merchant-1', '2024-04-05T11:00:00.000Z', '11:00', '21:00'),
('store-5', 'Aiden''s Smokehouse', 'aidens.smokehouse@dashdoor.merchant', '16113988014', 'Restaurant', 'merchant-3', '2024-05-12T08:30:00.000Z', '11:00', '22:00');

-- Update merchants with primary_store_id
UPDATE merchants SET primary_store_id = 'store-1' WHERE id = 'merchant-1';
UPDATE merchants SET primary_store_id = 'store-3' WHERE id = 'merchant-2';
UPDATE merchants SET primary_store_id = 'store-2' WHERE id = 'merchant-3';

-- ===========================================
-- ADDRESSES (Store Addresses)
-- ===========================================
INSERT INTO addresses (store_id, street, city, state, zip_code, latitude, longitude, is_primary) VALUES
('store-1', 'Forcella, 33 N Square', 'Boston', 'MA', '02113', 42.3634893, -71.0538665, 1),
('store-2', '100 Atlantic Ave', 'Boston', 'MA', '02110', 42.361976, -71.0506589, 1),
('store-3', '267 S Euclid St', 'Anaheim', 'CA', '92801', 33.8297042, -117.9418796, 1),
('store-4', 'Penang Malaysian Cuisine, 685 Washington St', 'Boston', 'MA', '02116', 42.3513535, -71.0630597, 1),
('store-5', '239 Meridian St', 'Boston', 'MA', '02128', 42.3758196, -71.0389097, 1);

-- ===========================================
-- MERCHANT_STORES (Junction Table)
-- ===========================================
INSERT INTO merchant_stores (merchant_id, store_id, role, created_at) VALUES
('merchant-1', 'store-1', 'owner', '2024-01-15T10:00:00.000Z'),
('merchant-1', 'store-4', 'owner', '2024-04-05T11:00:00.000Z'),
('merchant-2', 'store-3', 'owner', '2024-02-20T14:30:00.000Z'),
('merchant-3', 'store-2', 'owner', '2024-03-10T09:15:00.000Z'),
('merchant-3', 'store-5', 'owner', '2024-05-12T08:30:00.000Z');

-- ===========================================
-- MENU CATEGORIES
-- ===========================================
INSERT INTO menu_categories (id, store_id, name, description, display_order, is_active, created_at) VALUES
-- Portland Grill categories
('cat-1', 'store-1', 'Street Tacos', 'Seasonal street tacos built for DashDoor delivery.', 1, 1, '2024-01-15T10:00:00.000Z'),
('cat-2', 'store-1', 'Bowls & Salads', 'Seasonal bowls & salads built for DashDoor delivery.', 2, 1, '2024-01-15T10:00:00.000Z'),
('cat-3', 'store-1', 'Starters', 'Guest favourites that showcase the Portland Grill kitchen.', 3, 1, '2024-01-15T10:00:00.000Z'),
('cat-4', 'store-1', 'Beverages', 'Signature beverages curated by the chefs at Portland Grill.', 4, 1, '2024-01-15T10:00:00.000Z'),
('cat-5', 'store-1', 'Desserts', 'Seasonal desserts built for DashDoor delivery.', 5, 1, '2024-01-15T10:00:00.000Z'),
-- Urban Grill categories
('cat-6', 'store-2', 'Burgers', 'Signature burgers made fresh daily.', 1, 1, '2024-03-10T09:15:00.000Z'),
('cat-7', 'store-2', 'Sides', 'Perfect accompaniments to any meal.', 2, 1, '2024-03-10T09:15:00.000Z'),
('cat-8', 'store-2', 'Drinks', 'Refreshing beverages.', 3, 1, '2024-03-10T09:15:00.000Z'),
-- Talia's Kitchen categories
('cat-9', 'store-3', 'Main Dishes', 'Authentic home-style cooking.', 1, 1, '2024-02-20T14:30:00.000Z'),
('cat-10', 'store-3', 'Appetizers', 'Start your meal right.', 2, 1, '2024-02-20T14:30:00.000Z');

-- ===========================================
-- MENU ITEMS
-- ===========================================
INSERT INTO menu_items (id, store_id, category_id, name, description, image, pickup_price, delivery_price, status, calories, display_order, is_available, created_at, updated_at) VALUES
-- Portland Grill items
('item-1', 'store-1', 'cat-2', 'Toasted Farro Power Bowl', 'Nutrient-rich farro with roasted vegetables and tahini dressing.', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639051/dashdoor/menu_items/9.jpg', 1750, 1850, 'In stock', 520, 1, 1, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('item-2', 'store-1', 'cat-2', 'Charred Broccoli Grain Bowl', 'Charred broccoli with quinoa and lemon herb vinaigrette.', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639057/dashdoor/menu_items/10.jpg', 1450, 1550, 'In stock', 480, 2, 1, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('item-3', 'store-1', 'cat-2', 'Citrus Ginger Salmon Bowl', 'Fresh salmon with citrus ginger glaze over rice.', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639063/dashdoor/menu_items/11.jpg', 1900, 2000, 'In stock', 650, 3, 1, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('item-4', 'store-1', 'cat-3', 'Smoked Salmon Tartine', 'House-smoked salmon on sourdough with caper cream.', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639070/dashdoor/menu_items/13.jpg', 2000, 2100, 'In stock', 380, 1, 1, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('item-5', 'store-1', 'cat-3', 'Charred Shishito Peppers', 'Blistered shishito peppers with sea salt and lime.', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639077/dashdoor/menu_items/14.jpg', 1400, 1500, 'In stock', 120, 2, 1, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
-- Urban Grill items
('item-6', 'store-2', 'cat-6', 'Classic Burger', 'Angus beef patty with lettuce, tomato, and special sauce.', NULL, 1299, 1399, 'In stock', 750, 1, 1, '2024-03-10T09:15:00.000Z', '2024-03-10T09:15:00.000Z'),
('item-7', 'store-2', 'cat-6', 'Bacon Cheeseburger', 'Angus beef with crispy bacon and aged cheddar.', NULL, 1499, 1599, 'In stock', 920, 2, 1, '2024-03-10T09:15:00.000Z', '2024-03-10T09:15:00.000Z'),
('item-8', 'store-2', 'cat-7', 'Truffle Fries', 'Hand-cut fries with truffle oil and parmesan.', NULL, 799, 899, 'In stock', 450, 1, 1, '2024-03-10T09:15:00.000Z', '2024-03-10T09:15:00.000Z'),
-- Talia's Kitchen items
('item-9', 'store-3', 'cat-9', 'Chicken Parmesan', 'Breaded chicken breast with marinara and mozzarella.', NULL, 1699, 1799, 'In stock', 680, 1, 1, '2024-02-20T14:30:00.000Z', '2024-02-20T14:30:00.000Z'),
('item-10', 'store-3', 'cat-10', 'Bruschetta', 'Toasted bread with fresh tomatoes and basil.', NULL, 899, 999, 'In stock', 280, 1, 1, '2024-02-20T14:30:00.000Z', '2024-02-20T14:30:00.000Z');

-- ===========================================
-- MODIFIERS
-- ===========================================
INSERT INTO modifiers (id, store_id, name, status, timing, is_required, allow_multiple_options, allow_multiple_same, allow_free_options, created_at, updated_at) VALUES
('mod-1', 'store-1', 'Choose your sides', 'In stock', NULL, 0, 1, 0, 0, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('mod-2', 'store-1', 'Select protein', 'In stock', NULL, 0, 1, 0, 0, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('mod-3', 'store-1', 'Spice level', 'In stock', NULL, 1, 0, 0, 0, '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
('mod-4', 'store-2', 'Burger doneness', 'In stock', NULL, 1, 0, 0, 0, '2024-03-10T09:15:00.000Z', '2024-03-10T09:15:00.000Z'),
('mod-5', 'store-2', 'Add toppings', 'In stock', NULL, 0, 1, 1, 0, '2024-03-10T09:15:00.000Z', '2024-03-10T09:15:00.000Z');

-- ===========================================
-- MODIFIER OPTIONS
-- ===========================================
INSERT INTO modifier_options (id, modifier_id, name, price, is_default, sort_order, created_at) VALUES
-- Choose your sides options
('opt-1', 'mod-1', 'Fries Upgrade', 125, 0, 1, '2024-01-15T10:00:00.000Z'),
('opt-2', 'mod-1', 'Sweet Potato Wedges', 175, 0, 2, '2024-01-15T10:00:00.000Z'),
('opt-3', 'mod-1', 'Sesame Sprinkle', 50, 0, 3, '2024-01-15T10:00:00.000Z'),
-- Select protein options
('opt-4', 'mod-2', 'Shrimp', 300, 0, 1, '2024-01-15T10:00:00.000Z'),
('opt-5', 'mod-2', 'Tofu', 150, 0, 2, '2024-01-15T10:00:00.000Z'),
('opt-6', 'mod-2', 'Chicken', 250, 0, 3, '2024-01-15T10:00:00.000Z'),
-- Spice level options
('opt-7', 'mod-3', 'Mild', 0, 1, 1, '2024-01-15T10:00:00.000Z'),
('opt-8', 'mod-3', 'Medium', 0, 0, 2, '2024-01-15T10:00:00.000Z'),
('opt-9', 'mod-3', 'Hot', 0, 0, 3, '2024-01-15T10:00:00.000Z'),
('opt-10', 'mod-3', 'Extra Hot', 25, 0, 4, '2024-01-15T10:00:00.000Z'),
-- Burger doneness options
('opt-11', 'mod-4', 'Medium Rare', 0, 0, 1, '2024-03-10T09:15:00.000Z'),
('opt-12', 'mod-4', 'Medium', 0, 1, 2, '2024-03-10T09:15:00.000Z'),
('opt-13', 'mod-4', 'Medium Well', 0, 0, 3, '2024-03-10T09:15:00.000Z'),
('opt-14', 'mod-4', 'Well Done', 0, 0, 4, '2024-03-10T09:15:00.000Z'),
-- Add toppings options
('opt-15', 'mod-5', 'Extra Cheese', 150, 0, 1, '2024-03-10T09:15:00.000Z'),
('opt-16', 'mod-5', 'Avocado', 200, 0, 2, '2024-03-10T09:15:00.000Z'),
('opt-17', 'mod-5', 'Fried Egg', 175, 0, 3, '2024-03-10T09:15:00.000Z');

-- ===========================================
-- MENU ITEM MODIFIERS (Junction Table)
-- ===========================================
INSERT INTO menu_item_modifiers (menu_item_id, modifier_id) VALUES
('item-1', 'mod-1'),
('item-1', 'mod-2'),
('item-2', 'mod-2'),
('item-3', 'mod-3'),
('item-6', 'mod-4'),
('item-6', 'mod-5'),
('item-7', 'mod-4'),
('item-7', 'mod-5');

-- ===========================================
-- ORDERS
-- ===========================================
INSERT INTO orders (id, store_id, customer_name, customer_id, customer_email, status, order_date, scheduled_date, fulfillment_type, channel, delivery_street, delivery_city, delivery_state, delivery_zip_code, delivery_business, delivery_latitude, delivery_longitude, subtotal, service_fee, delivery_fee, tip_amount, total, created_at, updated_at) VALUES
('order-1', 'store-1', 'Kai Hayes', 'user-1', 'kai.hayes1@example.com', 'delivered', '2024-12-10T14:30:00.000Z', NULL, 'delivery', 'DashDoor', '700 N Brookhurst St', 'Anaheim', 'CA', '92801', NULL, 33.8402032, -117.9587196, 3700, 555, 399, 500, 5154, '2024-12-10T14:30:00.000Z', '2024-12-10T15:45:00.000Z'),
('order-2', 'store-1', 'Nora Chambers', 'user-2', 'nora.chambers2@mail.test', 'preparing', '2024-12-11T12:15:00.000Z', NULL, 'delivery', 'DashDoor', 'Naruto Ramen, 276 5th Ave', 'Brooklyn', 'NY', '11215', 'Naruto Ramen', 40.6744186, -73.9821765, 2850, 428, 399, 400, 4077, '2024-12-11T12:15:00.000Z', '2024-12-11T12:20:00.000Z'),
('order-3', 'store-1', 'Hannah Young', 'user-3', 'hannah.young3@example.com', 'pending', '2024-12-11T13:00:00.000Z', NULL, 'pickup', 'DashDoor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1900, 285, 0, 0, 2185, '2024-12-11T13:00:00.000Z', '2024-12-11T13:00:00.000Z'),
('order-4', 'store-2', 'Elias Fischer', 'user-4', 'elias.fischer4@example.com', 'delivered', '2024-12-09T18:45:00.000Z', NULL, 'delivery', 'DashDoor', '16 Oak Grove Ave', 'Malden', 'MA', '02148', NULL, 42.4409796, -71.0684754, 2798, 420, 399, 600, 4217, '2024-12-09T18:45:00.000Z', '2024-12-09T19:30:00.000Z'),
('order-5', 'store-2', 'Quinn Chambers', 'user-5', 'quinn.chambers5@inbox.local', 'confirmed', '2024-12-11T11:30:00.000Z', NULL, 'pickup', 'DashDoor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1299, 195, 0, 0, 1494, '2024-12-11T11:30:00.000Z', '2024-12-11T11:35:00.000Z'),
('order-6', 'store-3', 'Kai Hayes', 'user-1', 'kai.hayes1@example.com', 'scheduled', '2024-12-11T09:00:00.000Z', '2024-12-12T18:00:00.000Z', 'pickup', 'DashDoor', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2598, 390, 0, 0, 2988, '2024-12-11T09:00:00.000Z', '2024-12-11T09:00:00.000Z');

-- ===========================================
-- ORDER ITEMS
-- ===========================================
INSERT INTO order_items (id, order_id, menu_item_id, name, quantity, price, image, created_at) VALUES
-- Order 1 items
('oi-1', 'order-1', 'item-1', 'Toasted Farro Power Bowl', 1, 1850, 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639051/dashdoor/menu_items/9.jpg', '2024-12-10T14:30:00.000Z'),
('oi-2', 'order-1', 'item-3', 'Citrus Ginger Salmon Bowl', 1, 2000, 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639063/dashdoor/menu_items/11.jpg', '2024-12-10T14:30:00.000Z'),
-- Order 2 items
('oi-3', 'order-2', 'item-2', 'Charred Broccoli Grain Bowl', 1, 1550, 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639057/dashdoor/menu_items/10.jpg', '2024-12-11T12:15:00.000Z'),
('oi-4', 'order-2', 'item-5', 'Charred Shishito Peppers', 1, 1500, 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639077/dashdoor/menu_items/14.jpg', '2024-12-11T12:15:00.000Z'),
-- Order 3 items
('oi-5', 'order-3', 'item-3', 'Citrus Ginger Salmon Bowl', 1, 1900, 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639063/dashdoor/menu_items/11.jpg', '2024-12-11T13:00:00.000Z'),
-- Order 4 items
('oi-6', 'order-4', 'item-6', 'Classic Burger', 1, 1399, NULL, '2024-12-09T18:45:00.000Z'),
('oi-7', 'order-4', 'item-7', 'Bacon Cheeseburger', 1, 1599, NULL, '2024-12-09T18:45:00.000Z'),
-- Order 5 items
('oi-8', 'order-5', 'item-6', 'Classic Burger', 1, 1299, NULL, '2024-12-11T11:30:00.000Z'),
-- Order 6 items
('oi-9', 'order-6', 'item-9', 'Chicken Parmesan', 1, 1799, NULL, '2024-12-11T09:00:00.000Z'),
('oi-10', 'order-6', 'item-10', 'Bruschetta', 1, 999, NULL, '2024-12-11T09:00:00.000Z');

-- ===========================================
-- REVIEWS
-- ===========================================
INSERT INTO reviews (id, store_id, customer_id, customer_name, rating, content, timestamp, order_id, approval_status, created_at) VALUES
('review-1', 'store-1', 'user-1', 'Kai Hayes', 5.0, 'Absolutely incredible food! The Citrus Ginger Salmon Bowl was perfectly cooked and the flavors were amazing. Will definitely order again!', '2024-12-10T16:30:00.000Z', 'order-1', 'approved', '2024-12-10T16:30:00.000Z'),
('review-2', 'store-1', 'user-2', 'Nora Chambers', 4.0, 'Great healthy options. The Charred Broccoli Grain Bowl was delicious but portion could be slightly bigger. Fast delivery!', '2024-12-08T19:45:00.000Z', NULL, 'approved', '2024-12-08T19:45:00.000Z'),
('review-3', 'store-2', 'user-4', 'Elias Fischer', 5.0, 'Best burgers in town! The Bacon Cheeseburger was juicy and perfectly cooked. Truffle fries are a must-try!', '2024-12-09T20:15:00.000Z', 'order-4', 'approved', '2024-12-09T20:15:00.000Z'),
('review-4', 'store-2', 'user-3', 'Hannah Young', 3.0, 'Decent food but delivery took longer than expected. The Classic Burger was good but nothing exceptional.', '2024-12-07T14:20:00.000Z', NULL, 'approved', '2024-12-07T14:20:00.000Z'),
('review-5', 'store-3', 'user-1', 'Kai Hayes', 4.5, 'Authentic Italian flavors! The Chicken Parmesan reminded me of my trip to Italy. Bruschetta was fresh and tasty.', '2024-12-05T18:00:00.000Z', NULL, 'approved', '2024-12-05T18:00:00.000Z');

-- ===========================================
-- REVIEW LIKED ITEMS
-- ===========================================
INSERT INTO review_liked_items (review_id, menu_item_id) VALUES
('review-1', 'item-3'),  -- Citrus Ginger Salmon Bowl
('review-1', 'item-1'),  -- Toasted Farro Power Bowl
('review-2', 'item-2'),  -- Charred Broccoli Grain Bowl
('review-3', 'item-7'),  -- Bacon Cheeseburger
('review-3', 'item-8'),  -- Truffle Fries
('review-4', 'item-6'),  -- Classic Burger
('review-5', 'item-9'),  -- Chicken Parmesan
('review-5', 'item-10'); -- Bruschetta

-- ===========================================
-- REVIEW PHOTOS
-- ===========================================
INSERT INTO review_photos (id, review_id, url, sort_order, created_at) VALUES
('photo-1', 'review-1', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639063/dashdoor/menu_items/11.jpg', 1, '2024-12-10T16:30:00.000Z'),
('photo-2', 'review-3', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763639070/dashdoor/menu_items/13.jpg', 1, '2024-12-09T20:15:00.000Z');

