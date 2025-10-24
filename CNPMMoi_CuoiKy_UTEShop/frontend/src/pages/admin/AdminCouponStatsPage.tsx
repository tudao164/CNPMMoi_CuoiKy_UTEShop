import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminCouponService } from '@/services/admin.service';
import { CouponDetailStats } from '@/types/coupon.types';

export default function AdminCouponStatsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CouponDetailStats | null>(null);

  useEffect(() => {
    if (id) {
      fetchStats();
    }
  }, [id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminCouponService.getCouponStats(Number(id));
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thống kê');
      navigate('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy thống kê</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1 font-medium"
        >
          ← Quay lại danh sách
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Thống kê mã giảm giá: {stats.coupon.code}
        </h1>
        <p className="text-gray-600 mt-2">{stats.coupon.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Lượt sử dụng</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.statistics.actual_usage}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.statistics.usage_limit ? `/ ${stats.statistics.usage_limit}` : '/ ∞'}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Người dùng</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.statistics.unique_users}
                </div>
                <div className="text-xs text-gray-500 mt-1">Unique users</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Tổng giảm giá</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.statistics.total_discount_given)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total saved</div>
              </div>
            </div>
          </div>

          {/* Recent Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Lịch sử sử dụng gần đây
            </h2>
            
            {stats.recent_usage && stats.recent_usage.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Đơn hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Khách hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Giá trị đơn
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Giảm giá
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recent_usage.map((usage) => (
                      <tr key={usage.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-600">
                            #{usage.order_id}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{usage.user_name}</div>
                          <div className="text-xs text-gray-500">{usage.user_email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(usage.order_total)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-green-600">
                            -{formatCurrency(usage.discount_amount)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(usage.created_at).toLocaleString('vi-VN')}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có lịch sử sử dụng
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tiến độ sử dụng</h3>
            
            {stats.statistics.usage_limit ? (
              <>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Đã sử dụng</span>
                    <span className="font-semibold">
                      {stats.statistics.actual_usage} / {stats.statistics.usage_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.statistics.actual_usage / stats.statistics.usage_limit) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Còn lại</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.statistics.usage_limit - stats.statistics.actual_usage}
                  </div>
                  <div className="text-xs text-gray-500">lượt sử dụng</div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">♾️</div>
                <div className="text-sm text-gray-600">Không giới hạn số lượt sử dụng</div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/admin/coupons/${id}/edit`)}
                className="w-full btn-primary"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={() => navigate('/admin/coupons')}
                className="w-full btn-secondary"
              >
                📋 Danh sách
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-bold mb-3">Thông tin</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-90">Mã:</span>
                <span className="font-bold">{stats.statistics.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Lượt dùng:</span>
                <span className="font-bold">{stats.statistics.usage_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Users:</span>
                <span className="font-bold">{stats.statistics.unique_users}</span>
              </div>
              <div className="border-t border-white/30 my-2 pt-2">
                <div className="text-xs opacity-75">Tổng tiết kiệm</div>
                <div className="text-xl font-bold">
                  {formatCurrency(stats.statistics.total_discount_given)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
