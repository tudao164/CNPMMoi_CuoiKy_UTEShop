const { executeQuery } = require('../../config/database');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class AdminDashboardController {
    // GET /api/admin/dashboard/overview - Tổng quan dashboard
    async getOverview(req, res) {
        try {
            const { date_from, date_to } = req.query;

            let dateFilter = '';
            const params = [];

            if (date_from && date_to) {
                dateFilter = 'AND DATE(o.created_at) BETWEEN ? AND ?';
                params.push(date_from, date_to);
            }

            // 1. Revenue statistics
            const revenueStats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_orders,
                    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
                    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.discount_amount ELSE 0 END), 0) as total_discount,
                    COALESCE(AVG(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
                    COUNT(CASE WHEN o.status = 'new' THEN 1 END) as pending_orders,
                    COUNT(CASE WHEN o.status IN ('confirmed', 'preparing', 'shipping') THEN 1 END) as processing_orders,
                    COUNT(CASE WHEN o.status = 'delivered' THEN 1 END) as delivered_orders,
                    COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
                FROM orders o
                WHERE 1=1 ${dateFilter}
            `, params);

            // 2. Today's statistics
            const todayStats = await executeQuery(`
                SELECT 
                    COUNT(*) as orders_today,
                    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as revenue_today,
                    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_orders_today
                FROM orders
                WHERE DATE(created_at) = CURDATE()
            `);

            // 3. Customer statistics
            const customerStats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_customers,
                    COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_customers_30d,
                    COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_customers_7d,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_customers_today
                FROM users
                WHERE is_admin = FALSE
            `);

            // 4. Product statistics
            const productStats = await executeQuery(`
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_products,
                    COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
                    COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 END) as low_stock
                FROM products
            `);

            // 5. Payment method breakdown
            const paymentBreakdown = await executeQuery(`
                SELECT 
                    payment_method,
                    COUNT(*) as order_count,
                    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_amount
                FROM orders
                WHERE 1=1 ${dateFilter}
                GROUP BY payment_method
            `, params);

            return successResponse(res, {
                revenue: revenueStats[0],
                today: todayStats[0],
                customers: customerStats[0],
                products: productStats[0],
                payment_breakdown: paymentBreakdown
            }, 'Dữ liệu dashboard được tải thành công');

        } catch (error) {
            console.error('❌ Get dashboard overview error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy dữ liệu dashboard', 500);
        }
    }

    // GET /api/admin/dashboard/revenue-chart - Biểu đồ doanh thu
    async getRevenueChart(req, res) {
        try {
            const { period = 'daily', date_from, date_to } = req.query;

            let groupBy, dateFormat;
            switch (period) {
                case 'hourly':
                    groupBy = 'DATE_FORMAT(created_at, "%Y-%m-%d %H:00")';
                    dateFormat = '%Y-%m-%d %H:00';
                    break;
                case 'daily':
                    groupBy = 'DATE(created_at)';
                    dateFormat = '%Y-%m-%d';
                    break;
                case 'weekly':
                    groupBy = 'YEARWEEK(created_at)';
                    dateFormat = '%Y-W%v';
                    break;
                case 'monthly':
                    groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
                    dateFormat = '%Y-%m';
                    break;
                default:
                    groupBy = 'DATE(created_at)';
                    dateFormat = '%Y-%m-%d';
            }

            let dateFilter = '';
            const params = [];

            if (date_from && date_to) {
                dateFilter = 'AND DATE(created_at) BETWEEN ? AND ?';
                params.push(date_from, date_to);
            } else {
                // Default: last 30 days
                dateFilter = 'AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
            }

            const chartData = await executeQuery(`
                SELECT 
                    DATE_FORMAT(created_at, '${dateFormat}') as period,
                    COUNT(*) as order_count,
                    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as revenue,
                    COALESCE(SUM(CASE WHEN status = 'delivered' THEN discount_amount ELSE 0 END), 0) as discount,
                    COALESCE(SUM(CASE WHEN status = 'delivered' THEN (total_amount + discount_amount) ELSE 0 END), 0) as subtotal
                FROM orders
                WHERE 1=1 ${dateFilter}
                GROUP BY ${groupBy}
                ORDER BY period ASC
            `, params);

            return successResponse(res, {
                period,
                data: chartData
            }, 'Dữ liệu biểu đồ doanh thu được tải thành công');

        } catch (error) {
            console.error('❌ Get revenue chart error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy dữ liệu biểu đồ', 500);
        }
    }

    // GET /api/admin/dashboard/top-products - Top 10 sản phẩm bán chạy
    async getTopProducts(req, res) {
        try {
            const { limit = 10, date_from, date_to } = req.query;

            let dateFilter = '';
            const params = [];

            if (date_from && date_to) {
                dateFilter = 'AND DATE(o.created_at) BETWEEN ? AND ?';
                params.push(date_from, date_to);
            }

            params.push(parseInt(limit));

            const topProducts = await executeQuery(`
                SELECT 
                    p.id,
                    p.name,
                    p.image_url,
                    p.price,
                    p.sale_price,
                    p.stock_quantity,
                    c.name as category_name,
                    SUM(oi.quantity) as total_sold,
                    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
                    COUNT(DISTINCT o.id) as order_count
                FROM products p
                INNER JOIN order_items oi ON p.id = oi.product_id
                INNER JOIN orders o ON oi.order_id = o.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE o.status = 'delivered' ${dateFilter}
                GROUP BY p.id
                ORDER BY total_sold DESC
                LIMIT ?
            `, params);

            return successResponse(res, {
                top_products: topProducts,
                count: topProducts.length
            }, 'Top sản phẩm bán chạy được tải thành công');

        } catch (error) {
            console.error('❌ Get top products error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy top sản phẩm', 500);
        }
    }

    // GET /api/admin/dashboard/delivered-orders - Danh sách đơn hàng đã giao thành công
    async getDeliveredOrders(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                date_from, 
                date_to,
                payment_method 
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = ["o.status = 'delivered'"];
            const params = [];

            if (date_from && date_to) {
                whereConditions.push('DATE(o.delivered_at) BETWEEN ? AND ?');
                params.push(date_from, date_to);
            }

            if (payment_method) {
                whereConditions.push('o.payment_method = ?');
                params.push(payment_method);
            }

            const whereClause = whereConditions.join(' AND ');

            // Get total count
            const countResult = await executeQuery(`
                SELECT COUNT(*) as total
                FROM orders o
                WHERE ${whereClause}
            `, params);

            const total = countResult[0].total;

            // Get orders
            const orders = await executeQuery(`
                SELECT 
                    o.id,
                    o.user_id,
                    o.total_amount,
                    o.subtotal_amount,
                    o.discount_amount,
                    o.coupon_code,
                    o.payment_method,
                    o.shipping_address,
                    o.created_at,
                    o.delivered_at,
                    u.full_name as customer_name,
                    u.email as customer_email,
                    u.phone as customer_phone,
                    p.payment_status,
                    COUNT(oi.id) as item_count
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN payments p ON o.id = p.order_id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE ${whereClause}
                GROUP BY o.id
                ORDER BY o.delivered_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `, params);

            return successResponse(res, {
                orders,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                }
            }, 'Danh sách đơn hàng đã giao được tải thành công');

        } catch (error) {
            console.error('❌ Get delivered orders error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy danh sách đơn hàng', 500);
        }
    }

    // GET /api/admin/dashboard/cash-flow - Quản lý dòng tiền
    async getCashFlow(req, res) {
        try {
            const { date_from, date_to } = req.query;

            let dateFilter = '';
            const params = [];

            if (date_from && date_to) {
                dateFilter = 'AND DATE(o.created_at) BETWEEN ? AND ?';
                params.push(date_from, date_to);
            }

            // Tiền đã thu (delivered + COD/completed payment)
            const collectedMoney = await executeQuery(`
                SELECT 
                    o.payment_method,
                    COUNT(*) as order_count,
                    COALESCE(SUM(o.total_amount), 0) as total_amount,
                    COALESCE(SUM(o.discount_amount), 0) as total_discount,
                    COALESCE(SUM(o.subtotal_amount), 0) as total_subtotal
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                WHERE o.status = 'delivered'
                AND (
                    (o.payment_method = 'COD' AND p.payment_status = 'completed')
                    OR (o.payment_method != 'COD' AND p.payment_status = 'completed')
                )
                ${dateFilter}
                GROUP BY o.payment_method
            `, params);

            // Tiền chưa thu (shipping/preparing)
            const pendingMoney = await executeQuery(`
                SELECT 
                    o.payment_method,
                    o.status,
                    COUNT(*) as order_count,
                    COALESCE(SUM(o.total_amount), 0) as total_amount
                FROM orders o
                WHERE o.status IN ('confirmed', 'preparing', 'shipping')
                ${dateFilter}
                GROUP BY o.payment_method, o.status
            `, params);

            // Tổng hợp
            const summary = await executeQuery(`
                SELECT 
                    COALESCE(SUM(CASE 
                        WHEN o.status = 'delivered' AND p.payment_status = 'completed' 
                        THEN o.total_amount ELSE 0 
                    END), 0) as total_collected,
                    COALESCE(SUM(CASE 
                        WHEN o.status IN ('confirmed', 'preparing', 'shipping') 
                        THEN o.total_amount ELSE 0 
                    END), 0) as total_pending,
                    COALESCE(SUM(CASE 
                        WHEN o.status = 'cancelled' 
                        THEN o.total_amount ELSE 0 
                    END), 0) as total_cancelled,
                    COALESCE(SUM(CASE 
                        WHEN o.status = 'delivered' AND p.payment_status = 'completed' 
                        THEN o.discount_amount ELSE 0 
                    END), 0) as total_discount_applied
                FROM orders o
                LEFT JOIN payments p ON o.id = p.order_id
                WHERE 1=1 ${dateFilter}
            `, params);

            return successResponse(res, {
                collected: collectedMoney,
                pending: pendingMoney,
                summary: summary[0]
            }, 'Dữ liệu dòng tiền được tải thành công');

        } catch (error) {
            console.error('❌ Get cash flow error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy dữ liệu dòng tiền', 500);
        }
    }

    // GET /api/admin/dashboard/new-customers - Khách hàng mới
    async getNewCustomers(req, res) {
        try {
            const { page = 1, limit = 20, period = '30' } = req.query;
            const offset = (page - 1) * limit;

            const daysAgo = parseInt(period);

            // Get total count
            const countResult = await executeQuery(`
                SELECT COUNT(*) as total
                FROM users
                WHERE is_admin = FALSE
                AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            `, [daysAgo]);

            const total = countResult[0].total;

            // Get customers
            const customers = await executeQuery(`
                SELECT 
                    u.id,
                    u.email,
                    u.full_name,
                    u.phone,
                    u.is_verified,
                    u.created_at,
                    COUNT(DISTINCT o.id) as total_orders,
                    COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) as total_spent
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id
                WHERE u.is_admin = FALSE
                AND DATE(u.created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `, [daysAgo]);

            return successResponse(res, {
                customers,
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total: total,
                    total_pages: Math.ceil(total / limit)
                },
                period: `${daysAgo} ngày gần đây`
            }, 'Danh sách khách hàng mới được tải thành công');

        } catch (error) {
            console.error('❌ Get new customers error:', error);
            return errorResponse(res, error.message || 'Lỗi lấy danh sách khách hàng mới', 500);
        }
    }
}

module.exports = new AdminDashboardController();
