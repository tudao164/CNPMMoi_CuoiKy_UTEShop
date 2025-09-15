const CancelRequest = require('../models/CancelRequest');
const Order = require('../models/Order');
const { executeQuery } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class CancelRequestController {
    // POST /api/cancel-requests - Tạo yêu cầu hủy đơn hàng
    static async createCancelRequest(req, res) {
        try {
            const userId = req.user.id;
            const { order_id, reason } = req.body;

            // Validate input
            if (!order_id) {
                return errorResponse(res, 'ID đơn hàng không được để trống', 400);
            }

            if (!reason || reason.trim().length < 10) {
                return errorResponse(res, 'Lý do hủy đơn phải có ít nhất 10 ký tự', 400);
            }

            // Create cancel request
            const cancelRequest = await CancelRequest.createCancelRequest({
                order_id,
                user_id: userId,
                reason: reason.trim()
            });

            return successResponse(res, {
                cancel_request: cancelRequest.toJSON(),
                message: cancelRequest.status === 'approved' 
                    ? 'Đơn hàng đã được hủy thành công'
                    : 'Yêu cầu hủy đơn đã được gửi và đang chờ xử lý'
            }, 201);

        } catch (error) {
            console.error('❌ Create cancel request error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cancel-requests - Lấy danh sách yêu cầu hủy đơn của user
    static async getUserCancelRequests(req, res) {
        try {
            const userId = req.user.id;
            const {
                page = 1,
                limit = 10,
                status,
                order_by = 'created_at',
                order_dir = 'DESC'
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                user_id: userId,
                status,
                order_by,
                order_dir
            };

            const result = await CancelRequest.getCancelRequests(options);

            return successResponse(res, {
                cancel_requests: result.requests.map(req => req.toJSON()),
                pagination: result.pagination,
                message: 'Lấy danh sách yêu cầu hủy đơn thành công'
            });

        } catch (error) {
            console.error('❌ Get user cancel requests error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cancel-requests/:id - Lấy chi tiết yêu cầu hủy đơn
    static async getCancelRequestDetails(req, res) {
        try {
            const requestId = req.params.id;
            const userId = req.user.id;

            const cancelRequest = await CancelRequest.findById(requestId);

            if (!cancelRequest) {
                return errorResponse(res, 'Yêu cầu hủy đơn không tồn tại', 404);
            }

            // Check ownership
            if (cancelRequest.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền xem yêu cầu này', 403);
            }

            return successResponse(res, {
                cancel_request: cancelRequest.toJSON(),
                message: 'Lấy chi tiết yêu cầu hủy đơn thành công'
            });

        } catch (error) {
            console.error('❌ Get cancel request details error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cancel-requests/order/:orderId - Lấy yêu cầu hủy theo đơn hàng
    static async getCancelRequestByOrder(req, res) {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.id;

            // Check if user owns the order
            const order = await Order.findById(orderId);
            if (!order || order.user_id !== userId) {
                return errorResponse(res, 'Đơn hàng không tồn tại hoặc bạn không có quyền truy cập', 404);
            }

            const cancelRequest = await CancelRequest.findByOrderId(orderId);

            if (!cancelRequest) {
                return errorResponse(res, 'Không có yêu cầu hủy đơn nào cho đơn hàng này', 404);
            }

            return successResponse(res, {
                cancel_request: cancelRequest.toJSON(),
                message: 'Lấy yêu cầu hủy đơn theo đơn hàng thành công'
            });

        } catch (error) {
            console.error('❌ Get cancel request by order error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // PUT /api/cancel-requests/:id - Cập nhật yêu cầu hủy đơn (chỉ khi pending)
    static async updateCancelRequest(req, res) {
        try {
            const requestId = req.params.id;
            const userId = req.user.id;
            const { reason } = req.body;

            // Get cancel request
            const cancelRequest = await CancelRequest.findById(requestId);

            if (!cancelRequest) {
                return errorResponse(res, 'Yêu cầu hủy đơn không tồn tại', 404);
            }

            // Check ownership
            if (cancelRequest.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền cập nhật yêu cầu này', 403);
            }

            // Check if editable
            if (!cancelRequest.isEditable()) {
                return errorResponse(res, 'Yêu cầu hủy đơn không thể chỉnh sửa', 400);
            }

            // Validate new reason
            if (!reason || reason.trim().length < 10) {
                return errorResponse(res, 'Lý do hủy đơn phải có ít nhất 10 ký tự', 400);
            }

            // Update cancel request
            await executeQuery(
                'UPDATE cancel_requests SET reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [reason.trim(), requestId]
            );

            const updatedRequest = await CancelRequest.findById(requestId);

            return successResponse(res, {
                cancel_request: updatedRequest.toJSON(),
                message: 'Cập nhật yêu cầu hủy đơn thành công'
            });

        } catch (error) {
            console.error('❌ Update cancel request error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // DELETE /api/cancel-requests/:id - Rút lại yêu cầu hủy đơn
    static async withdrawCancelRequest(req, res) {
        try {
            const requestId = req.params.id;
            const userId = req.user.id;

            // Get cancel request
            const cancelRequest = await CancelRequest.findById(requestId);

            if (!cancelRequest) {
                return errorResponse(res, 'Yêu cầu hủy đơn không tồn tại', 404);
            }

            // Check ownership
            if (cancelRequest.user_id !== userId) {
                return errorResponse(res, 'Bạn không có quyền rút lại yêu cầu này', 403);
            }

            // Check if can be withdrawn
            if (!cancelRequest.canBeWithdrawn()) {
                return errorResponse(res, 'Yêu cầu hủy đơn không thể rút lại', 400);
            }

            // Delete cancel request
            await executeQuery(
                'DELETE FROM cancel_requests WHERE id = ?',
                [requestId]
            );

            // Update order status back to original
            await Order.updateStatus(
                cancelRequest.order_id, 
                'confirmed', 
                'Khách hàng đã rút lại yêu cầu hủy đơn',
                userId
            );

            return successResponse(res, {
                message: 'Đã rút lại yêu cầu hủy đơn thành công'
            });

        } catch (error) {
            console.error('❌ Withdraw cancel request error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cancel-requests/stats - Thống kê yêu cầu hủy đơn của user
    static async getCancelRequestStats(req, res) {
        try {
            const userId = req.user.id;
            const {
                start_date,
                end_date
            } = req.query;

            const stats = await CancelRequest.getCancelStats({
                start_date,
                end_date,
                user_id: userId
            });

            return successResponse(res, {
                stats,
                message: 'Lấy thống kê yêu cầu hủy đơn thành công'
            });

        } catch (error) {
            console.error('❌ Get cancel request stats error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // POST /api/cancel-requests/:id/process - Xử lý yêu cầu hủy đơn (Admin only)
    static async processRequest(req, res) {
        try {
            const requestId = req.params.id;
            const adminId = req.user.id;
            const { status, admin_response } = req.body;

            // Note: In real implementation, add admin role check here
            // if (req.user.role !== 'admin') {
            //     return errorResponse(res, 'Chỉ admin mới có quyền xử lý yêu cầu hủy đơn', 403);
            // }

            // Validate status
            if (!['approved', 'rejected'].includes(status)) {
                return errorResponse(res, 'Trạng thái xử lý phải là "approved" hoặc "rejected"', 400);
            }

            if (!admin_response || admin_response.trim().length < 5) {
                return errorResponse(res, 'Ghi chú admin phải có ít nhất 5 ký tự', 400);
            }

            // Process request
            const processedRequest = await CancelRequest.processRequest(requestId, {
                status,
                admin_response: admin_response.trim(),
                processed_by: adminId
            });

            return successResponse(res, {
                cancel_request: processedRequest.toJSON(),
                message: status === 'approved' 
                    ? 'Đã chấp thuận yêu cầu hủy đơn'
                    : 'Đã từ chối yêu cầu hủy đơn'
            });

        } catch (error) {
            console.error('❌ Process cancel request error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cancel-requests/admin/pending - Lấy danh sách yêu cầu chờ xử lý (Admin only)
    static async getPendingRequests(req, res) {
        try {
            // Note: In real implementation, add admin role check here
            // if (req.user.role !== 'admin') {
            //     return errorResponse(res, 'Chỉ admin mới có quyền xem danh sách này', 403);
            // }

            const {
                page = 1,
                limit = 10,
                order_by = 'created_at',
                order_dir = 'ASC' // Oldest first for admin processing
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                status: 'pending',
                order_by,
                order_dir
            };

            const result = await CancelRequest.getCancelRequests(options);

            return successResponse(res, {
                cancel_requests: result.requests.map(req => req.toJSON()),
                pagination: result.pagination,
                message: 'Lấy danh sách yêu cầu hủy đơn chờ xử lý thành công'
            });

        } catch (error) {
            console.error('❌ Get pending cancel requests error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    // GET /api/cancel-requests/admin/stats - Thống kê yêu cầu hủy đơn (Admin only)
    static async getAdminStats(req, res) {
        try {
            // Note: In real implementation, add admin role check here
            // if (req.user.role !== 'admin') {
            //     return errorResponse(res, 'Chỉ admin mới có quyền xem thống kê này', 403);
            // }

            const {
                start_date,
                end_date
            } = req.query;

            const stats = await CancelRequest.getCancelStats({
                start_date,
                end_date
            });

            return successResponse(res, {
                stats,
                message: 'Lấy thống kê yêu cầu hủy đơn (admin) thành công'
            });

        } catch (error) {
            console.error('❌ Get admin cancel request stats error:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}

module.exports = CancelRequestController;