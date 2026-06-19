import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Image } from 'lucide-react';
// Lấy trực tiếp từ các store đã cấu hình
import { useCartStore } from '../../store/cartStore';
import { useProductImageStore } from '../../store/productImageStore';

import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatPrice';

/*
|--------------------------------------------------------------------------
| SUB-COMPONENT: CART ITEM ROW
| Mỗi dòng sản phẩm tự quản lý việc fetch ảnh qua Store mà không lo đè state
|--------------------------------------------------------------------------
*/
const CartItemRow = ({ item, updateQuantity, removeItem }) => {
  const [imgUrl, setImgUrl] = useState('');
  const [loadingImg, setLoadingImg] = useState(true);
  const fetchImages = useProductImageStore((state) => state.fetchImages);

  const fallbackImg = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=200'; // Ảnh chó mèo mặc định

  useEffect(() => {
    let isMounted = true;
    
    const loadProductThumbnail = async () => {
      // Trường hợp BE đã map sẵn trường productImage chuẩn, không cần fetch lại
      if (item.productImage && item.productImage.startsWith('http')) {
        if (isMounted) {
          setImgUrl(item.productImage);
          setLoadingImg(false);
        }
        return;
      }

      // Trường hợp productImage bị null/chưa mapping từ BE, sử dụng store để kéo danh sách ảnh
      try {
        if (item.productId) {
          const res = await fetchImages(item.productId);
          if (res?.data && isMounted) {
            // Tìm ảnh được đánh dấu là thumbnail hoặc ảnh chính (isThumbnail || isMain)
            const mainImg = res.data.find(img => img.isThumbnail || img.isMain) || res.data[0];
            setImgUrl(mainImg?.imageUrl || fallbackImg);
          }
        }
      } catch (error) {
        console.error(`Không thể lấy ảnh cho sản phẩm ${item.productId}:`, error);
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
    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-50 hover:border-gray-100 transition-all">
      {/* Khu vực hiển thị ảnh hoặc Skeleton loading cho ảnh */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative border border-gray-100">
        {loadingImg ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <Image className="text-gray-300 animate-bounce" size={20} />
          </div>
        ) : (
          <img 
            src={imgUrl} 
            className="w-full h-full object-cover" 
            alt={item.productName} 
            onError={(e) => { e.target.src = fallbackImg; }}
          />
        )}
      </div>

      {/* Thông tin tên và giá */}
      <div className="flex-grow text-left">
        <h3 className="font-bold text-gray-800 line-clamp-1">{item.productName}</h3>
        <p className="text-pet-orange font-black mt-0.5">{formatPrice(item.productPrice)}</p>
      </div>
      
      {/* Bộ điều khiển số lượng */}
      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
          className="p-1 bg-white shadow-sm rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          disabled={item.quantity <= 1}
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
          className="p-1 bg-white shadow-sm rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
      
      {/* Nút xóa sản phẩm khỏi giỏ */}
      <button 
        onClick={() => removeItem(item.id)} 
        className="text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer border-none bg-transparent"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT: CART
|--------------------------------------------------------------------------
*/
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
      <div className="min-h-screen pt-32 text-center bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pet-blue border-t-transparent mb-4"></div>
        <h2 className="text-xl font-bold text-gray-600">Đang tải giỏ hàng của bạn...</h2>
      </div>
    );
  }

  if (itemDtoList.length === 0) {
    return (
      <div className="min-h-screen pt-32 text-center bg-gray-50">
        <h2 className="text-2xl font-black text-gray-800 mb-2">Giỏ hàng trống trơn! 🛒</h2>
        <p className="text-gray-500 mb-6 font-medium text-sm">Hãy tìm thêm các sản phẩm chăm sóc thú cưng chất lượng nhé.</p>
        <Link to="/shop">
          <Button className="!px-8 !py-3 rounded-xl uppercase font-black tracking-wide text-xs">Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20">
      <div className="container mx-auto px-4 md:px-10 max-w-5xl">
        <h1 className="text-3xl font-black text-pet-blue mb-8 uppercase tracking-tight text-left">
          Giỏ hàng của bạn
        </h1>
        
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Danh sách sản phẩm chiếm 8 cột */}
          <div className="lg:col-span-8 space-y-4">
            {itemDtoList.map((item) => (
              <CartItemRow 
                key={item.id} 
                item={item} 
                updateQuantity={updateQuantity} 
                removeItem={removeItem} 
              />
            ))}
          </div>

          {/* Tổng cộng & Thanh toán chiếm 4 cột */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24 text-left">
            <h3 className="text-lg font-black text-gray-800 border-b border-gray-50 pb-3 mb-4 uppercase tracking-wider">
              Tóm tắt đơn hàng
            </h3>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500 font-bold text-sm">Tổng tiền tạm tính:</span>
              {/* Lấy trực tiếp tổng tiền từ Store đã xử lý tối ưu thay vì reduce thủ công */}
              <span className="font-black text-2xl text-pet-orange">{formatPrice(totalAmount)}</span>
            </div>
            <Link to="/shop/checkout">
              <Button className="w-full !py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg shadow-blue-500/10">
                Tiến hành đặt hàng
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;