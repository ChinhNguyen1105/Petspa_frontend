import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react'; 
import { useAuthStore } from '../../store/authStore';
import menuService from '../../services/menuService'; 

// BẢNG MAP ICON ĐỘNG TỪ STRING SANG COMPONENT LUCIDE
const LucideIcon = ({ name, size = 18, className }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <Icons.HelpCircle size={size} className={className} />; 
  return <IconComponent size={size} className={className} />;
};

// COMPONENT PHỤ XỬ LÝ MỤC MENU (HỖ TRỢ ĐA CẤP ĐỒNG BỘ DTO backend)
const SidebarMenuItem = ({ item, currentPath }) => {
  const hasChildren = item.children && item.children.length > 0;
  
  const isAnyChildActive = hasChildren && item.children.some(child => currentPath === child.path);
  const shouldBeActive = currentPath === item.path || isAnyChildActive;

  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  const toggleSubMenu = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="space-y-1">
      <Link
        to={hasChildren ? '#' : item.path}
        onClick={hasChildren ? toggleSubMenu : undefined}
        className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
          shouldBeActive
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-pet-blue'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {shouldBeActive && (
          <span className="absolute left-0 top-1/4 w-1 h-1/2 bg-pet-orange rounded-r-full"></span>
        )}
        
        <div className="flex items-center gap-3">
          <LucideIcon 
            name={item.icon} 
            size={20} 
            className={`transition-colors ${
              shouldBeActive ? 'text-pet-blue' : 'text-gray-400 group-hover:text-gray-600'
            }`} 
          /> 
          
          <span>{item.name}</span>
        </div>

        {hasChildren && (
          <Icons.ChevronDown 
            size={16} 
            className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180 text-pet-blue' : ''}`}
          />
        )}
      </Link>

      {hasChildren && isOpen && (
        <div className="pl-9 pr-2 space-y-1 transition-all duration-300">
          {item.children.map((child) => {
            const isChildActive = currentPath === child.path;

            return (
              <Link
                key={child.path}
                to={child.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isChildActive
                    ? 'text-pet-orange bg-orange-50/50'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LucideIcon name={child.icon} size={14} />
                <span>{child.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

// COMPONENT SIDEBAR CHÍNH
const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // States quản lý dữ liệu menu từ API
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ĐỒNG BỘ STORE: Đảm bảo viết hoa đồng bộ chuỗi vai trò người dùng
  const userRole = user?.role?.name?.toUpperCase() || 'CUSTOMER';

  // CALL API LẤY DỮ LIỆU MENU KHI COMPONENT MOUNT
  useEffect(() => {
    const fetchSidebarMenus = async () => {
      try {
        setLoading(true);
        const response = await menuService.getMenuTree();
        
        console.log("Response gốc từ API:", response);

        // Kiểm tra đa luồng phản hồi: Thử bóc tách response.data, nếu không thấy thì dùng mảng rỗng
        const menus = Array.isArray(response?.data) 
          ? response.data 
          : Array.isArray(response) 
            ? response 
            : [];
            
        setMenuItems(menus);
      } catch (error) {
        console.error("Lỗi khi tải danh sách Menu:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarMenus();
  }, []);

  // ─── HÀM KIỂM TRA PHÂN QUYỀN THỰC TẾ (Nới lỏng điều kiện lỗi) ───────────────────
  const checkRolePermission = (item) => {
    // Trường hợp 1: Nếu API không trả về mảng roles cụ thể -> Cho phép hiển thị mặc định làm cơ sở
    if (!item.roles || item.roles.length === 0) return true;

    // Trường hợp 2: Nếu mảng roles chứa chuỗi string thẳng ['ADMIN', 'STAFF']
    if (typeof item.roles[0] === 'string') {
      return item.roles.map(r => r.toUpperCase()).includes(userRole);
    }

    // Trường hợp 3: Nếu mảng roles chứa danh sách Object từ DB [{ id: 1, name: 'ADMIN' }]
    if (typeof item.roles[0] === 'object') {
      return item.roles.some(roleObj => roleObj?.name?.toUpperCase() === userRole);
    }

    return true; 
  };

  // Lọc danh sách menu an toàn, tránh filter chặt cứng gây mất menu
  const allowedMenuItems = menuItems
    .filter(item => {
      const isActive = item.activeFlag === true || item.activeFlag === undefined || item.activeFlag === 1;
      const isNotDeleted = !item.deleteFlag;
      return isActive && isNotDeleted && checkRolePermission(item);
    })
    .map(item => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.filter(child => {
            const isChildActive = child.activeFlag === true || child.activeFlag === undefined || child.activeFlag === 1;
            const isChildNotDeleted = !child.deleteFlag;
            return isChildActive && isChildNotDeleted && checkRolePermission(child);
          })
        };
      }
      return item;
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm overflow-hidden">
      
      {/* 1. LOGO HEADER */}
      <div className="h-20 px-6 flex items-center border-b border-gray-50 shrink-0 bg-white">
        <Link to="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="bg-pet-blue p-2 rounded-xl group-hover:bg-pet-orange transition-colors shadow-sm">
            <Icons.PawPrint className="text-white" size={22} />
          </div>
          <span className="text-xl font-black tracking-tighter text-pet-blue">
            PET<span className="text-pet-orange">SPA</span>
            <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-red-50 text-red-500 font-bold rounded-md align-middle uppercase">
              {userRole}
            </span>
          </span>
        </Link>
      </div>

      {/* 2. MENU NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar min-h-0 no-scrollbar">
        {loading ? (
          <div className="space-y-3 px-2">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="h-10 bg-gray-100 rounded-xl animate-pulse w-full" />
            ))}
          </div>
        ) : allowedMenuItems.length > 0 ? (
          allowedMenuItems.map((item) => (
            <SidebarMenuItem 
              key={item.id || item.path} 
              item={item} 
              currentPath={location.pathname} 
            />
          ))
        ) : (
          <div className="text-center mt-8 px-4">
            <p className="text-xs text-gray-400 font-bold mb-1">Không tìm thấy menu hợp lệ</p>
            <p className="text-[10px] text-gray-400 italic">Kiểm tra lại thuộc tính activeFlag hoặc mảng roles trên DB.</p>
          </div>
        )}
      </nav>

      {/* 3. PROFILE FOOTER */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/50 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-pet-blue text-white flex items-center justify-center font-black text-sm uppercase shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-800 truncate">
                {user?.name || 'Quản trị viên'}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.email || 'admin@petspa.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            title="Đăng xuất"
          >
            <Icons.LogOut size={18} />
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;