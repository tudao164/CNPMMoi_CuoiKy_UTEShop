import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { RegisterRequest } from '@/types/auth.types';
import { VALIDATION, ERROR_MESSAGES } from '@/config/constants';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>();

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setIsLoading(true);
    
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
      });

      if (response.success) {
        toast.success(response.message);
        // Navigate to OTP verification page with email
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&type=register`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-600">Tạo tài khoản mới để mua sắm tại UTEShop</p>
        </div>

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

          {/* Email */}
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="email@example.com"
              {...register('email', {
                required: ERROR_MESSAGES.REQUIRED,
                pattern: {
                  value: VALIDATION.EMAIL.PATTERN,
                  message: ERROR_MESSAGES.EMAIL_INVALID,
                },
                maxLength: {
                  value: VALIDATION.EMAIL.MAX_LENGTH,
                  message: `Email không được quá ${VALIDATION.EMAIL.MAX_LENGTH} ký tự`,
                },
              })}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
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

          {/* Password */}
          <div>
            <label className="label">Mật khẩu *</label>
            <input
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              {...register('password', {
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
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="label">Xác nhận mật khẩu *</label>
            <input
              type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: ERROR_MESSAGES.REQUIRED,
                validate: (value) =>
                  value === watch('password') || ERROR_MESSAGES.PASSWORD_NOT_MATCH,
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
              'Đăng ký'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
