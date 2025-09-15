const { executeQuery, getOne, insert } = require('../config/database');

class Cart {
    constructor(cartData) {
        this.id = cartData.id;
        this.user_id = cartData.user_id;
        this.product_id = cartData.product_id;
        this.quantity = cartData.quantity;
        this.added_at = cartData.added_at;
        this.updated_at = cartData.updated_at;
        
        // Product details (when joined)
        this.product_name = cartData.product_name;
        this.product_price = parseFloat(cartData.product_price || 0);
        this.product_sale_price = parseFloat(cartData.product_sale_price || 0);
        this.product_image = cartData.product_image;
        this.product_stock = cartData.product_stock;
        this.is_in_stock = cartData.is_in_stock;
        this.category_name = cartData.category_name;
    }

    // Add item to cart or update quantity if exists
    static async addItem(userId, productId, quantity = 1) {
        try {
            // Check if item already exists in cart
            const existingItem = await getOne(
                'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;
                await executeQuery(
                    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [newQuantity, existingItem.id]
                );
                return await Cart.getCartItem(existingItem.id);
            } else {
                // Add new item
                const result = await executeQuery(
                    'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                    [userId, productId, quantity]
                );
                return await Cart.getCartItem(result.insertId);
            }
        } catch (error) {
            console.error('❌ Error adding item to cart:', error);
            throw new Error('Lỗi thêm sản phẩm vào giỏ hàng');
        }
    }

    // Get single cart item with product details
    static async getCartItem(cartItemId) {
        try {
            const cartData = await getOne(`
                SELECT 
                    ci.*,
                    p.name as product_name,
                    p.price as product_price,
                    p.sale_price as product_sale_price,
                    p.image_url as product_image,
                    p.stock_quantity as product_stock,
                    p.stock_quantity > 0 as is_in_stock,
                    c.name as category_name
                FROM cart_items ci
                LEFT JOIN products p ON ci.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE ci.id = ? AND p.is_active = TRUE
            `, [cartItemId]);

            return cartData ? new Cart(cartData) : null;
        } catch (error) {
            console.error('❌ Error getting cart item:', error);
            throw new Error('Lỗi lấy thông tin sản phẩm trong giỏ hàng');
        }
    }

    // Get all cart items for user
    static async getUserCart(userId) {
        try {
            const cartItems = await executeQuery(`
                SELECT 
                    ci.*,
                    p.name as product_name,
                    p.price as product_price,
                    p.sale_price as product_sale_price,
                    p.discount_percentage,
                    p.image_url as product_image,
                    p.stock_quantity as product_stock,
                    p.stock_quantity > 0 as is_in_stock,
                    c.name as category_name
                FROM cart_items ci
                LEFT JOIN products p ON ci.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE ci.user_id = ? AND p.is_active = TRUE
                ORDER BY ci.added_at DESC
            `, [userId]);

            return cartItems.map(item => new Cart(item));
        } catch (error) {
            console.error('❌ Error getting user cart:', error);
            throw new Error('Lỗi lấy giỏ hàng của người dùng');
        }
    }

    // Update cart item quantity
    static async updateQuantity(cartItemId, userId, quantity) {
        try {
            if (quantity <= 0) {
                return await Cart.removeItem(cartItemId, userId);
            }

            // Verify ownership
            const existingItem = await getOne(
                'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
                [cartItemId, userId]
            );

            if (!existingItem) {
                throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
            }

            await executeQuery(
                'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [quantity, cartItemId]
            );

            return await Cart.getCartItem(cartItemId);
        } catch (error) {
            console.error('❌ Error updating cart quantity:', error);
            throw new Error(error.message || 'Lỗi cập nhật số lượng sản phẩm');
        }
    }

    // Remove item from cart
    static async removeItem(cartItemId, userId) {
        try {
            // Verify ownership
            const existingItem = await getOne(
                'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
                [cartItemId, userId]
            );

            if (!existingItem) {
                throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
            }

            await executeQuery(
                'DELETE FROM cart_items WHERE id = ?',
                [cartItemId]
            );

            return true;
        } catch (error) {
            console.error('❌ Error removing cart item:', error);
            throw new Error(error.message || 'Lỗi xóa sản phẩm khỏi giỏ hàng');
        }
    }

    // Clear all cart items for user
    static async clearCart(userId) {
        try {
            await executeQuery(
                'DELETE FROM cart_items WHERE user_id = ?',
                [userId]
            );
            return true;
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            throw new Error('Lỗi xóa giỏ hàng');
        }
    }

    // Get cart summary (total items, total amount)
    static async getCartSummary(userId) {
        try {
            const summary = await getOne(`
                SELECT 
                    COUNT(*) as total_items,
                    SUM(ci.quantity) as total_quantity,
                    SUM(
                        ci.quantity * 
                        CASE 
                            WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 
                            THEN p.sale_price 
                            ELSE p.price 
                        END
                    ) as total_amount,
                    SUM(
                        ci.quantity * p.price
                    ) as original_amount,
                    SUM(
                        ci.quantity * 
                        CASE 
                            WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 
                            THEN (p.price - p.sale_price)
                            ELSE 0 
                        END
                    ) as total_savings
                FROM cart_items ci
                LEFT JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ? AND p.is_active = TRUE AND p.stock_quantity > 0
            `, [userId]);

            return {
                total_items: parseInt(summary.total_items) || 0,
                total_quantity: parseInt(summary.total_quantity) || 0,
                total_amount: parseFloat(summary.total_amount) || 0,
                original_amount: parseFloat(summary.original_amount) || 0,
                total_savings: parseFloat(summary.total_savings) || 0
            };
        } catch (error) {
            console.error('❌ Error getting cart summary:', error);
            throw new Error('Lỗi lấy tổng quan giỏ hàng');
        }
    }

    // Check cart validity (stock availability)
    static async validateCart(userId) {
        try {
            const invalidItems = await executeQuery(`
                SELECT 
                    ci.id,
                    ci.quantity,
                    p.name as product_name,
                    p.stock_quantity,
                    CASE 
                        WHEN p.is_active = FALSE THEN 'inactive'
                        WHEN p.stock_quantity = 0 THEN 'out_of_stock'
                        WHEN ci.quantity > p.stock_quantity THEN 'insufficient_stock'
                        ELSE 'valid'
                    END as issue
                FROM cart_items ci
                LEFT JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ?
                HAVING issue != 'valid'
            `, [userId]);

            return {
                is_valid: invalidItems.length === 0,
                invalid_items: invalidItems
            };
        } catch (error) {
            console.error('❌ Error validating cart:', error);
            throw new Error('Lỗi kiểm tra giỏ hàng');
        }
    }

    // Convert cart items to order items format
    static async getOrderItems(userId) {
        try {
            const cartItems = await executeQuery(`
                SELECT 
                    ci.product_id,
                    ci.quantity,
                    CASE 
                        WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 
                        THEN p.sale_price 
                        ELSE p.price 
                    END as price
                FROM cart_items ci
                LEFT JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ? AND p.is_active = TRUE AND p.stock_quantity >= ci.quantity
            `, [userId]);

            return cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: parseFloat(item.price)
            }));
        } catch (error) {
            console.error('❌ Error getting order items from cart:', error);
            throw new Error('Lỗi chuyển đổi giỏ hàng thành đơn hàng');
        }
    }

    // Get effective price for this cart item
    getEffectivePrice() {
        return this.product_sale_price && this.product_sale_price > 0 
            ? this.product_sale_price 
            : this.product_price;
    }

    // Get total price for this cart item
    getTotalPrice() {
        return this.getEffectivePrice() * this.quantity;
    }

    // Get discount amount for this cart item
    getDiscountAmount() {
        if (this.product_sale_price && this.product_sale_price > 0) {
            return (this.product_price - this.product_sale_price) * this.quantity;
        }
        return 0;
    }

    // Check if item is available
    isAvailable() {
        return this.is_in_stock && this.product_stock >= this.quantity;
    }

    // Convert to JSON for API response
    toJSON() {
        return {
            id: this.id,
            product_id: this.product_id,
            product_name: this.product_name,
            product_image: this.product_image,
            category_name: this.category_name,
            quantity: this.quantity,
            price: this.product_price,
            sale_price: this.product_sale_price,
            effective_price: this.getEffectivePrice(),
            total_price: this.getTotalPrice(),
            discount_amount: this.getDiscountAmount(),
            stock_quantity: this.product_stock,
            is_available: this.isAvailable(),
            added_at: this.added_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Cart;