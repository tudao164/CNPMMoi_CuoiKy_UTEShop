import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Đăng xuất thành công!');
      navigate('/login');
    } catch (error: any) {
      // Even if API fails, clear local storage
      logout();
      navigate('/login');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-primary-600">UTEShop</h1>
              <div className="space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Chào mừng đến với UTEShop
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Nền tảng mua sắm trực tuyến tốt nhất cho sinh viên UTE
            </p>
            <button
              onClick={() => navigate('/register')}
              className="btn-primary text-lg px-8 py-3"
            >
              Bắt đầu mua sắm
            </button>
          </div>
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
            <h1 className="text-2xl font-bold text-primary-600">UTEShop</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Xin chào, <span className="font-medium">{user.full_name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông tin tài khoản
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center pb-4 border-b border-gray-200">
              <div className="w-32 text-gray-600 font-medium">Email:</div>
              <div className="flex-1 text-gray-900">{user.email}</div>
              {user.is_verified && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  ✓ Đã xác thực
                </span>
              )}
            </div>

            <div className="flex items-center pb-4 border-b border-gray-200">
              <div className="w-32 text-gray-600 font-medium">Họ tên:</div>
              <div className="flex-1 text-gray-900">{user.full_name}</div>
            </div>

            {user.phone && (
              <div className="flex items-center pb-4 border-b border-gray-200">
                <div className="w-32 text-gray-600 font-medium">Số điện thoại:</div>
                <div className="flex-1 text-gray-900">{user.phone}</div>
              </div>
            )}

            <div className="flex items-center pb-4 border-b border-gray-200">
              <div className="w-32 text-gray-600 font-medium">Ngày tạo:</div>
              <div className="flex-1 text-gray-900">
                {new Date(user.created_at).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mua sắm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-lg text-center transition-colors border border-primary-200"
              >
                <div className="text-4xl mb-2">🏪</div>
                <div className="font-bold text-primary-700 text-lg">Cửa hàng</div>
                <div className="text-xs text-primary-600 mt-1">Khám phá sản phẩm</div>
              </button>
              <button
                onClick={() => navigate('/products')}
                className="p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg text-center transition-colors border border-green-200"
              >
                <div className="text-4xl mb-2">📦</div>
                <div className="font-bold text-green-700 text-lg">Tất cả sản phẩm</div>
                <div className="text-xs text-green-600 mt-1">Xem danh sách đầy đủ</div>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý tài khoản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-medium text-gray-900">Hồ sơ cá nhân</div>
                <div className="text-xs text-gray-600 mt-1">Xem và chỉnh sửa</div>
              </button>
              <button
                onClick={() => navigate('/change-password')}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
              >
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-medium text-gray-900">Đổi mật khẩu</div>
                <div className="text-xs text-gray-600 mt-1">Bảo mật tài khoản</div>
              </button>
              <button
                onClick={() => navigate('/stats')}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="font-medium text-gray-900">Thống kê</div>
                <div className="text-xs text-gray-600 mt-1">Xem thống kê & OTP</div>
              </button>
              <button
                onClick={() => navigate('/delete-account')}
                className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-center transition-colors"
              >
                <div className="text-3xl mb-2">🗑️</div>
                <div className="font-medium text-gray-900">Xóa tài khoản</div>
                <div className="text-xs text-gray-600 mt-1">Xóa vĩnh viễn</div>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tính năng đang phát triển
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 rounded-lg text-center">
                <div className="text-3xl mb-2">🛍️</div>
                <div className="font-medium text-gray-900">Sản phẩm</div>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">
                <div className="text-3xl mb-2">🛒</div>
                <div className="font-medium text-gray-900">Giỏ hàng</div>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="font-medium text-gray-900">Đơn hàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
