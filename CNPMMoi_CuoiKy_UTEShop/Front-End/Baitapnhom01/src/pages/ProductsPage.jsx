import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts, searchProducts } from "../services/api";
import ProductGrid from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import SearchBox from "../components/SearchBox";
import { useProducts } from "../contexts/ProductsContext";
import { useDebounce } from "../hooks/useDebounce";

const ProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { allProducts } = useProducts(); // Get products for fuzzy search
    
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Get initial values from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
    const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');
    const [onSale, setOnSale] = useState(searchParams.get('on_sale') === 'true');

    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const debouncedMinPrice = useDebounce(minPrice, 800);
    const debouncedMaxPrice = useDebounce(maxPrice, 800);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
        if (currentPage > 1) params.set('page', currentPage.toString());
        if (sortBy) params.set('sort', sortBy);
        if (debouncedMinPrice) params.set('min_price', debouncedMinPrice);
        if (debouncedMaxPrice) params.set('max_price', debouncedMaxPrice);
        if (inStock) params.set('in_stock', 'true');
        if (onSale) params.set('on_sale', 'true');

        setSearchParams(params);
    }, [debouncedSearchQuery, currentPage, sortBy, debouncedMinPrice, debouncedMaxPrice, inStock, onSale, setSearchParams]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                const filters = {};
                if (sortBy) filters.sort_by = sortBy;
                if (debouncedMinPrice) filters.min_price = debouncedMinPrice;
                if (debouncedMaxPrice) filters.max_price = debouncedMaxPrice;
                if (inStock) filters.in_stock = 'true';
                if (onSale) filters.on_sale = 'true';

                let response;
                if (debouncedSearchQuery.trim()) {
                    response = await searchProducts(debouncedSearchQuery, currentPage, 12);
                } else {
                    response = await getProducts(currentPage, 12, filters);
                }

                setProducts(response.data);
                setPagination(response.pagination);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
                setPagination(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [debouncedSearchQuery, currentPage, sortBy, debouncedMinPrice, debouncedMaxPrice, inStock, onSale]);

    // Reset page when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [debouncedSearchQuery, sortBy, debouncedMinPrice, debouncedMaxPrice, inStock, onSale]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSortBy('');
        setMinPrice('');
        setMaxPrice('');
        setInStock(false);
        setOnSale(false);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Tất cả sản phẩm</h1>
                        <button
                            onClick={() => navigate('/main')}
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            ← Trở về trang chủ
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Bộ lọc</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-red-600 hover:text-red-700"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>

                            {/* Search with Fuzzy Search */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tìm kiếm (Fuzzy Search)
                                </label>
                                <SearchBox
                                    products={allProducts}
                                    onSearch={(query) => setSearchQuery(query)}
                                    className="w-full"
                                />
                            </div>

                            {/* Sort */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sắp xếp theo
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Mặc định</option>
                                    <option value="price_asc">Giá tăng dần</option>
                                    <option value="price_desc">Giá giảm dần</option>
                                    <option value="name">Tên A-Z</option>
                                    <option value="popularity">Phổ biến</option>
                                    <option value="best_selling">Bán chạy</option>
                                    <option value="newest">Mới nhất</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Khoảng giá ($)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="Từ"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="Đến"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={inStock}
                                        onChange={(e) => setInStock(e.target.checked)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Chỉ sản phẩm còn hàng</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={onSale}
                                        onChange={(e) => setOnSale(e.target.checked)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Đang khuyến mãi</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                {loading ? (
                                    <p className="text-gray-600">Đang tải...</p>
                                ) : (
                                    <p className="text-gray-600">
                                        {pagination ? `${pagination.total} sản phẩm` : '0 sản phẩm'}
                                        {debouncedSearchQuery && ` cho "${debouncedSearchQuery}"`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Products */}
                        <ProductGrid products={products} loading={loading} />

                        {/* Pagination */}
                        {pagination && (
                            <Pagination 
                                pagination={pagination} 
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
