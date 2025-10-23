import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ProductDetail } from '@/types/product.types';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProductDetail(parseInt(id));
    }
  }, [id]);

  const loadProductDetail = async (productId: number) => {
    setIsLoading(true);
    try {
      const response = await productService.getProductDetail(productId);
      if (response.success) {
        setProductDetail(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load product detail:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  };

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
        return 'Sắp hết hàng';
      case 'out_of_stock':
        return 'Hết hàng';
      default:
        return 'Không rõ';
    }
  };

  const handleQuantityChange = (value: number) => {
    if (!productDetail) return;
    
    if (value < 1) {
      setQuantity(1);
    } else if (value > productDetail.product.stock_quantity) {
      setQuantity(productDetail.product.stock_quantity);
      toast.error(`Chỉ còn ${productDetail.product.stock_quantity} sản phẩm trong kho`);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (!productDetail) return;
    
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(productDetail.product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm vào giỏ hàng';
      toast.error(errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!productDetail) return;
    
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(productDetail.product.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      // Redirect to cart page
      navigate('/cart');
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm vào giỏ hàng';
      toast.error(errorMessage);
      setIsAddingToCart(false);
    }
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

  if (!productDetail) {
    return null;
  }

  const { product, related_products } = productDetail;
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url];

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
              ← Quay lại danh sách
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
          {' / '}
          <button
            onClick={() => navigate(`/products/category/${product.category_id}`)}
            className="hover:text-primary-600"
          >
            {product.category_name}
          </button>
          {' / '}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={images[selectedImage] || '/placeholder-product.png'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image || '/placeholder-product.png'}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6">
            {/* Category & Featured Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {product.category_name}
              </span>
              {product.is_featured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  ⭐ Nổi bật
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
              <span>👁 {product.view_count.toLocaleString()} lượt xem</span>
              <span>🛒 Đã bán {product.sold_count.toLocaleString()}</span>
              <span className={`font-semibold ${getStockStatusColor(product.stock_status)}`}>
                {getStockStatusText(product.stock_status)}
                {product.stock_quantity > 0 && ` (${product.stock_quantity})`}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              {product.is_on_sale && product.sale_price ? (
                <>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.effective_price)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded">
                      -{product.discount_percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">
                    💰 Tiết kiệm {formatPrice(product.savings_amount)}
                  </p>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex py-2 border-b border-gray-200">
                      <span className="w-1/3 text-gray-600 capitalize">{key}:</span>
                      <span className="flex-1 font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.is_in_stock && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Số lượng</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center border-x border-gray-300 py-2 focus:outline-none"
                      min="1"
                      max={product.stock_quantity}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock_quantity}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock_quantity} sản phẩm có sẵn
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || isAddingToCart}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  product.is_in_stock && !isAddingToCart
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAddingToCart ? '...' : product.is_in_stock ? '🛒 Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.is_in_stock || isAddingToCart}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  product.is_in_stock && !isAddingToCart
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAddingToCart ? '...' : 'Mua ngay'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related_products && related_products.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related_products.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
