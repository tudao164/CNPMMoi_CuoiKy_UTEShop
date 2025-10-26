import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { authService } from '@/services/auth.service';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product.types';
import { getImageUrl } from '@/config/constants';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { getCartItemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all products for fuzzy search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts({ limit: 1000 });
        if (response.success && response.data) {
          const products = Array.isArray(response.data) ? response.data : response.data.products || [];
          setAllProducts(products);
        }
      } catch (error) {
        console.error('Error fetching products for search:', error);
      }
    };
    fetchProducts();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fuzzy search with Fuse.js
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fuse = new Fuse(allProducts, {
      keys: ['name', 'description', 'category_name'],
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 2,
    });

    const results = fuse.search(searchQuery).slice(0, 8);
    setSuggestions(results.map((result) => result.item));
    setShowSuggestions(true);
    setSelectedIndex(-1);
  }, [searchQuery, allProducts]);

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
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/products/${product.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(e as any);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
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
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative" ref={searchRef}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.trim().length >= 2 && setSuggestions(suggestions)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700"
              >
                🔍
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {suggestions.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary-50'
                        : 'hover:bg-gray-50'
                    } ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/48';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatPrice(product.price)} • {product.category_name || 'Khác'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.stock_quantity > 0 ? (
                        <span className="text-green-600">✓ Còn hàng</span>
                      ) : (
                        <span className="text-red-600">Hết hàng</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* View all results */}
                <div
                  onClick={() => {
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="px-4 py-3 text-center text-primary-600 hover:bg-primary-50 cursor-pointer font-medium border-t border-gray-200"
                >
                  Xem tất cả kết quả →
                </div>
              </div>
            )}

            {/* No results */}
            {showSuggestions && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <p className="text-gray-600 text-center">
                  😕 Không tìm thấy sản phẩm nào phù hợp với "<strong>{searchQuery}</strong>"
                </p>
              </div>
            )}
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
