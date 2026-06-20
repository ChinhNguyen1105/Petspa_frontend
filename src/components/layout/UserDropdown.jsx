import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";

const UserDropdown = () => {
  const navigate = useNavigate();

  // 1. Lấy trạng thái đăng xuất và thông tin user cơ bản khi đăng nhập thành công từ AuthStore
  const logout = useAuthStore((state) => state.logout);
  const authUser = useAuthStore((state) => state.user);

  // 2. Lấy thông tin chi tiết (avatarUrl, name...) được nạp ngầm từ UserStore
  const { currentUser, fetchProfile } = useUserStore();

  // ✅ SỬA LOGIC: Khi có authUser (đã đăng nhập), gọi ngay fetchProfile() để nạp dữ liệu vào currentUser
  useEffect(() => {
    if (authUser) {
      fetchProfile();
    }
  }, [authUser, fetchProfile]); // Dependency là authUser chứ không phải currentUser

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 3. Khớp chuẩn thuộc tính từ API thực tế (name, avatarUrl, email)
  const displayAvatar =
    currentUser?.avatarUrl ||
    authUser?.avatarUrl ||
    authUser?.avatar ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

  const displayFullName =
    currentUser?.name || authUser?.name || authUser?.full_name || "User";

  const displayEmail =
    currentUser?.email || authUser?.email || "user@petspa.com";

  return (
    <div className="relative group py-2">
      {/* Avatar Trigger */}
      <button className="flex items-center gap-2 outline-none cursor-pointer">
        <div className="w-10 h-10 rounded-full border-2 border-pet-pink overflow-hidden group-hover:border-pet-blue transition-all">
          <img
            src={displayAvatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <div
        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 
        opacity-0 invisible translate-y-2 
        group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 
        transition-all duration-300 z-[60]"
      >
        {/* USER INFO */}
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-sm font-bold text-gray-800">
            Xin chào, {displayFullName} 👋
          </p>
          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
        </div>

        {/* MENU ITEMS */}
        <div className="p-2">
          <DropdownItem
            to="/profile"
            icon={<User size={18} />}
            label="Hồ sơ của tôi"
          />

          <DropdownItem
            to="/settings"
            icon={<Settings size={18} />}
            label="Cài đặt"
          />
        </div>

        {/* LOGOUT */}
        <div className="border-t border-gray-50 p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component hiển thị liên kết danh mục menu
const DropdownItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-pet-blue rounded-xl transition-colors"
  >
    {icon}
    {label}
  </Link>
);

export default UserDropdown;
