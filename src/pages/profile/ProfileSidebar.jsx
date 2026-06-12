import React from 'react';
import { User, Calendar, PawPrint, ShoppingBag, LogOut } from 'lucide-react';

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'info', label: 'Thông tin cá nhân', icon: User },
    { id: 'bookings', label: 'Lịch sử đặt lịch', icon: Calendar },
    { id: 'orders', label: 'Đơn hàng đã mua', icon: ShoppingBag }, 
    { id: 'pets', label: 'Thú cưng của tôi', icon: PawPrint },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-2 text-left">
      {menuItems.map(item => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === item.id 
                ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <IconComponent size={18} />
            {item.label}
          </button>
        );
      })}
      
      <div className="pt-4 mt-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 p-3.5 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors text-sm">
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;