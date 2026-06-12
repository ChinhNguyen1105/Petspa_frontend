import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ToastContainer from "./components/ui/ToastContainer";

// Pages - Shop
import HomePage from "./pages/home/HomePage";
import ProductList from "./pages/shop/ProductList";
import ProductDetail from "./pages/shop/ProductDetail";
import Cart from "./pages/shop/Cart";
import Checkout from "./pages/shop/Checkout";

// Pages - Spa
import ServiceList from "./pages/spa/ServiceList";
import ServiceDetail from "./pages/spa/ServiceDetail";
import BookingList from "./pages/spa/BookingList";
import BookingDetail from "./pages/spa/BookingDetail";
import BookingCreate from "./pages/spa/BookingCreate";

// Pages - Profile & Pet
import Profile from "./pages/profile/Profile";
import PetEdit from "./pages/pet/PetEdit";
import PetDetail from "./pages/pet/PetDetail";
import PetCreate from "./pages/pet/PetCreate";

// Pages - Review
import CreateOrderReview from "./pages/review/CreateProductReview";
import CreateBookingReview from "./pages/review/CreateBookingReview";

import OrderDetail from "./pages/order/OrderDetail";
import OrderList from "./pages/order/OrderList";
import AboutUs from "./pages/about/AboutUs";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import { useAuthStore } from "./store/authStore";
import "./styles/animations.css";

import Dashboard from "./pages/admin/dashboard/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminRoute from "./routes/AdminRoute";
import ProductManagement from "./pages/admin/products/ProductManagement";
import CategoryManagement from "./pages/admin/categories/CategoryManagement";
import ServiceManagement from "./pages/admin/services/ServiceManagement";
import BookingManagement from "./pages/admin/bookings/BookingManagement";
import OrderManagement from "./pages/admin/orders/OrderManagement";
import UserManagement from "./pages/admin/users/UserManagement";
import RevenueReport from "./pages/admin/reports/RevenueReport";
import RoleManagement from "./pages/admin/roles/roleManagement";
import InventoryListManagement from "./pages/admin/inventory/inventoryListManagement";
import InventoryTransManagement from "./pages/admin/inventory/inventoryTransManagement";

// ----------------------------------------------------------------------
// ROUTE GUARDS
// ----------------------------------------------------------------------
const AnonymousRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const ProtectedRoute = ({ children, allowRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  // 1. Nếu chưa đăng nhập -> Đá về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra cấu trúc role (Dạng Object { name: "ADMIN" } từ mock data)
  const userRole =
    user?.role?.name || (typeof user?.role === "string" ? user.role : "");

  // 3. Nếu có yêu cầu quyền truy cập cụ thể (allowRoles) nhưng user không đủ quyền
  if (allowRoles && !allowRoles.includes(userRole)) {
    // Nếu là admin đi lạc hoặc user thường cố vào admin -> Đẩy về trang tương ứng
    return (
      <Navigate to={userRole === "ADMIN" ? "/admin/dashboard" : "/"} replace />
    );
  }

  // 4. Hợp lệ thì cho phép hiển thị nội dung trang con
  return children;
};

// ----------------------------------------------------------------------
// APP COMPONENT
// ----------------------------------------------------------------------
function App() {
  const sync = useAuthStore((state) => state.sync);

  useEffect(() => {
    if (typeof sync === "function") {
      sync();
    }
  }, [sync]);

  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <ToastContainer />

      <main className="flex-grow pt-20">
        <Routes>
          {/* ========================================================= */}
          {/* PUBLIC ROUTES */}
          {/* ========================================================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/spa" element={<ServiceList />} />
          <Route path="/spa/service/:id" element={<ServiceDetail />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/shop/product/:id" element={<ProductDetail />} />
          <Route path="/shop/cart" element={<Cart />} />

          {/* AUTH ROUTES */}
          <Route
            path="/login"
            element={
              <AnonymousRoute>
                <Login />
              </AnonymousRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AnonymousRoute>
                <Register />
              </AnonymousRoute>
            }
          />

          {/* ========================================================= */}
          {/* PROTECTED ROUTES (CUSTOMER) */}
          {/* ========================================================= */}
          <Route
            path="/shop/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/spa/booking/create" element={<BookingCreate />} />
          <Route
            path="/booking/create/:id"
            element={
              <ProtectedRoute>
                <BookingCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spa/bookings"
            element={
              <ProtectedRoute>
                <BookingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spa/booking/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />

          {/* PROFILE & PETS */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/pets/detail/:id"
            element={
              <ProtectedRoute>
                <PetDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/pets/edit/:id"
            element={
              <ProtectedRoute>
                <PetEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/pets/create"
            element={
              <ProtectedRoute>
                <PetCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="review/create/product/:orderId"
            element={
              <ProtectedRoute>
                <CreateOrderReview />
              </ProtectedRoute>
            }
          />

          <Route
            path="review/create/booking/:bookingId"
            element={
              <ProtectedRoute>
                <CreateBookingReview />
              </ProtectedRoute>
            }
          />
          {/* ========================================================= */}
          {/* ADMIN ROUTES (Nested Routes) */}
          {/* ========================================================= */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="/admin/products/list"
              element={<ProductManagement />}
            />
            <Route
              path="/admin/categories"
              element={<CategoryManagement />}
            />
            <Route
              path="/admin/services/list"
              element={<ServiceManagement />}
            />
            <Route path="/admin/bookings" element={<BookingManagement />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/reports" element={<RevenueReport />} />

            <Route path="/admin/roles" element={<RoleManagement />} />
            <Route path="/admin/inventory/list" element={<InventoryListManagement />} />
            <Route path="/admin/inventory/transaction" element={<InventoryTransManagement />} />
          </Route>

          {/* ========================================================= */}
          {/* FALLBACK ROUTE (Luôn đặt ở CUỐI CÙNG của cụm Routes) */}
          {/* ========================================================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
