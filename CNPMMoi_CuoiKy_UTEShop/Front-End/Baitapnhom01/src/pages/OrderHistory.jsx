import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const OrderHistory = () => {
    const location = useLocation();
    const [orders, setOrders] = useState(location.state?.newOrder ? [location.state.newOrder] : []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:3000/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Cập nhật danh sách gồm cả orders từ backend + order vừa truyền
                setOrders(res.data.data.orders || location.state?.newOrder ? [location.state.newOrder] : []);
            } catch (err) {
                console.error("Lỗi lấy đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [location.key]); // refetch mỗi khi navigate

    if (loading) {
        return <p className="text-center text-gray-600">Đang tải đơn hàng...</p>;
    }

    if (orders.length === 0) {
        return <p className="text-center text-gray-600">Bạn chưa có đơn hàng nào.</p>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Lịch sử đơn hàng</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-green-100 text-left">
                        <th className="p-3 border">Mã đơn</th>
                        <th className="p-3 border">Ngày đặt</th>
                        <th className="p-3 border">Trạng thái</th>
                        <th className="p-3 border">Tổng tiền</th>
                        <th className="p-3 border text-center">Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-green-50">
                            <td className="p-3 border">#{order.id}</td>
                            <td className="p-3 border">{new Date(order.created_at).toLocaleString("vi-VN")}</td>
                            <td className="p-3 border">
                                <span className={`px-2 py-1 rounded text-sm`} style={{ backgroundColor: order.status_color || "#ddd" }}>
                                    {order.status_text}
                                </span>
                            </td>
                            <td className="p-3 border font-semibold text-red-600">{order.total_amount.toLocaleString("vi-VN")} ₫</td>
                            <td className="p-3 border text-center">
                                <Link to={`/orders/${order.id}`} className="text-green-600 hover:underline">Xem</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderHistory;
