import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProductsProvider } from "./contexts/ProductsContext";
import Home from "./pages/Home";             // Trang chủ khi chưa login
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Main from "./pages/Main";             // Trang chủ sau khi login
import Orders from "./pages/Orders";         // Đơn hàng của tôi
import ProductDetail from "./pages/ProductDetail"; // Chi tiết sản phẩm
import ProductsPage from "./pages/ProductsPage"; // Trang tất cả sản phẩm

function App() {
  return (
    <ProductsProvider>
      <BrowserRouter>
        <Routes>
        {/* Trang chủ (guest) */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User */}
        <Route path="/main" element={<Main />} />     {/* Trang chính sau login */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} /> {/* Trang tất cả sản phẩm */}
        <Route path="/product/:id" element={<ProductDetail />} /> {/* Chi tiết sản phẩm */}
      </Routes>
    </BrowserRouter>
  </ProductsProvider>
);
}

export default App;
