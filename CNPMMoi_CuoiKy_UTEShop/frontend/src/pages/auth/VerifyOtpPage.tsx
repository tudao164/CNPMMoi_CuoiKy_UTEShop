import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { VerifyOtpRequest } from '@/types/auth.types';
import { VALIDATION, ERROR_MESSAGES, OTP_TYPES } from '@/config/constants';
import toast from 'react-hot-toast';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const email = searchParams.get('email') || '';
  const otpType = (searchParams.get('type') || 'register') as 'register' | 'reset_password';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpRequest>({
    defaultValues: { email },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyOtpRequest) => {
    setIsLoading(true);
    
    try {
      const response = await authService.verifyOtp(data);

      if (response.success) {
        toast.success(response.message);
        
        if (response.data.token) {
          // Login successful after OTP verification
          setAuth(response.data.user, response.data.token);
          navigate('/shop');
        } else if (otpType === 'reset_password') {
          // Navigate to reset password page
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !email) return;
    
    setIsResending(true);
    
    try {
      const response = await authService.resendOtp({
        email,
        otp_type: otpType,
      });

      if (response.success) {
        toast.success(response.message);
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email không hợp lệ</h1>
          <p className="text-gray-600 mb-6">Vui lòng quay lại trang đăng ký</p>
          <Link to="/register" className="btn-primary inline-block">
            Về trang đăng ký
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác thực OTP</h1>
          <p className="text-gray-600">
            Mã OTP đã được gửi đến email
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden Email Field */}
          <input type="hidden" {...register('email')} />

          {/* OTP Code */}
          <div>
            <label className="label">Mã OTP (6 chữ số)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`input text-center text-2xl tracking-widest ${
                errors.otp_code ? 'input-error' : ''
              }`}
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
                Đang xác thực...
              </span>
            ) : (
              'Xác thực'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Không nhận được mã?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className={`text-sm font-medium ${
                countdown > 0 || isResending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary-600 hover:text-primary-700'
              }`}
            >
              {isResending
                ? 'Đang gửi...'
                : countdown > 0
                ? `Gửi lại sau ${countdown}s`
                : 'Gửi lại mã OTP'}
            </button>
          </div>
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
