import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

const ProductGrid = ({ products, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="border p-4 rounded-lg animate-pulse">
            <div className="w-full h-48 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
          <Link to={`/product/${product.id}`}>
            <div className="relative">
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-2"
                fallbackSrc="/dt1.jpg"
              />
              {product.is_on_sale && product.discount_percentage > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{Math.round(product.discount_percentage)}%
                </div>
              )}
              {!product.is_in_stock && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded">
                  <span className="text-white font-bold">Hết hàng</span>
                </div>
              )}
            </div>
            <h3 className="text-sm font-semibold mb-1 line-clamp-2 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-bold">
                ${product.effective_price}
              </span>
              {product.is_on_sale && (
                <span className="text-gray-400 line-through text-sm">
                  ${product.price}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>👁 {product.view_count}</span>
              <span>🛒 {product.sold_count}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`px-2 py-1 rounded text-xs ${
                product.is_in_stock 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {product.stock_status === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
