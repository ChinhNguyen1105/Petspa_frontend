// src/components/layout/AdminLayout.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Kiểm tra quyền: Nếu chưa đăng nhập hoặc không phải admin thì đá về trang login
    // (Giả sử bạn có trường role trong object user

console.log(user);
console.log(user?.role);
console.log(user?.role?.name);
  return (
    <div className="min-h-screen bg-gray-50 flex .no-scrollbar">
      {/* Sidebar cố định bên trái (Rộng 64 = 16rem = 256px) */}
      <Sidebar />

      {/* Khối nội dung bên phải: dịch sang phải một khoảng bằng độ rộng của Sidebar */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        
        {/* Bạn có thể thêm một AdminHeader nhỏ ở đây nếu muốn */}
        
        {/* Nội dung các trang admin (Dashboard, ProductManagement...) sẽ render tại đây */}
        <main className="flex-1 p-0">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;