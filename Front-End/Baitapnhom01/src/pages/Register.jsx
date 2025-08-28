import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Login from "../pages/Login";

const Register = () => {
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:3000/api/auth/register", form);
            const { data } = res;

            if (data.success) {
                localStorage.setItem("email", form.email);
                setMessage("✅ Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP");
                setTimeout(() => navigate("/verify-otp"), 1000);
            } else {
                setMessage(data.message || "❌ Đăng ký thất bại, vui lòng thử lại.");
            }

        } catch (err) {
            console.error("Register error:", err.response?.data || err.message);
            setMessage(err.response?.data?.message || "❌ Đăng ký thất bại, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center mb-6 text-green-700">Register</h2>

                {message && (
                    <p
                        className={`mb-4 text-center ${message.includes("thành công") ? "text-green-600" : "text-red-500"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-green-400"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-green-400"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:ring-green-400"
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring focus:ring-green-400"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                    {loading ? "Đang đăng ký..." : "Register"}
                </button>

                <div className="flex justify-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm text-green-600 hover:underline"
                    >
                        Đã có tài khoản? Đăng nhập
                    </button>

                </div>
            </form>
        </div>
    );
};

export default Register;
