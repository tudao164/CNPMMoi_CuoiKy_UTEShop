import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { Product, Category, SortBy } from '@/types/product.types';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export default function CategoryProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [sortBy, setSortBy] = useState<SortBy>(
    (searchParams.get('sort_by') as SortBy) || 'newest'
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      loadCategoryProducts(parseInt(categoryId));
    }
  }, [categoryId, sortBy, searchParams.get('page')]);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.success) {
        // Ensure categories is an array
        const categoriesData = Array.isArray(response.data) ? response.data : [];
        setAllCategories(categoriesData);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setAllCategories([]); // Set empty array on error
    }
  };

  const loadCategoryProducts = async (catId: number) => {
    setIsLoading(true);
    try {
      const page = parseInt(searchParams.get('page') || '1');
      
      const response = await productService.getProductsByCategory(catId, {
        page,
        limit: 12,
        sort_by: sortBy,
      });

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);

        // Find and set category info
        const categoryInfo = allCategories.find((cat) => cat.id === catId);
        if (categoryInfo) {
          setCategory(categoryInfo);
        }
      }
    } catch (error: any) {
      console.error('Failed to load category products:', error);
      toast.error('Không thể tải sản phẩm của danh mục');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams);
    params.set('sort_by', newSort);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (catId: number) => {
    navigate(`/products/category/${catId}`);
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
              onClick={() => navigate('/products')}
              className="text-gray-700 hover:text-primary-600"
            >
              ← Tất cả sản phẩm
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-primary-600">
            Trang chủ
          </button>
          {' / '}
          <button onClick={() => navigate('/products')} className="hover:text-primary-600">
            Sản phẩm
          </button>
          {category && (
            <>
              {' / '}
              <span className="text-gray-900">{category.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Danh mục</h2>
              <div className="space-y-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      cat.id === parseInt(categoryId || '0')
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-sm opacity-75">
                        {cat.product_count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Category Header */}
            {category && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600">{category.description}</p>
                )}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination.total > 0 && (
                  <>
                    Hiển thị <span className="font-semibold">{pagination.total}</span> sản phẩm
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sắp xếp:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  Chưa có sản phẩm nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Danh mục này chưa có sản phẩm. Vui lòng quay lại sau!
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="btn-primary"
                >
                  Xem tất cả sản phẩm
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
