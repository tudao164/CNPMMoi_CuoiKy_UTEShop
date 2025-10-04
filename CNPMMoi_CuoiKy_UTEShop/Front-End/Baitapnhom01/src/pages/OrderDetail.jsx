import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [tracking, setTracking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:3000/api/orders/${id}/tracking`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrder(res.data.data.order);
                setTracking(res.data.data.tracking || []);
            } catch (err) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:3000/api/orders/${id}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Hủy đơn hàng thành công!");
            navigate("/orders"); // quay lại lịch sử đơn hàng
        } catch (err) {
            console.error("Lỗi khi hủy đơn hàng:", err);
            alert("Không thể hủy đơn hàng. Vui lòng thử lại.");
        }
    };

    if (loading) {
        return <p className="text-center text-gray-600">Đang tải chi tiết đơn hàng...</p>;
    }

    if (!order) {
        return <p className="text-center text-gray-600">Không tìm thấy đơn hàng.</p>;
    }

    // kiểm tra quyền hủy đơn
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = (now - createdAt) / 1000 / 60;
    const canCancelDirect =
        order.status === "NEW" && diffMinutes <= 30; // cho phép hủy trực tiếp
    const canRequestCancel = order.status === "PREPARING"; // chỉ cho gửi yêu cầu hủy

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold text-green-700 mb-4">
                Chi tiết đơn hàng #{order.id}
            </h2>

            {/* Thông tin tổng quan */}
            <div className="mb-6">
                <p><strong>Trạng thái:</strong> <span style={{ color: order.status_color }}>{order.status_text}</span></p>
                <p><strong>Ngày đặt:</strong> {createdAt.toLocaleString("vi-VN")}</p>
                <p><strong>Tổng tiền:</strong> {order.total_amount.toLocaleString("vi-VN")} ₫</p>
            </div>

            {/* Nút hủy đơn */}
            {canCancelDirect && (
                <button
                    onClick={handleCancel}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mb-6"
                >
                    Hủy đơn hàng
                </button>
            )}
            {canRequestCancel && (
                <button
                    onClick={handleCancel}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mb-6"
                >
                    Gửi yêu cầu hủy đơn
                </button>
            )}

            {/* Timeline theo dõi */}
            <h3 className="text-xl font-semibold text-green-700 mb-3">Theo dõi đơn hàng</h3>
            <ul className="space-y-4">
                {tracking.map((step) => (
                    <li key={step.id} className="flex items-start space-x-3">
                        <div
                            className="w-3 h-3 rounded-full mt-2"
                            style={{ backgroundColor: step.status_color }}
                        ></div>
                        <div>
                            <p className="font-semibold">
                                {step.status_text}{" "}
                                <span className="text-sm text-gray-500">({step.time_elapsed})</span>
                            </p>
                            <p className="text-gray-600 text-sm">{step.notes}</p>
                            <p className="text-xs text-gray-500">
                                Bởi: {step.actor_name || "Hệ thống"} |{" "}
                                {new Date(step.changed_at).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderDetail;
