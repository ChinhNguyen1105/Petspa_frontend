import React, { useState, useEffect } from 'react';
import { ShoppingBag, Inbox } from 'lucide-react';
import OrderItem from './OrderItem'; 
import { useOrderStore } from '../../store/orderStore'; 
import { useCartStore } from '../../store/cartStore'; 
import { STATUS_FILTERS } from '../../constants';

// Trường hợp dự án chưa import được STATUS_FILTERS từ file constants, 
// bạn có thể dùng mảng fallback dưới đây, nếu đã có sẵn thì giữ nguyên.
const TABS = STATUS_FILTERS;

const OrderList = ({ userId = 1 }) => {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // ĐỒNG BỘ STORE: Sử dụng fetchOrdersByUser dành cho Client thay vì fetchOrders của Admin
  const { orders, loading, fetchOrdersByUser, cancelOrder } = useOrderStore();
  // ĐỒNG BỘ ACTIONS: Tên chính xác trong useCartStore là showToast
  const { showToast } = useCartStore();

  // Gọi API giả lập lấy danh sách đơn hàng của User khi component mount
  useEffect(() => {
    fetchOrdersByUser(userId);
  }, [fetchOrdersByUser, userId]);

  // Bộ lọc dữ liệu theo các Tab trạng thái tương ứng
  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(
        orders.filter(order => (order.status || '').toUpperCase() === activeTab)
      );
    }
  }, [activeTab, orders]);

  // Xử lý hủy đơn hàng trực tiếp từ Client
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

    try {
      const res = await cancelOrder(orderId);
      
      if (res && res.success) {
        // Đồng bộ gọi hàm hiển thị toast chuẩn của dự án
        if (showToast) {
          showToast("Hủy đơn hàng thành công!", "success");
        } else {
          alert("Hủy đơn hàng thành công!");
        }
      } else {
        if (showToast) {
          showToast(res?.message || "Không thể hủy đơn hàng vào lúc này.", "error");
        } else {
          alert(res?.message || "Không thể hủy đơn hàng vào lúc này.");
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý hủy đơn hàng:", error);
      alert("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.");
    }
  };

  return (
    <div className="w-full text-left space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Đơn hàng đã mua</h2>
          <p className="text-xs text-slate-400 font-medium">Theo dõi lịch sử mua sắm vật phẩm cho thú cưng</p>
        </div>
      </div>

      {/* Thanh Tabs phân loại trạng thái đơn hàng */}
      <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar bg-white rounded-2xl p-1.5 shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all flex-1 text-center ${
              activeTab === tab.value
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER NỘI DUNG CHÍNH */}
      {loading ? (
        /* Màn hình Skeleton chờ tải dữ liệu */
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white h-36 rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Trạng thái trống (Empty State) */
        <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
            <Inbox size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">Lịch sử đơn hàng trống</h3>
          <p className="text-sm text-slate-400 font-medium max-w-sm">
            Bạn hiện chưa có đơn hàng nào trong mục "{TABS.find(t => t.value === activeTab)?.label}". Hãy sắm ngay vài món đồ cho bé cưng nhé!
          </p>
        </div>
      ) : (
        /* DANH SÁCH ĐƠN HÀNG THỰC TẾ */
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onCancelOrder={handleCancelOrder} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;