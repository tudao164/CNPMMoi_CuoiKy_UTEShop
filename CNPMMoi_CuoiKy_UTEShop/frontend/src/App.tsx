import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/AdminLayout';

// Pages
import HomePage from '@/pages/HomePage';
import ShopHomePage from '@/pages/ShopHomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// User Management Pages
import ProfilePage from '@/pages/user/ProfilePage';
import ChangePasswordPage from '@/pages/user/ChangePasswordPage';
import StatsPage from '@/pages/user/StatsPage';
import DeleteAccountPage from '@/pages/user/DeleteAccountPage';

// Product Pages
import ProductListPage from '@/pages/products/ProductListPage';
import ProductDetailPage from '@/pages/products/ProductDetailPage';
import ProductSearchPage from '@/pages/products/ProductSearchPage';
import CategoryProductsPage from '@/pages/products/CategoryProductsPage';

// Cart Pages
import CartPage from '@/pages/cart/CartPage';

// Checkout Pages
import CheckoutPage from '@/pages/checkout/CheckoutPage';

// Order Pages
import OrderListPage from '@/pages/orders/OrderListPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminProductCreatePage from '@/pages/admin/AdminProductCreatePage';
import AdminProductEditPage from '@/pages/admin/AdminProductEditPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminCancelRequestsPage from '@/pages/admin/AdminCancelRequestsPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.is_admin) {
    return <Navigate to="/shop" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/shop" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Auth Routes - No Layout */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Admin Routes - Admin Layout */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/create" element={<AdminProductCreatePage />} />
                  <Route path="products/edit/:id" element={<AdminProductEditPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="cancel-requests" element={<AdminCancelRequestsPage />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* All other routes with Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />

                {/* Shop Home - Public */}
                <Route path="/shop" element={<ShopHomePage />} />

                {/* Product Routes - Public */}
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/search" element={<ProductSearchPage />} />
                <Route path="/products/category/:categoryId" element={<CategoryProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                {/* Cart Route - Protected */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />

                {/* Checkout Route - Protected */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

                {/* Order Routes - Protected */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* User Management Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePasswordPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/stats"
                  element={
                    <ProtectedRoute>
                      <StatsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delete-account"
                  element={
                    <ProtectedRoute>
                      <DeleteAccountPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
