import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { VALIDATION, ERROR_MESSAGES } from '@/config/constants';

interface UpdateProfileForm {
  full_name: string;
  phone: string;
  avatar_url: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateProfileForm>();

  // Load latest profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUser(response.data.user);
        setValue('full_name', response.data.user.full_name);
        setValue('phone', response.data.user.phone || '');
        setValue('avatar_url', response.data.user.avatar_url || '');
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async (data: UpdateProfileForm) => {
    setIsLoading(true);

    try {
      const response = await userService.updateProfile({
        full_name: data.full_name,
        phone: data.phone || undefined,
        avatar_url: data.avatar_url || undefined,
      });

      if (response.success) {
        setUser(response.data.user);
        toast.success(response.message);
        // Reload profile to get latest data
        await loadProfile();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Đăng xuất thành công!');
      navigate('/login');
    } catch (error: any) {
      logout();
      navigate('/login');
    }
  };

  if (isRefreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 
              className="text-2xl font-bold text-primary-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
              UTEShop
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/change-password')}
                className="text-gray-700 hover:text-primary-600"
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => navigate('/stats')}
                className="text-gray-700 hover:text-primary-600"
              >
                Thống kê
              </button>
              <button onClick={handleLogout} className="btn-secondary">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700"
            >
              ← Về trang chủ
            </button>
          </div>

          {/* Account Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trạng thái tài khoản</p>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
              </div>
              {user.is_verified ? (
                <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  ✓ Đã xác thực
                </span>
              ) : (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  ⚠ Chưa xác thực
                </span>
              )}
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Họ và tên *</label>
              <input
                type="text"
                className={`input ${errors.full_name ? 'input-error' : ''}`}
                placeholder="Nguyễn Văn A"
                {...register('full_name', {
                  required: ERROR_MESSAGES.REQUIRED,
                  minLength: {
                    value: VALIDATION.FULL_NAME.MIN_LENGTH,
                    message: `Họ tên phải có ít nhất ${VALIDATION.FULL_NAME.MIN_LENGTH} ký tự`,
                  },
                  maxLength: {
                    value: VALIDATION.FULL_NAME.MAX_LENGTH,
                    message: `Họ tên không được quá ${VALIDATION.FULL_NAME.MAX_LENGTH} ký tự`,
                  },
                  pattern: {
                    value: VALIDATION.FULL_NAME.PATTERN,
                    message: ERROR_MESSAGES.FULL_NAME_INVALID,
                  },
                })}
              />
              {errors.full_name && (
                <p className="error-text">{errors.full_name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="label">Số điện thoại</label>
              <input
                type="tel"
                className={`input ${errors.phone ? 'input-error' : ''}`}
                placeholder="0123456789"
                {...register('phone', {
                  pattern: {
                    value: VALIDATION.PHONE.PATTERN,
                    message: ERROR_MESSAGES.PHONE_INVALID,
                  },
                  minLength: {
                    value: VALIDATION.PHONE.MIN_LENGTH,
                    message: ERROR_MESSAGES.PHONE_INVALID,
                  },
                  maxLength: {
                    value: VALIDATION.PHONE.MAX_LENGTH,
                    message: ERROR_MESSAGES.PHONE_INVALID,
                  },
                })}
              />
              {errors.phone && (
                <p className="error-text">{errors.phone.message}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div>
              <label className="label">URL Ảnh đại diện</label>
              <input
                type="url"
                className={`input ${errors.avatar_url ? 'input-error' : ''}`}
                placeholder="https://example.com/avatar.jpg"
                {...register('avatar_url', {
                  pattern: {
                    value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                    message: 'URL ảnh không hợp lệ (phải là .jpg, .png, .gif hoặc .webp)',
                  },
                })}
              />
              {errors.avatar_url && (
                <p className="error-text">{errors.avatar_url.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Nhập URL ảnh đại diện của bạn (tùy chọn)
              </p>
            </div>

            {/* Account Info (Read-only) */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ngày tạo tài khoản</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {user.updated_at && (
                  <div>
                    <p className="text-gray-600">Cập nhật lần cuối</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.updated_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang cập nhật...
                </span>
              ) : (
                'Cập nhật thông tin'
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Vùng nguy hiểm</h3>
          <p className="text-gray-600 mb-4">
            Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
          </p>
          <button
            onClick={() => navigate('/delete-account')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all"
          >
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
