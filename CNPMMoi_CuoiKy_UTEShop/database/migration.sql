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
    END;

-- Commit changes
COMMIT;
