-- ===================================================================
-- UTEShop Complete Database Schema
-- Run this script to create the entire database from scratch
-- ===================================================================

-- Set SQL mode and character set
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Create database
DROP DATABASE IF EXISTS uteshop;
CREATE DATABASE uteshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uteshop;

-- ===================================================================
-- CORE TABLES
-- ===================================================================

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_verified (is_verified),
    INDEX idx_is_admin (is_admin)
);

-- OTP codes table
CREATE TABLE otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    otp_type ENUM('register', 'reset_password') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_otp_code (otp_code),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_used (is_used)
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    category_id INT,
    image_url VARCHAR(500),
    images JSON,
    specifications JSON,
    view_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active),
    INDEX idx_price (price),
    INDEX idx_view_count (view_count),
    INDEX idx_sold_count (sold_count),
    INDEX idx_is_featured (is_featured),
    INDEX idx_created_at (created_at),
    INDEX idx_name (name)
);

-- ===================================================================
-- E-COMMERCE TABLES
-- ===================================================================

-- Cart Items table
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_added_at (added_at)
);

-- Orders table (Enhanced with new statuses and payment info)
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('new', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'cancel_requested') DEFAULT 'new',
    payment_method ENUM('COD', 'E_WALLET', 'BANK_TRANSFER', 'CREDIT_CARD') DEFAULT 'COD',
    shipping_address TEXT,
    notes TEXT,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancel_reason TEXT NULL,
    auto_confirm_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_created_at (created_at),
    INDEX idx_confirmed_at (confirmed_at),
    INDEX idx_auto_confirm_at (auto_confirm_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method ENUM('COD', 'E_WALLET', 'BANK_TRANSFER', 'CREDIT_CARD') DEFAULT 'COD',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(255) NULL,
    gateway_response JSON NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_transaction_id (transaction_id)
);

-- Order Status History table
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    reason TEXT NULL,
    updated_by ENUM('system', 'admin', 'user') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_by (updated_by)
);

-- Cancel Requests table
CREATE TABLE cancel_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_response TEXT NULL,
    processed_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- ===================================================================
-- TRIGGERS AND STORED PROCEDURES
-- ===================================================================

-- Enable event scheduler for auto-confirmation
SET GLOBAL event_scheduler = ON;

-- Create BEFORE trigger for updating timestamp fields
DROP TRIGGER IF EXISTS order_status_timestamp_trigger;

DELIMITER $$
CREATE TRIGGER order_status_timestamp_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    -- Update timestamp fields based on status change
    IF OLD.status != NEW.status THEN
        IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
            SET NEW.confirmed_at = NOW();
        ELSEIF NEW.status = 'shipping' AND NEW.shipped_at IS NULL THEN
            SET NEW.shipped_at = NOW();
        ELSEIF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
            SET NEW.delivered_at = NOW();
        ELSEIF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
            SET NEW.cancelled_at = NOW();
        END IF;
    END IF;
END$$
DELIMITER ;

-- Create AFTER trigger for order status history tracking
DROP TRIGGER IF EXISTS order_status_history_trigger;

DELIMITER $$
CREATE TRIGGER order_status_history_trigger
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, updated_by)
        VALUES (NEW.id, OLD.status, NEW.status, 'system');
    END IF;
END$$
DELIMITER ;

-- Stored procedure for auto-confirming orders
DROP PROCEDURE IF EXISTS AutoConfirmOrders;

DELIMITER $$
CREATE PROCEDURE AutoConfirmOrders()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE order_id INT;
    DECLARE order_cursor CURSOR FOR 
        SELECT id FROM orders 
        WHERE status = 'new' 
        AND auto_confirm_at <= NOW()
        AND auto_confirm_at IS NOT NULL;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN order_cursor;
    
    read_loop: LOOP
        FETCH order_cursor INTO order_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE orders 
        SET status = 'confirmed', 
            confirmed_at = NOW()
        WHERE id = order_id;
        
    END LOOP;
    
    CLOSE order_cursor;
END$$
DELIMITER ;

-- Create event for auto-confirmation (runs every 5 minutes)
DROP EVENT IF EXISTS auto_confirm_orders;
CREATE EVENT auto_confirm_orders
ON SCHEDULE EVERY 5 MINUTE
STARTS CURRENT_TIMESTAMP
DO
    CALL AutoConfirmOrders();

-- Trigger to set auto_confirm_at when order is created
DROP TRIGGER IF EXISTS set_auto_confirm_trigger;

DELIMITER $$
CREATE TRIGGER set_auto_confirm_trigger
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'new' AND NEW.auto_confirm_at IS NULL THEN
        SET NEW.auto_confirm_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE);
    END IF;
END$$
DELIMITER ;

-- ===================================================================
-- SAMPLE DATA
-- ===================================================================

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Electronic devices and gadgets', '/images/categories/electronics.jpg'),
('Clothing', 'Fashion and apparel', '/images/categories/clothing.jpg'),
('Books', 'Books and educational materials', '/images/categories/books.jpg'),
('Home & Garden', 'Home improvement and garden supplies', '/images/categories/home-garden.jpg'),
('Sports', 'Sports equipment and accessories', '/images/categories/sports.jpg'),
('Beauty', 'Beauty and personal care products', '/images/categories/beauty.jpg');

-- Insert sample products
INSERT INTO products (name, description, price, sale_price, discount_percentage, stock_quantity, category_id, image_url, images, specifications, view_count, sold_count, is_featured) VALUES
-- Electronics
('iPhone 15 Pro', 'Latest iPhone with advanced features and titanium design', 999.99, 899.99, 10.00, 50, 1, '/images/iphone15pro.jpg', 
JSON_ARRAY('/images/iphone15pro-1.jpg', '/images/iphone15pro-2.jpg', '/images/iphone15pro-3.jpg'), 
JSON_OBJECT('screen', '6.1 inch', 'storage', '128GB', 'camera', '48MP', 'color', 'Natural Titanium'), 
1250, 45, TRUE),

('Samsung Galaxy S24', 'High-performance Android smartphone with AI features', 849.99, NULL, 0, 30, 1, '/images/galaxy-s24.jpg', 
JSON_ARRAY('/images/galaxy-s24-1.jpg', '/images/galaxy-s24-2.jpg'), 
JSON_OBJECT('screen', '6.2 inch', 'storage', '256GB', 'camera', '50MP', 'color', 'Phantom Black'), 
980, 35, TRUE),

('MacBook Pro M3', 'Professional laptop with M3 chip for ultimate performance', 1999.99, 1799.99, 10.00, 25, 1, '/images/macbook-pro-m3.jpg', 
JSON_ARRAY('/images/macbook-pro-m3-1.jpg', '/images/macbook-pro-m3-2.jpg'), 
JSON_OBJECT('screen', '14 inch', 'processor', 'M3 Pro', 'memory', '18GB', 'storage', '512GB SSD'), 
1500, 28, TRUE),

('Wireless Gaming Headset', 'High-quality gaming audio with surround sound', 149.99, 119.99, 20.00, 75, 1, '/images/gaming-headset.jpg', 
JSON_ARRAY('/images/gaming-headset-1.jpg', '/images/gaming-headset-2.jpg'), 
JSON_OBJECT('type', 'Over-ear', 'connection', 'Wireless', 'battery', '20 hours', 'compatibility', 'PC, PS5, Xbox'), 
1120, 68, FALSE),

('Smart Watch Pro', 'Advanced fitness tracking and smart features', 299.99, 249.99, 16.67, 40, 1, '/images/smart-watch.jpg', 
JSON_ARRAY('/images/smart-watch-1.jpg', '/images/smart-watch-2.jpg'), 
JSON_OBJECT('display', 'AMOLED', 'battery', '7 days', 'waterproof', '5ATM', 'GPS', 'Built-in'), 
920, 55, TRUE),

('Bluetooth Speaker', 'Portable high-quality speaker with deep bass', 89.99, 69.99, 22.23, 90, 1, '/images/bluetooth-speaker.jpg', 
JSON_ARRAY('/images/bluetooth-speaker-1.jpg'), 
JSON_OBJECT('power', '20W', 'battery', '12 hours', 'waterproof', 'IPX7', 'connectivity', 'Bluetooth 5.0'), 
680, 78, FALSE),

-- Clothing
('Nike Air Max', 'Comfortable running shoes with air cushioning', 129.99, 99.99, 23.08, 100, 2, '/images/nike-air-max.jpg', 
JSON_ARRAY('/images/nike-air-max-1.jpg', '/images/nike-air-max-2.jpg'), 
JSON_OBJECT('type', 'Running Shoes', 'size', '7-12', 'color', 'White/Black', 'material', 'Mesh/Synthetic'), 
750, 120, FALSE),

('Adidas Ultraboost', 'Premium running shoes with boost technology', 159.99, 129.99, 18.75, 80, 2, '/images/adidas-ultraboost.jpg', 
JSON_ARRAY('/images/adidas-ultraboost-1.jpg'), 
JSON_OBJECT('type', 'Running Shoes', 'technology', 'Boost', 'upper', 'Primeknit', 'sole', 'Continental Rubber'), 
650, 85, FALSE),

('Premium Cotton T-Shirt', 'High-quality cotton t-shirt for everyday wear', 29.99, 24.99, 16.67, 200, 2, '/images/cotton-tshirt.jpg', 
JSON_ARRAY('/images/cotton-tshirt-1.jpg'), 
JSON_OBJECT('material', '100% Cotton', 'fit', 'Regular', 'colors', 'Multiple', 'care', 'Machine Washable'), 
420, 150, FALSE),

-- Books
('JavaScript Programming Book', 'Learn JavaScript from basics to advanced concepts', 49.99, NULL, 0, 200, 3, '/images/js-book.jpg', 
JSON_ARRAY('/images/js-book-1.jpg'), 
JSON_OBJECT('pages', '500', 'level', 'Beginner to Advanced', 'format', 'Paperback', 'edition', '2024'), 
420, 180, FALSE),

('React Complete Guide', 'Master React development with modern techniques', 59.99, 39.99, 33.34, 150, 3, '/images/react-book.jpg', 
JSON_ARRAY('/images/react-book-1.jpg'), 
JSON_OBJECT('pages', '600', 'level', 'Intermediate', 'includes', 'Online Resources', 'updated', '2024'), 
380, 95, FALSE),

-- Home & Garden
('Home Security Camera', 'Smart security camera system with night vision', 199.99, 149.99, 25.00, 60, 4, '/images/security-camera.jpg', 
JSON_ARRAY('/images/security-camera-1.jpg', '/images/security-camera-2.jpg'), 
JSON_OBJECT('resolution', '1080p', 'features', 'Night Vision, Motion Detection', 'storage', 'Cloud/Local', 'app', 'iOS/Android'), 
890, 42, TRUE),

('Smart LED Bulbs Set', 'WiFi controlled LED lighting with color changing', 79.99, 59.99, 25.00, 120, 4, '/images/led-bulbs.jpg', 
JSON_ARRAY('/images/led-bulbs-1.jpg'), 
JSON_OBJECT('quantity', '4 bulbs', 'colors', '16 million', 'dimming', 'Yes', 'voice_control', 'Alexa, Google'), 
560, 95, FALSE),

('Robot Vacuum Cleaner', 'Automated cleaning with smart navigation', 299.99, 249.99, 16.67, 35, 4, '/images/robot-vacuum.jpg', 
JSON_ARRAY('/images/robot-vacuum-1.jpg'), 
JSON_OBJECT('battery', '120 minutes', 'features', 'Mapping, Scheduling', 'bin_capacity', '0.6L', 'height', '9.5cm'), 
720, 28, TRUE);

-- Insert sample users for testing
INSERT INTO users (email, password, full_name, phone, is_verified, is_admin) VALUES
('admin@uteshop.com', '$2b$10$8K1p/a9aasdf8wdwq.3/.uK0d6h2kZ0/2.HkUps1rsjsdfaYE6c2', 'Admin User', '0123456789', TRUE, TRUE),
('user1@gmail.com', '$2b$10$8K1p/a9aasdf8wdwq.3/.uK0d6h2kZ0/2.HkUps1rsjsdfaYE6c2', 'Nguyen Van A', '0987654321', TRUE, FALSE),
('user2@gmail.com', '$2b$10$8K1p/a9aasdf8wdwq.3/.uK0d6h2kZ0/2.HkUps1rsjsdfaYE6c2', 'Tran Thi B', '0901234567', TRUE, FALSE);

-- Insert sample orders for testing
INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address, notes) VALUES
(2, 999.99, 'new', 'COD', '123 Nguyen Van Cu, District 5, Ho Chi Minh City', 'Please call before delivery'),
(2, 459.98, 'confirmed', 'E_WALLET', '456 Le Van Sy, District 3, Ho Chi Minh City', 'Apartment 10A'),
(3, 129.99, 'delivered', 'COD', '789 Tran Hung Dao, District 1, Ho Chi Minh City', 'Office delivery');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 899.99),
(2, 4, 1, 119.99),
(2, 9, 1, 24.99),
(2, 12, 1, 59.99),
(3, 7, 1, 99.99);

-- Insert sample payments
INSERT INTO payments (order_id, payment_method, payment_status, amount) VALUES
(1, 'COD', 'pending', 999.99),
(2, 'E_WALLET', 'completed', 459.98),
(3, 'COD', 'completed', 129.99);

-- ===================================================================
-- EXTENDED FEATURES: Reviews, Coupons, Enhanced Orders
-- ===================================================================

-- ===================================================================
-- PRODUCT REVIEWS SYSTEM
-- ===================================================================

-- Product reviews table
CREATE TABLE product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    images JSON,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_order (user_id, product_id, order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_is_approved (is_approved),
    INDEX idx_created_at (created_at)
);

ALTER TABLE product_reviews
MODIFY COLUMN images VARCHAR(255);


-- Review helpful votes table
CREATE TABLE review_helpful (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_review (user_id, review_id),
    INDEX idx_review_id (review_id)
);

-- Add rating columns to products table
ALTER TABLE products
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0 AFTER sold_count,
ADD COLUMN review_count INT DEFAULT 0 AFTER average_rating;

-- ===================================================================
-- COUPONS/VOUCHERS SYSTEM
-- ===================================================================

-- Coupons table
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2) NULL,
    usage_limit INT NULL,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to ENUM('all', 'category', 'product') DEFAULT 'all',
    applies_to_ids JSON NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- Coupon usage history
CREATE TABLE coupon_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
);

-- Add coupon fields to orders table
ALTER TABLE orders 
ADD COLUMN coupon_id INT NULL AFTER payment_method,
ADD COLUMN coupon_code VARCHAR(50) NULL AFTER coupon_id,
ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0 AFTER coupon_code,
ADD COLUMN subtotal_amount DECIMAL(10,2) NULL AFTER discount_amount,
ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- ===================================================================
-- SAMPLE DATA FOR NEW FEATURES
-- ===================================================================

-- Sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, start_date, end_date, created_by, is_active) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10.00, 100.00, 50.00, 1000, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, TRUE),
('FREESHIP', 'Miễn phí vận chuyển cho đơn từ 200k', 'fixed_amount', 30.00, 200.00, 30.00, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, TRUE),
('SUMMER50', 'Giảm 50k cho đơn hàng từ 500k', 'fixed_amount', 50.00, 500.00, 50.00, 500, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 1, TRUE),
('VIP20', 'Giảm 20% cho khách hàng VIP (max 100k)', 'percentage', 20.00, 300.00, 100.00, NULL, 5, NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), 1, TRUE),
('BLACKFRIDAY', 'Black Friday - Giảm 25%', 'percentage', 25.00, 500.00, 200.00, 10000, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, TRUE);

-- Sample reviews
INSERT INTO product_reviews (product_id, user_id, order_id, rating, title, comment, is_verified_purchase, is_approved) VALUES
(1, 2, 1, 5, 'Sản phẩm tuyệt vời!', 'iPhone 15 Pro rất đáng giá. Hiệu năng mạnh mẽ, camera xuất sắc. Giao hàng nhanh, đóng gói cẩn thận.', TRUE, TRUE),
(4, 2, 2, 4, 'Tai nghe tốt trong tầm giá', 'Chất lượng âm thanh ổn định, pin trâu. Thiết kế hơi to so với tai mình. Nhìn chung OK!', TRUE, TRUE),
(7, 3, 3, 5, 'Rất hài lòng với sản phẩm', 'Giày đẹp, chất lượng tốt, đúng size. Giao hàng nhanh chóng. Sẽ ủng hộ shop tiếp!', TRUE, TRUE);

-- ===================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ===================================================================

-- Trigger to update product rating when review is added
DROP TRIGGER IF EXISTS update_product_rating_after_insert;
DELIMITER $$
CREATE TRIGGER update_product_rating_after_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    IF NEW.is_approved = TRUE THEN
        UPDATE products 
        SET 
            average_rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
            review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
        WHERE id = NEW.product_id;
    END IF;
END$$
DELIMITER ;

-- Trigger to update product rating when review is updated
DROP TRIGGER IF EXISTS update_product_rating_after_update;
DELIMITER $$
CREATE TRIGGER update_product_rating_after_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products 
    SET 
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
    WHERE id = NEW.product_id;
END$$
DELIMITER ;

-- Trigger to update product rating when review is deleted
DROP TRIGGER IF EXISTS update_product_rating_after_delete;
DELIMITER $$
CREATE TRIGGER update_product_rating_after_delete
AFTER DELETE ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products 
    SET 
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = OLD.product_id AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = OLD.product_id AND is_approved = TRUE)
    WHERE id = OLD.product_id;
END$$
DELIMITER ;

-- Trigger to update coupon usage count
DROP TRIGGER IF EXISTS update_coupon_usage_count;
DELIMITER $$
CREATE TRIGGER update_coupon_usage_count
AFTER INSERT ON coupon_usage
FOR EACH ROW
BEGIN
    UPDATE coupons 
    SET usage_count = usage_count + 1
    WHERE id = NEW.coupon_id;
END$$
DELIMITER ;

-- Commit all changes
COMMIT;
