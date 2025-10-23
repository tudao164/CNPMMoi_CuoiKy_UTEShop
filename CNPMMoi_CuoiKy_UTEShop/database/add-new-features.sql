-- ===================================================================
-- Add New Features: Reviews, Coupons, Enhanced Statistics
-- ===================================================================

USE uteshop;

-- ===================================================================
-- 1. PRODUCT REVIEWS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
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

-- Review helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful (
    id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_review (user_id, review_id),
    INDEX idx_review_id (review_id)
);

-- ===================================================================
-- 2. COUPONS/VOUCHERS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS coupons (
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
CREATE TABLE IF NOT EXISTS coupon_usage (
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

-- ===================================================================
-- 3. ADD COUPON FIELDS TO ORDERS TABLE
-- ===================================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_id INT NULL AFTER payment_method,
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) NULL AFTER coupon_id,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0 AFTER coupon_code,
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) NULL AFTER discount_amount;

-- Add foreign key for coupon_id
ALTER TABLE orders
ADD CONSTRAINT fk_orders_coupon 
FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- ===================================================================
-- 4. ADD AVERAGE RATING TO PRODUCTS TABLE
-- ===================================================================

ALTER TABLE products
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 AFTER sold_count,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0 AFTER average_rating;

-- ===================================================================
-- 5. SAMPLE DATA
-- ===================================================================

-- Sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, created_by, is_active) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10.00, 100.00, 50.00, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, TRUE),
('FREESHIP', 'Miễn phí vận chuyển cho đơn từ 200k', 'fixed_amount', 30.00, 200.00, 30.00, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, TRUE),
('SUMMER50', 'Giảm 50k cho đơn hàng từ 500k', 'fixed_amount', 50.00, 500.00, 50.00, 500, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 1, TRUE),
('VIP20', 'Giảm 20% cho khách hàng VIP', 'percentage', 20.00, 300.00, 100.00, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), 1, TRUE);

-- Sample reviews
INSERT INTO product_reviews (product_id, user_id, order_id, rating, title, comment, is_verified_purchase) VALUES
(1, 2, 1, 5, 'Sản phẩm tuyệt vời!', 'iPhone 15 Pro rất đáng giá. Hiệu năng mạnh mẽ, camera xuất sắc.', TRUE),
(4, 2, 2, 4, 'Tai nghe tốt', 'Chất lượng âm thanh ổn, pin trâu. Hơi to so với tai.', TRUE),
(7, 3, 3, 5, 'Rất hài lòng', 'Giày đẹp, chất lượng tốt, giao hàng nhanh.', TRUE);

-- Update product ratings
UPDATE products p SET 
    average_rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE),
    review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE);

-- ===================================================================
-- 6. TRIGGERS FOR AUTO-UPDATE
-- ===================================================================

-- Trigger to update product rating when review is added
DROP TRIGGER IF EXISTS update_product_rating_after_insert;
DELIMITER $$
CREATE TRIGGER update_product_rating_after_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products 
    SET 
        average_rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
    WHERE id = NEW.product_id;
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
        average_rating = (SELECT AVG(rating) FROM product_reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
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
        average_rating = COALESCE((SELECT AVG(rating) FROM product_reviews WHERE product_id = OLD.product_id AND is_approved = TRUE), 0),
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

COMMIT;
