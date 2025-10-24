import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminProductService } from '@/services/admin.service';
import { AdminProduct, ProductStats } from '@/types/admin.types';
import { getImageUrl } from '@/config/constants';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(true);
  const [stockStatus, setStockStatus] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, search, isActive, stockStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search) params.search = search;
      if (isActive !== undefined) params.is_active = isActive;
      if (stockStatus) params.stock_status = stockStatus;

      const response = await adminProductService.getProducts(params);
      
      if (response.success) {
        setProducts(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminProductService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await adminProductService.deleteProduct(id);
      toast.success('Xóa sản phẩm thành công');
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await adminProductService.activateProduct(id);
      toast.success('Kích hoạt sản phẩm thành công');
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể kích hoạt sản phẩm');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Hết hàng</span>;
    } else if (quantity < 10) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Sắp hết</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Còn hàng</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/create')}
          className="btn-primary"
        >
          ➕ Thêm sản phẩm mới
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Tổng sản phẩm</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_products}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đang bán</div>
            <div className="text-2xl font-bold text-green-600">{stats.active_products}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Hết hàng</div>
            <div className="text-2xl font-bold text-red-600">{stats.out_of_stock}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Đang sale</div>
            <div className="text-2xl font-bold text-blue-600">{stats.on_sale}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên sản phẩm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={isActive === undefined ? '' : isActive.toString()}
              onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đang bán</option>
              <option value="false">Ngừng bán</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tồn kho
            </label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tất cả</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="low_stock">Sắp hết</option>
              <option value="in_stock">Còn hàng</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setIsActive(undefined);
                setStockStatus('');
                setPagination({ ...pagination, page: 1 });
              }}
              className="btn-secondary w-full"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã bán
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(product.image_url)}
                          alt={product.name}
                          className="h-12 w-12 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150';
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.sale_price || product.price)}
                      </div>
                      {product.sale_price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock_quantity}
                      </div>
                      {getStockBadge(product.stock_quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.total_sold || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        ✏️ Sửa
                      </button>
                      {product.is_active ? (
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Xóa
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(product.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          ✅ Kích hoạt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{pagination.total}</span> sản phẩm
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
