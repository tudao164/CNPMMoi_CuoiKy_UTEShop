import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { userService } from '@/services/user.service';
import { ChangePasswordRequest } from '@/types/auth.types';
import { VALIDATION, ERROR_MESSAGES } from '@/config/constants';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordRequest>();

  const onSubmit = async (data: ChangePasswordRequest) => {
    setIsLoading(true);

    try {
      const response = await userService.changePassword(data);

      if (response.success) {
        toast.success(response.message);
        reset();
        // Optionally navigate to profile after successful change
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-700 hover:text-primary-600"
            >
              ← Quay lại Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đổi mật khẩu</h2>
            <p className="text-gray-600">Cập nhật mật khẩu bảo mật cho tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="label">Mật khẩu hiện tại *</label>
              <input
                type="password"
                className={`input ${errors.current_password ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('current_password', {
                  required: ERROR_MESSAGES.REQUIRED,
                })}
              />
              {errors.current_password && (
                <p className="error-text">{errors.current_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="label">Mật khẩu mới *</label>
              <input
                type="password"
                className={`input ${errors.new_password ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('new_password', {
                  required: ERROR_MESSAGES.REQUIRED,
                  minLength: {
                    value: VALIDATION.PASSWORD.MIN_LENGTH,
                    message: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
                  },
                  pattern: {
                    value: VALIDATION.PASSWORD.PATTERN,
                    message: ERROR_MESSAGES.PASSWORD_WEAK,
                  },
                })}
              />
              {errors.new_password && (
                <p className="error-text">{errors.new_password.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                className={`input ${errors.confirm_password ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('confirm_password', {
                  required: ERROR_MESSAGES.REQUIRED,
                  validate: (value) =>
                    value === watch('new_password') || ERROR_MESSAGES.PASSWORD_NOT_MATCH,
                })}
              />
              {errors.confirm_password && (
                <p className="error-text">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Lưu ý:</strong> Sau khi đổi mật khẩu thành công, bạn sẽ được chuyển về trang profile.
              </p>
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
                  Đang xử lý...
                </span>
              ) : (
                'Đổi mật khẩu'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
