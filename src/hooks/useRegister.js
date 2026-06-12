import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../services/AuthService";
import { useAuthStore } from "../store/authStore";

/**
 * useRegister hook
 * - handle register API
 * - sync auth state (Zustand)
 * - auto login after register (recommended UX)
 */
export const useRegister = () => {
  const navigate = useNavigate();

  // Zustand auth store
  const loginStore = useAuthStore((state) => state.login);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * REGISTER FUNCTION
   */
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // call API (mock or real)
      const res = await authService.register(formData);

      const user = res.data.user;
      const token = res.data.access_token;

      /**
       * 🔥 IMPORTANT: auto login after register
       * sync Zustand + localStorage
       */
      loginStore(user, token);

      setSuccess(true);

      // redirect after register
      const role = user?.role?.name || user?.role;

      if (role === "ADMIN" || role === "STAFF") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      return res;

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Đăng ký thất bại";

      setError(msg);
      throw new Error(msg);

    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
    success,
  };
};