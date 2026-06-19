import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingBag, ArrowLeft, Plus, X, Image } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/ui/Badge';
import AddressForm from '../../components/form/AddressForm'; 

// TÍCH HỢP STORES
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useAddressStore } from '../../store/addressStore';
import { formatPrice } from '../../utils/formatPrice';
import { useProductImageStore } from '../../store/productImageStore';

import PaymentModal from '../../components/common/PaymentModal';

// 🔥 TÍCH HỢP COMPONENT APRIORI RECOMMENDATION
import RecommendedProducts from './RecommendProducts';

/*
|--------------------------------------------------------------------------
| SUB-COMPONENT: CHECKOUT ITEM ROW
| Từng dòng sản phẩm tự quản lý fetch ảnh để tránh lỗi đè dữ liệu
|--------------------------------------------------------------------------
*/
const CheckoutItemRow = ({ item }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [loadingImg, setLoadingImg] = useState(true);
  const fetchImages = useProductImageStore((state) => state.fetchImages);

  const fallbackImg = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=100'; // Fallback mặc định

  useEffect(() => {
    let isMounted = true;

    const loadProductThumbnail = async () => {
      // 1. Nếu BE đã mapping sẵn link ảnh hợp lệ, dùng luôn không cần gọi API
      if (item.productImage && item.productImage.startsWith('http')) {
        if (isMounted) {
          setImgUrl(item.productImage);
          setLoadingImg(false);
        }
        return;
      }

      // 2. Nếu link ảnh trống, dùng store gọi API lấy danh sách ảnh của productId đó
      try {
        if (item.productId) {
          const res = await fetchImages(item.productId);
          if (res?.data && isMounted) {
            const mainImg = res.data.find(img => img.isThumbnail || img.isMain) || res.data[0];
            setImgUrl(mainImg?.imageUrl || fallbackImg);
          }
        } else {
          if (isMounted) setImgUrl(fallbackImg);
        }
      } catch (error) {
        console.error(`Lỗi fetch ảnh sản phẩm ${item.productId} tại Checkout:`, error);
        if (isMounted) setImgUrl(fallbackImg);
      } finally {
        if (isMounted) setLoadingImg(false);
      }
    };

    loadProductThumbnail();

    return () => {
      isMounted = false;
    };
  }, [item.productId, item.productImage, fetchImages]);

  return (
    <div className="flex py-3 items-center justify-between gap-2">
      {/* Vùng chứa ảnh sản phẩm */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative border border-gray-100">
        {loadingImg ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <Image className="text-gray-300 animate-bounce" size={14} />
          </div>
        ) : (
          <img 
            src={imgUrl} 
            alt={item.productName} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        )}
      </div>

      {/* Thông tin văn bản */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-sm font-bold text-gray-800 truncate">{item.productName}</h4>
        <p className="text-xs text-gray-500 font-medium">Số lượng: {item.quantity}</p>
      </div>

      {/* Thành tiền */}
      <span className="text-sm font-black text-gray-700 flex-shrink-0">
        {formatPrice(item.productPrice * item.quantity)}
      </span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT: CHECKOUT
|--------------------------------------------------------------------------
*/
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
  
  // Lưu trữ thông tin địa chỉ đang cần chỉnh sửa/xóa
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

  // Xử lý sau khi Thêm mới / Sửa / Xóa thành công từ Form gửi về
  const handleAddressSubmitSuccess = (newAddress) => {
    fetchAddresses(); 
    
    if (newAddress && !editingAddress) {
      setSelectedAddress(newAddress); 
    } else if (editingAddress) {
      if (selectedAddress?.id === editingAddress.id) {
        setSelectedAddress(newAddress);
      }
    } else {
      if (selectedAddress?.id === editingAddress?.id) {
        setSelectedAddress(null); 
      }
    }
    
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
        className="flex items-center text-gray-600 hover:text-primary mb-6 transition-colors font-bold text-sm bg-transparent border-none outline-none cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Quay lại giỏ hàng
      </button>

      <h1 className="text-3xl font-black mb-8 text-gray-800 uppercase tracking-tight text-left">
        Tiến hành thanh toán
      </h1>

      {/* Grid thông tin thanh toán cơ bản */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* CỘT TRÁI & GIỮA: THÔNG TIN GIAO HÀNG VÀ THANH TOÁN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KHỐI 1: ĐỊA CHỈ NHẬN HÀNG */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black flex items-center text-gray-800 uppercase tracking-wide">
                <MapPin className="w-5 h-5 text-primary mr-2" />
                Thông tin nhận hàng
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddressOverlay(true)}
                className="font-bold rounded-xl"
              >
                Thay đổi địa chỉ
              </Button>
            </div>

            {isLoadingAddress ? (
              <p className="text-gray-400 text-sm animate-pulse font-medium">Đang tải thông tin địa chỉ...</p>
            ) : selectedAddress ? (
              <div className="p-4 bg-slate-50/60 rounded-xl border border-dashed border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-700">{selectedAddress.fullName || selectedAddress.recipient_name}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-bold text-sm">{selectedAddress.phone || selectedAddress.phone_number}</span>
                  {selectedAddress.isDefault && (
                    <Badge variant="success" className="text-xs ml-2 font-bold rounded-md">Mặc định</Badge>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1 font-medium leading-relaxed">
                  {selectedAddress.fullAddress || `${selectedAddress.detail_address}, ${selectedAddress.district_ward}, ${selectedAddress.province_city}`}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm mb-3 font-medium">Bạn chưa có địa chỉ nhận hàng nào</p>
                <Button size="sm" className="font-bold rounded-xl" onClick={() => { setShowAddressOverlay(true); setShowAddForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Thêm địa chỉ mới
                </Button>
              </div>
            )}
          </div>

          {/* KHỐI 2: PHƯƠNG THỨC THANH TOÁN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
            <h2 className="text-xl font-black flex items-center text-gray-800 mb-4 uppercase tracking-wide">
              <CreditCard className="w-5 h-5 text-primary mr-2" />
              Phương thức thanh toán
            </h2>
            
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="COD" 
                  checked={paymentMethod === 'COD'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                />
                <div className="ml-4">
                  <p className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Thanh toán bằng tiền mặt trực tiếp cho shipper khi nhận được hàng hóa</p>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'BANKING' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="BANKING" 
                  checked={paymentMethod === 'BANKING'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                />
                <div className="ml-4">
                  <p className="font-bold text-gray-800">Thanh toán qua cổng tự động QR VietQR / Banking</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Hệ thống hiển thị mã QR kèm nội dung chuyển khoản tự động quét khớp đơn</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24 text-left">
          <h2 className="text-xl font-black flex items-center text-gray-800 mb-4 uppercase tracking-wider border-b border-gray-50 pb-3">
            <ShoppingBag className="w-5 h-5 text-primary mr-2" />
            Tóm tắt đơn hàng
          </h2>

          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto mb-4 pr-1 scrollbar-thin">
            {itemDtoList.map((item) => (
              <CheckoutItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-500 font-bold">
              <span>Tạm tính</span>
              <span className="text-gray-700">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 font-bold">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-bold">Miễn phí</span>
            </div>
            <div className="flex justify-between items-center text-base font-bold text-gray-800 border-t border-gray-100 pt-3 mt-1">
              <span className="text-sm text-gray-600 font-bold">Tổng cộng</span>
              <span className="text-2xl text-pet-orange font-black">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <Button 
            className="w-full py-4 text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/10"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || itemDtoList.length === 0}
          >
            {isSubmitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận đặt đơn'}
          </Button>
        </div>

      </div>

      {/* COMPONENT RECOMMENDATION APRIORI */}
      <div className="mt-12">
        <RecommendedProducts maxItems={4} />
      </div>

      {/* --- OVERLAY / MODAL CHỌN ĐỊA CHỈ & FORM THÊM MỚI / SỬA --- */}
      {showAddressOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="no-scrollbar bg-white rounded-3xl w-full max-w-xl p-6 shadow-xl relative max-h-[85vh] overflow-y-auto m-4 animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => { 
                setShowAddressOverlay(false); 
                setShowAddForm(false); 
                setEditingAddress(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!showAddForm ? (
              <>
                <h3 className="text-lg font-black text-gray-800 mb-4 uppercase tracking-tight text-left">Danh sách địa chỉ của bạn</h3>
                
                <div className="space-y-3 mb-6">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`p-4 rounded-xl border text-left relative flex justify-between items-center transition-all ${selectedAddress?.id === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div 
                        className="cursor-pointer flex-1 pr-12"
                        onClick={() => {
                          setSelectedAddress(addr);
                          setShowAddressOverlay(false);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">{addr.fullName || addr.recipient_name}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500 text-xs font-bold">{addr.phone || addr.phone_number}</span>
                          {addr.isDefault && <Badge variant="success" className="text-xs font-bold rounded-md">Mặc định</Badge>}
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                          {addr.fullAddress || `${addr.detail_address}, ${addr.district_ward}, ${addr.province_city}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setEditingAddress(addr); 
                          setShowAddForm(true); 
                        }}
                        className="text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors flex-shrink-0 cursor-pointer border-none"
                      >
                        Sửa
                      </button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-dashed flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  onClick={() => {
                    setEditingAddress(null); 
                    setShowAddForm(true);
                  }}
                >
                  <Plus className="w-4 h-4" /> Thêm địa chỉ nhận hàng mới
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black text-gray-800 mb-1 text-left uppercase tracking-tight">
                  {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </h3>
                <p className="text-xs text-gray-400 mb-4 font-medium text-left">
                  Vui lòng điền thông tin biểu mẫu chính xác bên dưới để giao hàng thuận tiện hơn.
                </p>
                
                <div className="border border-gray-100 p-4 rounded-2xl bg-slate-50/50">
                  <AddressForm 
                    initialData={editingAddress} 
                    onSuccess={handleAddressSubmitSuccess}
                    onCancel={() => { 
                      setShowAddForm(false); 
                      setEditingAddress(null); 
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