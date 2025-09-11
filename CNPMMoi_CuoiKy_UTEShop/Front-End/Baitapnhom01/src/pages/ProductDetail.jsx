import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/products/${id}`);
                if (res.data.success) {
                    setProduct(res.data.data.product);
                    setRelated(res.data.data.related_products || []);
                }
            } catch (err) {
                console.error("Lỗi:", err);
            }
        };
        fetchProduct();
    }, [id]);

    if (!product) return <p>Đang tải...</p>;

    const increaseQty = () => {
        if (quantity < (product.stock_quantity || 1)) setQuantity((prev) => prev + 1);
    };

    const decreaseQty = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-green-50 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-green-800">
                {product.name}
            </h1>

            {/* Hình ảnh sản phẩm */}
            <img
                src={"/dt1.jpg"}
                alt={product.name}
                className="w-80 h-80 object-cover rounded-lg shadow-md mb-4"
            />

            {/* Thông tin sản phẩm */}
            <div className="space-y-2">
                <p className="text-xl font-semibold text-green-700">
                    Giá gốc: {product.price}₫
                </p>
                {product.is_on_sale && (
                    <p className="text-lg text-red-600">
                        Giá khuyến mãi: {product.sale_price}₫ (-{product.discount_percentage}
                        %)
                    </p>
                )}
                <p
                    className={`text-lg font-medium ${product.is_in_stock ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {product.is_in_stock
                        ? `Còn ${product.stock_quantity} sản phẩm`
                        : "Hết hàng"}
                </p>
                <p className="text-md text-green-700">
                    Danh mục: {product.category_name}
                </p>
                <p className="text-md text-gray-600">
                    Lượt xem: {product.view_count} | Đã bán: {product.sold_count}
                </p>
            </div>

            {/* Tăng giảm số lượng */}
            <div className="flex items-center mt-6 space-x-3">
                <button
                    onClick={decreaseQty}
                    className="px-4 py-2 border border-green-600 rounded text-green-700 hover:bg-green-100"
                >
                    -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                    onClick={increaseQty}
                    className="px-4 py-2 border border-green-600 rounded text-green-700 hover:bg-green-100"
                >
                    +
                </button>
            </div>

            <button
                disabled={!product.is_in_stock}
                className={`mt-6 w-full px-6 py-3 rounded text-white font-semibold 
          ${!product.is_in_stock ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
                Thêm vào giỏ hàng
            </button>

            {/* Sản phẩm liên quan */}
            {related.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-green-800 mb-4">
                        Sản phẩm liên quan
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {related.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 border rounded-lg bg-white shadow hover:shadow-md"
                            >
                                <img
                                    src={"/dt1.jpg"}
                                    alt={item.name}
                                    className="w-full h-40 object-cover rounded"
                                />
                                <h3 className="text-lg font-semibold mt-2">{item.name}</h3>
                                <p className="text-green-700">{item.price}₫</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
