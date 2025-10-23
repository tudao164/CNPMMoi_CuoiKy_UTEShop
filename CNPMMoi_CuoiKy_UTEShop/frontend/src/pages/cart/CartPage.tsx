import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import CartItemCard from '@/components/CartItemCard';
import toast from 'react-hot-toast';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, isLoading, fetchCart, updateCartItem, removeCartItem, clearCart } = useCartStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCartItem(itemId, quantity);
      toast.success('Cập nhật số lượng thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Đã xóa toàn bộ giỏ hàng');
      setShowClearConfirm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa giỏ hàng');
    }
  };

  const handleCheckout = () => {
    if (!cart?.validation.is_valid) {
      toast.error('Giỏ hàng có sản phẩm không khả dụng. Vui lòng kiểm tra lại!');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🛒 Giỏ hàng của bạn
          </h1>
          {!isEmpty && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Empty State */}
        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Validation Warning */}
              {cart.validation && !cart.validation.is_valid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-yellow-800">
                        Giỏ hàng có sản phẩm không khả dụng
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Vui lòng xóa hoặc cập nhật các sản phẩm không còn hàng
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List */}
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng số sản phẩm:</span>
                    <span className="font-medium">{cart.summary.total_items}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng số lượng:</span>
                    <span className="font-medium">{cart.summary.total_quantity}</span>
                  </div>
                  {cart.summary.total_savings > 0 && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Tổng tiền hàng:</span>
                        <span className="font-medium">
                          {cart.summary.original_amount.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Tiết kiệm:</span>
                        <span className="font-medium">
                          -{cart.summary.total_savings.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {cart.summary.total_amount.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading || !cart.validation.is_valid}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Tiến hành thanh toán
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Tiếp tục mua hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Xác nhận xóa giỏ hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
