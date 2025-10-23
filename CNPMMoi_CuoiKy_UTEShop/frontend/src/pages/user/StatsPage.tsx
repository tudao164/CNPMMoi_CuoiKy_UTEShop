import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, UserStats, OTPHistory } from '@/services/user.service';
import { ERROR_MESSAGES } from '@/config/constants';
import toast from 'react-hot-toast';

export default function StatsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [otpHistory, setOtpHistory] = useState<OTPHistory[]>([]);
  const [otpLimit, setOtpLimit] = useState(10);

  useEffect(() => {
    loadData();
  }, [otpLimit]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, otpResponse] = await Promise.all([
        userService.getStats(),
        userService.getOTPHistory(otpLimit),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (otpResponse.success) {
        setOtpHistory(otpResponse.data.otps);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOTPTypeText = (type: string) => {
    switch (type) {
      case 'register':
        return 'Đăng ký';
      case 'reset_password':
        return 'Đặt lại mật khẩu';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Thống kê tài khoản</h2>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.is_verified ? '✓' : '⚠'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stats.is_verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <svg className={`w-6 h-6 ${stats.is_verified ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng OTP</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_otp_requests}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Yêu cầu OTP</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đã sử dụng</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.used_otps}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">OTP đã dùng</p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hết hạn</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired_otps}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">OTP hết hạn</p>
            </div>
          </div>
        )}

        {/* Account Info */}
        {stats && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Ngày tạo tài khoản:</span>
                <span className="font-medium text-gray-900">{formatDate(stats.account_created)}</span>
              </div>
              {stats.last_otp_time && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">OTP gần nhất:</span>
                  <span className="font-medium text-gray-900">{formatDate(stats.last_otp_time)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OTP History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Lịch sử OTP</h3>
            <select
              value={otpLimit}
              onChange={(e) => setOtpLimit(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={5}>5 OTP gần nhất</option>
              <option value={10}>10 OTP gần nhất</option>
              <option value={20}>20 OTP gần nhất</option>
              <option value={50}>50 OTP gần nhất</option>
            </select>
          </div>

          {otpHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>Chưa có lịch sử OTP</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hết hạn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {otpHistory.map((otp) => (
                    <tr key={otp.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {getOTPTypeText(otp.otp_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {otp.is_used ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            ✓ Đã dùng
                          </span>
                        ) : otp.is_expired ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            ✗ Hết hạn
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            ⏳ Còn hạn
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(otp.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(otp.expires_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
