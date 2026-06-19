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
  
  // 1. Khai báo link ảnh dự phòng cố định ở trên cùng
  const fallbackDefaultImg = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800';
  
  // Áp dụng store quản lý ảnh sản phẩm
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

  // 2. 🌟 TƯƠNG TỰ SERVICECARD: Tìm ảnh tối ưu nhất từ dữ liệu có sẵn
  const displayImage = React.useMemo(() => {
    // Trường hợp 1: Nếu store đã tải xong mảng hình ảnh và có dữ liệu
    if (images && Array.isArray(images) && images.length > 0) {
      // Tìm ảnh được đánh dấu là thumbnail (hỗ trợ cả trường url hoặc imageUrl)
      const thumbnailImg = images.find((img) => img.isThumbnail)?.imageUrl || images.find((img) => img.isThumbnail)?.url;
      // Nếu không có thumbnail, lấy ảnh đầu tiên trong mảng
      const firstImg = images[0]?.imageUrl || images[0]?.url;
      
      if (thumbnailImg || firstImg) return thumbnailImg || firstImg;
    }

    // Trường hợp 2: Nếu dữ liệu trong store chưa có, fallback về các trường ảnh đính kèm trực tiếp trong object product ban đầu
    return product.thumbnail || product.image || fallbackDefaultImg;
  }, [images, product, fallbackDefaultImg]);

  const handleBuyNow = (e) => {
    e.preventDefault();
    addItem(product,1);
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
            // 3. 🌟 Giữ màng lọc an toàn chặn mọi link ảnh lỗi từ phía API/Server
            onError={(e) => {
              if (e.target.src !== fallbackDefaultImg) {
                e.target.src = fallbackDefaultImg;
              }
            }}
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
          onClick={() => addItem(product,1)} 
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