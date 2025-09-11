import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Main = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [homeData, setHomeData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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
        const fetchProducts = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/products/home");
                setHomeData(res.data.data);
            } catch (err) {
                console.error("Lỗi load sản phẩm:", err);
            }
        };
        fetchProducts();
    }, []);

    // gọi API search khi searchQuery thay đổi
    useEffect(() => {
        const fetchSearch = async () => {
            if (!searchQuery.trim()) {
                try {
                    const res = await axios.get("http://localhost:3000/api/products/home");
                    setHomeData(res.data.data);
                } catch (err) {
                    console.error("Lỗi load sản phẩm:", err);
                }
                return;
            }

            try {
                const res = await axios.get(
                    `http://localhost:3000/api/products/search?q=${encodeURIComponent(searchQuery)}`
                );
                setHomeData({ search_products: res.data.data });
            } catch (err) {
                console.error("Lỗi tìm kiếm:", err);
            }
        };

        fetchSearch();
    }, [searchQuery]);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const getFilteredData = () => {
        if (!homeData) return [];

        if (homeData.search_products) {
            return homeData.search_products;
        }

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
                return [
                    ...(homeData.latest_products || []),
                    ...(homeData.best_selling_products || []),
                    ...(homeData.most_viewed_products || []),
                    ...(homeData.highest_discount_products || []),
                ];
        }
    };

    const renderProducts = (products) =>
        products?.map((p) => (
            <div key={p.id} className="border p-2 rounded hover:shadow-lg">
                <Link to={`/product/${p.id}`}>
                    <img
                        src={p.image || "/dt1.jpg"} // nó ở public
                        alt={p.name}
                        className="w-full h-48 object-cover rounded"
                    />
                    <h3 className="mt-2 text-sm font-semibold">{p.name}</h3>
                </Link>
                <p className="text-red-500 font-bold">
                    {p.sale_price ? `$${p.sale_price}` : `$${p.price}`}
                </p>
            </div>
        ));

    // dữ liệu sau filter
    const allFilteredProducts = getFilteredData();

    // phân trang
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentProducts = allFilteredProducts.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(allFilteredProducts.length / itemsPerPage);

    // reset về trang 1 khi đổi filter hoặc search
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, searchQuery]);

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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Lọc sản phẩm */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">Tất cả sản phẩm</option>
                        <option value="latest">Sản phẩm mới nhất</option>
                        <option value="best_selling">Sản phẩm bán chạy</option>
                        <option value="most_viewed">Sản phẩm xem nhiều</option>
                        <option value="highest_discount">Sản phẩm khuyến mãi cao</option>
                    </select>
                </div>

                {!homeData ? (
                    <p>Loading sản phẩm...</p>
                ) : (
                    <>
                        {/* Danh sách sản phẩm */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {renderProducts(currentProducts)}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Prev
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`px-3 py-1 border rounded ${currentPage === index + 1
                                            ? "bg-green-600 text-white"
                                            : "bg-white"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Main;
