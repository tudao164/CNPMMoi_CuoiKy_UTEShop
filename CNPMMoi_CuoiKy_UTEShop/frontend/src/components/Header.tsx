import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getCartItemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <h1
            className="text-2xl font-bold text-primary-600 cursor-pointer whitespace-nowrap"
            onClick={() => navigate('/shop')}
          >
            UTEShop
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700"
              >
                🔍
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-4 whitespace-nowrap">
            {isAuthenticated && user ? (
              <>
                {user.is_admin && (
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="relative text-gray-700 hover:text-primary-600 p-2"
                    title="Admin Panel"
                  >
                    <span className="text-2xl">🔐</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/cart')}
                  className="relative text-gray-700 hover:text-primary-600 p-2"
                  title="Giỏ hàng"
                >
                  <span className="text-2xl">🛒</span>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="relative text-gray-700 hover:text-primary-600 p-2"
                  title="Đơn hàng của tôi"
                >
                  <span className="text-2xl">📦</span>
                </button>
                <button
                  onClick={() => navigate('/my-reviews')}
                  className="relative text-gray-700 hover:text-primary-600 p-2"
                  title="Đánh giá của tôi"
                >
                  <span className="text-2xl">⭐</span>
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-700 hover:text-primary-600"
                >
                  👤 {user.full_name}
                </button>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-1.5"
                >
                  <span className="text-sm">🚪</span>
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
