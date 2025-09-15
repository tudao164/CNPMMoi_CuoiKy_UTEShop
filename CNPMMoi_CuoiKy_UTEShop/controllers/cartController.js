const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class CartController {
    // GET /api/cart - Lấy giỏ hàng của user
    static async getCart(req, res) {
        try {
            const userId = req.user.id;

            // Lấy danh sách sản phẩm trong giỏ hàng
            const cartItems = await Cart.getUserCart(userId);

            // Lấy tổng quan giỏ hàng
            const summary = await Cart.getCartSummary(userId);

            // Kiểm tra tính hợp lệ của giỏ hàng
            const validation = await Cart.validateCart(userId);

            return successResponse(res, {
                items: cartItems.map(item => item.toJSON()),
                summary,
                validation,
                message: 'Lấy giỏ hàng thành công'
            });

        } catch (error) {
            console.error('❌ Get cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
    static async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { product_id, quantity = 1 } = req.body;

            // Validate input
            if (!product_id) {
                return errorResponse(res, 'ID sản phẩm không được để trống', 400);
            }

            if (quantity < 1 || quantity > 999) {
                return errorResponse(res, 'Số lượng phải từ 1 đến 999', 400);
            }

            // Kiểm tra sản phẩm có tồn tại và còn hàng không
            const product = await Product.findById(product_id);
            if (!product) {
                return errorResponse(res, 'Sản phẩm không tồn tại', 404);
            }

            if (!product.is_active) {
                return errorResponse(res, 'Sản phẩm hiện không có sẵn', 400);
            }

            if (product.stock_quantity < quantity) {
                return errorResponse(res, `Chỉ còn ${product.stock_quantity} sản phẩm trong kho`, 400);
            }

            // Thêm vào giỏ hàng
            const cartItem = await Cart.addItem(userId, product_id, quantity);

            // Lấy tổng quan giỏ hàng mới
            const summary = await Cart.getCartSummary(userId);

            return successResponse(res, {
                item: cartItem.toJSON(),
                summary,
                message: 'Thêm sản phẩm vào giỏ hàng thành công'
            }, 201);

        } catch (error) {
            console.error('❌ Add to cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // PUT /api/cart/:id - Cập nhật số lượng sản phẩm trong giỏ hàng
    static async updateCartItem(req, res) {
        try {
            const userId = req.user.id;
            const cartItemId = req.params.id;
            const { quantity } = req.body;

            // Validate input
            if (!quantity || quantity < 0 || quantity > 999) {
                return errorResponse(res, 'Số lượng phải từ 0 đến 999', 400);
            }

            // Nếu quantity = 0, xóa sản phẩm khỏi giỏ hàng
            if (quantity === 0) {
                await Cart.removeItem(cartItemId, userId);
                const summary = await Cart.getCartSummary(userId);
                
                return successResponse(res, {
                    summary,
                    message: 'Đã xóa sản phẩm khỏi giỏ hàng'
                });
            }

            // Cập nhật số lượng
            const updatedItem = await Cart.updateQuantity(cartItemId, userId, quantity);
            
            if (!updatedItem) {
                return errorResponse(res, 'Sản phẩm không tồn tại trong giỏ hàng', 404);
            }

            // Kiểm tra stock
            if (!updatedItem.isAvailable()) {
                return errorResponse(res, `Chỉ còn ${updatedItem.product_stock} sản phẩm trong kho`, 400);
            }

            const summary = await Cart.getCartSummary(userId);

            return successResponse(res, {
                item: updatedItem.toJSON(),
                summary,
                message: 'Cập nhật số lượng thành công'
            });

        } catch (error) {
            console.error('❌ Update cart item error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // DELETE /api/cart/:id - Xóa sản phẩm khỏi giỏ hàng
    static async removeFromCart(req, res) {
        try {
            const userId = req.user.id;
            const cartItemId = req.params.id;

            const success = await Cart.removeItem(cartItemId, userId);
            
            if (!success) {
                return errorResponse(res, 'Sản phẩm không tồn tại trong giỏ hàng', 404);
            }

            const summary = await Cart.getCartSummary(userId);

            return successResponse(res, {
                summary,
                message: 'Đã xóa sản phẩm khỏi giỏ hàng'
            });

        } catch (error) {
            console.error('❌ Remove from cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // DELETE /api/cart - Xóa toàn bộ giỏ hàng
    static async clearCart(req, res) {
        try {
            const userId = req.user.id;

            await Cart.clearCart(userId);

            return successResponse(res, {
                summary: {
                    total_items: 0,
                    total_quantity: 0,
                    total_amount: 0,
                    original_amount: 0,
                    total_savings: 0
                },
                message: 'Đã xóa toàn bộ giỏ hàng'
            });

        } catch (error) {
            console.error('❌ Clear cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cart/summary - Lấy tổng quan giỏ hàng
    static async getCartSummary(req, res) {
        try {
            const userId = req.user.id;

            const summary = await Cart.getCartSummary(userId);

            return successResponse(res, {
                summary,
                message: 'Lấy tổng quan giỏ hàng thành công'
            });

        } catch (error) {
            console.error('❌ Get cart summary error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cart/validate - Kiểm tra tính hợp lệ của giỏ hàng
    static async validateCart(req, res) {
        try {
            const userId = req.user.id;

            const validation = await Cart.validateCart(userId);

            return successResponse(res, {
                validation,
                message: validation.is_valid 
                    ? 'Giỏ hàng hợp lệ' 
                    : 'Có sản phẩm trong giỏ hàng cần được cập nhật'
            });

        } catch (error) {
            console.error('❌ Validate cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/cart/bulk-add - Thêm nhiều sản phẩm vào giỏ hàng
    static async bulkAddToCart(req, res) {
        try {
            const userId = req.user.id;
            const { items } = req.body; // Array of { product_id, quantity }

            if (!Array.isArray(items) || items.length === 0) {
                return errorResponse(res, 'Danh sách sản phẩm không hợp lệ', 400);
            }

            if (items.length > 50) {
                return errorResponse(res, 'Chỉ có thể thêm tối đa 50 sản phẩm cùng lúc', 400);
            }

            const results = [];
            const errors = [];

            for (const item of items) {
                try {
                    const { product_id, quantity = 1 } = item;

                    // Validate each item
                    if (!product_id || quantity < 1 || quantity > 999) {
                        errors.push({
                            product_id,
                            error: 'Thông tin sản phẩm không hợp lệ'
                        });
                        continue;
                    }

                    // Check product exists and in stock
                    const product = await Product.findById(product_id);
                    if (!product || !product.is_active) {
                        errors.push({
                            product_id,
                            error: 'Sản phẩm không tồn tại hoặc không có sẵn'
                        });
                        continue;
                    }

                    if (product.stock_quantity < quantity) {
                        errors.push({
                            product_id,
                            error: `Chỉ còn ${product.stock_quantity} sản phẩm trong kho`
                        });
                        continue;
                    }

                    // Add to cart
                    const cartItem = await Cart.addItem(userId, product_id, quantity);
                    results.push(cartItem.toJSON());

                } catch (itemError) {
                    errors.push({
                        product_id: item.product_id,
                        error: itemError.message
                    });
                }
            }

            const summary = await Cart.getCartSummary(userId);

            return successResponse(res, {
                added_items: results,
                errors,
                summary,
                message: `Đã thêm ${results.length} sản phẩm vào giỏ hàng${errors.length > 0 ? `, ${errors.length} sản phẩm lỗi` : ''}`
            });

        } catch (error) {
            console.error('❌ Bulk add to cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/cart/sync - Đồng bộ giỏ hàng (cho trường hợp offline)
    static async syncCart(req, res) {
        try {
            const userId = req.user.id;
            const { items } = req.body; // Array of { product_id, quantity }

            if (!Array.isArray(items)) {
                return errorResponse(res, 'Dữ liệu đồng bộ không hợp lệ', 400);
            }

            // Clear existing cart
            await Cart.clearCart(userId);

            // Add new items
            const results = [];
            const errors = [];

            for (const item of items) {
                try {
                    const { product_id, quantity = 1 } = item;

                    if (!product_id || quantity < 1) continue;

                    const product = await Product.findById(product_id);
                    if (!product || !product.is_active) continue;

                    const finalQuantity = Math.min(quantity, product.stock_quantity);
                    if (finalQuantity > 0) {
                        const cartItem = await Cart.addItem(userId, product_id, finalQuantity);
                        results.push(cartItem.toJSON());
                    }
                } catch (itemError) {
                    console.error('Sync item error:', itemError);
                }
            }

            const summary = await Cart.getCartSummary(userId);

            return successResponse(res, {
                items: results,
                summary,
                message: 'Đồng bộ giỏ hàng thành công'
            });

        } catch (error) {
            console.error('❌ Sync cart error:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = CartController;