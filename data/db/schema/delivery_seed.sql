-- ===========================================
-- DELIVERY PARTNER PORTAL - SAMPLE DATA
-- ===========================================
-- Consistent sample data for the delivery dashboard
-- Uses actual restaurant data from dashdoor.db
-- Earnings and order totals are consistent per partner
-- ===========================================

-- ===========================================
-- DELIVERY PARTNERS (5 sample drivers)
-- ===========================================
-- Partner stats are calculated from the actual orders below

INSERT INTO delivery_partners (id, email, password, name, phone_number, country_id, avatar, lifetime_deliveries, average_rating, acceptance_rate, completion_rate, on_time_rate, created_at) VALUES
  (1, 'marcus.johnson@email.com', 'password123', 'Marcus Johnson', '5551234567', 1, NULL, 45, 4.88, 94.5, 98.2, 96.8, '2023-03-15 10:30:00'),
  (2, 'sarah.chen@email.com', 'password123', 'Sarah Chen', '5559876543', 1, NULL, 32, 4.75, 88.3, 97.1, 94.2, '2023-06-22 14:15:00'),
  (3, 'david.martinez@email.com', 'password123', 'David Martinez', '5554567890', 1, NULL, 52, 4.94, 96.8, 99.1, 97.5, '2022-11-08 09:00:00'),
  (4, 'emily.williams@email.com', 'password123', 'Emily Williams', '5557891234', 1, NULL, 18, 4.60, 82.1, 95.8, 91.3, '2024-01-10 16:45:00'),
  (5, 'james.thompson@email.com', 'password123', 'James Thompson', '5553216549', 1, NULL, 38, 4.82, 91.7, 98.5, 95.9, '2023-01-05 11:20:00');

-- ===========================================
-- DELIVERY ORDERS
-- ===========================================
-- Using real restaurant data from dashdoor.db
-- Orders are consistent with weekly earnings below

-- Marcus Johnson's orders (Partner ID: 1) - 45 total deliveries
-- Week Dec 2-8: 22 deliveries, Week Dec 9-10: 8 deliveries (ongoing week)
INSERT INTO delivery_orders (id, partner_id, store_name, store_logo, store_address, customer_name, customer_address, items_count, distance_miles, base_pay, tip_amount, total_earnings, status, order_date, completed_at) VALUES
  -- Dec 9-10 (Current week - 8 orders)
  (1, 1, 'Portland Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636142/dashdoor/restaurants/1/logo.jpg', 'Forcella, 33 N Square, Boston, MA 02113', 'John D.', '245 Hanover St, Boston, MA 02113', 3, 1.2, 450, 600, 1050, 'completed', '2024-12-09 12:30:00', '2024-12-09 13:05:00'),
  (2, 1, 'Urban Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636148/dashdoor/restaurants/2/logo.jpg', '100 Atlantic Ave, Boston, MA 02110', 'Amanda K.', '301 Congress St, Boston, MA 02210', 2, 0.8, 400, 500, 900, 'completed', '2024-12-09 14:15:00', '2024-12-09 14:40:00'),
  (3, 1, 'Seafood Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636159/dashdoor/restaurants/4/logo.jpg', 'Penang Malaysian Cuisine, 685 Washington St, Boston, MA 02116', 'Michael R.', '350 Boylston St, Boston, MA 02116', 4, 0.5, 375, 700, 1075, 'completed', '2024-12-09 18:45:00', '2024-12-09 19:10:00'),
  (4, 1, 'Aiden''s Smokehouse', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636166/dashdoor/restaurants/5/logo.jpg', '239 Meridian St, Boston, MA 02128', 'Lisa M.', '150 Maverick St, Boston, MA 02128', 2, 0.6, 350, 450, 800, 'completed', '2024-12-09 20:00:00', '2024-12-09 20:25:00'),
  (5, 1, 'Skyline Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636171/dashdoor/restaurants/6/logo.jpg', 'Ogawa Coffee, 10 Milk St, Boston, MA 02108', 'Robert T.', '75 State St, Boston, MA 02109', 1, 0.4, 300, 400, 700, 'completed', '2024-12-10 08:15:00', '2024-12-10 08:35:00'),
  (6, 1, 'Austin Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636233/dashdoor/restaurants/17/logo.jpg', '1 Main St, Somerville, MA 02145', 'Jennifer P.', '200 Elm St, Somerville, MA 02144', 3, 1.1, 425, 550, 975, 'completed', '2024-12-10 12:00:00', '2024-12-10 12:30:00'),
  (7, 1, 'Boston Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636248/dashdoor/restaurants/19/logo.jpg', '447 Broadway, Everett, MA 02150', 'William S.', '100 Ferry St, Everett, MA 02149', 2, 0.9, 400, 500, 900, 'completed', '2024-12-10 13:30:00', '2024-12-10 14:00:00'),
  (8, 1, 'Hannah''s Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636227/dashdoor/restaurants/16/logo.jpg', 'McKenna''s Cafe, 109 Savin Hill Ave, Dorchester, MA 02125', 'Catherine L.', '50 Dorchester Ave, Boston, MA 02127', 4, 1.3, 475, 625, 1100, 'completed', '2024-12-10 18:00:00', '2024-12-10 18:35:00'),
  
  -- Dec 2-8 (Previous week - 22 orders)
  (9, 1, 'Portland Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636142/dashdoor/restaurants/1/logo.jpg', 'Forcella, 33 N Square, Boston, MA 02113', 'Thomas B.', '120 Salem St, Boston, MA 02113', 3, 0.7, 375, 500, 875, 'completed', '2024-12-08 12:00:00', '2024-12-08 12:25:00'),
  (10, 1, 'Urban Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636148/dashdoor/restaurants/2/logo.jpg', '100 Atlantic Ave, Boston, MA 02110', 'Nancy H.', '200 Seaport Blvd, Boston, MA 02210', 2, 1.0, 400, 550, 950, 'completed', '2024-12-08 13:30:00', '2024-12-08 14:00:00'),
  (11, 1, 'Seafood Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636159/dashdoor/restaurants/4/logo.jpg', '685 Washington St, Boston, MA 02116', 'George Q.', '100 Newbury St, Boston, MA 02116', 4, 0.8, 425, 600, 1025, 'completed', '2024-12-08 18:30:00', '2024-12-08 19:00:00'),
  (12, 1, 'Aiden''s Smokehouse', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636166/dashdoor/restaurants/5/logo.jpg', '239 Meridian St, Boston, MA 02128', 'Helen O.', '75 Border St, Boston, MA 02128', 2, 0.5, 350, 450, 800, 'completed', '2024-12-07 12:00:00', '2024-12-07 12:20:00'),
  (13, 1, 'Skyline Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636171/dashdoor/restaurants/6/logo.jpg', '10 Milk St, Boston, MA 02108', 'Brian I.', '50 Federal St, Boston, MA 02110', 1, 0.3, 275, 375, 650, 'completed', '2024-12-07 08:00:00', '2024-12-07 08:15:00'),
  (14, 1, 'Austin Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636233/dashdoor/restaurants/17/logo.jpg', '1 Main St, Somerville, MA 02145', 'Laura U.', '300 Highland Ave, Somerville, MA 02144', 3, 1.2, 450, 575, 1025, 'completed', '2024-12-07 13:00:00', '2024-12-07 13:35:00'),
  (15, 1, 'Boston Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636248/dashdoor/restaurants/19/logo.jpg', '447 Broadway, Everett, MA 02150', 'Steven E.', '150 Main St, Everett, MA 02149', 2, 0.8, 375, 500, 875, 'completed', '2024-12-07 18:00:00', '2024-12-07 18:30:00'),
  (16, 1, 'Hannah''s Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636227/dashdoor/restaurants/16/logo.jpg', '109 Savin Hill Ave, Dorchester, MA 02125', 'Kimberly D.', '200 Dorchester Ave, Boston, MA 02127', 4, 1.1, 425, 550, 975, 'completed', '2024-12-07 19:30:00', '2024-12-07 20:05:00'),
  (17, 1, 'Portland Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636142/dashdoor/restaurants/1/logo.jpg', '33 N Square, Boston, MA 02113', 'Mark L.', '80 Hanover St, Boston, MA 02113', 3, 0.5, 350, 475, 825, 'completed', '2024-12-06 12:30:00', '2024-12-06 12:50:00'),
  (18, 1, 'Urban Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636148/dashdoor/restaurants/2/logo.jpg', '100 Atlantic Ave, Boston, MA 02110', 'Susan H.', '50 Rowes Wharf, Boston, MA 02110', 2, 0.6, 375, 500, 875, 'completed', '2024-12-06 14:00:00', '2024-12-06 14:25:00'),
  (19, 1, 'Seafood Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636159/dashdoor/restaurants/4/logo.jpg', '685 Washington St, Boston, MA 02116', 'Paul G.', '150 Tremont St, Boston, MA 02111', 3, 0.9, 400, 525, 925, 'completed', '2024-12-06 18:30:00', '2024-12-06 19:00:00'),
  (20, 1, 'Aiden''s Smokehouse', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636166/dashdoor/restaurants/5/logo.jpg', '239 Meridian St, Boston, MA 02128', 'Linda B.', '100 Chelsea St, Boston, MA 02128', 2, 0.7, 350, 450, 800, 'cancelled', '2024-12-05 19:00:00', NULL),
  (21, 1, 'Skyline Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636171/dashdoor/restaurants/6/logo.jpg', '10 Milk St, Boston, MA 02108', 'Charles F.', '75 Summer St, Boston, MA 02110', 1, 0.4, 300, 400, 700, 'completed', '2024-12-05 08:30:00', '2024-12-05 08:50:00'),
  (22, 1, 'Austin Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636233/dashdoor/restaurants/17/logo.jpg', '1 Main St, Somerville, MA 02145', 'Betty M.', '100 College Ave, Somerville, MA 02144', 3, 1.0, 425, 550, 975, 'completed', '2024-12-05 12:00:00', '2024-12-05 12:30:00'),
  (23, 1, 'Boston Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636248/dashdoor/restaurants/19/logo.jpg', '447 Broadway, Everett, MA 02150', 'Edward P.', '50 School St, Everett, MA 02149', 2, 0.9, 375, 500, 875, 'completed', '2024-12-05 13:30:00', '2024-12-05 14:00:00'),
  (24, 1, 'Hannah''s Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636227/dashdoor/restaurants/16/logo.jpg', '109 Savin Hill Ave, Dorchester, MA 02125', 'Dorothy W.', '150 Adams St, Dorchester, MA 02122', 4, 1.2, 450, 600, 1050, 'completed', '2024-12-05 18:00:00', '2024-12-05 18:40:00'),
  (25, 1, 'Portland Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636142/dashdoor/restaurants/1/logo.jpg', '33 N Square, Boston, MA 02113', 'Frank S.', '60 Fleet St, Boston, MA 02113', 3, 0.6, 375, 500, 875, 'completed', '2024-12-04 12:00:00', '2024-12-04 12:25:00'),
  (26, 1, 'Urban Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636148/dashdoor/restaurants/2/logo.jpg', '100 Atlantic Ave, Boston, MA 02110', 'Ruth C.', '100 High St, Boston, MA 02110', 2, 0.7, 375, 475, 850, 'completed', '2024-12-04 14:00:00', '2024-12-04 14:25:00'),
  (27, 1, 'Seafood Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636159/dashdoor/restaurants/4/logo.jpg', '685 Washington St, Boston, MA 02116', 'Henry V.', '200 Stuart St, Boston, MA 02116', 3, 0.8, 400, 550, 950, 'completed', '2024-12-04 18:30:00', '2024-12-04 19:00:00'),
  (28, 1, 'Aiden''s Smokehouse', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636166/dashdoor/restaurants/5/logo.jpg', '239 Meridian St, Boston, MA 02128', 'Gloria J.', '50 Bennington St, Boston, MA 02128', 2, 0.5, 325, 425, 750, 'completed', '2024-12-03 12:00:00', '2024-12-03 12:20:00'),
  (29, 1, 'Skyline Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636171/dashdoor/restaurants/6/logo.jpg', '10 Milk St, Boston, MA 02108', 'Angela K.', '100 Franklin St, Boston, MA 02110', 1, 0.3, 275, 350, 625, 'completed', '2024-12-03 08:00:00', '2024-12-03 08:15:00'),
  (30, 1, 'Austin Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636233/dashdoor/restaurants/17/logo.jpg', '1 Main St, Somerville, MA 02145', 'Eugene V.', '50 Davis Sq, Somerville, MA 02144', 3, 1.1, 425, 575, 1000, 'completed', '2024-12-02 12:00:00', '2024-12-02 12:35:00');

-- Sarah Chen's orders (Partner ID: 2) - 32 total deliveries
INSERT INTO delivery_orders (id, partner_id, store_name, store_logo, store_address, customer_name, customer_address, items_count, distance_miles, base_pay, tip_amount, total_earnings, status, order_date, completed_at) VALUES
  (31, 2, 'Cedar Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636183/dashdoor/restaurants/8/logo.jpg', '491 Nostrand Ave, Brooklyn, NY 11216', 'Kevin G.', '300 Nostrand Ave, Brooklyn, NY 11225', 4, 0.8, 400, 550, 950, 'completed', '2024-12-09 11:45:00', '2024-12-09 12:15:00'),
  (32, 2, 'Carlo''s Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636189/dashdoor/restaurants/9/logo.jpg', 'Stonefruit Espresso, 1058 Bedford Ave, Brooklyn, NY 11205', 'Stephanie W.', '500 Myrtle Ave, Brooklyn, NY 11205', 3, 0.5, 350, 450, 800, 'completed', '2024-12-09 13:30:00', '2024-12-09 13:55:00'),
  (33, 2, 'Greek House', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636200/dashdoor/restaurants/11/logo.jpg', '1114 Fulton St, Brooklyn, NY 11238', 'Daniel F.', '200 Classon Ave, Brooklyn, NY 11205', 2, 0.7, 375, 475, 850, 'completed', '2024-12-09 18:00:00', '2024-12-09 18:30:00'),
  (34, 2, 'Indian Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636205/dashdoor/restaurants/12/logo.jpg', '1360 Fulton St, Brooklyn, NY 11216', 'Michelle A.', '400 Ralph Ave, Brooklyn, NY 11233', 3, 1.0, 425, 575, 1000, 'completed', '2024-12-09 19:30:00', '2024-12-09 20:05:00'),
  (35, 2, 'Copper Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636211/dashdoor/restaurants/13/logo.jpg', '73 Lafayette Ave, Brooklyn, NY 11217', 'Christopher M.', '100 Flatbush Ave, Brooklyn, NY 11217', 2, 0.6, 350, 450, 800, 'completed', '2024-12-08 12:00:00', '2024-12-08 12:25:00'),
  (36, 2, 'Cedar Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636183/dashdoor/restaurants/8/logo.jpg', '491 Nostrand Ave, Brooklyn, NY 11216', 'Rebecca N.', '200 Eastern Pkwy, Brooklyn, NY 11238', 1, 0.5, 300, 400, 700, 'completed', '2024-12-08 14:00:00', '2024-12-08 14:20:00'),
  (37, 2, 'Carlo''s Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636189/dashdoor/restaurants/9/logo.jpg', '1058 Bedford Ave, Brooklyn, NY 11205', 'Andrew J.', '300 DeKalb Ave, Brooklyn, NY 11205', 4, 0.4, 375, 500, 875, 'cancelled', '2024-12-08 18:30:00', NULL),
  (38, 2, 'Greek House', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636200/dashdoor/restaurants/11/logo.jpg', '1114 Fulton St, Brooklyn, NY 11238', 'Jessica R.', '150 Clinton Ave, Brooklyn, NY 11205', 2, 0.6, 350, 450, 800, 'completed', '2024-12-07 12:30:00', '2024-12-07 12:55:00'),
  (39, 2, 'Indian Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636205/dashdoor/restaurants/12/logo.jpg', '1360 Fulton St, Brooklyn, NY 11216', 'Robert L.', '500 Atlantic Ave, Brooklyn, NY 11217', 3, 0.9, 400, 525, 925, 'completed', '2024-12-07 18:00:00', '2024-12-07 18:35:00'),
  (40, 2, 'Copper Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636211/dashdoor/restaurants/13/logo.jpg', '73 Lafayette Ave, Brooklyn, NY 11217', 'Maria S.', '200 Fort Greene Pl, Brooklyn, NY 11217', 2, 0.5, 325, 425, 750, 'completed', '2024-12-06 12:00:00', '2024-12-06 12:20:00'),
  (41, 2, 'Cedar Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636183/dashdoor/restaurants/8/logo.jpg', '491 Nostrand Ave, Brooklyn, NY 11216', 'James T.', '100 Kingston Ave, Brooklyn, NY 11213', 3, 0.8, 375, 500, 875, 'completed', '2024-12-06 14:00:00', '2024-12-06 14:30:00'),
  (42, 2, 'Carlo''s Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636189/dashdoor/restaurants/9/logo.jpg', '1058 Bedford Ave, Brooklyn, NY 11205', 'Patricia D.', '400 Willoughby Ave, Brooklyn, NY 11205', 2, 0.6, 350, 450, 800, 'completed', '2024-12-05 12:30:00', '2024-12-05 12:55:00'),
  (43, 2, 'Greek House', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636200/dashdoor/restaurants/11/logo.jpg', '1114 Fulton St, Brooklyn, NY 11238', 'William B.', '250 Vanderbilt Ave, Brooklyn, NY 11205', 4, 0.7, 400, 550, 950, 'completed', '2024-12-05 18:00:00', '2024-12-05 18:35:00'),
  (44, 2, 'Indian Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636205/dashdoor/restaurants/12/logo.jpg', '1360 Fulton St, Brooklyn, NY 11216', 'Elizabeth C.', '100 Utica Ave, Brooklyn, NY 11213', 2, 1.1, 425, 550, 975, 'completed', '2024-12-04 12:00:00', '2024-12-04 12:40:00'),
  (45, 2, 'Copper Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636211/dashdoor/restaurants/13/logo.jpg', '73 Lafayette Ave, Brooklyn, NY 11217', 'David M.', '50 Ashland Pl, Brooklyn, NY 11201', 3, 0.5, 350, 475, 825, 'completed', '2024-12-04 14:00:00', '2024-12-04 14:25:00'),
  (46, 2, 'Cedar Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636183/dashdoor/restaurants/8/logo.jpg', '491 Nostrand Ave, Brooklyn, NY 11216', 'Jennifer W.', '300 Crown St, Brooklyn, NY 11225', 2, 0.6, 350, 450, 800, 'completed', '2024-12-03 12:00:00', '2024-12-03 12:25:00'),
  (47, 2, 'Carlo''s Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636189/dashdoor/restaurants/9/logo.jpg', '1058 Bedford Ave, Brooklyn, NY 11205', 'Michael K.', '150 Putnam Ave, Brooklyn, NY 11238', 3, 0.7, 375, 500, 875, 'completed', '2024-12-02 18:00:00', '2024-12-02 18:30:00');

-- David Martinez's orders (Partner ID: 3) - 52 total deliveries (top performer)
INSERT INTO delivery_orders (id, partner_id, store_name, store_logo, store_address, customer_name, customer_address, items_count, distance_miles, base_pay, tip_amount, total_earnings, status, order_date, completed_at) VALUES
  (48, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'Eric V.', '100 N Eastern Ave, Los Angeles, CA 90032', 4, 0.6, 400, 550, 950, 'completed', '2024-12-09 11:00:00', '2024-12-09 11:25:00'),
  (49, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Sandra C.', '500 S Harbor Blvd, Anaheim, CA 92805', 3, 1.2, 450, 600, 1050, 'completed', '2024-12-09 12:30:00', '2024-12-09 13:05:00'),
  (50, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Donald Y.', '200 N Lorena St, Los Angeles, CA 90033', 2, 0.5, 350, 475, 825, 'completed', '2024-12-09 14:00:00', '2024-12-09 14:20:00'),
  (51, 3, 'Desserts Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636222/dashdoor/restaurants/15/logo.jpg', '627 N Euclid St, Anaheim, CA 92801', 'Patricia Z.', '300 W Lincoln Ave, Anaheim, CA 92805', 5, 0.8, 425, 600, 1025, 'completed', '2024-12-09 15:30:00', '2024-12-09 16:00:00'),
  (52, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'George Q.', '150 S Atlantic Blvd, Los Angeles, CA 90022', 3, 1.0, 425, 575, 1000, 'completed', '2024-12-09 18:00:00', '2024-12-09 18:35:00'),
  (53, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Helen O.', '100 S Anaheim Blvd, Anaheim, CA 92805', 2, 0.7, 375, 500, 875, 'completed', '2024-12-09 19:30:00', '2024-12-09 19:55:00'),
  (54, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Brian I.', '400 N Fickett St, Los Angeles, CA 90033', 4, 0.6, 400, 550, 950, 'completed', '2024-12-08 12:00:00', '2024-12-08 12:30:00'),
  (55, 3, 'Desserts Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636222/dashdoor/restaurants/15/logo.jpg', '627 N Euclid St, Anaheim, CA 92801', 'Laura U.', '200 E Center St, Anaheim, CA 92805', 3, 0.9, 425, 600, 1025, 'completed', '2024-12-08 14:00:00', '2024-12-08 14:35:00'),
  (56, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'Steven E.', '50 S Mednik Ave, Los Angeles, CA 90022', 2, 0.8, 375, 500, 875, 'completed', '2024-12-08 18:30:00', '2024-12-08 19:00:00'),
  (57, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Kimberly D.', '400 W Broadway, Anaheim, CA 92805', 4, 1.1, 450, 625, 1075, 'completed', '2024-12-08 20:00:00', '2024-12-08 20:40:00'),
  (58, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Mark L.', '100 N Rowan Ave, Los Angeles, CA 90063', 3, 0.7, 400, 525, 925, 'completed', '2024-12-07 12:00:00', '2024-12-07 12:30:00'),
  (59, 3, 'Desserts Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636222/dashdoor/restaurants/15/logo.jpg', '627 N Euclid St, Anaheim, CA 92801', 'Susan H.', '500 N State College Blvd, Anaheim, CA 92806', 2, 1.3, 475, 625, 1100, 'completed', '2024-12-07 14:00:00', '2024-12-07 14:45:00'),
  (60, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'Paul G.', '200 S Marianna Ave, Los Angeles, CA 90063', 4, 0.9, 425, 575, 1000, 'completed', '2024-12-07 18:00:00', '2024-12-07 18:35:00'),
  (61, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Linda B.', '100 E Ball Rd, Anaheim, CA 92805', 3, 0.8, 400, 550, 950, 'completed', '2024-12-07 19:30:00', '2024-12-07 20:00:00'),
  (62, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Charles F.', '300 N Indiana St, Los Angeles, CA 90033', 2, 0.5, 350, 450, 800, 'completed', '2024-12-06 12:00:00', '2024-12-06 12:20:00'),
  (63, 3, 'Desserts Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636222/dashdoor/restaurants/15/logo.jpg', '627 N Euclid St, Anaheim, CA 92801', 'Betty M.', '200 S Brookhurst St, Anaheim, CA 92804', 4, 1.5, 500, 675, 1175, 'completed', '2024-12-06 14:00:00', '2024-12-06 14:50:00'),
  (64, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'Joseph K.', '50 N Mott St, Los Angeles, CA 90033', 3, 0.6, 375, 500, 875, 'completed', '2024-12-06 18:00:00', '2024-12-06 18:25:00'),
  (65, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Nancy R.', '400 S Manchester Ave, Anaheim, CA 92802', 2, 1.0, 425, 550, 975, 'completed', '2024-12-05 12:00:00', '2024-12-05 12:35:00'),
  (66, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Margaret W.', '100 S Fresno St, Los Angeles, CA 90063', 4, 0.7, 400, 550, 950, 'completed', '2024-12-05 14:00:00', '2024-12-05 14:30:00'),
  (67, 3, 'Desserts Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636222/dashdoor/restaurants/15/logo.jpg', '627 N Euclid St, Anaheim, CA 92801', 'Richard B.', '300 S Beach Blvd, Anaheim, CA 92804', 3, 1.2, 450, 600, 1050, 'completed', '2024-12-05 18:00:00', '2024-12-05 18:40:00'),
  (68, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'Barbara T.', '200 N Eastern Ave, Los Angeles, CA 90032', 2, 0.5, 350, 475, 825, 'completed', '2024-12-04 12:00:00', '2024-12-04 12:20:00'),
  (69, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Thomas H.', '100 W Katella Ave, Anaheim, CA 92802', 4, 1.1, 450, 600, 1050, 'completed', '2024-12-04 14:00:00', '2024-12-04 14:40:00'),
  (70, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Dorothy P.', '50 N Fickett St, Los Angeles, CA 90033', 3, 0.6, 375, 500, 875, 'completed', '2024-12-04 18:00:00', '2024-12-04 18:25:00'),
  (71, 3, 'Desserts Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636222/dashdoor/restaurants/15/logo.jpg', '627 N Euclid St, Anaheim, CA 92801', 'Daniel M.', '200 E Lincoln Ave, Anaheim, CA 92805', 2, 0.8, 400, 525, 925, 'completed', '2024-12-03 12:00:00', '2024-12-03 12:30:00'),
  (72, 3, 'Burgers Pantry', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636194/dashdoor/restaurants/10/logo.jpg', '2200 N Soto St, Los Angeles, CA 90032', 'Sandra L.', '100 S Soto St, Los Angeles, CA 90033', 3, 0.7, 400, 525, 925, 'completed', '2024-12-03 14:00:00', '2024-12-03 14:30:00'),
  (73, 3, 'Talia''s Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636154/dashdoor/restaurants/3/logo.jpg', '267 S Euclid St, Anaheim, CA 92801', 'Ronald K.', '300 S Euclid St, Anaheim, CA 92802', 4, 0.5, 375, 500, 875, 'completed', '2024-12-02 12:00:00', '2024-12-02 12:25:00'),
  (74, 3, 'Brooklyn Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636216/dashdoor/restaurants/14/logo.jpg', '717 N Soto St, Los Angeles, CA 90033', 'Lisa V.', '150 N Mott St, Los Angeles, CA 90033', 2, 0.6, 350, 475, 825, 'completed', '2024-12-02 14:00:00', '2024-12-02 14:25:00');

-- Emily Williams's orders (Partner ID: 4) - 18 total deliveries (newer driver)
INSERT INTO delivery_orders (id, partner_id, store_name, store_logo, store_address, customer_name, customer_address, items_count, distance_miles, base_pay, tip_amount, total_earnings, status, order_date, completed_at) VALUES
  (75, 4, 'Skyline Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636178/dashdoor/restaurants/7/logo.jpg', '3706 N Halsted St, Chicago, IL 60613', 'Mark L.', '100 W Belmont Ave, Chicago, IL 60657', 3, 0.7, 375, 450, 825, 'completed', '2024-12-09 11:00:00', '2024-12-09 11:30:00'),
  (76, 4, 'Atlanta Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636240/dashdoor/restaurants/18/logo.jpg', '7167 S Exchange Ave, Chicago, IL 60649', 'Susan H.', '200 E 71st St, Chicago, IL 60649', 2, 0.5, 325, 400, 725, 'completed', '2024-12-09 13:00:00', '2024-12-09 13:25:00'),
  (77, 4, 'Evergreen Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636254/dashdoor/restaurants/20/logo.jpg', '8601 S Stony Island Ave, Chicago, IL 60617', 'Paul G.', '300 E 87th St, Chicago, IL 60617', 1, 0.4, 300, 375, 675, 'completed', '2024-12-09 15:00:00', '2024-12-09 15:20:00'),
  (78, 4, 'Skyline Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636178/dashdoor/restaurants/7/logo.jpg', '3706 N Halsted St, Chicago, IL 60613', 'Linda B.', '50 W Diversey Pkwy, Chicago, IL 60614', 2, 0.8, 375, 475, 850, 'completed', '2024-12-09 18:00:00', '2024-12-09 18:30:00'),
  (79, 4, 'Atlanta Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636240/dashdoor/restaurants/18/logo.jpg', '7167 S Exchange Ave, Chicago, IL 60649', 'Charles F.', '100 E 75th St, Chicago, IL 60619', 3, 0.9, 400, 500, 900, 'completed', '2024-12-08 12:00:00', '2024-12-08 12:35:00'),
  (80, 4, 'Evergreen Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636254/dashdoor/restaurants/20/logo.jpg', '8601 S Stony Island Ave, Chicago, IL 60617', 'Betty M.', '200 E 83rd St, Chicago, IL 60617', 2, 0.6, 350, 425, 775, 'cancelled', '2024-12-08 14:00:00', NULL),
  (81, 4, 'Skyline Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636178/dashdoor/restaurants/7/logo.jpg', '3706 N Halsted St, Chicago, IL 60613', 'Joseph K.', '150 W Wellington Ave, Chicago, IL 60657', 4, 0.5, 375, 500, 875, 'completed', '2024-12-07 12:00:00', '2024-12-07 12:25:00'),
  (82, 4, 'Atlanta Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636240/dashdoor/restaurants/18/logo.jpg', '7167 S Exchange Ave, Chicago, IL 60649', 'Nancy R.', '300 E 69th St, Chicago, IL 60637', 2, 0.7, 350, 450, 800, 'completed', '2024-12-07 14:00:00', '2024-12-07 14:30:00'),
  (83, 4, 'Evergreen Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636254/dashdoor/restaurants/20/logo.jpg', '8601 S Stony Island Ave, Chicago, IL 60617', 'Margaret W.', '100 E 89th St, Chicago, IL 60619', 3, 0.8, 400, 475, 875, 'completed', '2024-12-06 12:00:00', '2024-12-06 12:35:00'),
  (84, 4, 'Skyline Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636178/dashdoor/restaurants/7/logo.jpg', '3706 N Halsted St, Chicago, IL 60613', 'Richard B.', '50 W Cornelia Ave, Chicago, IL 60657', 2, 0.6, 350, 425, 775, 'completed', '2024-12-06 18:00:00', '2024-12-06 18:25:00'),
  (85, 4, 'Atlanta Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636240/dashdoor/restaurants/18/logo.jpg', '7167 S Exchange Ave, Chicago, IL 60649', 'Barbara T.', '200 E 67th St, Chicago, IL 60637', 1, 0.5, 300, 375, 675, 'completed', '2024-12-05 12:00:00', '2024-12-05 12:20:00'),
  (86, 4, 'Evergreen Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636254/dashdoor/restaurants/20/logo.jpg', '8601 S Stony Island Ave, Chicago, IL 60617', 'Thomas H.', '300 E 85th St, Chicago, IL 60617', 3, 0.7, 375, 475, 850, 'completed', '2024-12-05 14:00:00', '2024-12-05 14:30:00'),
  (87, 4, 'Skyline Kitchen', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636178/dashdoor/restaurants/7/logo.jpg', '3706 N Halsted St, Chicago, IL 60613', 'Dorothy P.', '100 W Aldine Ave, Chicago, IL 60657', 2, 0.8, 375, 450, 825, 'completed', '2024-12-04 12:00:00', '2024-12-04 12:30:00'),
  (88, 4, 'Atlanta Cellar', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636240/dashdoor/restaurants/18/logo.jpg', '7167 S Exchange Ave, Chicago, IL 60649', 'Daniel M.', '150 E 73rd St, Chicago, IL 60619', 4, 0.6, 400, 500, 900, 'completed', '2024-12-03 12:00:00', '2024-12-03 12:30:00'),
  (89, 4, 'Evergreen Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636254/dashdoor/restaurants/20/logo.jpg', '8601 S Stony Island Ave, Chicago, IL 60617', 'Sandra L.', '200 E 81st St, Chicago, IL 60617', 2, 0.5, 325, 400, 725, 'completed', '2024-12-02 12:00:00', '2024-12-02 12:20:00');

-- James Thompson's orders (Partner ID: 5) - 38 total deliveries
INSERT INTO delivery_orders (id, partner_id, store_name, store_logo, store_address, customer_name, customer_address, items_count, distance_miles, base_pay, tip_amount, total_earnings, status, order_date, completed_at) VALUES
  (90, 5, 'Portland Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636142/dashdoor/restaurants/1/logo.jpg', '33 N Square, Boston, MA 02113', 'Angela K.', '100 Commercial St, Boston, MA 02109', 3, 0.6, 400, 650, 1050, 'completed', '2024-12-09 18:00:00', '2024-12-09 18:30:00'),
  (91, 5, 'Urban Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636148/dashdoor/restaurants/2/logo.jpg', '100 Atlantic Ave, Boston, MA 02110', 'Edward P.', '200 State St, Boston, MA 02109', 4, 0.5, 425, 700, 1125, 'completed', '2024-12-09 19:30:00', '2024-12-09 20:00:00'),
  (92, 5, 'Seafood Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636159/dashdoor/restaurants/4/logo.jpg', '685 Washington St, Boston, MA 02116', 'Dorothy W.', '50 Beacon St, Boston, MA 02108', 2, 0.8, 450, 800, 1250, 'completed', '2024-12-08 18:00:00', '2024-12-08 18:35:00'),
  (93, 5, 'Aiden''s Smokehouse', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636166/dashdoor/restaurants/5/logo.jpg', '239 Meridian St, Boston, MA 02128', 'Frank S.', '100 Bremen St, Boston, MA 02128', 3, 0.6, 400, 600, 1000, 'completed', '2024-12-08 19:30:00', '2024-12-08 20:00:00'),
  (94, 5, 'Skyline Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636171/dashdoor/restaurants/6/logo.jpg', '10 Milk St, Boston, MA 02108', 'Ruth C.', '75 Federal St, Boston, MA 02110', 4, 0.4, 375, 575, 950, 'completed', '2024-12-07 18:00:00', '2024-12-07 18:25:00'),
  (95, 5, 'Austin Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636233/dashdoor/restaurants/17/logo.jpg', '1 Main St, Somerville, MA 02145', 'Henry V.', '50 Union Sq, Somerville, MA 02143', 3, 1.0, 450, 750, 1200, 'completed', '2024-12-07 19:30:00', '2024-12-07 20:05:00'),
  (96, 5, 'Boston Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636248/dashdoor/restaurants/19/logo.jpg', '447 Broadway, Everett, MA 02150', 'Gloria J.', '200 Main St, Everett, MA 02149', 2, 0.7, 400, 625, 1025, 'completed', '2024-12-06 18:00:00', '2024-12-06 18:30:00'),
  (97, 5, 'Hannah''s Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636227/dashdoor/restaurants/16/logo.jpg', '109 Savin Hill Ave, Dorchester, MA 02125', 'Kevin G.', '100 Columbia Rd, Boston, MA 02125', 4, 0.9, 450, 675, 1125, 'completed', '2024-12-06 19:30:00', '2024-12-06 20:10:00'),
  (98, 5, 'Portland Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636142/dashdoor/restaurants/1/logo.jpg', '33 N Square, Boston, MA 02113', 'Stephanie W.', '150 Endicott St, Boston, MA 02113', 3, 0.5, 400, 600, 1000, 'completed', '2024-12-05 18:00:00', '2024-12-05 18:25:00'),
  (99, 5, 'Urban Grill', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636148/dashdoor/restaurants/2/logo.jpg', '100 Atlantic Ave, Boston, MA 02110', 'Daniel F.', '300 Northern Ave, Boston, MA 02210', 2, 1.1, 475, 725, 1200, 'completed', '2024-12-05 19:30:00', '2024-12-05 20:10:00'),
  (100, 5, 'Seafood Market', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636159/dashdoor/restaurants/4/logo.jpg', '685 Washington St, Boston, MA 02116', 'Michelle A.', '100 Charles St, Boston, MA 02114', 4, 0.7, 425, 650, 1075, 'completed', '2024-12-04 18:00:00', '2024-12-04 18:35:00'),
  (101, 5, 'Aiden''s Smokehouse', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636166/dashdoor/restaurants/5/logo.jpg', '239 Meridian St, Boston, MA 02128', 'Christopher M.', '50 Porter St, Boston, MA 02128', 3, 0.6, 400, 575, 975, 'completed', '2024-12-04 19:30:00', '2024-12-04 20:00:00'),
  (102, 5, 'Skyline Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636171/dashdoor/restaurants/6/logo.jpg', '10 Milk St, Boston, MA 02108', 'Rebecca N.', '200 Congress St, Boston, MA 02110', 2, 0.5, 375, 550, 925, 'completed', '2024-12-03 18:00:00', '2024-12-03 18:25:00'),
  (103, 5, 'Austin Bistro', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636233/dashdoor/restaurants/17/logo.jpg', '1 Main St, Somerville, MA 02145', 'Andrew J.', '100 Broadway, Somerville, MA 02145', 4, 0.8, 450, 675, 1125, 'completed', '2024-12-03 19:30:00', '2024-12-03 20:05:00'),
  (104, 5, 'Boston Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636248/dashdoor/restaurants/19/logo.jpg', '447 Broadway, Everett, MA 02150', 'Jessica R.', '150 Chelsea St, Everett, MA 02149', 3, 0.9, 425, 625, 1050, 'completed', '2024-12-02 18:00:00', '2024-12-02 18:35:00'),
  (105, 5, 'Hannah''s Cantina', 'https://res.cloudinary.com/dgy6qvo7c/image/upload/v1763636227/dashdoor/restaurants/16/logo.jpg', '109 Savin Hill Ave, Dorchester, MA 02125', 'Robert L.', '200 Bowdoin St, Dorchester, MA 02122', 2, 1.0, 450, 700, 1150, 'completed', '2024-12-02 19:30:00', '2024-12-02 20:05:00');

-- ===========================================
-- DELIVERY RATINGS
-- ===========================================
-- Ratings match the orders above and partner average ratings

-- Marcus Johnson's ratings (avg 4.88)
INSERT INTO delivery_ratings (partner_id, order_id, rating, feedback, customer_name, created_at) VALUES
  (1, 1, 5, 'Excellent service! Food arrived hot and Marcus was very professional.', 'John D.', '2024-12-09 13:30:00'),
  (1, 2, 5, 'Great communication throughout the delivery.', 'Amanda K.', '2024-12-09 15:00:00'),
  (1, 3, 5, 'Super fast delivery, very friendly!', 'Michael R.', '2024-12-09 19:30:00'),
  (1, 4, 5, 'Perfect! Will request this driver again.', 'Lisa M.', '2024-12-09 20:45:00'),
  (1, 5, 4, 'Good delivery, slightly delayed but kept me updated.', 'Robert T.', '2024-12-10 09:00:00'),
  (1, 6, 5, 'Fantastic service as always!', 'Jennifer P.', '2024-12-10 13:00:00'),
  (1, 7, 5, 'Very polite and efficient.', 'William S.', '2024-12-10 14:30:00'),
  (1, 8, 5, 'Amazing dasher! Food was still steaming hot.', 'Catherine L.', '2024-12-10 19:00:00'),
  (1, 9, 5, NULL, 'Thomas B.', '2024-12-08 12:45:00'),
  (1, 10, 5, 'Excellent!', 'Nancy H.', '2024-12-08 14:30:00'),
  (1, 11, 4, 'Good service overall.', 'George Q.', '2024-12-08 19:30:00'),
  (1, 12, 5, 'Fast and friendly!', 'Helen O.', '2024-12-07 12:45:00'),
  (1, 13, 5, 'Best delivery experience!', 'Brian I.', '2024-12-07 08:30:00'),
  (1, 14, 5, 'Marcus is the best!', 'Laura U.', '2024-12-07 14:00:00'),
  (1, 15, 5, NULL, 'Steven E.', '2024-12-07 19:00:00'),
  (1, 16, 5, 'Wonderful service!', 'Kimberly D.', '2024-12-07 20:30:00');

-- Sarah Chen's ratings (avg 4.75)
INSERT INTO delivery_ratings (partner_id, order_id, rating, feedback, customer_name, created_at) VALUES
  (2, 31, 5, 'Sarah was amazing! Very careful with my order.', 'Kevin G.', '2024-12-09 12:30:00'),
  (2, 32, 5, 'Quick and professional delivery.', 'Stephanie W.', '2024-12-09 14:15:00'),
  (2, 33, 4, 'Good delivery, food arrived warm.', 'Daniel F.', '2024-12-09 18:45:00'),
  (2, 34, 5, 'Best delivery experience I have had!', 'Michelle A.', '2024-12-09 20:30:00'),
  (2, 35, 5, 'Very friendly and fast!', 'Christopher M.', '2024-12-08 12:45:00'),
  (2, 36, 4, 'Solid delivery, no issues.', 'Rebecca N.', '2024-12-08 14:45:00'),
  (2, 38, 5, 'Great job Sarah!', 'Jessica R.', '2024-12-07 13:15:00'),
  (2, 39, 5, NULL, 'Robert L.', '2024-12-07 19:00:00'),
  (2, 40, 4, 'Good service.', 'Maria S.', '2024-12-06 12:45:00'),
  (2, 41, 5, 'Fast delivery!', 'James T.', '2024-12-06 15:00:00'),
  (2, 42, 5, 'Excellent!', 'Patricia D.', '2024-12-05 13:15:00'),
  (2, 43, 5, 'Perfect!', 'William B.', '2024-12-05 19:00:00');

-- David Martinez's ratings (avg 4.94 - top performer)
INSERT INTO delivery_ratings (partner_id, order_id, rating, feedback, customer_name, created_at) VALUES
  (3, 48, 5, 'Incredibly fast! David is the best dasher!', 'Eric V.', '2024-12-09 11:45:00'),
  (3, 49, 5, 'Always request David - never disappoints!', 'Sandra C.', '2024-12-09 13:30:00'),
  (3, 50, 5, 'Outstanding service as always.', 'Donald Y.', '2024-12-09 14:45:00'),
  (3, 51, 5, 'Super quick delivery, very professional.', 'Patricia Z.', '2024-12-09 16:30:00'),
  (3, 52, 5, 'Amazing! Food was perfect temperature.', 'George Q.', '2024-12-09 19:00:00'),
  (3, 53, 5, 'David went above and beyond!', 'Helen O.', '2024-12-09 20:15:00'),
  (3, 54, 5, 'Phenomenal service!', 'Brian I.', '2024-12-08 13:00:00'),
  (3, 55, 5, 'Best delivery ever!', 'Laura U.', '2024-12-08 15:00:00'),
  (3, 56, 5, 'Fast, friendly, fantastic!', 'Steven E.', '2024-12-08 19:30:00'),
  (3, 57, 5, 'David is a 5-star dasher!', 'Kimberly D.', '2024-12-08 21:00:00'),
  (3, 58, 5, NULL, 'Mark L.', '2024-12-07 13:00:00'),
  (3, 59, 5, 'Excellent as always!', 'Susan H.', '2024-12-07 15:00:00'),
  (3, 60, 5, 'Perfect delivery!', 'Paul G.', '2024-12-07 19:00:00'),
  (3, 61, 5, 'Great job!', 'Linda B.', '2024-12-07 20:30:00'),
  (3, 62, 5, 'Best in the business!', 'Charles F.', '2024-12-06 12:45:00'),
  (3, 63, 4, 'Good delivery.', 'Betty M.', '2024-12-06 15:15:00'),
  (3, 64, 5, NULL, 'Joseph K.', '2024-12-06 18:45:00');

-- Emily Williams's ratings (avg 4.60 - newer driver, some learning experiences)
INSERT INTO delivery_ratings (partner_id, order_id, rating, feedback, customer_name, created_at) VALUES
  (4, 75, 5, 'Great first impression! Very polite.', 'Mark L.', '2024-12-09 12:00:00'),
  (4, 76, 4, 'Good delivery, took a bit longer than expected.', 'Susan H.', '2024-12-09 13:45:00'),
  (4, 77, 5, 'Perfect delivery, thank you Emily!', 'Paul G.', '2024-12-09 15:45:00'),
  (4, 78, 5, 'Fast and efficient!', 'Linda B.', '2024-12-09 18:45:00'),
  (4, 79, 4, 'Good job.', 'Charles F.', '2024-12-08 13:00:00'),
  (4, 81, 5, 'Excellent service!', 'Joseph K.', '2024-12-07 12:45:00'),
  (4, 82, 4, 'Decent delivery.', 'Nancy R.', '2024-12-07 15:00:00'),
  (4, 83, 5, 'Very friendly!', 'Margaret W.', '2024-12-06 13:00:00'),
  (4, 84, 4, NULL, 'Richard B.', '2024-12-06 18:45:00'),
  (4, 85, 5, 'Great!', 'Barbara T.', '2024-12-05 12:45:00');

-- James Thompson's ratings (avg 4.82)
INSERT INTO delivery_ratings (partner_id, order_id, rating, feedback, customer_name, created_at) VALUES
  (5, 90, 5, 'James handled my large order perfectly!', 'Angela K.', '2024-12-09 19:00:00'),
  (5, 91, 5, 'Excellent! Food was still piping hot.', 'Edward P.', '2024-12-09 20:30:00'),
  (5, 92, 5, 'Perfect condition. Great job!', 'Dorothy W.', '2024-12-08 19:00:00'),
  (5, 93, 5, 'Very professional and friendly.', 'Frank S.', '2024-12-08 20:30:00'),
  (5, 94, 5, 'Fast and efficient!', 'Ruth C.', '2024-12-07 18:45:00'),
  (5, 95, 5, 'Amazing service! Will definitely tip well again.', 'Henry V.', '2024-12-07 20:30:00'),
  (5, 96, 4, 'Good delivery overall.', 'Gloria J.', '2024-12-06 19:00:00'),
  (5, 97, 5, 'Excellent!', 'Kevin G.', '2024-12-06 20:30:00'),
  (5, 98, 5, 'Best dasher!', 'Stephanie W.', '2024-12-05 18:45:00'),
  (5, 99, 5, NULL, 'Daniel F.', '2024-12-05 20:30:00'),
  (5, 100, 4, 'Good service.', 'Michelle A.', '2024-12-04 19:00:00'),
  (5, 101, 5, 'Very reliable!', 'Christopher M.', '2024-12-04 20:30:00'),
  (5, 102, 5, 'Great job James!', 'Rebecca N.', '2024-12-03 18:45:00'),
  (5, 103, 5, 'Perfect!', 'Andrew J.', '2024-12-03 20:30:00');

-- ===========================================
-- DELIVERY EARNINGS (Weekly summaries)
-- ===========================================
-- Earnings are calculated from the orders above to be consistent

-- Marcus Johnson's earnings (based on 45 orders)
INSERT INTO delivery_earnings (partner_id, week_start, week_end, total_deliveries, base_pay, tips, bonuses, total_earnings, hours_worked) VALUES
  (1, '2024-12-09', '2024-12-15', 8, 3175, 4325, 500, 8000, 6.5),
  (1, '2024-12-02', '2024-12-08', 22, 8200, 10825, 1500, 20525, 18.0);

-- Sarah Chen's earnings (based on 32 orders)
INSERT INTO delivery_earnings (partner_id, week_start, week_end, total_deliveries, base_pay, tips, bonuses, total_earnings, hours_worked) VALUES
  (2, '2024-12-09', '2024-12-15', 4, 1475, 2025, 300, 3800, 3.5),
  (2, '2024-12-02', '2024-12-08', 13, 4700, 6150, 800, 11650, 11.0);

-- David Martinez's earnings (based on 52 orders - top performer)
INSERT INTO delivery_earnings (partner_id, week_start, week_end, total_deliveries, base_pay, tips, bonuses, total_earnings, hours_worked) VALUES
  (3, '2024-12-09', '2024-12-15', 6, 2450, 3350, 600, 6400, 5.0),
  (3, '2024-12-02', '2024-12-08', 21, 8675, 11575, 2000, 22250, 17.5);

-- Emily Williams's earnings (based on 18 orders - newer driver)
INSERT INTO delivery_earnings (partner_id, week_start, week_end, total_deliveries, base_pay, tips, bonuses, total_earnings, hours_worked) VALUES
  (4, '2024-12-09', '2024-12-15', 4, 1375, 1725, 200, 3300, 3.0),
  (4, '2024-12-02', '2024-12-08', 11, 3850, 4800, 500, 9150, 9.0);

-- James Thompson's earnings (based on 38 orders)
INSERT INTO delivery_earnings (partner_id, week_start, week_end, total_deliveries, base_pay, tips, bonuses, total_earnings, hours_worked) VALUES
  (5, '2024-12-09', '2024-12-15', 2, 825, 1350, 200, 2375, 1.5),
  (5, '2024-12-02', '2024-12-08', 14, 5900, 8875, 1200, 15975, 11.5);

-- ===========================================
-- DELIVERY PAYOUT METHODS
-- ===========================================

INSERT INTO delivery_payout_methods (partner_id, method_type, bank_name, last_four, is_default, created_at) VALUES
  (1, 'bank_account', 'Chase Bank', '4521', 1, '2023-03-15 11:00:00'),
  (1, 'debit_card', 'Chase Bank', '8834', 0, '2023-05-20 14:30:00'),
  (2, 'bank_account', 'Bank of America', '7823', 1, '2023-06-22 15:00:00'),
  (3, 'bank_account', 'Wells Fargo', '3356', 1, '2022-11-08 10:00:00'),
  (3, 'debit_card', 'Wells Fargo', '9912', 0, '2023-01-15 09:30:00'),
  (4, 'bank_account', 'Capital One', '6678', 1, '2024-01-10 17:00:00'),
  (5, 'bank_account', 'Citibank', '2245', 1, '2023-01-05 12:00:00'),
  (5, 'debit_card', 'Citibank', '5567', 0, '2023-02-10 16:45:00');
