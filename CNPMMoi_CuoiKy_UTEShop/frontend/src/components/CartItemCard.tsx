import { CartItem } from '@/types/cart.types';
import { getImageUrl } from '@/config/constants';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  isLoading?: boolean;
}

export default function CartItemCard({ item, onUpdateQuantity, onRemove, isLoading }: CartItemCardProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stock_quantity) {
      alert(`Chỉ còn ${item.stock_quantity} sản phẩm trong kho`);
      return;
    }
    onUpdateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={getImageUrl(item.product_image)}
          alt={item.product_name}
          className="w-full h-full object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/96?text=No+Image';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.product_name}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.category_name}</p>
            
            {/* Stock Status */}
            {!item.is_available && (
              <p className="text-sm text-red-600 mt-1">⚠️ Sản phẩm không khả dụng</p>
            )}
            {item.is_available && item.stock_quantity < 10 && (
              <p className="text-sm text-orange-600 mt-1">
                ⚠️ Chỉ còn {item.stock_quantity} sản phẩm
              </p>
            )}
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Xóa sản phẩm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isLoading || item.quantity >= item.stock_quantity}
              className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            {item.discount_amount > 0 && (
              <p className="text-sm text-gray-400 line-through">
                {item.price.toLocaleString('vi-VN')}₫
              </p>
            )}
            <p className="text-lg font-bold text-primary-600">
              {item.total_price.toLocaleString('vi-VN')}₫
            </p>
            {item.discount_amount > 0 && (
              <p className="text-xs text-green-600">
                Tiết kiệm {item.discount_amount.toLocaleString('vi-VN')}₫
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
