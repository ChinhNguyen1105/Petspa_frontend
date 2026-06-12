import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  PawPrint,
  CalendarDays
} from 'lucide-react';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { Button } from '../common/Button';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown'; 
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const scrollDirection = useScrollDirection();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ─── ĐỒNG BỘ STORE MỚI ───────────────────────────────────────
  // Lấy trực tiếp tổng số lượng item đã tính toán sẵn từ Store để tối ưu render
  const cartCount = useCartStore((state) => state.totalItem);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      navigate(`/spa?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-transform duration-500 bg-white border-b border-gray-100 shadow-sm ${
      scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
    }`}>
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-pet-blue p-2 rounded-xl group-hover:bg-pet-orange transition-colors shadow-sm">
            <PawPrint className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-pet-blue">
            PET<span className="text-pet-orange">SPA</span>
          </span>
        </Link>

        {/* NAVIGATION (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-600">
          <NavLink to="/shop" label="Cửa hàng" />
          <NavLink to="/spa" label="Dịch vụ chăm sóc" /> 
          <NavLink to="/about" label="Về chúng tôi" />
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 lg:gap-5">
          
          {/* Khối Tìm kiếm */}
          <div className="relative flex items-center group/search py-2">
            <div className="flex items-center bg-gray-50 rounded-full border border-transparent group-hover/search:border-gray-200 group-hover/search:bg-white transition-all duration-300 overflow-hidden">
              <input 
                type="text"
                placeholder="Tìm dịch vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-0 group-hover/search:w-48 lg:group-hover/search:w-64 transition-all duration-300 pl-0 group-hover/search:pl-4 py-1.5 bg-transparent outline-none text-sm text-gray-600"
              />
              <button 
                onClick={() => navigate(`/spa?search=${searchQuery}`)}
                className="p-2 text-gray-500 hover:text-pet-blue transition-colors"
              >
                <Search size={22} />
              </button>
            </div>
          </div>

          {/* COMPONENT THÔNG BÁO */}
          <NotificationDropdown />

          {/* Khối Giỏ hàng */}
          <Link to="/shop/cart" className="p-2 text-gray-500 hover:text-pet-blue transition-colors relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pet-orange text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-8 w-[1px] bg-gray-200 hidden lg:block mx-1"></div>

          {/* 🚀 ĐẶT LỊCH NHANH */}
          <Link to="/spa/booking/create" className="hidden xl:block">
            <Button variant="secondary" className="!bg-pet-orange hover:shadow-lg hover:shadow-pet-orange/20 !px-4 !py-2 text-xs flex items-center gap-2 text-white font-bold transition-all">
              <CalendarDays size={16} /> ĐẶT LỊCH NHANH
            </Button>
          </Link>

          {/* Khối Auth */}
          {!isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/login"><Button variant="outline" className="!px-4 !py-1.5 text-sm">Đăng nhập</Button></Link>
              <Link to="/register"><Button variant="primary" className="!px-4 !py-1.5 text-sm">Đăng ký</Button></Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          )}

          {/* Nút Menu Mobile */}
          <button 
            className="lg:hidden p-2 text-pet-blue"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 shadow-xl">
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700">Cửa hàng</Link>
          <Link to="/spa" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700">Dịch vụ chăm sóc</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700">Về chúng tôi</Link>
          <hr />
          
          {/* ĐẶT LỊCH NHANH CHO MOBILE */}
          <Link to="/spa/booking/create" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2 !bg-pet-orange text-white font-bold mb-2">
              <CalendarDays size={20} /> ĐẶT LỊCH NGAY
            </Button>
          </Link>

          {!isAuthenticated && (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full" variant="outline">Đăng nhập</Button></Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full" variant="primary">Đăng ký</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const NavLink = ({ to, label }) => (
  <Link to={to} className="relative group py-2 hover:text-pet-blue transition-colors font-bold">
    {label}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pet-orange transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

export default Header;