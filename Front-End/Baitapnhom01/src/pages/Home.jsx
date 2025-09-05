import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // lấy user từ localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        navigate("/"); // trở về Home chưa login
    };

    return (
        <div className="p-4">
            <header className="flex justify-between items-center bg-gray-100 p-4 rounded">
                <h1 className="text-xl font-bold">🏠 Trang chủ</h1>

                {user ? (
                    <div className="relative group">
                        {/* Nút hiển thị tên user */}
                        <button className="px-4 py-2 bg-blue-500 text-white rounded">
                            {user.fullName || user.name || "User"}
                        </button>

                        {/* Dropdown menu */}
                        <div className="absolute right-0 hidden group-hover:block bg-white border shadow rounded mt-2 w-48">
                            <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">
                                Profile
                            </Link>
                            <Link to="/orders" className="block px-4 py-2 hover:bg-gray-200">
                                Đơn hàng của tôi
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 bg-gray-500 text-white rounded"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </header>

            <main className="mt-6 text-center">
                <h2 className="text-2xl font-semibold">
                    {user ? `Xin chào, ${user.fullName || user.name}!` : "Chào mừng đến trang web"}
                </h2>

            </main>
        </div>
    );
};

export default Home;
