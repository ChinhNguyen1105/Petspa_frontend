import React, { useState, useEffect } from 'react'; // 1. ĐÃ SỬA: Thêm useEffect
import { useLocation } from 'react-router-dom'; // 2. ĐÃ SỬA: Thêm useLocation từ react-router-dom
import ProfileSidebar from './ProfileSidebar';
import ProfileInfo from './ProfileInfo';
import OrderList from '../order/OrderList'; 
import PetList from '../pet/PetList'; 
import BookingList from '../spa/BookingList';

const Profile = () => {
  const location = useLocation();
  
  // Khởi tạo tab mặc định dựa trên state ẩn được truyền sang, nếu không có thì mở 'info'
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'info'); 

  // Lắng nghe sự thay đổi nếu user đang ở profile mà bấm chuyển hướng (redirect) lại từ trang khác tới
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Hàm điều hướng hiển thị component theo tab đang chọn
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfo />;
      case 'orders':
        return <OrderList />; 
      case 'pets':
        return <PetList />;
      case 'bookings':
        return <BookingList />; 
      default:
        return <ProfileInfo />;
    }
  };

  return (
    // 3. ĐÃ SỬA: Đổi pt-10 thành pt-28 để chống tràn/che khuất bởi Header bar
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        <h1 className="text-3xl font-black text-pet-blue mb-8 uppercase tracking-tight">
          Hồ sơ cá nhân
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* CỘT TRÁI: SIDEBAR MENU CHUYỂN TAB */}
          <div className="md:col-span-1 sticky top-28">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* CỘT PHẢI: KHU VỰC HIỂN THỊ NỘI DUNG LINH HOẠT */}
          <div className="md:col-span-3">
            <div className="w-full transition-all duration-300">
              {renderTabContent()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;