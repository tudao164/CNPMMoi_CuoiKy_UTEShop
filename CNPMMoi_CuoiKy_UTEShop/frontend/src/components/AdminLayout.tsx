import { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

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

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: '📊',
      label: 'Dashboard',
    },
    {
      path: '/admin/products',
      icon: '📦',
      label: 'Quản lý Sản phẩm',
    },
    {
      path: '/admin/orders',
      icon: '🛒',
      label: 'Quản lý Đơn hàng',
    },
    {
      path: '/admin/users',
      icon: '👥',
      label: 'Quản lý Người dùng',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1
                className="text-2xl font-bold text-primary-600 cursor-pointer"
                onClick={() => navigate('/admin/dashboard')}
              >
                🔐 UTEShop Admin
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                🏠 Về trang chủ
              </button>
              <div className="text-sm text-gray-700">
                👤 {user?.full_name}
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
