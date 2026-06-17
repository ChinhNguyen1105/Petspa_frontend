import axios from "axios";

// ─────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Tự động gắn JWT vào header
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("petspa_token");

    console.log(
      "JWT TOKEN:",
      token
    );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Xử lý lỗi tập trung
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      console.error(
        "Token hết hạn hoặc không hợp lệ"
      );

      localStorage.removeItem(
        "petspa_token"
      );

      localStorage.removeItem(
        "petspa_user"
      );

      // Nếu muốn tự động về login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;