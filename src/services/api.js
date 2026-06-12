import axios from 'axios';

// Khởi tạo cấu hình mặc định cho API
const api = axios.create({
  // Thay thế URL này bằng URL backend thực tế của bạn
  baseURL: 'http://localhost:8080/api/v1', 
  timeout: 10000, // Timeout sau 10 giây nếu server không phản hồi
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Thêm Token vào mỗi request (nếu người dùng đã đăng nhập)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Hoặc lấy từ authStore của bạn
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý lỗi tập trung (ví dụ: lỗi 401 khi token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý đăng xuất hoặc chuyển hướng về trang login tại đây
      console.error("Token hết hạn hoặc không hợp lệ");
      localStorage.removeItem('token');
      // window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;