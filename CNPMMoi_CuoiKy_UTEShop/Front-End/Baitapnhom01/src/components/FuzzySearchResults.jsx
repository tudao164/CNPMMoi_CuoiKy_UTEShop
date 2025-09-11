import React from 'react';
import { useNavigate } from 'react-router-dom';

const FuzzySearchResults = ({ results, isSearching, query, onResultClick, getHighlightedText }) => {
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    if (onResultClick) {
      onResultClick(product);
    }
    navigate(`/product/${product.id}`);
  };

  if (isSearching) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2">Đang tìm kiếm...</span>
        </div>
      </div>
    );
  }

  if (!query.trim() || results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2 border-b bg-gray-50 text-sm text-gray-600">
        Tìm thấy {results.length} kết quả cho "<span className="font-semibold">{query}</span>"
      </div>
      
      {results.map((product, index) => (
        <div
          key={product.id}
          onClick={() => handleProductClick(product)}
          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
        >
          {/* Product Image */}
          <div className="w-12 h-12 flex-shrink-0 mr-3">
            <img
              src={product.image_url || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              {/* Product Name with Highlight */}
              <h4 
                className="text-sm font-medium text-gray-900 truncate"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedText(
                    product.name, 
                    product._fuzzyMatches?.filter(match => match.key === 'name')
                  )
                }}
              />
              
              {/* Fuzzy Score Badge */}
              {product._fuzzyScore !== undefined && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {Math.round((1 - product._fuzzyScore) * 100)}%
                </span>
              )}
            </div>
            
            {/* Price */}
            <div className="flex items-center mt-1">
              {product.sale_price ? (
                <>
                  <span className="text-sm font-semibold text-red-600">
                    ${product.sale_price}
                  </span>
                  <span className="text-xs text-gray-500 line-through ml-2">
                    ${product.price}
                  </span>
                  <span className="text-xs text-green-600 ml-2">
                    -{product.discount_percentage}%
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-gray-900">
                  ${product.price}
                </span>
              )}
            </div>

            {/* Category and Stock */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                {product.category_name}
              </span>
              <span className={`text-xs ${product.is_in_stock ? 'text-green-600' : 'text-red-600'}`}>
                {product.is_in_stock ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>

            {/* Description with Highlight (if matched) */}
            {product._fuzzyMatches?.some(match => match.key === 'description') && (
              <p 
                className="text-xs text-gray-600 mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: getHighlightedText(
                    product.description?.substring(0, 100) + '...',
                    product._fuzzyMatches?.filter(match => match.key === 'description')
                  )
                }}
              />
            )}
          </div>
        </div>
      ))}

      {/* View All Results Button */}
      {results.length > 5 && (
        <div className="p-3 border-t bg-gray-50">
          <button
            onClick={() => navigate(`/products?search=${encodeURIComponent(query)}`)}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem tất cả {results.length} kết quả →
          </button>
        </div>
      )}
    </div>
  );
};

export default FuzzySearchResults;
