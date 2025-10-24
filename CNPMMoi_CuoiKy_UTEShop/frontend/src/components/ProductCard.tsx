import { Product } from '@/types/product.types';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { getImageUrl } from '@/config/constants';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600';
      case 'low_stock':
        return 'text-yellow-600';
      case 'out_of_stock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'Còn hàng';
      case 'low_stock':
        return 'Sắp hết';
      case 'out_of_stock':
        return 'Hết hàng';
      default:
        return 'Không rõ';
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      console.log('Adding to cart:', { productId: product.id, quantity: 1 });
      await addToCart(product.id, 1);
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error: any) {
      console.error('Add to cart error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm vào giỏ hàng';
      toast.error(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={getImageUrl(product.image_url)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.is_on_sale && product.discount_percentage > 0 && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
              -{product.discount_percentage}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
              ⭐ Nổi bật
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white font-bold rounded">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-primary-600 font-medium mb-1">
          {product.category_name}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 h-10">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-2">
          {product.is_on_sale && product.sale_price ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.effective_price)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
              <p className="text-xs text-green-600 font-medium">
                Tiết kiệm {formatPrice(product.savings_amount)}
              </p>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-3">
            <span>👁 {product.view_count}</span>
            <span>🛒 {product.sold_count}</span>
          </div>
          <span className={`font-medium ${getStockStatusColor(product.stock_status)}`}>
            {getStockStatusText(product.stock_status)}
          </span>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock || isAddingToCart}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              product.is_in_stock
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? '...' : '🛒 Thêm'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
