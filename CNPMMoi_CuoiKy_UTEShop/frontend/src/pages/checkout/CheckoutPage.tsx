import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { couponService } from '@/services/coupon.service';
import { orderService } from '@/services/order.service';
import { ValidateCouponResponse } from '@/types/coupon.types';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/config/constants';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'E_WALLET'>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await couponService.validateCoupon({
        code: couponCode.toUpperCase(),
        items: cart.items.map(item => ({
          product_id: item.product_id,
          price: item.effective_price,
          quantity: item.quantity
        }))
      });

      if (response.success) {
        setAppliedCoupon(response.data);
        toast.success('Áp dụng mã giảm giá thành công!');
      }
    } catch (error: any) {
      console.error('Validate coupon error:', error);
      const errorMessage = error.response?.data?.message || 'Mã giảm giá không hợp lệ';
      toast.error(errorMessage);
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Đã xóa mã giảm giá');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (shippingAddress.trim().length < 10) {
      toast.error('Địa chỉ giao hàng phải có ít nhất 10 ký tự');
      return;
    }

    if (shippingAddress.trim().length > 500) {
      toast.error('Địa chỉ giao hàng không được quá 500 ký tự');
      return;
    }

    if (notes.length > 500) {
      toast.error('Ghi chú không được quá 500 ký tự');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const response = await orderService.createOrderFromCart({
        shipping_address: shippingAddress,
        notes: notes,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : undefined
      });

      if (response.success) {
        toast.success('Đặt hàng thành công!');
        // Navigate to products page after successful order
        navigate('/products');
      }
    } catch (error: any) {
      console.error('Create order error:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo đơn hàng';
      toast.error(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.summary.total_amount;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const total = appliedCoupon ? appliedCoupon.final_amount : subtotal;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        <form onSubmit={handleCreateOrder}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Shipping & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ giao hàng <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        shippingAddress.trim().length > 0 && shippingAddress.trim().length < 10
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      rows={3}
                      required
                    />
                    <div className="mt-1 flex justify-between items-center">
                      <p className={`text-sm ${
                        shippingAddress.trim().length > 0 && shippingAddress.trim().length < 10
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}>
                        {shippingAddress.trim().length > 0 && shippingAddress.trim().length < 10
                          ? `⚠️ Cần ít nhất ${10 - shippingAddress.trim().length} ký tự nữa`
                          : 'Tối thiểu 10 ký tự, tối đa 500 ký tự'}
                      </p>
                      <p className={`text-sm ${
                        shippingAddress.length > 500 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {shippingAddress.length}/500
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        notes.length > 500 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={2}
                    />
                    <p className={`text-sm text-right mt-1 ${
                      notes.length > 500 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {notes.length}/500
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'COD')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">💵 Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="E_WALLET"
                      checked={paymentMethod === 'E_WALLET'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'E_WALLET')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">👛 Ví điện tử</p>
                      <p className="text-sm text-gray-600">MoMo, ZaloPay, VNPay</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mã giảm giá
                </h2>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">
                        🎉 {appliedCoupon.coupon_code}
                      </p>
                      <p className="text-sm text-green-600">
                        Giảm {formatPrice(appliedCoupon.discount_amount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isValidatingCoupon ? 'Kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Đơn hàng của bạn
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-4 pb-4 border-b">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={getImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatPrice(item.effective_price)}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.total_price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedCoupon.coupon_code}):</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isCreatingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Quay lại giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
