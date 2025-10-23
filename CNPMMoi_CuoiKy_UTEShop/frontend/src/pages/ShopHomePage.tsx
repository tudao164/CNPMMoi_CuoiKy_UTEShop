import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { HomePageData, Category } from '@/types/product.types';
import ProductCard from '@/components/ProductCard';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function ShopHomePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getCartItemCount, fetchCart } = useCartStore();
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHomePageData();
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const loadHomePageData = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getHomePageData();
      if (response.success && response.data) {
        // Validate and ensure arrays are properly set
        const validatedData: HomePageData = {
          categories: Array.isArray(response.data.categories) ? response.data.categories : [],
          latest_products: Array.isArray(response.data.latest_products) ? response.data.latest_products : [],
          best_selling_products: Array.isArray(response.data.best_selling_products) ? response.data.best_selling_products : [],
          most_viewed_products: Array.isArray(response.data.most_viewed_products) ? response.data.most_viewed_products : [],
          highest_discount_products: Array.isArray(response.data.highest_discount_products) ? response.data.highest_discount_products : []
        };
        setHomeData(validatedData);
      }
    } catch (error: any) {
      console.error('Failed to load home page data:', error);
      toast.error('Không thể tải dữ liệu trang chủ');
      // Set empty data on error to prevent map errors
      setHomeData({
        categories: [],
        latest_products: [],
        best_selling_products: [],
        most_viewed_products: [],
        highest_discount_products: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Đăng xuất thành công!');
    } catch (error: any) {
      logout();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/products/category/${category.id}`);
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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <h1
              className="text-2xl font-bold text-primary-600 cursor-pointer whitespace-nowrap"
              onClick={() => navigate('/')}
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
                    onClick={() => navigate('/profile')}
                    className="text-gray-700 hover:text-primary-600"
                  >
                    👤 {user.full_name}
                  </button>
                  <button onClick={handleLogout} className="btn-secondary">
                    Đăng xuất
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Chào mừng đến UTEShop
          </h2>
          <p className="text-xl mb-6">
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Khám phá ngay →
          </button>
        </div>

        {/* Categories */}
        {homeData?.categories && homeData.categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh mục sản phẩm</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {homeData.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center group"
                >
                  <div className="text-4xl mb-2">📦</div>
                  <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">{category.product_count} sản phẩm</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Latest Products */}
        {homeData?.latest_products && homeData.latest_products.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🆕 Sản phẩm mới nhất</h2>
              <button
                onClick={() => navigate('/products?sort_by=newest')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {homeData.latest_products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Best Selling Products */}
        {homeData?.best_selling_products && homeData.best_selling_products.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🔥 Bán chạy nhất</h2>
              <button
                onClick={() => navigate('/products?sort_by=best_selling')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {homeData.best_selling_products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Most Viewed Products */}
        {homeData?.most_viewed_products && homeData.most_viewed_products.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">👁 Được xem nhiều nhất</h2>
              <button
                onClick={() => navigate('/products?sort_by=popularity')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {homeData.most_viewed_products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Highest Discount Products */}
        {homeData?.highest_discount_products && homeData.highest_discount_products.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">💰 Khuyến mãi lớn</h2>
              <button
                onClick={() => navigate('/products?on_sale=true')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {homeData.highest_discount_products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
