import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product.types';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (query) {
      setSearchQuery(query);
      searchProducts(query, page);
    } else {
      navigate('/products');
    }
  }, [searchParams]);

  const searchProducts = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      navigate('/products');
      return;
    }

    setIsLoading(true);
    try {
      const response = await productService.searchProducts({
        q: query,
        page,
        limit: 12,
      });

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      const message = error.response?.data?.message || 'Không thể tìm kiếm sản phẩm';
      toast.error(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      params.set('page', '1');
      setSearchParams(params);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <h1
              className="text-2xl font-bold text-primary-600 cursor-pointer whitespace-nowrap"
              onClick={() => navigate('/')}
            >
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
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700"
                >
                  🔍
                </button>
              </div>
            </form>

            <button
              onClick={() => navigate('/products')}
              className="text-gray-700 hover:text-primary-600 whitespace-nowrap"
            >
              Xem tất cả
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm
          </h2>
          {!isLoading && (
            <p className="text-gray-600">
              {pagination.total > 0 ? (
                <>
                  Tìm thấy <span className="font-semibold">{pagination.total}</span> sản phẩm 
                  cho "<span className="font-semibold text-primary-600">{searchParams.get('q')}</span>"
                </>
              ) : (
                <>
                  Không tìm thấy sản phẩm nào cho 
                  "<span className="font-semibold text-primary-600">{searchParams.get('q')}</span>"
                </>
              )}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-6">
              Thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="btn-primary"
              >
                Xem tất cả sản phẩm
              </button>
              <button
                onClick={() => {
                  setSearchQuery('');
                  navigate('/');
                }}
                className="btn-secondary"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ← Trước
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.page - 1 && page <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${
                            page === pagination.page
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.page - 2 ||
                      page === pagination.page + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
