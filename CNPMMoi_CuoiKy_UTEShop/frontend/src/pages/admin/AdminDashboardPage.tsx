import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  adminProductService,
  adminUserService,
  adminOrderService,
} from '@/services/admin.service';
import { ProductStats, UserStats, OrderStats } from '@/types/admin.types';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [productData, userData, orderData] = await Promise.all([
        adminProductService.getStats(),
        adminUserService.getStats(),
        adminOrderService.getStats(),
      ]);

      setProductStats(productData.data.stats);
      setUserStats(userData.data.stats);
      setOrderStats(orderData.data.stats);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan hệ thống UTEShop</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Today */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Doanh thu hôm nay</h3>
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(orderStats?.revenue_today || 0)}
          </p>
          <p className="text-green-100 text-sm mt-2">
            {orderStats?.orders_today || 0} đơn hàng
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Tổng đơn hàng</h3>
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-3xl font-bold">{orderStats?.total_orders || 0}</p>
          <p className="text-blue-100 text-sm mt-2">
            {orderStats?.new_orders || 0} đơn mới
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Sản phẩm</h3>
            <span className="text-3xl">🏷️</span>
          </div>
          <p className="text-3xl font-bold">
            {productStats?.total_products || 0}
          </p>
          <p className="text-purple-100 text-sm mt-2">
            {productStats?.active_products || 0} đang bán
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Người dùng</h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-3xl font-bold">{userStats?.total_users || 0}</p>
          <p className="text-orange-100 text-sm mt-2">
            {userStats?.new_users_30d || 0} mới (30 ngày)
          </p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📦</span> Thống kê Sản phẩm
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Tổng sản phẩm</span>
              <span className="font-semibold">
                {productStats?.total_products || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đang hoạt động</span>
              <span className="font-semibold text-green-600">
                {productStats?.active_products || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Ngừng bán</span>
              <span className="font-semibold text-red-600">
                {productStats?.inactive_products || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Hết hàng</span>
              <span className="font-semibold text-red-600">
                {productStats?.out_of_stock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Sắp hết hàng</span>
              <span className="font-semibold text-yellow-600">
                {productStats?.low_stock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Đang sale</span>
              <span className="font-semibold text-blue-600">
                {productStats?.on_sale || 0}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/products')}
            className="btn-primary w-full mt-4"
          >
            Quản lý Sản phẩm
          </button>
        </div>

        {/* Order Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🛒</span> Thống kê Đơn hàng
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đơn mới</span>
              <span className="font-semibold text-blue-600">
                {orderStats?.new_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đã xác nhận</span>
              <span className="font-semibold text-green-600">
                {orderStats?.confirmed_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đang chuẩn bị</span>
              <span className="font-semibold text-yellow-600">
                {orderStats?.preparing_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đang giao</span>
              <span className="font-semibold text-purple-600">
                {orderStats?.shipping_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đã giao</span>
              <span className="font-semibold text-green-600">
                {orderStats?.delivered_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đã hủy</span>
              <span className="font-semibold text-red-600">
                {orderStats?.cancelled_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Tổng doanh thu</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(orderStats?.total_revenue || 0)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="btn-primary w-full mt-4"
          >
            Quản lý Đơn hàng
          </button>
        </div>

        {/* User Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>👥</span> Thống kê Người dùng
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Tổng người dùng</span>
              <span className="font-semibold">
                {userStats?.total_users || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Đã xác thực</span>
              <span className="font-semibold text-green-600">
                {userStats?.verified_users || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Mới (7 ngày)</span>
              <span className="font-semibold text-blue-600">
                {userStats?.new_users_7d || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Mới (30 ngày)</span>
              <span className="font-semibold text-blue-600">
                {userStats?.new_users_30d || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Quản trị viên</span>
              <span className="font-semibold text-purple-600">
                {userStats?.admin_count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Đăng ký hôm nay</span>
              <span className="font-semibold text-green-600">
                {userStats?.users_today || 0}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-primary w-full mt-4"
          >
            Quản lý Người dùng
          </button>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💳</span> Phương thức Thanh toán
          </h2>
          {orderStats?.payment_breakdown && orderStats.payment_breakdown.length > 0 ? (
            <div className="space-y-4">
              {orderStats.payment_breakdown.map((item) => (
                <div key={item.payment_method} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">
                      {item.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Ví điện tử'}
                    </span>
                    <span className="text-2xl">
                      {item.payment_method === 'COD' ? '💵' : '💳'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Số đơn hàng:</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có dữ liệu thanh toán
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
