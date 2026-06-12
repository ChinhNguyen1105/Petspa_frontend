import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, ShoppingBag, ArrowLeft, CreditCard, Phone } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore'; 
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';

// Giả định bạn import các constants này từ file constants của mình
import { STATUS_CONFIG } from '../../constants';
import { PAYMENT_STATUS_CONFIG } from '../../constants';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Lấy các state và action tập trung từ useOrderStore
  const { currentOrder, loading, submitting, fetchOrderById, cancelOrder } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id);
    }
  }, [id, fetchOrderById]);

  if (loading) return <Loading fullScreen />;

  // Xử lý fallback dữ liệu an toàn
  const order = currentOrder;
  if (!order) {
    return <div className="pt-32 text-center text-gray-500 font-medium">Không tìm thấy thông tin đơn hàng.</div>;
  }

  // Hàm xử lý tương tác hủy đơn hàng trực tiếp qua Store
  const handleCancelOrder = async () => {
    if (window.confirm("Bạn có chắc chắn muốn yêu cầu hủy đơn hàng này không?")) {
      const res = await cancelOrder(id);
      if (res && res.success) {
        alert("Yêu cầu hủy đơn hàng thành công!");
      } else {
        alert(res?.message || "Hủy đơn hàng thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  // ĐỒNG BỘ CONSTANTS: Lấy cấu hình hiển thị Trạng thái đơn hàng (Mặc định xử lý fallback về PENDING)
  const orderStatusKey = order.status?.toUpperCase() || 'PENDING';
  const currentStatusConfig = STATUS_CONFIG[orderStatusKey] || STATUS_CONFIG.PENDING;

  // ĐỒNG BỘ CONSTANTS: Lấy cấu hình hiển thị Trạng thái thanh toán (Mặc định xử lý fallback về PENDING)
  const paymentStatusKey = order.paymentStatus?.toUpperCase() || 'PENDING';
  const currentPaymentConfig = PAYMENT_STATUS_CONFIG[paymentStatusKey] || PAYMENT_STATUS_CONFIG.PENDING;

  // Tính toán dòng tiền dựa trên cấu trúc mock
  const totalAmount = order.totalAmount || 0;
  const discountAmount = order.discountAmount || 0;
  
  const isFreeShip = totalAmount > 500000;
  const shippingFee = isFreeShip ? 0 : 30000;
  const subTotal = order.subtotalAmount || (totalAmount + discountAmount - shippingFee);

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate("/profile", { state: { activeTab: "orders" } })}
          className="flex items-center text-gray-500 hover:text-pet-blue mb-6 font-bold text-sm transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách đơn hàng
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Header Card */}
          <div className="bg-pet-blue p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-200 text-sm font-semibold tracking-wider">
                  MÃ ĐƠN HÀNG: #{order.id}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar size={16} className="text-blue-200" />
                  <span className="text-sm text-blue-100">
                    Ngày đặt: {formatDate(order.createdDate)}
                  </span>
                </div>
              </div>
              <div>
                {/* TÍCH HỢP CONSTANT: Hiển thị trạng thái đơn hàng */}
                <Badge className={`${currentStatusConfig.className} px-3 py-1 text-sm font-bold border rounded-xl`}>
                  {currentStatusConfig.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            
            {/* Khối 1: Thông tin người nhận & Thanh toán */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-black tracking-wider text-gray-400 flex items-center gap-1.5">
                  <MapPin size={14} /> Địa chỉ nhận hàng
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-bold text-gray-900 flex items-center gap-1">
                    <User size={14} className="text-gray-400" /> 
                    {order.shippingName || 'Người nhận'}
                  </p>
                  <p className="font-bold text-gray-900 flex items-center gap-1">
                    <Phone size={14} className="text-gray-400" /> 
                    {order.shippingPhone || 'Liên hệ qua ứng dụng'}
                  </p>
                  <p className="text-gray-500 pl-5 font-medium leading-relaxed">
                    {order.shippingAddressFull}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-black tracking-wider text-gray-400 flex items-center gap-1.5">
                  <CreditCard size={14} /> Phương thức thanh toán
                </h3>
                <div className="text-sm font-bold text-gray-800 space-y-2">
                  <div className="bg-gray-50 flex items-center justify-between px-3 py-1.5 rounded-xl border border-gray-100">
                    <span>
                      {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : `Thanh toán qua ${order.paymentMethod || 'Ngân hàng'}`}
                    </span>
                    {/* TÍCH HỢP CONSTANT: Hiển thị trạng thái thanh toán */}
                    <Badge className={`${currentPaymentConfig.color} ml-2 text-xs py-0.5 px-2 border rounded-xl font-bold`}>
                      {currentPaymentConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối 2: Danh sách sản phẩm */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-black tracking-wider text-gray-400 flex items-center gap-1.5">
                <ShoppingBag size={14} /> Danh sách sản phẩm
              </h3>
              
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30 px-4">
                {order.orderDetails?.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-4 py-4 first:pt-4 last:pb-4">
                    <img 
                      src={item.productImage || 'https://via.placeholder.com/150'} 
                      alt={item.productName} 
                      className="w-16 h-16 rounded-2xl object-contain bg-white border p-1" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        Đơn giá: {formatPrice(item.unitPrice || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400 block">x{item.quantity || 1}</span>
                      <span className="text-sm font-black text-gray-800 block mt-0.5">
                        {formatPrice(item.totalAmount || (item.unitPrice || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Khối 3: Tổng kết tài chính */}
            <div className="border-t border-gray-100 pt-6 space-y-3 text-sm font-medium text-gray-500">
              <div className="flex justify-between">
                <span>Tạm tính sản phẩm:</span>
                <span className="text-gray-800 font-bold">
                  {formatPrice(subTotal > 0 ? subTotal : 0)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-bold">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="text-gray-800 font-bold">
                  {isFreeShip ? <span className="text-green-500 font-bold">Miễn phí</span> : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-black text-gray-900 border-t border-dashed pt-4">
                <span>Tổng tiền cần thanh toán:</span>
                <span className="text-2xl text-pet-orange">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Hành Động - Chỉ hiển thị khi đơn hàng đang ở trạng thái pending */}
          {orderStatusKey === 'PENDING' && (
            <div className="p-6 bg-gray-50 border-t flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleCancelOrder}
                disabled={submitting}
                className="flex-1 text-red-500 border-red-200 hover:bg-red-50/50 !py-3 rounded-2xl font-bold disabled:opacity-50"
              >
                {submitting ? 'Đang xử lý...' : 'Yêu cầu hủy đơn'}
              </Button>
              <Button className="flex-1 !py-3 rounded-2xl font-bold" disabled={submitting}>
                Liên hệ hỗ trợ
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;