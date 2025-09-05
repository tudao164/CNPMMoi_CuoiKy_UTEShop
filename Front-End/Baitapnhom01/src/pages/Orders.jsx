import { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:3000/api/orders", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const orderData = res.data.data?.orders || [];
                setOrders(orderData);
            } catch (err) {
                console.error(err);
                setError("Không thể tải đơn hàng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading)
        return (
            <p className="text-green-700 font-bold text-lg">Đang tải đơn hàng...</p>
        );
    if (error)
        return (
            <p className="text-red-600 font-bold text-lg">{error}</p>
        );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-green-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Đơn hàng của tôi</h2>
            {orders.length === 0 ? (
                <p className="text-green-700">Chưa có đơn hàng nào.</p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.id}
                        className="border-2 border-green-600 rounded-lg p-5 mb-5 bg-white shadow hover:shadow-lg transition-shadow duration-300"
                    >
                        <p className="font-semibold text-green-800 mb-1">
                            Mã đơn: <span className="font-normal text-gray-700">{order.id}</span>
                        </p>
                        <p className="font-semibold text-green-800 mb-1">
                            Tổng tiền: <span className="font-normal text-gray-700">{order.total_amount.toLocaleString()} VNĐ</span>
                        </p>
                        <p className="font-semibold text-green-800 mb-1">
                            Trạng thái: <span className="font-normal text-gray-700">{order.status_text}</span>
                        </p>
                        <p className="font-semibold text-green-800 mb-1">
                            Địa chỉ giao hàng: <span className="font-normal text-gray-700">{order.shipping_address}</span>
                        </p>
                        <p className="font-semibold text-green-800 mb-1">
                            Ghi chú: <span className="font-normal text-gray-700">{order.notes || "Không có"}</span>
                        </p>
                        <p className="font-semibold text-green-800">
                            Số lượng sản phẩm: <span className="font-normal text-gray-700">{order.total_items}</span>
                        </p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Orders;
