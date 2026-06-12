import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, CheckCircle, ShoppingBag, Megaphone } from 'lucide-react';
import NotificationService from '../../services/NotificationService';
import { useAuthStore } from '../../store/authStore';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Gọi API lấy danh sách thông báo
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await NotificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Xử lý khi click vào từng thông báo
  const handleNotificationClick = async (noti) => {
    if (!noti.is_read) {
      try {
        await NotificationService.markAsRead(noti.id);
        setNotifications(prev => 
          prev.map(item => item.id === noti.id ? { ...item, is_read: true } : item)
        );
      } catch (error) {
        console.error(error);
      }
    }

    // Điều hướng theo type
    if (noti.type === 'BOOKING') navigate('/profile?tab=booking');
    if (noti.type === 'ORDER') navigate('/profile?tab=orders');
  };

  // Đánh dấu đọc tất cả nhanh
  const handleMarkAllRead = async (e) => {
    e.preventDefault();
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(item => ({ ...item, is_read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm render icon động theo từng danh mục
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'ORDER':
        return <ShoppingBag size={16} className="text-blue-500" />;
      case 'PROMOTION':
        return <Megaphone size={16} className="text-amber-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // Nếu chưa đăng nhập thì không hiển thị chuông thông báo (hoặc ẩn dropdown tùy bạn phối UI)
  if (!isAuthenticated) return null;

  return (
    <div className="relative group/notify py-2">
      {/* Nút Chuông */}
      <button className="p-2 text-gray-500 group-hover/notify:text-pet-blue transition-colors relative">
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pet-orange rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Khối Dropdown ẩn/hiển thị khi Hover */}
      <div className="absolute right-0 top-full w-80 bg-white rounded-2xl border border-gray-100 shadow-xl opacity-0 pointer-events-none group-hover/notify:opacity-100 group-hover/notify:pointer-events-auto transition-all duration-300 origin-top-right transform scale-95 group-hover/notify:scale-100 z-50 overflow-hidden">
        
        {/* Header của Dropdown */}
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <span className="font-bold text-gray-800 text-sm">Thông báo gần đây</span>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="text-[11px] text-pet-blue hover:text-pet-orange font-bold transition-colors"
            >
              Đọc tất cả ({unreadCount})
            </button>
          )}
        </div>

        {/* Danh sách thông báo */}
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
          {loading ? (
            <div className="py-6 text-center text-xs text-gray-400">Đang tải thông báo...</div>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleNotificationClick(item)}
                className={`p-4 flex gap-3 hover:bg-gray-50/80 transition-colors cursor-pointer relative ${!item.is_read ? 'bg-blue-50/10' : ''}`}
              >
                {!item.is_read && (
                  <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                )}
                
                <div className="mt-0.5 p-2 bg-white rounded-xl border border-gray-100 shadow-sm h-fit flex items-center justify-center">
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs text-gray-800 truncate mb-0.5 ${!item.is_read ? 'font-bold' : 'font-medium'}`}>
                    {item.title}
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-1">
                    {item.content}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(item.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs font-medium">
              Không có thông báo nào
            </div>
          )}
        </div>

        {/* Xem tất cả */}
        <Link 
          to="/profile?tab=notifications" 
          className="block py-3 text-center text-xs font-bold text-pet-blue hover:text-pet-orange border-t border-gray-50 bg-gray-50/30 transition-colors"
        >
          Xem tất cả thông báo
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;