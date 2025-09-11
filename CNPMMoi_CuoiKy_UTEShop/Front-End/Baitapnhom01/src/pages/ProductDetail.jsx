import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ImageWithFallback from "../components/ImageWithFallback";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:3000/api/products/${id}`);
                if (res.data.success) {
                    setProduct(res.data.data.product);
                    setRelated(res.data.data.related_products || []);
                }
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
                    <button
                        onClick={() => navigate('/main')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const increaseQty = () => {
        if (quantity < (product.stock_quantity || 1)) setQuantity((prev) => prev + 1);
    };

    const decreaseQty = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleAddToCart = () => {
        // Logic thêm vào giỏ hàng
        alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`);
    };

    const handleBuyNow = () => {
        // Logic mua ngay
        alert(`Mua ngay ${quantity} sản phẩm "${product.name}"!`);
    };

    // Get all product images including main image
    const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <nav className="flex items-center space-x-2 text-sm">
                        <button
                            onClick={() => navigate('/main')}
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            Trang chủ
                        </button>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{product.category_name}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-800 font-medium truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
                            <ImageWithFallback
                                src={allImages[selectedImage] || product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                        </div>

                        {/* Thumbnail Images */}
                        {allImages.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {allImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImage === index
                                                ? 'border-green-500 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <ImageWithFallback
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Product Title and Category */}
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    {product.category_name}
                                </span>
                                {product.is_featured && (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                        ⭐ Nổi bật
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        {/* Rating and Stats */}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <span>👁</span>
                                <span>{product.view_count.toLocaleString()} lượt xem</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span>🛒</span>
                                <span>{product.sold_count} đã bán</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-3xl font-bold text-red-600">
                                    ${product.effective_price}
                                </span>
                                {product.is_on_sale && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">
                                            ${product.price}
                                        </span>
                                        <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                                            -{Math.round(product.discount_percentage)}%
                                        </span>
                                    </>
                                )}
                            </div>
                            {product.is_on_sale && (
                                <p className="text-green-600 text-sm font-medium">
                                    Tiết kiệm: ${product.savings_amount}
                                </p>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                                product.is_in_stock ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`font-medium ${
                                product.is_in_stock ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {product.is_in_stock
                                    ? `Còn hàng (${product.stock_quantity} sản phẩm)`
                                    : "Hết hàng"}
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
                                <div className="space-y-2">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-700 capitalize">{key}:</span>
                                            <span className="text-gray-600">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="border-t pt-6 space-y-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-gray-700">Số lượng:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={decreaseQty}
                                        disabled={quantity <= 1}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="px-4 py-2 font-semibold border-x border-gray-300">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={increaseQty}
                                        disabled={quantity >= product.stock_quantity}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    ({product.stock_quantity} sản phẩm có sẵn)
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.is_in_stock}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                                        !product.is_in_stock
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {!product.is_in_stock ? 'Hết hàng' : '🛒 Thêm vào giỏ hàng'}
                                </button>
                                
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!product.is_in_stock}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold border-2 transition-all duration-200 ${
                                        !product.is_in_stock
                                            ? 'border-gray-400 text-gray-400 cursor-not-allowed'
                                            : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:shadow-lg transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {!product.is_in_stock ? 'Không thể mua' : '⚡ Mua ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Sản phẩm liên quan</h2>
                            <button
                                onClick={() => navigate(`/products?category=${product.category_id}`)}
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Xem tất cả →
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {related.slice(0, 4).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/product/${item.id}`)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
                                >
                                    <div className="aspect-square">
                                        <ImageWithFallback
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-bold text-red-600">
                                                ${item.effective_price}
                                            </span>
                                            {item.is_on_sale && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ${item.price}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                            <span>👁 {item.view_count}</span>
                                            <span>🛒 {item.sold_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
