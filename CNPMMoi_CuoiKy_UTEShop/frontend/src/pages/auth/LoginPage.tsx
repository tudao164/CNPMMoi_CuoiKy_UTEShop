import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { LoginRequest } from '@/types/auth.types';
import { VALIDATION, ERROR_MESSAGES, STORAGE_KEYS } from '@/config/constants';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL)
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: {
      email: localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL) || '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(data);

      if (response.success && response.data.token) {
        // Save to store and localStorage
        setAuth(response.data.user, response.data.token);
        
        // Remember email if checked
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, data.email);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
        }
        
        toast.success(response.message);
        navigate('/shop');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Chào mừng bạn quay lại UTEShop</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="label">Email</label>
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
              })}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="label">Mật khẩu</label>
            <input
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              {...register('password', {
                required: ERROR_MESSAGES.REQUIRED,
              })}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Quên mật khẩu?
            </Link>
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
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
