-- ==============================================================================
-- Agricultural By-Product Utilization & Exchange Platform
-- Seed Data for MySQL
-- ==============================================================================

USE agri_exchange_db;

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Platform Administrator with system-wide analytics, verification, and oversight'),
(2, 'ROLE_FARMER', 'Agricultural producer listing by-products, monitoring orders, and earnings'),
(3, 'ROLE_BUYER', 'Industrial buyer, bio-energy plant, paper mill, or animal feed manufacturer')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. USERS (Pass: Password123! hashed with BCrypt: $2a$10$wT0o3q6h0yXW9t8hFwOq8OmP39q9xWpB76p6C7/N9V9M0H7W6t0eW)
INSERT INTO users (id, name, email, password_hash, role, phone, organization_name, address, district, state, pincode, is_verified, rating_average) VALUES
(1, 'Platform Admin', 'admin@agriexchange.org', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_ADMIN', '+91 98765 00001', 'AgriExchange HQ', '100 Green Tech Park, Sector 62', 'Gurugram', 'Haryana', '122002', TRUE, 5.00),
(2, 'Gurpreet Singh', 'farmer.gurpreet@agriexchange.org', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_FARMER', '+91 98141 23456', 'Kisan Samriddhi Farms', 'Village Samrala, GT Road', 'Ludhiana', 'Punjab', '141114', TRUE, 4.85),
(3, 'Ramesh Patil', 'farmer.patil@agriexchange.org', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_FARMER', '+91 98220 34567', 'Sahyadri Agro Residuaries', 'Karveer Taluk', 'Kolhapur', 'Maharashtra', '416004', TRUE, 4.90),
(4, 'Murugan Selvam', 'farmer.murugan@agriexchange.org', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_FARMER', '+91 94433 45678', 'Annamalai Coir & Agro', 'Pollachi High Road', 'Coimbatore', 'Tamil Nadu', '642001', TRUE, 4.75),
(5, 'Rajesh Choudhary', 'farmer.rajesh@agriexchange.org', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_FARMER', '+91 98960 56789', 'Yamuna Basin Agritech', 'Indri Road', 'Karnal', 'Haryana', '132001', TRUE, 4.80),
(6, 'Dr. Arvinder Mehta', 'buyer.bioenergy@biopower.com', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_BUYER', '+91 98110 67890', 'GreenTerra BioEnergy 50MW Plant', 'Plot 45, Ecotech Industrial Area', 'Greater Noida', 'Uttar Pradesh', '201306', TRUE, 4.95),
(7, 'Sunita Deshmukh', 'buyer.ecopulp@ecopaper.com', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_BUYER', '+91 98230 78901', 'EcoPulp & Packaging Mills', 'MIDC Chakan Industrial Corridor', 'Pune', 'Maharashtra', '410501', TRUE, 4.70),
(8, 'Karthik Raman', 'buyer.agrifeed@feedglobal.com', '$2a$10$7zVn2q00uQ7x5yZgA3H1ue8U5N8Cq0iNqGjYk6PzE5YqA2hZ1w5c6', 'ROLE_BUYER', '+91 98450 89012', 'NutriFeed Cattle & Poultry Organics', 'Peenya Industrial Estate Phase II', 'Bengaluru', 'Karnataka', '560058', TRUE, 4.88)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. CATEGORIES
INSERT INTO categories (id, name, code, description, carbon_offset_factor) VALUES
(1, 'Cereal Straws & Stubble', 'CEREAL_STRAW', 'Paddy straw, wheat straw, and barley stubble suitable for biomass power and compressed biogas (CBG)', 1.450),
(2, 'Sugar Mill By-Products', 'SUGAR_BYPRODUCT', 'Sugarcane bagasse, press mud, and filter cake ideal for paper manufacture and co-generation boilers', 1.300),
(3, 'Fibers & Husk Residues', 'FIBER_HUSK', 'Coconut coir pith, rice husk, coffee husks, and groundnut shells used for horticulture and refractory bricks', 1.150),
(4, 'Stalks & Woody Biomass', 'WOODY_STALK', 'Cotton stalks, corn cobs, mustard stems, and chili stalks suited for biomass briquettes and bio-coal', 1.380),
(5, 'Organic Manure & Bedding', 'ANIMAL_BYPRODUCT', 'Poultry deep litter, cattle compost bedding, and mushroom spent substrate for enriched organic fertilizers', 0.950)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. PRODUCTS
INSERT INTO products (id, farmer_id, category_id, title, byproduct_type, description, quantity_tons, available_quantity_tons, moisture_content_percent, organic_matter_percent, price_per_ton, estimated_market_price, packaging_type, storage_type, harvest_season, state, district, pincode, image_url, status) VALUES
(1, 2, 1, 'Premium High-Density Paddy Rice Straw Bales', 'rice_straw', 'Square baled rice straw collected with modern balers, moisture tightly controlled under 13%. Suitable for CBG digesters and 2G ethanol refineries.', 120.00, 75.00, 12.50, 84.50, 2450.00, 2400.00, 'Square Bales (25kg)', 'Covered Tarpaulin Shed', 'Kharif', 'Punjab', 'Ludhiana', '141114', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 'AVAILABLE'),
(2, 3, 2, 'Sun-Dried Sugarcane Bagasse (Caloric 2200 kcal/kg)', 'sugarcane_bagasse', 'Screened, de-pocked sugarcane mill residue. Very low ash content, superior burning characteristics for industrial fluidized boilers.', 350.00, 350.00, 18.00, 89.00, 2800.00, 2750.00, 'Loose Bulk Loaded in Tiplers', 'Asphalt Concrete Yard', 'Rabi', 'Maharashtra', 'Kolhapur', '416004', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'AVAILABLE'),
(3, 4, 3, 'Washed Low-EC Coconut Coir Pith Briquettes', 'coir_pith', 'Electrical conductivity below 0.5 mS/cm. Naturally aged 6+ months, washed with clean borewell water. Ideal for greenhouse hydroponics & potting mixes.', 85.00, 45.00, 14.00, 94.00, 5200.00, 5350.00, 'Palletized 5kg Compressed Blocks', 'Indoor Warehouse', 'Zaid', 'Tamil Nadu', 'Coimbatore', '642001', 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80', 'AVAILABLE'),
(4, 5, 4, 'Shredded Cotton Stalks & Stems for Bio-Pellets', 'cotton_stalk', 'Chipped to 20-30mm particle size. High lignin content makes it the premier raw material for high-density pelletization without synthetic binders.', 180.00, 180.00, 11.00, 86.50, 3100.00, 3050.00, 'Jumbo Bags (500kg)', 'Dry Silo Warehouse', 'Kharif', 'Haryana', 'Karnal', '132001', 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', 'AVAILABLE'),
(5, 5, 1, 'Clean Golden Wheat Straw Chopped Bales', 'wheat_straw', 'Threshed golden wheat straw, free from stones and weeds. Highly preferred for dairy cattle bedding and cardboard pulp fiber blending.', 95.00, 95.00, 9.80, 88.00, 3400.00, 3350.00, 'Round Bales (120kg)', 'Elevated Dry Granary', 'Rabi', 'Haryana', 'Karnal', '132001', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', 'AVAILABLE'),
(6, 3, 4, 'Dried De-shelled Corn Cobs for Furfural & Boilers', 'corn_cob', 'Whole de-kernelled corn cobs, sun dried to moisture < 10%. High pentosan content for furfural extraction or clean fuel pellets.', 140.00, 110.00, 9.50, 91.20, 3600.00, 3550.00, 'PP Woven Sacks (40kg)', 'Covered Metal Hangar', 'Kharif', 'Maharashtra', 'Kolhapur', '416004', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80', 'AVAILABLE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. ORDERS
INSERT INTO orders (id, order_number, buyer_id, farmer_id, product_id, quantity_tons, price_per_ton, subtotal_amount, logistics_fee, tax_amount, total_amount, delivery_address, delivery_district, delivery_state, delivery_pincode, transport_type, order_status, payment_status) VALUES
(1, 'ORD-202610-8841', 6, 2, 1, 45.00, 2450.00, 110250.00, 9500.00, 5987.50, 125737.50, 'GreenTerra Thermal Co-Gen Plant, Gate 3', 'Greater Noida', 'Uttar Pradesh', '201306', 'Platform 3PL Fleet', 'DELIVERED', 'RELEASED_TO_FARMER'),
(2, 'ORD-202610-9104', 7, 3, 2, 80.00, 2800.00, 224000.00, 14000.00, 11900.00, 249900.00, 'EcoPulp Receiving Yard, Plot B-12', 'Pune', 'Maharashtra', '410501', 'Buyer Arranged Freight', 'DISPATCHED', 'ESCROW_HELD'),
(3, 'ORD-202610-9552', 8, 4, 3, 40.00, 5200.00, 208000.00, 12500.00, 11025.00, 231525.00, 'NutriFeed Blending Facility, Peenya Phase 2', 'Bengaluru', 'Karnataka', '560058', 'Platform 3PL Fleet', 'CONFIRMED', 'ESCROW_HELD')
ON DUPLICATE KEY UPDATE order_number=VALUES(order_number);

-- 6. TRANSACTIONS
INSERT INTO transactions (id, transaction_code, order_id, payer_id, payee_id, amount, currency, payment_gateway, gateway_reference, status, escrow_release_status) VALUES
(1, 'TXN-RAZ-9918231', 1, 6, 2, 125737.50, 'INR', 'RAZORPAY_ESCROW', 'pay_Ox8H1s9K209A', 'SUCCESS', 'RELEASED'),
(2, 'TXN-RAZ-9918232', 2, 7, 3, 249900.00, 'INR', 'RAZORPAY_ESCROW', 'pay_Pl2G4v8M110B', 'SUCCESS', 'HELD'),
(3, 'TXN-RAZ-9918233', 3, 8, 4, 231525.00, 'INR', 'RAZORPAY_ESCROW', 'pay_Kj9R5t3Z445C', 'SUCCESS', 'HELD')
ON DUPLICATE KEY UPDATE transaction_code=VALUES(transaction_code);

-- 7. PRICE PREDICTIONS
INSERT INTO price_predictions (id, user_id, byproduct_type, moisture_content_percent, organic_matter_percent, quantity_tons, state, season, transport_distance_km, predicted_price_per_ton, confidence_lower_bound, confidence_upper_bound, model_version) VALUES
(1, 2, 'rice_straw', 12.50, 84.50, 120.00, 'Punjab', 'Kharif', 65.00, 2400.00, 2280.00, 2520.00, 'xgboost-agri-v1.2'),
(2, 3, 'sugarcane_bagasse', 18.00, 89.00, 350.00, 'Maharashtra', 'Rabi', 40.00, 2750.00, 2600.00, 2900.00, 'xgboost-agri-v1.2'),
(3, 4, 'coir_pith', 14.00, 94.00, 85.00, 'Tamil Nadu', 'Zaid', 120.00, 5350.00, 5100.00, 5600.00, 'xgboost-agri-v1.2'),
(4, 5, 'cotton_stalk', 11.00, 86.50, 180.00, 'Haryana', 'Kharif', 80.00, 3050.00, 2920.00, 3180.00, 'xgboost-agri-v1.2')
ON DUPLICATE KEY UPDATE byproduct_type=VALUES(byproduct_type);

-- 8. INQUIRIES & NEGOTIATIONS
INSERT INTO inquiries (id, product_id, buyer_id, farmer_id, offered_price_per_ton, requested_quantity_tons, message, status) VALUES
(1, 1, 6, 2, 2380.00, 50.00, 'Can you supply 50 MT delivered to Greater Noida by next Wednesday? We have consistent monthly boiler requirements.', 'ACCEPTED'),
(2, 2, 7, 3, 2700.00, 100.00, 'We are interested in recurring shipments of your de-pocked bagasse for paper pulp production. Is price negotiable for 100+ MT?', 'COUNTERED'),
(3, 3, 8, 4, 5100.00, 30.00, 'Looking for test lot of 30 MT low-EC coir pith for our hydroponic substrate line in Karnataka.', 'PENDING')
ON DUPLICATE KEY UPDATE message=VALUES(message);
