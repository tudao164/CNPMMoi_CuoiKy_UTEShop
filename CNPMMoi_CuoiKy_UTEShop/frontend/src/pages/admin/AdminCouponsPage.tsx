import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminCouponService } from '@/services/admin.service';
import { AdminCoupon, CouponStats } from '@/types/coupon.types';

export default function AdminCouponsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  });

  // Filters
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [discountType, setDiscountType] = useState('');
  const [search, setSearch] = useState('');

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [pagination.current_page, isActive, discountType]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.current_page,
        limit: pagination.per_page,
      };

      if (isActive !== undefined) params.is_active = isActive;
      if (discountType) params.discount_type = discountType;
      if (search) params.search = search;

      const response = await adminCouponService.getCoupons(params);

      if (response.success) {
        setCoupons(response.data.coupons || []);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách mã giảm giá');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminCouponService.getOverallStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current_page: 1 });
    fetchCoupons();
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      setDeleting(true);
      await adminCouponService.deleteCoupon(selectedCoupon.id);
      toast.success('Xóa mã giảm giá thành công');
      setShowDeleteModal(false);
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa mã giảm giá');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDiscount = (coupon: AdminCoupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return formatCurrency(coupon.discount_value);
  };

  const getStatusBadge = (isActive: boolean, endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (!isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Tạm dừng</span>;
    }
    
    if (end < now) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Hết hạn</span>;
    }
    
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đang hoạt động</span>;
  };

  const getTypeBadge = (type: string) => {
    return type === 'percentage' ? (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Phần trăm</span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Cố định</span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Mã giảm giá</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả mã giảm giá trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/coupons/create')}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Tạo mã mới
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng số</div>
            <div className="text-2xl font-bold text-gray-900">{stats.overview.total_coupons}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đang hoạt động</div>
            <div className="text-2xl font-bold text-green-600">{stats.overview.active_coupons}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tạm dừng</div>
            <div className="text-2xl font-bold text-gray-600">{stats.overview.inactive_coupons}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Hết hạn</div>
            <div className="text-2xl font-bold text-red-600">{stats.overview.expired_coupons}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Lượt sử dụng</div>
            <div className="text-2xl font-bold text-blue-600">{stats.usage.total_redemptions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Người dùng</div>
            <div className="text-2xl font-bold text-purple-600">{stats.usage.unique_users}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng giảm giá</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(stats.usage.total_discount_given)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={isActive === undefined ? '' : isActive.toString()}
              onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Tạm dừng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giảm giá
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="percentage">Phần trăm</option>
              <option value="fixed_amount">Cố định</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Mã hoặc mô tả..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button onClick={handleSearch} className="btn-primary flex-1">
              Tìm kiếm
            </button>
            <button
              onClick={() => {
                setIsActive(undefined);
                setDiscountType('');
                setSearch('');
                setPagination({ ...pagination, current_page: 1 });
                fetchCoupons();
              }}
              className="btn-secondary flex-1"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy mã giảm giá nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sử dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary-600">{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{coupon.description}</div>
                      <div className="text-xs text-gray-500">Tối thiểu: {formatCurrency(coupon.min_order_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(coupon.discount_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{formatDiscount(coupon)}</div>
                      {coupon.max_discount_amount && (
                        <div className="text-xs text-gray-500">Tối đa: {formatCurrency(coupon.max_discount_amount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.usage_count} / {coupon.usage_limit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">Mỗi user: {coupon.per_user_limit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {new Date(coupon.start_date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(coupon.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(coupon.is_active, coupon.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        📊 Thống kê
                      </button>
                      <button
                        onClick={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{pagination.total}</span> mã
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                    disabled={pagination.current_page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                    disabled={pagination.current_page === pagination.total_pages}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa mã giảm giá <strong>{selectedCoupon.code}</strong>?
              <br />
              <span className="text-sm text-red-600">Lưu ý: Chỉ có thể xóa mã chưa được sử dụng.</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
