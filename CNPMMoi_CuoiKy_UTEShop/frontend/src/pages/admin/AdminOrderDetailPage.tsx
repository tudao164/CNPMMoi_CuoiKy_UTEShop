import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminOrderService } from '@/services/admin.service';
import { AdminOrderDetail } from '@/types/admin.types';
import { getImageUrl } from '@/config/constants';

export default function AdminOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await adminOrderService.getOrderDetail(Number(id));
      const orderData: AdminOrderDetail = {
        ...response.data.order,
        items: response.data.items,
        history: response.data.history,
      };
      setOrder(orderData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Vui lòng chọn trạng thái mới');
      return;
    }

    try {
      setUpdating(true);
      await adminOrderService.updateOrderStatus(Number(id), {
        status: newStatus as any,
        notes,
      });
      toast.success('Cập nhật trạng thái thành công');
      setShowStatusModal(false);
      setNewStatus('');
      setNotes('');
      fetchOrderDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'blue',
      confirmed: 'green',
      preparing: 'yellow',
      shipping: 'purple',
      delivered: 'green',
      cancelled: 'red',
      cancel_requested: 'orange',
    };
    return colors[status] || 'gray';
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const transitions: Record<string, string[]> = {
      new: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['shipping', 'cancelled'],
      shipping: ['delivered', 'cancelled'],
      cancel_requested: ['cancelled', 'confirmed'],
    };
    return transitions[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-primary-600 hover:text-primary-700 mb-2"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết đơn hàng #{order.id}
          </h1>
        </div>
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-primary"
          >
            🔄 Cập nhật trạng thái
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className={`font-semibold text-${getStatusColor(order.status)}-600`}>
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thanh toán</p>
                <p className="font-semibold">
                  {order.payment_method === 'COD' ? 'COD' : 'Ví điện tử'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <p className="font-semibold">{order.payment_status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary-600">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử đơn hàng</h2>
            <div className="space-y-4">
              {order.history.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border-l-4 border-primary-500 bg-gray-50">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.status}</p>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleString('vi-VN')}
                      {item.changed_by_name && ` - Bởi ${item.changed_by_name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin khách hàng</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tên</p>
                <p className="font-semibold text-gray-900">{order.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{order.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-semibold text-gray-900">{order.shipping_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                <p className="font-semibold text-gray-900">{order.shipping_address}</p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="font-semibold text-gray-900">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cập nhật trạng thái đơn hàng
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái mới
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {getAvailableStatuses(order.status).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Thêm ghi chú..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn-secondary flex-1"
                disabled={updating}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                className="btn-primary flex-1"
                disabled={updating}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
