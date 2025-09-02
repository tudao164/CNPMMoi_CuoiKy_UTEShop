-- UTEShop Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS uteshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uteshop;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_verified (is_verified)
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

-- Categories table (for future e-commerce features)
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table (for future e-commerce features)
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
    INDEX idx_created_at (created_at)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
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

-- Insert sample data
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Fashion and apparel'),
('Books', 'Books and educational materials'),
('Home & Garden', 'Home improvement and garden supplies');

-- Insert sample products
INSERT INTO products (name, description, price, sale_price, discount_percentage, stock_quantity, category_id, image_url, images, view_count, sold_count, is_featured) VALUES
('iPhone 15 Pro', 'Latest iPhone with advanced features', 999.99, 899.99, 10.00, 50, 1, '/images/iphone15pro.jpg', '["./images/iphone15pro-1.jpg", "/images/iphone15pro-2.jpg", "/images/iphone15pro-3.jpg"]', 1250, 45, TRUE),
('Samsung Galaxy S24', 'High-performance Android smartphone', 849.99, NULL, 0, 30, 1, '/images/galaxy-s24.jpg', '["./images/galaxy-s24-1.jpg", "/images/galaxy-s24-2.jpg"]', 980, 35, TRUE),
('MacBook Pro M3', 'Professional laptop with M3 chip', 1999.99, 1799.99, 10.00, 25, 1, '/images/macbook-pro-m3.jpg', '["./images/macbook-pro-m3-1.jpg", "/images/macbook-pro-m3-2.jpg"]', 1500, 28, TRUE),
('Nike Air Max', 'Comfortable running shoes', 129.99, 99.99, 23.08, 100, 2, '/images/nike-air-max.jpg', '["./images/nike-air-max-1.jpg", "/images/nike-air-max-2.jpg"]', 750, 120, FALSE),
('Adidas Ultraboost', 'Premium running shoes', 159.99, 129.99, 18.75, 80, 2, '/images/adidas-ultraboost.jpg', '["./images/adidas-ultraboost-1.jpg"]', 650, 85, FALSE),
('JavaScript Programming Book', 'Learn JavaScript from basics to advanced', 49.99, NULL, 0, 200, 3, '/images/js-book.jpg', '["./images/js-book-1.jpg"]', 420, 180, FALSE),
('React Complete Guide', 'Master React development', 59.99, 39.99, 33.34, 150, 3, '/images/react-book.jpg', '["./images/react-book-1.jpg"]', 380, 95, FALSE),
('Home Security Camera', 'Smart security camera system', 199.99, 149.99, 25.00, 60, 4, '/images/security-camera.jpg', '["./images/security-camera-1.jpg", "/images/security-camera-2.jpg"]', 890, 42, TRUE),
('Smart LED Bulbs Set', 'WiFi controlled LED lighting', 79.99, 59.99, 25.00, 120, 4, '/images/led-bulbs.jpg', '["./images/led-bulbs-1.jpg"]', 560, 95, FALSE),
('Wireless Gaming Headset', 'High-quality gaming audio', 149.99, 119.99, 20.00, 75, 1, '/images/gaming-headset.jpg', '["./images/gaming-headset-1.jpg", "/images/gaming-headset-2.jpg"]', 1120, 68, FALSE),
('Smart Watch Pro', 'Advanced fitness tracking', 299.99, 249.99, 16.67, 40, 1, '/images/smart-watch.jpg', '["./images/smart-watch-1.jpg", "/images/smart-watch-2.jpg"]', 920, 55, TRUE),
('Bluetooth Speaker', 'Portable high-quality speaker', 89.99, 69.99, 22.23, 90, 1, '/images/bluetooth-speaker.jpg', '["./images/bluetooth-speaker-1.jpg"]', 680, 78, FALSE);
