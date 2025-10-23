import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { Product, ProductFilters, SortBy, Category } from '@/types/product.types';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<ProductFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined,
    min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
    sort_by: (searchParams.get('sort_by') as SortBy) || 'newest',
    on_sale: searchParams.get('on_sale') === 'true' ? true : undefined,
    in_stock: searchParams.get('in_stock') === 'true' ? true : undefined,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.success) {
        // Ensure categories is an array
        const categoriesData = Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts(filters);
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const defaultFilters: ProductFilters = {
      page: 1,
      limit: 12,
      sort_by: 'newest',
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1
              className="text-2xl font-bold text-primary-600 cursor-pointer"
              onClick={() => navigate('/')}
            >
            </h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-primary-600"
            >
              ← Về trang chủ
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Bộ lọc</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category_id}
                      onChange={() => updateFilters({ category_id: undefined })}
                      className="mr-2"
                    />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category_id === category.id}
                        onChange={() => updateFilters({ category_id: category.id })}
                        className="mr-2"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Giá tối thiểu"
                    value={filters.min_price || ''}
                    onChange={(e) => updateFilters({ min_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Giá tối đa"
                    value={filters.max_price || ''}
                    onChange={(e) => updateFilters({ max_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Other Filters */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Khác</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.on_sale || false}
                      onChange={(e) => updateFilters({ on_sale: e.target.checked ? true : undefined })}
                      className="mr-2"
                    />
                    <span className="text-sm">Đang khuyến mãi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.in_stock || false}
                      onChange={(e) => updateFilters({ in_stock: e.target.checked ? true : undefined })}
                      className="mr-2"
                    />
                    <span className="text-sm">Còn hàng</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sắp xếp</h3>
                <select
                  value={filters.sort_by || 'newest'}
                  onChange={(e) => updateFilters({ sort_by: e.target.value as SortBy })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="best_selling">Bán chạy</option>
                  <option value="popularity">Phổ biến</option>
                  <option value="price_asc">Giá thấp → cao</option>
                  <option value="price_desc">Giá cao → thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Danh sách sản phẩm
                {pagination.total > 0 && (
                  <span className="text-gray-500 text-lg ml-2">
                    ({pagination.total} sản phẩm)
                  </span>
                )}
              </h2>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc tìm kiếm khác
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                        // Show first, last, current, and nearby pages
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
          </main>
        </div>
      </div>
    </div>
  );
}
