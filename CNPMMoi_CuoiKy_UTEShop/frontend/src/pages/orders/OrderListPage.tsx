import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '@/services/order.service';
import { cancelRequestService } from '@/services/cancelRequest.service';
import { Order } from '@/types/order.types';
import { CancelRequest } from '@/types/cancelRequest.types';
import toast from 'react-hot-toast';

type TabType = 'orders' | 'cancel-requests';

export default function OrderListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancelRequests, setCancelRequests] = useState<CancelRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      const response = await orderService.getOrders(params);
      if (response.success) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData as any);
        const paginationData = (response as any).pagination;
        setTotalPages(paginationData?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCancelRequests = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      const response = await cancelRequestService.getCancelRequests(params);
      if (response.success && response.data) {
        setCancelRequests(response.data.cancel_requests || []);
        const paginationData = response.data.pagination;
        setTotalPages(paginationData?.total_pages || 1);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error('Fetch cancel requests error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu hủy đơn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async () => {
    if (!selectedOrderId) return;
    
    if (cancelReason.trim().length < 10) {
      toast.error('Lý do hủy phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await cancelRequestService.createCancelRequest({
        order_id: selectedOrderId,
        reason: cancelReason.trim()
      });

      if (response.success) {
        toast.success('Gửi yêu cầu hủy đơn hàng thành công!');
        setShowCancelModal(false);
        setSelectedOrderId(null);
        setCancelReason('');
        fetchOrders(currentPage);
      }
    } catch (error: any) {
      console.error('Cancel order error:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu hủy đơn');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders(1);
    } else {
      fetchCancelRequests(1);
    }
  }, [activeTab]);

  const handlePageChange = (page: number) => {
    if (activeTab === 'orders') {
      fetchOrders(page);
    } else {
      fetchCancelRequests(page);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: '⏳ Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '✅ Đã xác nhận', className: 'bg-blue-100 text-blue-800' },
      shipping: { label: '🚚 Đang giao', className: 'bg-purple-100 text-purple-800' },
      delivered: { label: '📦 Đã giao', className: 'bg-green-100 text-green-800' },
      cancelled: { label: '❌ Đã hủy', className: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getCancelStatusBadge = (status: string, statusColor?: string, statusText?: string) => {
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    
    const className = statusColor ? colorMap[statusColor] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
    const label = statusText || status;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      COD: 'Thanh toán khi nhận hàng',
      E_WALLET: 'Ví điện tử'
    };
    return labels[method] || method;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading && orders.length === 0 && cancelRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-2">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📦 Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab('cancel-requests')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cancel-requests'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚫 Yêu cầu hủy đơn
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào</p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex justify-between items-start mb-4 pb-4 border-b">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Đơn hàng #{order.id}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-gray-600">Đặt ngày: {formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">{formatPrice(order.total_amount)}</p>
                          {order.discount_amount && order.discount_amount > 0 && (
                            <p className="text-sm text-green-600">Tiết kiệm: {formatPrice(order.discount_amount)}</p>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Sản phẩm:</h4>
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={item.product_image || 'https://via.placeholder.com/80'}
                                  alt={item.product_name}
                                  className="w-20 h-20 object-cover rounded border"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                                  <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                  <p className="text-sm font-semibold text-primary-600 mt-1">
                                    {formatPrice(typeof item.price === 'number' ? item.price * item.quantity : parseFloat(item.price as any) * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shipping Address */}
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">🚚 Địa chỉ giao hàng:</h4>
                        <p className="text-gray-700">{order.shipping_address}</p>
                        {order.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Ghi chú:</span> {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Coupon Info */}
                      {order.coupon_code && (
                        <div className="mb-4 p-4 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            🎟️ Mã giảm giá: <span className="font-bold">{order.coupon_code}</span>
                          </p>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          {order.subtotal_amount && (
                            <div className="flex justify-between text-gray-600">
                              <span>Tạm tính:</span>
                              <span>{formatPrice(order.subtotal_amount)}</span>
                            </div>
                          )}
                          {order.discount_amount && order.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Giảm giá:</span>
                              <span>-{formatPrice(order.discount_amount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Tổng cộng:</span>
                            <span className="text-primary-600">{formatPrice(order.total_amount)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Phương thức thanh toán:</span>
                            <span>{order.payment_method ? getPaymentMethodLabel(order.payment_method) : 'Chưa xác định'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <div className="mt-4 pt-4 border-t">
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            🚫 Hủy đơn hàng
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Cancel Requests Tab */}
        {activeTab === 'cancel-requests' && (
          <>
            {cancelRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chưa có yêu cầu hủy đơn</h2>
                <p className="text-gray-600">Bạn chưa có yêu cầu hủy đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cancelRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      {/* Request Header */}
                      <div className="flex justify-between items-start mb-4 pb-4 border-b">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Yêu cầu hủy #{request.id}</h3>
                            {getCancelStatusBadge(request.status, request.status_color, request.status_text)}
                          </div>
                          <p className="text-sm text-gray-600">Đơn hàng: #{request.order_id}</p>
                          <p className="text-sm text-gray-600">Ngày tạo: {formatDate(request.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{formatPrice(request.order_total_amount)}</p>
                          {request.is_urgent && (
                            <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">⚠️ Khẩn cấp</span>
                          )}
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Lý do hủy:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                      </div>

                      {/* Admin Response */}
                      {request.admin_response && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">💬 Phản hồi từ admin:</h4>
                          <p className="text-gray-700">{request.admin_response}</p>
                          {request.processed_at && (
                            <p className="text-sm text-gray-600 mt-2">Xử lý lúc: {formatDate(request.processed_at)}</p>
                          )}
                        </div>
                      )}

                      {/* Order Info */}
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Trạng thái đơn hàng:</span>
                            <span className="ml-2 font-medium">{request.order_status}</span>
                          </div>
                          {request.processing_time_hours !== null && request.processing_time_hours !== undefined && (
                            <div>
                              <span className="text-gray-600">Thời gian xử lý:</span>
                              <span className="ml-2 font-medium">{request.processing_time_hours.toFixed(1)} giờ</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === page
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚫 Hủy đơn hàng</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy đơn hàng <span className="text-red-600">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng nhập lý do hủy đơn hàng (tối thiểu 10 ký tự)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                {cancelReason.trim().length}/10 ký tự
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedOrderId(null);
                  setCancelReason('');
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                onClick={handleSubmitCancel}
                disabled={isSubmitting || cancelReason.trim().length < 10}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
