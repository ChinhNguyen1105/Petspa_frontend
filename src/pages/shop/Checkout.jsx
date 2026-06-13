import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/ui/Badge';
import AddressForm from '../../components/form/AddressForm'; 

// TÍCH HỢP STORES
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useAddressStore } from '../../store/addressStore';
import { formatPrice } from '../../utils/formatPrice';
import PaymentModal from '../../components/common/PaymentModal';

// 🔥 TÍCH HỢP COMPONENT APRIORI RECOMMENDATION
import RecommendedProducts from './RecommendProducts';

const Checkout = () => {
  const navigate = useNavigate();

  // 1. Giỏ hàng Store
  const { itemDtoList, totalAmount, fetchCart, clearCart } = useCartStore();

  // 2. Đặt hàng Store
  const { createOrder, submitting: isSubmitting } = useOrderStore();

  // 3. Địa chỉ Store
  const { addresses, isLoading: isLoadingAddress, fetchAddresses } = useAddressStore();

  // --- TRẠNG THÁI LOCAL ---
  const [selectedAddress, setSelectedAddress] = useState(null); 
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddressOverlay, setShowAddressOverlay] = useState(false); 
  const [showAddForm, setShowAddForm] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState(null);
  
  // TRẠNG THÁI MỚI: Lưu trữ thông tin địa chỉ đang cần chỉnh sửa/xóa
  const [editingAddress, setEditingAddress] = useState(null); 

  // Đồng bộ tải dữ liệu ban đầu
  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  // Đặt địa chỉ mặc định khi danh sách addresses từ store tải xong
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find(item => item.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses, selectedAddress]);

  // ĐỒNG BỘ NÂNG CẤP: Xử lý sau khi Thêm mới / Sửa / Xóa thành công từ Form gửi về
  const handleAddressSubmitSuccess = (newAddress) => {
    fetchAddresses(); // Tải lại danh sách từ store để cập nhật dữ liệu mới nhất
    
    if (newAddress && !editingAddress) {
      // Trường hợp 1: Thêm mới thành công -> Áp dụng chọn ngay địa chỉ này
      setSelectedAddress(newAddress); 
    } else if (editingAddress) {
      // Trường hợp 2: Chỉnh sửa thành công
      if (selectedAddress?.id === editingAddress.id) {
        // Nếu địa chỉ vừa sửa trùng với địa chỉ đang active ngoài màn hình -> Cập nhật hiển thị text bên ngoài luôn
        setSelectedAddress(newAddress);
      }
    } else {
      // Trường hợp 3: Xóa địa chỉ (Form không trả về newAddress)
      if (selectedAddress?.id === editingAddress?.id) {
        setSelectedAddress(null); // Xóa hiển thị active nếu trúng địa chỉ vừa bị xóa hành vi
      }
    }
    
    // Reset toàn bộ trạng thái để quay về màn hình danh sách địa chỉ trong Overlay
    setEditingAddress(null); 
    setShowAddForm(false); 
  };

  // Xử lý hành động Đặt hàng chính
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Vui lòng chọn hoặc thêm địa chỉ nhận hàng!");
      return;
    }

    const orderPayload = {
      cartItemIds: itemDtoList.map((item) => item.id),
      addressId: selectedAddress.id,
      paymentMethod: paymentMethod,
    };

    console.log("ORDER PAYLOAD:", orderPayload);

    const res = await createOrder(orderPayload);

    // FIX QUAN TRỌNG Ở ĐÂY
    const orderData = res?.data || res;

    if (res?.success || orderData) {
      if (paymentMethod === "BANKING") {
        setCreatedOrderData(orderData);
        setShowPaymentModal(true);
      } else {
        clearCart();
        navigate("/order-success", {
          state: { order: orderData },
        });
      }
    } else {
      alert(res?.message || "Đã có lỗi xảy ra khi tạo đơn hàng.");
    }
  };

  return (
    <div className="container mx-auto px-12 py-8 max-w-6xl">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center text-gray-600 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Quay lại giỏ hàng
      </button>

      <h1 className="text-3xl font-bold mb-8 text-gray-800">Tiến hành thanh toán</h1>

      {/* Grid thông tin thanh toán cơ bản */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI & GIỮA: THÔNG TIN GIAO HÀNG VÀ THANH TOÁN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KHỐI 1: ĐỊA CHỈ NHẬN HÀNG */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <MapPin className="w-5 h-5 text-primary mr-2" />
                Thông tin nhận hàng
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddressOverlay(true)}
              >
                Thay đổi địa chỉ
              </Button>
            </div>

            {isLoadingAddress ? (
              <p className="text-gray-400 text-sm animate-pulse">Đang tải thông tin địa chỉ...</p>
            ) : selectedAddress ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-700">{selectedAddress.fullName || selectedAddress.recipient_name}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{selectedAddress.phone || selectedAddress.phone_number}</span>
                  {selectedAddress.isDefault && (
                    <Badge variant="success" className="text-xs ml-2">Mặc định</Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedAddress.fullAddress || `${selectedAddress.detail_address}, ${selectedAddress.district_ward}, ${selectedAddress.province_city}`}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm mb-3">Bạn chưa có địa chỉ nhận hàng nào</p>
                <Button size="sm" onClick={() => { setShowAddressOverlay(true); setShowAddForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Thêm địa chỉ mới
                </Button>
              </div>
            )}
          </div>

          {/* KHỐI 2: PHƯƠNG THỨC THANH TOÁN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold flex items-center text-gray-800 mb-4">
              <CreditCard className="w-5 h-5 text-primary mr-2" />
              Phương thức thanh toán
            </h2>
            
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="COD" 
                  checked={paymentMethod === 'COD'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-gray-500">Thanh toán bằng tiền mặt trực tiếp cho shipper khi nhận được hàng hóa</p>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'BANKING' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="BANKING" 
                  checked={paymentMethod === 'BANKING'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-800">Thanh toán qua cổng tự động QR VietQR / Banking</p>
                  <p className="text-xs text-gray-500">Hệ thống hiển thị mã QR kèm nội dung chuyển khoản tự động quét khớp đơn</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold flex items-center text-gray-800 mb-4">
            <ShoppingBag className="w-5 h-5 text-primary mr-2" />
            Tóm tắt đơn hàng
          </h2>

          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto mb-4 pr-1">
            {itemDtoList.map((item) => (
              <div key={item.id} className="flex py-3 items-center justify-between gap-2">
                <img 
                  src={item.productImage || 'https://placehold.co/100'} 
                  alt={item.productName} 
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 truncate">{item.productName}</h4>
                  <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {formatPrice(item.productPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-medium">Miễn phí</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-100 pt-2">
              <span>Tổng cộng</span>
              <span className="text-xl text-primary">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <Button 
            className="w-full py-3 text-base font-semibold"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || itemDtoList.length === 0}
          >
            {isSubmitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận đặt đơn'}
          </Button>
        </div>

      </div>

      {/* 🔥 VỊ TRÍ GẮN COMPONENT RECOMMENDATION APRIORI TRỰC QUAN */}
      {/* Hiển thị full-width ngay phía dưới Grid thanh toán để kích thích upsell */}
      <div className="mt-12">
        <RecommendedProducts maxItems={4} />
      </div>

      {/* --- OVERLAY / MODAL CHỌN ĐỊA CHỈ & FORM THÊM MỚI / SỬA --- */}
      {showAddressOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="no-scrollbar bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl relative max-h-[85vh] overflow-y-auto m-4 animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => { 
                setShowAddressOverlay(false); 
                setShowAddForm(false); 
                setEditingAddress(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!showAddForm ? (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Danh sách địa chỉ của bạn</h3>
                
                <div className="space-y-3 mb-6">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`p-4 rounded-xl border text-left relative flex justify-between items-center transition-all ${selectedAddress?.id === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      {/* VÙNG CLICK 1: Chọn địa chỉ làm active */}
                      <div 
                        className="cursor-pointer flex-1 pr-12"
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressOverlay(false);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{addr.fullName || addr.recipient_name}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600 text-sm">{addr.phone || addr.phone_number}</span>
                          {addr.isDefault && <Badge variant="success" className="text-xs">Mặc định</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">
                          {addr.fullAddress || `${addr.detail_address}, ${addr.district_ward}, ${addr.province_city}`}
                        </p>
                      </div>

                      {/* VÙNG CLICK 2: Nút sửa nằm biệt lập */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn hành động click lan sang vùng chọn địa chỉ
                          setEditingAddress(addr); // Lưu data địa chỉ đích để sửa
                          setShowAddForm(true); // Mở form
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        Sửa
                      </button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-dashed flex items-center justify-center gap-2 py-2.5"
                  onClick={() => {
                    setEditingAddress(null); // Đảm bảo trạng thái sửa bằng null để kích hoạt form Thêm mới
                    setShowAddForm(true);
                  }}
                >
                  <Plus className="w-4 h-4" /> Thêm địa chỉ nhận hàng mới
                </Button>
              </>
            ) : (
              <>
                {/* TIÊU ĐỀ THAY ĐỔI LINH HOẠT THEO HÀNH ĐỘNG */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {editingAddress ? "Chỉnh sửa địa chỉ giao hàng" : "Thêm địa chỉ giao hàng mới"}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Vui lòng điền thông tin biểu mẫu chính xác bên dưới để giao hàng thuận tiện hơn.
                </p>
                
                <div className="border border-gray-100 p-4 rounded-xl bg-slate-50">
                  <AddressForm 
                    initialData={editingAddress} // Đẩy data của địa chỉ đang sửa vào prop này
                    onSuccess={handleAddressSubmitSuccess}
                    onCancel={() => { 
                      setShowAddForm(false); 
                      setEditingAddress(null); // Hủy sửa thì xóa trạng thái lưu tạm
                    }} 
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL CỔNG THANH TOÁN TỰ ĐỘNG QR BANKING */}
      {showPaymentModal && createdOrderData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            clearCart();
            navigate('/order-success', { state: { order: createdOrderData } });
          }}
          orderData={createdOrderData}
        />
      )}
    </div>
  );
};

export default Checkout;
