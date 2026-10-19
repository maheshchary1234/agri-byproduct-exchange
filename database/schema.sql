-- ==============================================================================
-- Agricultural By-Product Utilization & Exchange Platform
-- Database Schema (MySQL 8.0+)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS agri_exchange_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE agri_exchange_db;

-- ------------------------------------------------------------------------------
-- 1. ROLES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_FARMER',
    phone VARCHAR(20),
    organization_name VARCHAR(150),
    address VARCHAR(255),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    land_area_acres DECIMAL(10, 2) DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    rating_average DECIMAL(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    carbon_offset_factor DECIMAL(5, 3) DEFAULT 1.200 -- Metric tons CO2 equivalent saved per ton recycled
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. PRODUCTS (AGRI BY-PRODUCTS INVENTORY) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    byproduct_type VARCHAR(100) NOT NULL, -- e.g., 'rice_straw', 'sugarcane_bagasse', 'wheat_straw', 'corn_cob'
    description TEXT,
    quantity_tons DECIMAL(10, 2) NOT NULL,
    available_quantity_tons DECIMAL(10, 2) NOT NULL,
    moisture_content_percent DECIMAL(5, 2) NOT NULL, -- e.g., 12.5%
    organic_matter_percent DECIMAL(5, 2) DEFAULT 80.00,
    price_per_ton DECIMAL(10, 2) NOT NULL,
    estimated_market_price DECIMAL(10, 2), -- predicted by XGBoost ML module
    packaging_type VARCHAR(100) DEFAULT 'Baled (Round/Square)', -- Baled, Loose, Pelleted, Bagged
    storage_type VARCHAR(100) DEFAULT 'Covered Shed',
    harvest_season VARCHAR(50), -- Kharif, Rabi, Zaid
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    image_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, UNDER_NEGOTIATION, SOLD, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_product_byproduct (byproduct_type),
    INDEX idx_product_state (state),
    INDEX idx_product_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    buyer_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity_tons DECIMAL(10, 2) NOT NULL,
    price_per_ton DECIMAL(10, 2) NOT NULL,
    subtotal_amount DECIMAL(12, 2) NOT NULL,
    logistics_fee DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_district VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_pincode VARCHAR(20),
    transport_type VARCHAR(100) DEFAULT 'Buyer Arranged', -- Buyer Arranged, Farmer Arranged, Platform 3PL
    order_status VARCHAR(50) NOT NULL DEFAULT 'PLACED', -- PLACED, CONFIRMED, DISPATCHED, DELIVERED, CANCELLED
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ESCROW_HELD, RELEASED_TO_FARMER, REFUNDED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_buyer (buyer_id),
    INDEX idx_order_farmer (farmer_id),
    INDEX idx_order_status (order_status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE (Payment / Escrow audit log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(100) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    payer_id BIGINT NOT NULL,
    payee_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_gateway VARCHAR(50) DEFAULT 'RAZORPAY_ESCROW',
    gateway_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, PENDING, FAILED, REFUNDED
    escrow_release_status VARCHAR(50) DEFAULT 'HELD', -- HELD, RELEASED, DISPUTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. PRICE PREDICTIONS LOG (XGBoost Audit and Calibration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    byproduct_type VARCHAR(100) NOT NULL,
    moisture_content_percent DECIMAL(5, 2) NOT NULL,
    organic_matter_percent DECIMAL(5, 2),
    quantity_tons DECIMAL(10, 2) NOT NULL,
    state VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL,
    transport_distance_km DECIMAL(8, 2) DEFAULT 50.0,
    predicted_price_per_ton DECIMAL(10, 2) NOT NULL,
    confidence_lower_bound DECIMAL(10, 2),
    confidence_upper_bound DECIMAL(10, 2),
    model_version VARCHAR(50) DEFAULT 'xgboost-v1.2',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 8. INQUIRIES & NEGOTIATIONS TABLE (Farmer-Buyer chat/bidding)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    offered_price_per_ton DECIMAL(10, 2),
    requested_quantity_tons DECIMAL(10, 2),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COUNTERED, ACCEPTED, DECLINED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 9. REVIEWS AND RATINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    reviewer_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
