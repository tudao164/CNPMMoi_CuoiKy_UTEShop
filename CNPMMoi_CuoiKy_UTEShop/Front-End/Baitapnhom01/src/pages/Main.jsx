import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getProducts, searchProducts, getHomeData } from "../services/api";
import ProductGrid from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import { useDebounce } from "../hooks/useDebounce";

const Main = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
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
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow">
                <h1
                    className="text-xl font-bold cursor-pointer"
                    onClick={() => navigate("/main")}
                >
                    🛒 UTE Shop
                </h1>

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-lg hover:bg-green-800"
                        >
                            <span>{user.full_name}</span>
                            <span>▼</span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                                <button
                                    onClick={() => navigate("/profile")}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => navigate("/orders")}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Đơn hàng của tôi
                                </button>
                                <button
                                    onClick={logout}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => navigate("/login")}
                            className="px-4 py-1 bg-white text-green-600 rounded-lg hover:bg-gray-200"
                        >
                            Login
                        </button>
                    </div>
                )}
            </nav>

            {/* Nội dung trang */}
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-center mb-6 gap-4">
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full md:w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Lọc sản phẩm */}
                    <select
                        value={filterType}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!!searchQuery.trim()} // Disable filter when searching
                    >
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="latest">Sản phẩm mới nhất</option>
                        <option value="best_selling">Sản phẩm bán chạy</option>
                        <option value="most_viewed">Sản phẩm xem nhiều</option>
                        <option value="highest_discount">Sản phẩm khuyến mãi cao</option>
                    </select>

                    {/* Link to full products page */}
                    <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Xem tất cả
                    </button>
                </div>

                {/* Search result info */}
                {searchQuery.trim() && (
                    <div className="mb-4 text-center">
                        <p className="text-gray-600">
                            {loading ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm cho: "${searchQuery}"`}
                            {pagination && ` - ${pagination.total} sản phẩm`}
                        </p>
                    </div>
                )}

                {/* Products Grid */}
                <ProductGrid products={displayProducts} loading={loading} />

                {/* Pagination - only show for search results or "all" filter */}
                {pagination && (debouncedSearchQuery.trim() || filterType === "all") && (
                    <Pagination 
                        pagination={pagination} 
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Show simple grid for home data filters without pagination */}
                {!pagination && homeData && filterType !== "all" && !debouncedSearchQuery.trim() && (
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            Hiển thị {displayProducts.length} sản phẩm
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Main;
