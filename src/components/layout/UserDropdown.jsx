import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const UserDropdown = () => {
  const navigate = useNavigate();

  // ✅ lấy state từ Zustand (nguồn duy nhất)
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative group py-2">

      {/* Avatar Trigger */}
      <button className="flex items-center gap-2 outline-none">

        <div className="w-10 h-10 rounded-full border-2 border-pet-pink overflow-hidden group-hover:border-pet-blue transition-all">

          <img
            src={
              user?.avatar ||
              "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            }
            alt="User"
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
            Xin chào, {user?.full_name || "User"} 👋
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email || "user@petspa.com"}
          </p>
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
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

      </div>
    </div>
  );
};

// Sub-component giữ nguyên UI
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