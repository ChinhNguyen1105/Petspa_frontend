// routes/RoleRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole =
    user?.role?.roleName ||
    user?.role?.name ||
    (typeof user?.role === "string" ? user.role : "");

  // Không thuộc role được phép
  if (!allowedRoles.includes(userRole)) {
    if (userRole === "ROLE_ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (userRole === "ROLE_STAFF") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
