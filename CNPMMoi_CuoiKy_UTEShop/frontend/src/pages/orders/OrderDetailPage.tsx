import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '@/services/order.service';
import { Order, OrderTracking } from '@/types/order.types';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/config/constants';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');

  useEffect(() => {
    fetchOrderDetail();
    fetchOrderTracking();
  }, [id]);

  const fetchOrderDetail = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await orderService.getOrderById(parseInt(id));
      if (response.success) {
        setOrder(response.data as any);
      }
    } catch (error: any) {
      console.error('Fetch order detail error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderTracking = async () => {
    if (!id) return;
    
    try {
      const response = await orderService.getOrderTracking(parseInt(id));
      if (response.success) {
        setTracking(response.data.tracking || []);
      }
    } catch (error: any) {
      console.error('Fetch order tracking error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      COD: '💵 Thanh toán khi nhận hàng',
      E_WALLET: '👛 Ví điện tử',
      BANK_TRANSFER: '🏦 Chuyển khoản',
      CREDIT_CARD: '💳 Thẻ tín dụng',
    };
    return labels[method] || method;
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Quay lại danh sách đơn hàng
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết đơn hàng #{order.id}
              </h1>
              <p className="text-gray-600 mt-2">
                Đặt ngày: {formatDate(order.created_at)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Thông tin đơn hàng
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'tracking'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Theo dõi đơn hàng ({tracking.length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'details' ? (
              <>
                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Sản phẩm đã đặt
                  </h2>
                  {!order.items || order.items.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      Không có sản phẩm nào trong đơn hàng này
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                          <img
                            src={getImageUrl(item.product_image)}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Đơn giá: {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shipping Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Thông tin giao hàng
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ giao hàng:</p>
                      <p className="font-medium text-gray-900">{order.shipping_address}</p>
                    </div>
                    {order.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Ghi chú:</p>
                        <p className="text-gray-900">{order.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Phương thức thanh toán:</p>
                      <p className="font-medium text-gray-900">
                        {order.payment_method ? getPaymentMethodLabel(order.payment_method) : 'Chưa xác định'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Order Tracking */
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Lịch sử đơn hàng
                </h2>
                {tracking.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Chưa có thông tin theo dõi
                  </p>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Timeline Items */}
                    <div className="space-y-6">
                      {tracking.map((item, index) => (
                        <div key={item.id} className="relative pl-10">
                          {/* Timeline Dot */}
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-primary-600' : 'bg-gray-300'
                          }`}>
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          
                          {/* Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {getStatusBadge(item.status)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(item.changed_at)}
                              </p>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-medium">
                    {formatPrice(order.subtotal_amount || order.total_amount)}
                  </span>
                </div>
                
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}

                {order.coupon_code && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600">🎉</span>
                    <span className="text-sm text-green-700 font-medium">
                      Đã áp dụng mã: {order.coupon_code}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status === 'pending' && (
                <button
                  onClick={() => {
                    // TODO: Implement cancel order
                    toast.error('Chức năng hủy đơn hàng đang được phát triển');
                  }}
                  className="w-full border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Hủy đơn hàng
                </button>
              )}

              <button
                onClick={() => navigate('/orders')}
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
