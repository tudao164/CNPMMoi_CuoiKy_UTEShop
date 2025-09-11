import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getProducts, searchProducts, getHomeData } from "../services/api";
import ProductGrid from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import SearchBox from "../components/SearchBox";
import { useProducts } from "../contexts/ProductsContext";
import { useDebounce } from "../hooks/useDebounce";

const Main = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const { allProducts } = useProducts(); // Get products for fuzzy search

    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [homeData, setHomeData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [productsData, setProductsData] = useState(null);
    const [pagination, setPagination] = useState(null);
    const itemsPerPage = 12;

    // Debounce search query to avoid too many API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // load user
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                navigate("/login");
                return;
            }
            try {
                const res = await axios.get("http://localhost:3000/api/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) setUser(res.data.data.user);
            } catch (err) {
                console.error("Lỗi load user:", err);
                localStorage.removeItem("token");
                navigate("/login");
            }
        };
        fetchUser();
    }, [token, navigate]);

    // load home products lần đầu
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                const data = await getHomeData();
                setHomeData(data.data);
            } catch (err) {
                console.error("Lỗi load sản phẩm:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Fetch products function
    const fetchProducts = useCallback(async (page = 1, query = "", filter = "all") => {
        try {
            setLoading(true);
            let response;

            if (query.trim()) {
                // Search products
                response = await searchProducts(query, page, itemsPerPage);
                console.log('Search response:', response);
                setProductsData(response.data);
                setPagination(response.pagination);
                setHomeData(null); // Clear home data when searching
            } else if (filter === "all") {
                // Get all products with pagination
                response = await getProducts(page, itemsPerPage);
                console.log('All products response:', response);
                setProductsData(response.data);
                setPagination(response.pagination);
                setHomeData(null); // Clear home data when showing all products
            } else {
                // Show home data with specific filter
                const homeResponse = await getHomeData();
                setHomeData(homeResponse.data);
                setProductsData(null);
                setPagination(null);
            }
        } catch (err) {
            console.error("Lỗi load sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    }, [itemsPerPage]);

    // Effect for search and filter changes (reset to page 1)
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, filterType]);

    // Effect for page changes (including when reset to page 1)
    useEffect(() => {
        fetchProducts(currentPage, debouncedSearchQuery, filterType);
    }, [currentPage, debouncedSearchQuery, filterType, fetchProducts]);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const handlePageChange = (page) => {
        console.log('Page change requested:', page, 'current page:', currentPage);
        setCurrentPage(page);
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
    };

    const getDisplayProducts = () => {
        // If we have products data from API (search or all products)
        if (productsData) {
            return productsData;
        }

        // If we have home data and a specific filter
        if (homeData && filterType !== "all") {
            switch (filterType) {
                case "latest":
                    return homeData.latest_products || [];
                case "best_selling":
                    return homeData.best_selling_products || [];
                case "most_viewed":
                    return homeData.most_viewed_products || [];
                case "highest_discount":
                    return homeData.highest_discount_products || [];
                default:
                    return [];
            }
        }

        // Default: show latest products from home data
        return homeData?.latest_products || [];
    };

    const displayProducts = getDisplayProducts();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Enhanced Navbar */}
            <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div
                            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => navigate("/main")}
                        >
                            <div className="bg-white text-green-600 p-2 rounded-xl">
                                <span className="text-2xl">🛒</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">UTE Shop</h1>
                                <p className="text-green-100 text-sm">Mua sắm thông minh</p>
                            </div>
                        </div>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center space-x-3 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg"
                                >
                                    <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">
                                        {user.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="font-medium">{user.full_name}</span>
                                    <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate("/profile")}
                                            className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="mr-3">👤</span>
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => navigate("/orders")}
                                            className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="mr-3">📦</span>
                                            Đơn hàng của tôi
                                        </button>
                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={logout}
                                                className="flex items-center w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                                            >
                                                <span className="mr-3">🚪</span>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-6 py-2 bg-white text-green-600 rounded-xl hover:bg-gray-100 font-semibold transition-all duration-200 shadow-lg"
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section with Search */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Chào mừng đến với UTE Shop
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
                        </p>
                    </div>

                    {/* Enhanced Search and Filter Section */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                        {/* Fuzzy Search Box */}
                        <div className="w-full lg:w-1/2">
                            <SearchBox
                                products={allProducts}
                                onSearch={(query) => {
                                    setSearchQuery(query);
                                    setCurrentPage(1);
                                }}
                                className="w-full"
                            />
                        </div>

                        {/* Filter and Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <select
                                value={filterType}
                                onChange={handleFilterChange}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm min-w-[200px]"
                                disabled={!!searchQuery.trim()}
                            >
                                <option value="all">🏪 Tất cả sản phẩm</option>
                                <option value="latest">✨ Sản phẩm mới nhất</option>
                                <option value="best_selling">🔥 Sản phẩm bán chạy</option>
                                <option value="most_viewed">👁️ Sản phẩm xem nhiều</option>
                                <option value="highest_discount">💰 Khuyến mãi cao</option>
                            </select>

                            <button
                                onClick={() => navigate('/products')}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                                🔍 Xem tất cả
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Results Info */}
                {searchQuery.trim() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-blue-600">🔍</span>
                            <p className="text-blue-800 font-medium">
                                {loading ? (
                                    <span className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span>Đang tìm kiếm...</span>
                                    </span>
                                ) : (
                                    `Kết quả tìm kiếm cho: "${searchQuery}"${pagination ? ` - ${pagination.total} sản phẩm` : ''}`
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filter Info */}
                {!searchQuery.trim() && filterType !== "all" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-green-600">
                                {filterType === 'latest' && '✨'}
                                {filterType === 'best_selling' && '🔥'}
                                {filterType === 'most_viewed' && '👁️'}
                                {filterType === 'highest_discount' && '💰'}
                            </span>
                            <p className="text-green-800 font-medium">
                                Hiển thị: {
                                    filterType === 'latest' && 'Sản phẩm mới nhất' ||
                                    filterType === 'best_selling' && 'Sản phẩm bán chạy' ||
                                    filterType === 'most_viewed' && 'Sản phẩm được xem nhiều' ||
                                    filterType === 'highest_discount' && 'Sản phẩm khuyến mãi cao'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Products Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {searchQuery.trim() ? 'Kết quả tìm kiếm' : 
                             filterType === 'all' ? 'Tất cả sản phẩm' :
                             filterType === 'latest' ? 'Sản phẩm mới nhất' :
                             filterType === 'best_selling' ? 'Sản phẩm bán chạy' :
                             filterType === 'most_viewed' ? 'Sản phẩm được xem nhiều' :
                             filterType === 'highest_discount' ? 'Sản phẩm khuyến mãi cao' :
                             'Sản phẩm nổi bật'}
                        </h3>
                        
                        {!searchQuery.trim() && filterType === "all" && pagination && (
                            <div className="text-sm text-gray-500">
                                Trang {pagination.page} / {pagination.totalPages} 
                                ({pagination.total} sản phẩm)
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    <ProductGrid products={displayProducts} loading={loading} />

                    {/* Pagination */}
                    {pagination && (debouncedSearchQuery.trim() || filterType === "all") && (
                        <div className="mt-8">
                            <Pagination 
                                pagination={pagination} 
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}

                    {/* Simple product count for filtered home data */}
                    {!pagination && homeData && filterType !== "all" && !debouncedSearchQuery.trim() && (
                        <div className="text-center mt-8 py-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-600">
                                <span className="font-semibold text-green-600">{displayProducts.length}</span> sản phẩm
                            </p>
                            <button
                                onClick={() => navigate('/products')}
                                className="mt-2 px-4 py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                Xem thêm sản phẩm khác →
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && displayProducts.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Không tìm thấy sản phẩm nào
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchQuery.trim() 
                                    ? `Không có kết quả cho "${searchQuery}". Hãy thử từ khóa khác.`
                                    : 'Hiện tại không có sản phẩm nào trong danh mục này.'
                                }
                            </p>
                            {searchQuery.trim() && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                >
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Main;
