-- Migration script để cập nhật database schema
-- Chạy script này nếu database đã tồn tại và cần thêm các trường mới

-- Thêm trường avatar_url vào bảng users
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) AFTER phone;

-- Thêm các trường mới vào bảng products
ALTER TABLE products 
ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0 AFTER sale_price,
ADD COLUMN images JSON AFTER image_url,
ADD COLUMN specifications JSON AFTER images,
ADD COLUMN view_count INT DEFAULT 0 AFTER specifications,
ADD COLUMN sold_count INT DEFAULT 0 AFTER view_count,
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER sold_count;

-- Thêm indexes mới cho products
ALTER TABLE products 
ADD INDEX idx_view_count (view_count),
ADD INDEX idx_sold_count (sold_count),
ADD INDEX idx_is_featured (is_featured),
ADD INDEX idx_created_at (created_at);

-- Tạo bảng orders nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS orders (
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

-- Tạo bảng order_items nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS order_items (
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

-- =====================================
-- NEW FEATURES: CART, PAYMENT, ORDER TRACKING
-- =====================================

-- 1. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
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

-- 2. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
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
    INDEX idx_payment_method (payment_method)
);

-- 3. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    reason TEXT NULL,
    updated_by ENUM('system', 'admin', 'user') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
);

-- 4. CANCEL REQUESTS TABLE
CREATE TABLE IF NOT EXISTS cancel_requests (
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
    INDEX idx_status (status)
);

-- 5. UPDATE ORDERS TABLE WITH NEW STATUS AND FIELDS
-- Add new columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method ENUM('COD', 'E_WALLET', 'BANK_TRANSFER', 'CREDIT_CARD') DEFAULT 'COD' AFTER status,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP NULL AFTER notes,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL AFTER confirmed_at,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL AFTER shipped_at,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL AFTER delivered_at,
ADD COLUMN IF NOT EXISTS cancel_reason TEXT NULL AFTER cancelled_at,
ADD COLUMN IF NOT EXISTS auto_confirm_at TIMESTAMP NULL AFTER cancel_reason;

-- Update status enum to include new statuses
ALTER TABLE orders MODIFY COLUMN status ENUM(
    'new', 
    'confirmed', 
    'preparing', 
    'shipping', 
    'delivered', 
    'cancelled',
    'cancel_requested'
) DEFAULT 'new';

-- Add indexes for performance
ALTER TABLE orders 
ADD INDEX IF NOT EXISTS idx_payment_method (payment_method),
ADD INDEX IF NOT EXISTS idx_confirmed_at (confirmed_at),
ADD INDEX IF NOT EXISTS idx_auto_confirm_at (auto_confirm_at);

-- 6. CREATE TRIGGER FOR ORDER STATUS HISTORY
DROP TRIGGER IF EXISTS order_status_change_trigger;

DELIMITER $$
CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, updated_by)
        VALUES (NEW.id, OLD.status, NEW.status, 'system');
    END IF;
END$$
DELIMITER ;

-- 7. CREATE STORED PROCEDURE FOR AUTO-CONFIRMATION
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

-- 8. CREATE EVENT FOR AUTO-CONFIRMATION
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS auto_confirm_orders;
CREATE EVENT auto_confirm_orders
ON SCHEDULE EVERY 1 MINUTE
STARTS CURRENT_TIMESTAMP
DO
    CALL AutoConfirmOrders();

-- Cập nhật dữ liệu mẫu cho products (chỉ chạy nếu bảng products đã có dữ liệu)
UPDATE products SET 
    discount_percentage = CASE 
        WHEN sale_price IS NOT NULL AND price > sale_price 
        THEN ROUND(((price - sale_price) / price) * 100, 2)
        ELSE 0 
    END,
    images = CASE id
        WHEN 1 THEN JSON_ARRAY('/images/iphone15pro-1.jpg', '/images/iphone15pro-2.jpg', '/images/iphone15pro-3.jpg')
        WHEN 2 THEN JSON_ARRAY('/images/galaxy-s24-1.jpg', '/images/galaxy-s24-2.jpg')
        ELSE JSON_ARRAY(image_url)
    END,
    view_count = FLOOR(RAND() * 1500) + 100,
    sold_count = FLOOR(RAND() * 200) + 10,
    is_featured = CASE 
        WHEN id IN (1, 2, 8, 11) THEN TRUE 
        ELSE FALSE 
    END
WHERE discount_percentage IS NULL OR discount_percentage = 0;

-- Update existing orders
UPDATE orders SET status = 'new' WHERE status = 'pending';
UPDATE orders 
SET auto_confirm_at = DATE_ADD(created_at, INTERVAL 30 MINUTE)
WHERE status = 'new' AND auto_confirm_at IS NULL;

-- Commit changes
COMMIT;
