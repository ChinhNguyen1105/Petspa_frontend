import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Calendar, 
  ShoppingBag, 
  Users, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Import Các Zustand Stores
import { useBookingStore } from '../../../store/bookingStore';
import { useOrderStore } from '../../../store/orderStore';
import { useUserStore } from '../../../store/userStore';

import Loading from '../../../components/common/Loading';
import StatCard from './components/StatCard';
import { formatPrice } from '../../../utils/formatPrice';

import { STATUS_CONFIG } from '../../../constants';

// Tách hàm helper ra ngoài Component để tránh re-create khi render
const getStatusBadge = (status) => {
  const config = STATUS_CONFIG[status] || { 
    className: 'bg-gray-50 text-gray-600 border-gray-200', 
    iconName: null, 
    text: status 
  };

  const IconComponent = LucideIcons[config.iconName];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.className}`}>
      {IconComponent && <IconComponent size={13} />}
      {config.text}
    </span>
  );
};

const Dashboard = () => {
  // ─── LẤY DỮ LIỆU VÀ ACTIONS TỪ ZUSTAND STORES ──────────────────────────────
  const { 
    bookings, 
    loading: bookingLoading, 
    error: bookingError, 
    fetchBookings 
  } = useBookingStore();

  const { 
    orders, 
    loading: orderLoading, 
    fetchOrders 
  } = useOrderStore();

  const { 
    users, 
    loading: userLoading, 
    fetchUsers 
  } = useUserStore();

  // Đồng bộ toàn bộ dữ liệu hệ thống thông qua các Store Actions
  const fetchDashboardData = () => {
    Promise.all([
      fetchOrders(),
      fetchBookings(),
      fetchUsers()
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ─── XỬ LÝ ĐỒNG BỘ TRẠNG THÁI UI ──────────────────────────────────────────

  const isGlobalLoading = bookingLoading || orderLoading || userLoading;
  const systemError = bookingError; 

  // ─── TÍNH DOANH THU ──────────────────────────────────────────────────────────
  // Orders: dùng paymentStatus === 'SUCCESS' và totalAmount (camelCase theo mock mới)
  const orderRevenue = orders?.reduce((sum, order) => {
    return order.paymentStatus === 'SUCCESS' ? sum + (order.totalAmount || 0) : sum;
  }, 0) || 0;

  // Bookings: mock mới không có payment_status riêng → cộng actualPrice của tất cả booking
  // (hoặc lọc theo status nếu có logic nghiệp vụ cụ thể)
  const bookingRevenue = bookings?.reduce((sum, booking) => {
    return sum + (booking.actualPrice || 0);
  }, 0) || 0;

  const stats = {
    revenue: orderRevenue + bookingRevenue,
    bookings: bookings?.length || 0,
    orders: orders?.length || 0,
    users: users?.length || 0
  };

  // Trích xuất danh sách hiển thị gần đây (Top 5 bản ghi mới nhất)
  const recentBookings = bookings?.slice(0, 5) || [];
  const recentOrders = orders?.slice(0, 5) || [];

  // UI khi đang tải dữ liệu
  if (isGlobalLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  // UI khi gặp lỗi từ Store/API
  if (systemError) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4 text-center p-6">
        <div className="p-4 bg-red-50 text-red-500 rounded-full">
          <AlertCircle size={40} />
        </div>
        <p className="text-gray-600 font-medium max-w-md">
          Không thể tải dữ liệu hệ thống. Vui lòng kiểm tra lại kết nối mạng!
        </p>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-pet-blue text-white rounded-xl text-sm font-bold shadow-sm hover:bg-opacity-90 transition-all"
        >
          <RefreshCw size={16} /> Tải lại dữ liệu
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-black text-pet-blue tracking-tight">TỔNG QUAN HỆ THỐNG</h1>
        <p className="text-sm text-gray-500 mt-1">Dữ liệu kinh doanh được quản lý tập trung qua trạng thái Zustand Store.</p>
      </div>

      {/* Grid 4 Thẻ chỉ số chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatPrice(stats.revenue)}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
        />

        <StatCard
          title="Lịch Đặt Chăm Sóc"
          value={stats.bookings}
          icon={Calendar}
          iconBg="bg-blue-50"
          iconColor="text-pet-blue"
        />

        <StatCard
          title="Đơn Hàng Sản Phẩm"
          value={stats.orders}
          icon={ShoppingBag}
          iconBg="bg-orange-50"
          iconColor="text-pet-orange"
        />

        <StatCard
          title="Tổng Thành Viên"
          value={stats.users}
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
      </div>

      {/* Grid 2 bảng dữ liệu chi tiết */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* BẢNG LỊCH SPA GẦN ĐÂY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-pet-blue flex items-center gap-2">
              <span className="w-2 h-5 bg-pet-blue rounded-full"></span> Lịch hẹn dịch vụ gần đây
            </h2>
            <Link to="/admin/services" className="text-xs font-bold text-pet-orange hover:underline">
              Xem tất cả
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                  <th className="p-3 rounded-l-lg">Khách hàng</th>
                  <th className="p-3">Thú cưng</th>
                  <th className="p-3">Tổng chi phí</th>
                  <th className="p-3 rounded-r-lg text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                      Chưa có lịch đặt dịch vụ nào gần đây.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3">
                        {/* SỬA: customer?.full_name → userName */}
                        <div className="font-semibold text-gray-800">{booking.userName}</div>
                        {/* SỬA: booking_date → bookingDate, start_time → startTime */}
                        <div className="text-xs text-gray-400">{booking.bookingDate} | {booking.startTime}</div>
                      </td>
                      <td className="p-3">
                        {/* SỬA: pet?.name → petName; breed/species không có trong mock mới → bỏ */}
                        <div className="text-sm font-medium text-gray-700">{booking.petName}</div>
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        {/* SỬA: total_amount → actualPrice */}
                        {formatPrice(booking.actualPrice)}
                      </td>
                      <td className="p-3 text-center">{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BẢNG ĐƠN HÀNG SHOP GẦN ĐÂY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-pet-blue flex items-center gap-2">
              <span className="w-2 h-5 bg-pet-orange rounded-full"></span> Đơn hàng mua sắm gần đây
            </h2>
            <Link to="/admin/orders" className="text-xs font-bold text-pet-blue hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                  {/* SỬA: Đổi header "Mã đơn" → "ID đơn" vì mock mới không có order_code */}
                  <th className="p-3 rounded-l-lg">ID đơn</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Giá trị đơn</th>
                  <th className="p-3 rounded-r-lg text-center">Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400 font-medium">
                      Chưa có đơn mua sản phẩm nào gần đây.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3">
                        {/* SỬA: order_code → id (mock mới không có order_code) */}
                        <span className="font-mono text-xs font-bold text-pet-blue bg-blue-50/50 px-2 py-1 rounded">
                          #{order.id}
                        </span>
                      </td>
                      <td className="p-3">
                        {/* SỬA: customer?.full_name → userName */}
                        <div className="font-medium text-gray-800">{order.shippingName}</div>
                      </td>
                      <td className="p-3 font-black text-gray-900">
                        {/* SỬA: total_amount → totalAmount */}
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="p-3 text-center">
                        {/* SỬA: payment_status → paymentStatus */}
                        {getStatusBadge(order.paymentStatus)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;