import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, CreditCard, ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { formatPrice } from '../../utils/formatPrice';
import { useCartStore } from '../../store/cartStore';
import { useProductImageStore } from '../../store/productImageStore';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  
  // Áp dụng store mới để quản lý ảnh
  const { images, fetchImages, loading } = useProductImageStore();

  useEffect(() => {
    if (product?.id) {
      fetchImages(product.id);
    }
  }, [product?.id, fetchImages]);

  // Xử lý logic hiển thị Danh mục
  const displayCategoryName = typeof product.category === 'object' && product.category !== null
    ? product.category.name 
    : (product.categoryName || product.category_name || 'Sản phẩm');

  // Ưu tiên lấy ảnh từ store mới, nếu chưa có/đang tải thì fallback về data cũ hoặc placeholder
  const displayImage = images && images.length > 0 
    ? images[0]?.url // Giả định object trong mảng có trường url (bạn tùy chỉnh lại trường này nếu cần)
    : (product.thumbnail || product.image || 'https://placehold.co/300x300');

  const handleBuyNow = (e) => {
    e.preventDefault();
    addItem(product);
    navigate('/shop/checkout');
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-[0_20px_40px_rgba(42,130,228,0.06)] transition-all duration-300 group flex flex-col h-full text-left">
      
      {/* Khung chứa ảnh */}
      <Link to={`/shop/product/${product.id}`} className="block relative h-52 mb-4 overflow-hidden rounded-2xl bg-gray-50">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
            <ImageIcon size={24} />
          </div>
        ) : (
          <img 
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Badge số sao đánh giá */}
        {product.averageRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-100">
            <Star size={12} className="text-pet-orange" fill="currentColor" />
            <span className="text-xs font-bold text-gray-700">{product.averageRating}</span>
          </div>
        )}
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="flex-grow flex flex-col px-1">
        <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
          {displayCategoryName}
        </p>
        
        <Link to={`/shop/product/${product.id}`} className="block flex-grow mb-2">
          <h3 className="font-bold text-gray-800 hover:text-pet-blue transition-colors text-base line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-1 pb-3">
          <p className="text-pet-orange font-black text-xl">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      {/* Khu vực nút bấm */}
      <div className="flex items-center gap-2 w-full mt-2">
        <Button 
          onClick={() => addItem(product)} 
          variant="outline" 
          className="p-3 border border-slate-200 text-slate-600 hover:text-pet-blue hover:border-pet-blue/30 hover:bg-pet-blue/5 rounded-2xl transition-all active:scale-[0.95]"
          title="Thêm vào giỏ hàng"
        >
          <ShoppingCart size={18} className="stroke-[2.5]" />
        </Button>

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