import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
// Lấy trực tiếp từ store đã cấu hình
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatPrice';

const Cart = () => {
  // Đồng bộ hóa trạng thái ứng dụng theo mô hình DTO mới
  const { 
    itemDtoList, 
    totalAmount, 
    removeItem, 
    updateQuantity, 
    fetchCart, 
    isLoading 
  } = useCartStore();

  // Khởi tạo và kéo dữ liệu giỏ hàng đồng bộ với Mock Service khi component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && itemDtoList.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-xl font-medium text-gray-600 mb-4">Đang tải giỏ hàng...</h2>
      </div>
    );
  }

  if (itemDtoList.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
        <Link to="/shop">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-15 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-black text-pet-blue mb-8">Giỏ hàng của bạn</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-2 space-y-4">
            {itemDtoList.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <img 
                  src={item.productImage} 
                  className="w-20 h-20 rounded-xl object-cover" 
                  alt={item.productName} 
                />
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{item.productName}</h3>
                  <p className="text-pet-orange font-bold">{formatPrice(item.productPrice)}</p>
                </div>
                
                {/* Bộ điều khiển số lượng */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                    className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                    className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                {/* Nút xóa sản phẩm khỏi giỏ */}
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="text-red-400 hover:text-red-600 p-2 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Tổng cộng & Thanh toán */}
          <div className="bg-white p-6 rounded-3xl h-fit border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Thanh toán</h3>
            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Tạm tính:</span>
              {/* Lấy trực tiếp tổng tiền từ Store đã xử lý tối ưu thay vì reduce thủ công */}
              <span className="font-bold text-xl text-pet-blue">{formatPrice(totalAmount)}</span>
            </div>
            <Link to="/shop/checkout">
              <Button className="w-full !py-3">Tiến hành đặt hàng</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;