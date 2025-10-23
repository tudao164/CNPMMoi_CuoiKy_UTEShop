import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { ResetPasswordRequest } from '@/types/auth.types';
import { VALIDATION, ERROR_MESSAGES } from '@/config/constants';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  const email = searchParams.get('email') || '';
  const otpCode = searchParams.get('otp') || '';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordRequest & { confirmPassword: string }>({
    defaultValues: { email, otp_code: otpCode },
  });

  const onSubmit = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    
    try {
      const response = await authService.resetPassword(data);

      if (response.success) {
        toast.success(response.message);
        navigate('/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email không hợp lệ</h1>
          <p className="text-gray-600 mb-6">Vui lòng quay lại trang quên mật khẩu</p>
          <Link to="/forgot-password" className="btn-primary inline-block">
            Về trang quên mật khẩu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="card max-w-md w-full">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-600">Nhập mật khẩu mới của bạn</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden Email */}
          <input type="hidden" {...register('email')} />

          {/* OTP Code */}
          <div>
            <label className="label">Mã OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`input ${errors.otp_code ? 'input-error' : ''}`}
              placeholder="000000"
              {...register('otp_code', {
                required: ERROR_MESSAGES.REQUIRED,
                pattern: {
                  value: VALIDATION.OTP.PATTERN,
                  message: ERROR_MESSAGES.OTP_INVALID,
                },
              })}
            />
            {errors.otp_code && (
              <p className="error-text">{errors.otp_code.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="label">Mật khẩu mới</label>
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
            <label className="label">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: ERROR_MESSAGES.REQUIRED,
                validate: (value) =>
                  value === watch('new_password') || ERROR_MESSAGES.PASSWORD_NOT_MATCH,
              })}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
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
              'Đặt lại mật khẩu'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
