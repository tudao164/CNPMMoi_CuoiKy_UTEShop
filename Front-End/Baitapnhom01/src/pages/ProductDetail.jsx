import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/products/${id}`);
                setProduct(res.data.data || res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProduct();
    }, [id]);

    if (!product) return <p>Loading...</p>;

    const increaseQty = () => {
        if (quantity < (product.stock || 1)) setQuantity(prev => prev + 1);
    };

    const decreaseQty = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-green-50 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-green-800">{product.name || "Tên sản phẩm"}</h1>

            {/* Thông tin sản phẩm */}
            <div className="mt-4 space-y-2">
                <p className="text-xl font-semibold text-green-700">Giá: {product.price || 0}₫</p>
                <p className={`text-lg font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
                </p>
                <p className="text-md text-green-700">Danh mục: {product.category?.name || "Chưa có danh mục"}</p>
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
                disabled={product.stock === 0}
                className={`mt-6 w-full px-6 py-3 rounded text-white font-semibold 
                    ${product.stock === 0 ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            >
                Thêm vào giỏ hàng
            </button>
        </div>
    );
};

export default ProductDetail;
