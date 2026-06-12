import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatPrice } from '../../utils/formatPrice';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service, onBookingClick }) => {
  const navigate = useNavigate();

  const handleBooking = () => {
    if (typeof onBookingClick === 'function') {
      return onBookingClick();
    }
    navigate(`/spa/booking/create?serviceId=${service.id}`);
  };

  // 1. ĐỒNG BỘ DANH MỤC: Ăn theo cấu trúc 'categoryName' mới
  const displayCategoryName = service.categoryName || 
    (service.category && typeof service.category === 'object' ? (service.category.name || service.category.title) : service.category) || 
    'Dịch vụ Spa';

  // 2. ĐỒNG BỘ HÌNH ẢNH: Tìm ảnh có isThumbnail: true từ mảng serviceImages mới
  const thumbnailImg = service.serviceImages?.find(img => img.isThumbnail)?.imageUrl;
  const firstImg = service.serviceImages?.[0]?.imageUrl;
  
  const displayImage = thumbnailImg || 
    firstImg || 
    service.thumbnail || 
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800';

  // 3. ĐỒNG BỘ THỜI GIAN & GIÁ CẢ: Ăn theo 'durationMin' và 'basePrice' mới
  const duration = service.durationMin || service.durationMinutes || 0;
  const price = service.basePrice || service.finalPrice || service.price || 0;

  return (
    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      {/* Khối hình ảnh */}
      <div className="relative overflow-hidden h-64">
        <img
          src={displayImage}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-2xl rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          {displayCategoryName}
        </div>
      </div>

      {/* Khối nội dung */}
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs uppercase tracking-[0.18em] font-bold text-pet-orange">
            {duration} phút
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
            <Star size={16} className="fill-yellow-500" />
            {service.averageRating?.toFixed(1) || service.rating?.toFixed(1) || '4.8'}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-tight mb-3">
          {service.name}
        </h3>
        
        <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">
          {service.description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp, chuẩn an toàn và yêu thương.'}
        </p>

        {/* Khối giá tiền */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-pet-orange">
              {formatPrice(price)}
            </span>
            {/* Nếu sau này mock/API có thêm trường giảm giá */}
            {service.discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(service.originalPrice || price)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{displayCategoryName}</span>
        </div>

        {/* Khối nút bấm */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="w-full"
            onClick={() => navigate(`/spa/service/${service.id}`)}
            variant="outline"
          >
            Chi tiết
          </Button>
          <Button
            className="w-full"
            onClick={handleBooking}
          >
            Đặt lịch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;