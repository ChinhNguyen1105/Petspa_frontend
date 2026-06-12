import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate để điều hướng sang checkout
import { ShoppingCart, Star, CreditCard } from 'lucide-react';
import { Button } from '../common/Button';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  // Lấy hàm addItem từ store. Hàm này đã tích hợp sẵn showToastNotification bên trong.
  const addItem = useCartStore((state) => state.addItem);

  // 🔥 ĐỒNG BỘ LOGIC: Xử lý an toàn cho Category phòng trường hợp là Object {id, name}
  const displayCategoryName = typeof product.category === 'object' && product.category !== null
    ? product.category.name 
    : (product.categoryName || product.category_name || 'Sản phẩm');

  // 🔥 ĐỒNG BỘ TRƯỜNG ẢNH: Mock data trả về là 'thumbnail', phòng hờ trường hợp API trả về 'image'
  const displayImage = product.thumbnail || product.image || 'https://placehold.co/300x300';

  // Hàm xử lý Mua Ngay trực tiếp chuyển sang Checkout
  const handleBuyNow = (e) => {
    e.preventDefault(); // Ngăn chặn các sự kiện sủi bọt không mong muốn
    addItem(product);   // Thêm vào giỏ hàng
    navigate('/shop/checkout'); // Điều hướng ngay lập tức đến trang thanh toán
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-4 hover:shadow-[0_20px_40px_rgba(42,130,228,0.06)] transition-all duration-300 group flex flex-col h-full text-left">
      
      {/* Hình ảnh sản phẩm (Bo góc sâu, hiệu ứng Zoom ảnh nhẹ khi hover card) */}
      <Link to={`/shop/product/${product.id}`} className="block relative h-52 mb-4 overflow-hidden rounded-[24px] bg-gray-50">
        <img 
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge đánh giá nổi góc trên hình ảnh nếu có số sao */}
        {product.averageRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
            <Star size={12} className="text-pet-orange" fill="currentColor" />
            <span className="text-xs font-bold text-gray-700">{product.averageRating}</span>
          </div>
        )}
      </Link>

      {/* Thông tin nội dung chi tiết */}
      <div className="flex-grow flex flex-col px-1">
        {/* Danh mục sản phẩm */}
        <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
          {displayCategoryName}
        </p>
        
        {/* Tên sản phẩm giới hạn tối đa 2 dòng phòng trường hợp tên quá dài làm lệch layout hàng */}
        <Link to={`/shop/product/${product.id}`} className="block flex-grow mb-1">
          <h3 className="font-bold text-gray-800 hover:text-pet-blue transition-colors text-base line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        
        {/* Khu vực giá cả chỉn chu */}
        <div className="mt-auto pt-2 pb-3 flex items-baseline justify-between">
          <p className="text-pet-orange font-black text-xl">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      {/* Khu vực nút tương tác - Thiết kế song song tối ưu trải nghiệm mua sắm */}
      <div className="flex items-center gap-2 w-full mt-2">
        {/* Nút thêm vào giỏ hàng (Chuyển thành dạng Icon gọn gàng, tinh tế) */}
        <Button 
          onClick={() => addItem(product)} 
          variant="outline" 
          className="p-3 border border-slate-200 text-slate-600 hover:text-pet-blue hover:border-pet-blue/30 hover:bg-pet-blue/5 rounded-2xl transition-all active:scale-[0.95]"
          title="Thêm vào giỏ hàng"
        >
          <ShoppingCart size={18} className="stroke-[2.5]" />
        </Button>

        {/* Nút Mua ngay (Nút chính - Nổi bật thu hút hành động hành vi mua nhanh) */}
        <Button 
          onClick={handleBuyNow}
          variant="primary" 
          className="flex-1 flex items-center justify-center gap-1.5 !py-3 font-bold rounded-2xl text-sm transition-all shadow-sm shadow-pet-blue/10 active:scale-[0.98]"
        >
          <CreditCard size={16} className="stroke-[2.5]" /> Mua ngay
        </Button>
      </div>
      
    </div>
  );
};

export default ProductCard;