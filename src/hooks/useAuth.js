import { useState, useEffect } from "react";
import authService from "../services/AuthService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("petspa_user");
    const storedToken = localStorage.getItem("petspa_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });

      const user = res.data.user;
      const token = res.data.access_token;

      setUser(user);
      setToken(token);

      localStorage.setItem("petspa_user", JSON.stringify(user));
      localStorage.setItem("petspa_token", token);

      return user;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Đăng nhập thất bại";

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("petspa_user");
    localStorage.removeItem("petspa_token");
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token,
  };
};