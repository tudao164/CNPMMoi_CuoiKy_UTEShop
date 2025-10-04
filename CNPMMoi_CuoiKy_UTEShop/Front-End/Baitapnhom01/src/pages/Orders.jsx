import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getImagePath } from "../utils/getImagePath";
const Order = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("Chưa có token");
                setLoading(false);
                return;
            }

            const res = await axios.get("http://localhost:3000/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const items = res.data.data?.items || [];
            setCartItems(items);
        } catch (err) {
            console.error("Lỗi khi tải giỏ hàng:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (id, type) => {
        const item = cartItems.find((i) => i.id === id);
        if (!item) return;

        const newQuantity =
            type === "increase" ? item.quantity + 1 : Math.max(1, item.quantity - 1);

        try {
            await axios.put(
                `http://localhost:3000/api/cart/${id}`,
                { quantity: newQuantity },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setCartItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i))
            );
        } catch (err) {
            console.error("Lỗi khi cập nhật số lượng:", err.response?.data || err);
        }
    };

    const handleRemoveItem = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/cart/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setCartItems((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Lỗi khi xoá sản phẩm:", err.response?.data || err);
        }
    };

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.price || item.effective_price || 0) * (item.quantity || 1),
        0
    );

    if (loading)
        return (
            <p className="text-center text-lg text-green-700 font-semibold mt-10">
                Đang tải giỏ hàng...
            </p>
        );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-green-600">
                Giỏ hàng của bạn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Danh sách sản phẩm */}
                <div className="md:col-span-2 bg-green-50 p-6 rounded-lg shadow-lg">
                    {cartItems.length === 0 ? (
                        <p className="text-gray-600 text-center py-10">Giỏ hàng trống.</p>
                    ) : (
                        cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between border-b py-4 last:border-b-0"
                            >
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={getImagePath(item.product_image)}
                                        alt={item.product_name || item.product?.name || "Sản phẩm"}
                                        className="w-48 h-48 object-contain rounded-lg border border-green-200 bg-white"
                                    />


                                    <div>
                                        <h3 className="font-semibold text-green-800">
                                            {item.product_name || item.product?.name}
                                        </h3>
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, "decrease")}
                                                className="px-3 py-1 border border-green-300 rounded-l bg-green-100 hover:bg-green-200"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, "increase")}
                                                className="px-3 py-1 border border-green-300 rounded-r bg-green-100 hover:bg-green-200"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end space-y-2">
                                    <p className="font-semibold text-green-900">
                                        {(
                                            (item.price || item.effective_price || 0) *
                                            (item.quantity || 1)
                                        ).toLocaleString()}
                                        đ
                                    </p>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-600 hover:text-red-800 text-xl"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Chi tiết đơn hàng */}
                <div className="bg-green-100 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-green-800">Chi tiết đơn hàng</h3>
                    <div className="flex justify-between mb-2 text-green-900">
                        <span>Tổng tiền</span>
                        <span>{totalPrice.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between mb-2 text-green-900">
                        <span>Giảm giá</span>
                        <span>0đ</span>
                    </div>
                    <hr className="my-2 border-green-300" />
                    <div className="flex justify-between font-semibold text-lg text-green-900">
                        <span>Thành tiền</span>
                        <span>{totalPrice.toLocaleString()}đ</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                        Đơn từ 498k được miễn phí vận chuyển nhé!
                    </p>
                    <button
                        onClick={() => navigate("/checkout")}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all"
                    >
                        Đặt hàng →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Order;
