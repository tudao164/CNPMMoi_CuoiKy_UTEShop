import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminOrderService } from '@/services/admin.service';
import { AdminOrder, OrderStats } from '@/types/admin.types';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, status, paymentMethod, paymentStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (status) params.status = status;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (paymentStatus) params.payment_status = paymentStatus;

      const response = await adminOrderService.getOrders(params);
      
      if (response.success) {
        setOrders(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminOrderService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      new: { label: 'Mới', className: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800' },
      preparing: { label: 'Đang chuẩn bị', className: 'bg-yellow-100 text-yellow-800' },
      shipping: { label: 'Đang giao', className: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      cancel_requested: { label: 'Yêu cầu hủy', className: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ thanh toán', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
      refunded: { label: 'Đã hoàn tiền', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[paymentStatus] || { label: paymentStatus, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <p className="text-gray-600 mt-2">Quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-xs text-gray-600">Mới</div>
            <div className="text-xl font-bold text-blue-600">{stats.new_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-xs text-gray-600">Đã xác nhận</div>
            <div className="text-xl font-bold text-green-600">{stats.confirmed_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-xs text-gray-600">Đang chuẩn bị</div>
            <div className="text-xl font-bold text-yellow-600">{stats.preparing_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-xs text-gray-600">Đang giao</div>
            <div className="text-xl font-bold text-purple-600">{stats.shipping_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-xs text-gray-600">Đã giao</div>
            <div className="text-xl font-bold text-green-600">{stats.delivered_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="text-xs text-gray-600">Đã hủy</div>
            <div className="text-xl font-bold text-red-600">{stats.cancelled_orders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 col-span-2">
            <div className="text-xs text-gray-600">Tổng doanh thu</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(stats.total_revenue)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái đơn hàng
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="new">Mới</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
              <option value="cancel_requested">Yêu cầu hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phương thức thanh toán
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="COD">COD</option>
              <option value="E_WALLET">Ví điện tử</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái thanh toán
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatus('');
                setPaymentMethod('');
                setPaymentStatus('');
                setPagination({ ...pagination, page: 1 });
              }}
              className="btn-secondary w-full"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.user_name}</div>
                      <div className="text-xs text-gray-500">{order.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.payment_method === 'COD' ? 'COD' : 'Ví điện tử'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        👁️ Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{pagination.total}</span> đơn hàng
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
