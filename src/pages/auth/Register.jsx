import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, UserRound } from "lucide-react";

// Components & Global Store
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuthStore } from "../../store/authStore";

// Validators
import { validateRegisterForm } from "../../utils/authValidator";

const Register = () => {
  const navigate = useNavigate();
  
  // 💡 Lấy các trạng thái và hàm từ Zustand Store thông qua Selector chuẩn
  const loading = useAuthStore((state) => state.loading);
  const serverError = useAuthStore((state) => state.error);
  const registerAction = useAuthStore((state) => state.registerAction);
  const loginAction = useAuthStore((state) => state.loginAction);

  // Khởi tạo State lưu trữ Form dữ liệu nhập liệu (Đồng bộ 4 trường)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Quản lý trạng thái giao diện UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Hàm xử lý thay đổi dữ liệu đầu vào
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    if (validationError) setValidationError("");
  };

  // Xử lý gửi Form Đăng ký và Điều Hướng
const handleSubmit = async (e) => {
  e.preventDefault();

  const validation = validateRegisterForm(formData);
  if (!validation.isValid) return;

  const submitData = {
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  };

  // ======================
  // REGISTER
  // ======================
  const registerResult = await registerAction(submitData);
  if (!registerResult?.success) return;

  // ======================
  // LOGIN
  // ======================
  const loginResult = await loginAction({
    email: submitData.email,
    password: submitData.password,
  });

  if (!loginResult?.success) {
    navigate("/login");
    return;
  }

  // ======================
  // CHỈ SET SUCCESS SAU KHI LOGIN OK
  // ======================
  setIsSuccess(true);

  // CHỜ UI RENDER THẬT SỰ
  await new Promise((r) => setTimeout(r, 3000));

  navigate("/", { replace: true });
};

  // MÀN HÌNH CHÚC MỪNG KHI ĐĂNG KÝ THÀNH CÔNG (UX INTERMEDIATE STATE)
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100 space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Đăng Ký Thành Công!</h2>
            <p className="text-slate-500 text-sm font-medium">
              Chào mừng thành viên mới gia nhập mái nhà chung <span className="text-pet-blue font-bold">PetSpa</span>.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-500 animate-pulse">
            Hệ thống đang tự động tối ưu hóa tài khoản và đưa bạn vào hệ thống...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
      
      {/* KHỐI TRÁI: Form Nhập Liệu */}
      <div className="lg:col-span-5 flex flex-col justify-center px-8 sm:px-16 lg:px-12 xl:px-16 bg-white z-10 relative shadow-xl py-12 max-h-screen overflow-y-auto no-scrollbar">
        <div className="max-w-md w-full mx-auto">
          
          {/* Tiêu đề */}
          <div className="mb-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Tạo Tài Khoản</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Trở thành thành viên để nhận ngập tràn ưu đãi dịch vụ chăm sóc Boss.</p>
          </div>

          {/* Thông báo lỗi tập trung hiển thị */}
          {(validationError || serverError) && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-xl text-xs font-semibold mb-5">
              {validationError || serverError}
            </div>
          )}

          {/* Form Đăng ký */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Ô nhập Họ và Tên */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Họ và Tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserRound size={18} />
                </div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full bg-slate-50 border-slate-200 focus:bg-white rounded-xl py-2.5 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Ô nhập Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Địa chỉ Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  name="email"
                  placeholder="bossyeu@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full bg-slate-50 border-slate-200 focus:bg-white rounded-xl py-2.5 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Ô nhập Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 w-full bg-slate-50 border-slate-200 focus:bg-white rounded-xl py-2.5 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Ô nhập lại Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nhập lại mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 w-full bg-slate-50 border-slate-200 focus:bg-white rounded-xl py-2.5 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nút gửi thông tin Đăng ký */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pet-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2 tracking-wide uppercase text-xs"
            >
              {loading ? "Đang khởi tạo tài khoản..." : "Đăng Ký Thành Viên"}
              {!loading && <ArrowRight size={16} />}
            </Button>
          </form>

          {/* Điều hướng về trang Đăng Nhập nếu đã có tài khoản */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Bạn đã có tài khoản từ trước?{" "}
              <Link to="/login" className="text-pet-blue hover:text-blue-600 font-bold transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* KHỐI PHẢI: Hình Ảnh Minh Họa Trang Trí */}
      <div className="hidden lg:col-span-7 lg:flex relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1535268647977-a403b69fc756?q=80&w=1200"
          alt="Dog taking a bath"
          className="absolute inset-0 w-full h-full object-cover opacity-40 transform scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-pet-orange/80 via-slate-900/80 to-transparent"></div>

        <div className="relative z-10 max-w-md text-left text-white space-y-4">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block">
            Đăng ký nhanh chóng - Nhận ngàn đặc quyền 🎁
          </span>
          <h3 className="text-4xl font-black uppercase tracking-tight leading-tight">
            Chăm Sóc Boss Cưng <br />
            Chưa Bao Giờ <span className="text-pet-blue">Dễ Dàng</span> Đến Thế.
          </h3>
          <p className="text-sm opacity-90 leading-relaxed font-medium text-slate-200">
            Tạo tài khoản chỉ trong 1 phút để mở khóa tính năng tự động nhắc lịch tiêm ngừa vắc-xin, lưu trữ lịch trình Spa riêng biệt và tích điểm đổi quà bách hóa cực khủng.
          </p>
        </div>

        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pet-blue/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

    </div>
  );
};

export default Register;