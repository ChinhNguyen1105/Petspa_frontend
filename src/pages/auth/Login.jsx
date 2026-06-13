import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

import { Button } from "../../components/common/Button";
import {Input} from "../../components/common/Input";
import { useAuthStore } from "../../store/authStore";

// ✅ SỬA TẠI ĐÂY: Import toàn bộ object chứa các hàm validate
import authValidator from "../../utils/authValidator";
// ✅ SỬA TẠI ĐÂY: Trích xuất hàm cụ thể ra khỏi object để gọi trực tiếp ở dưới
const { validateLoginForm } = authValidator;

const Login = () => {
  const navigate = useNavigate();

  // Giải pháp an toàn gánh mọi cấu trúc Store: Tự động bắt cả loginAction, login hoặc actions.loginAction
  const loginAction = useAuthStore((state) => state.loginAction || state.login || state.actions?.loginAction);
  const loading = useAuthStore((state) => state.loading);
  const authError = useAuthStore((state) => state.error);

  // UI State nội bộ của form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Cập nhật state khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError("");
  };

  // Thực hiện xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sử dụng bộ kiểm tra dữ liệu sau khi đã bóc tách ra từ object thành công
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    // Kiểm tra dự phòng nếu store vẫn không tìm thấy hàm đăng nhập phù hợp
    if (typeof loginAction !== "function") {
      setValidationError("Hệ thống xác thực chưa sẵn sàng. Vui lòng kiểm tra lại cấu trúc authStore.");
      return;
    }

    // Gọi store thực hiện gửi dữ liệu đăng nhập tới API
    const result = await loginAction({
      email: formData.email.trim(),
      password: formData.password,
    });
console.log("LOGIN RESULT:", result);
console.log("FINAL ROLE:", result.role);
    if (result?.success) {
      console.log("FINAL ROLE:", result.role);

      // Điều hướng dựa theo vai trò (Role) trả về từ Store
      if (["ROLE_ADMIN", "ROLE_STAFF"].includes(result.role)) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      {/* LEFT FORM CONTENT */}
      <div className="lg:col-span-5 flex flex-col justify-center px-8 sm:px-16 lg:px-12 xl:px-16 bg-white z-10 relative shadow-xl">
        <div className="max-w-md w-full mx-auto">
          {/* Header Title */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
              Mừng Bạn Trở Lại
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Đăng nhập để quản lý lịch hẹn và mua sắm.
            </p>
          </div>

          {/* ERROR ALERT REGION */}
          {(validationError || authError) && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl text-xs font-semibold mb-6 animate-shake">
              {validationError || authError}
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL INPUT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full bg-slate-50 border-slate-200 rounded-xl py-3 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Mật khẩu
                </label>
                <Link to="/forgot-password" className="text-xs font-bold text-pet-blue">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 w-full bg-slate-50 border-slate-200 rounded-xl py-3 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER LOGIN */}
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 accent-pet-blue rounded" />
              <label className="ml-2 text-xs text-slate-500 font-bold">
                Duy trì đăng nhập
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pet-blue text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          {/* FOOTER LINK */}
          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-pet-orange font-bold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE VISUAL SCREEN */}
      <div className="hidden lg:col-span-7 lg:flex relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          alt="Pet Spa Visual background"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-pet-blue/90 via-slate-900/80" />
        <div className="relative z-10 text-white max-w-md">
          <h3 className="text-4xl font-black uppercase">
            Nơi Boss tận hưởng <br />
            <span className="text-pet-orange">Spa đẳng cấp</span>
          </h3>
          <p className="text-sm mt-4 text-slate-200">
            Hệ sinh thái chăm sóc thú cưng toàn diện.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;