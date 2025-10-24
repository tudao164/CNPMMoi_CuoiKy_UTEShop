import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminCouponService } from '@/services/admin.service';
import { AdminCoupon } from '@/types/coupon.types';

export default function AdminCouponEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupon, setCoupon] = useState<AdminCoupon | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: null as number | null,
    usage_limit: null as number | null,
    per_user_limit: 1,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await adminCouponService.getCouponById(Number(id));
      if (response.success) {
        const couponData = response.data;
        setCoupon(couponData);
        
        // Format dates for datetime-local input
        const startDate = new Date(couponData.start_date);
        const endDate = new Date(couponData.end_date);
        
        setFormData({
          description: couponData.description,
          discount_value: couponData.discount_value,
          min_order_amount: couponData.min_order_amount,
          max_discount_amount: couponData.max_discount_amount,
          usage_limit: couponData.usage_limit,
          per_user_limit: couponData.per_user_limit,
          start_date: formatDateForInput(startDate),
          end_date: formatDateForInput(endDate),
          is_active: couponData.is_active,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin mã giảm giá');
      navigate('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    if (formData.discount_value <= 0) {
      toast.error('Giá trị giảm giá phải lớn hơn 0');
      return;
    }

    if (coupon?.discount_type === 'percentage' && formData.discount_value > 100) {
      toast.error('Giá trị phần trăm không được vượt quá 100');
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    try {
      setSaving(true);
      await adminCouponService.updateCoupon(Number(id), formData);
      toast.success('Cập nhật mã giảm giá thành công');
      navigate('/admin/coupons');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật mã giảm giá');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      const numValue = value === '' ? null : Number(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
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

  if (!coupon) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy mã giảm giá</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="text-primary-600 hover:text-primary-700 mb-2 flex items-center gap-1 font-medium"
        >
          ← Quay lại danh sách
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa mã giảm giá</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin mã giảm giá: <strong>{coupon.code}</strong></p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã giảm giá
                  </label>
                  <input
                    type="text"
                    value={coupon.code}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Không thể thay đổi mã sau khi tạo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Mô tả chi tiết về mã giảm giá..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Discount Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giảm giá</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại giảm giá
                    </label>
                    <input
                      type="text"
                      value={coupon.discount_type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định (VNĐ)'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị giảm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="discount_value"
                      value={formData.discount_value || ''}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị đơn tối thiểu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="min_order_amount"
                      value={formData.min_order_amount || ''}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giảm tối đa (cho % discount)
                    </label>
                    <input
                      type="number"
                      name="max_discount_amount"
                      value={formData.max_discount_amount || ''}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      disabled={coupon.discount_type === 'fixed_amount'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giới hạn sử dụng</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng số lượt sử dụng
                    </label>
                    <input
                      type="number"
                      name="usage_limit"
                      value={formData.usage_limit || ''}
                      onChange={handleChange}
                      min="0"
                      placeholder="Không giới hạn"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Đã sử dụng: {coupon.usage_count} lượt
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượt mỗi user <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="per_user_limit"
                      value={formData.per_user_limit || ''}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Time Range */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thời gian hiệu lực</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Preview</h3>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold mb-2">{coupon.code}</div>
                <div className="text-sm mb-3">{formData.description}</div>
                <div className="border-t border-white/30 pt-3">
                  <div className="text-3xl font-bold mb-1">
                    {coupon.discount_type === 'percentage' 
                      ? `${formData.discount_value}%` 
                      : formatCurrency(formData.discount_value)}
                  </div>
                  <div className="text-xs">
                    Đơn tối thiểu: {formatCurrency(formData.min_order_amount)}
                  </div>
                  {formData.max_discount_amount && coupon.discount_type === 'percentage' && (
                    <div className="text-xs">
                      Giảm tối đa: {formatCurrency(formData.max_discount_amount)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trạng thái</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Kích hoạt mã giảm giá
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary mb-2"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/coupons')}
                className="w-full btn-secondary"
                disabled={saving}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
