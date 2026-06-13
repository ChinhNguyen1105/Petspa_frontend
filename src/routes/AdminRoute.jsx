import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore((state) => state.user);

  const role =
    user?.role?.name ||
    (typeof user?.role === "string"
      ? user.role
      : "");

  console.log("AUTH:", isAuthenticated);
  console.log("USER:", user);
  console.log("ROLE:", role);

  // chưa login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // không có quyền admin
  if (role !== "ROLE_ADMIN" && role !== "ROLE_STAFF") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;