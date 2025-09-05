import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Image } from '@imagekit/react';
const Main = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const [homeData, setHomeData] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // thêm state tìm kiếm

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

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const filterProducts = (products) => {
        if (!searchQuery) return products; // nếu không tìm kiếm thì trả về tất cả
        return products.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderProducts = (products) =>
        filterProducts(products)?.map((p) => (
            <div key={p.id} className="border p-2 rounded hover:shadow-lg">
                <Link to={`/product/${p.id}`}>
                    <Image
                        urlEndpoint="https://ik.imagekit.io/l8lrjeercs/"
                        src="https://ik.imagekit.io/l8lrjeercs/samsung-galaxy-s24-fe-thumb-600x600.jpg?updatedAt=1757089080197"
                        width={500}
                        height={500}
                        alt="Picture of the author"
                    />
                    <h3 className="mt-2 text-sm font-semibold">{p.name}</h3>
                </Link>
                <p className="text-red-500 font-bold">
                    {p.sale_price ? `$${p.sale_price}` : `$${p.price}`}
                </p>
            </div>
        ));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow">
                <h1
                    className="text-xl font-bold cursor-pointer"
                    onClick={() => navigate("/main")}
                >
                    🛒 MyShop
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
                </div>

                {!homeData ? (
                    <p>Loading sản phẩm...</p>
                ) : (
                    <>
                        <section className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">08 Sản phẩm mới nhất</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {renderProducts(homeData.latest_products)}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">06 Sản phẩm bán chạy nhất</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {renderProducts(homeData.best_selling_products)}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">08 Sản phẩm được xem nhiều nhất</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {renderProducts(homeData.most_viewed_products)}
                            </div>
                        </section>

                        <section className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">04 Sản phẩm khuyến mãi cao nhất</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {homeData?.highest_discount_products?.length > 0 ? (
                                    homeData.highest_discount_products.slice(0, 4).map(product => (
                                        <div key={product.id} className="product-card">
                                            <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
                                            <p className="font-semibold mt-2">{product.name}</p>
                                            <p className="text-red-500">{product.price}₫</p>
                                            <p className="text-green-600">{product.discount}% OFF</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Không có sản phẩm khuyến mãi</p>
                                )}
                            </div>
                        </section>


                    </>
                )}
            </div>
        </div>
    );
};

export default Main;
