import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { loginUser } from "../features/authSlice";
import InputField from "../components/InputField";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await axios.post("http://localhost:3000/api/auth/login", form);

            if (res.data.success) {
                dispatch(loginUser(res.data));
                localStorage.setItem("token", res.data.data.token);
                navigate("/main");
            } else {
                setError(res.data.message || "Đăng nhập thất bại");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi server");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-green-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-md w-96"
            >
                <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Login</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}

                <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
                <InputField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                    {loading ? "Loading..." : "Login"}
                </button>

                <div className="flex justify-between mt-3">
                    <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm text-green-600 hover:underline"
                    >
                        Quên mật khẩu?
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-sm text-green-600 hover:underline"
                    >
                        Bạn chưa có mật khẩu? Đăng ký
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Login;
