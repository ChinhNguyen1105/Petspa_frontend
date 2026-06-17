import React from "react";
import { Star } from "lucide-react";
import { Button } from "../../components/common/Button";
import { formatPrice } from "../../utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { useCategoryStore } from "../../store/categoryStore"; // Đảm bảo đúng đường dẫn store của bạn

const ServiceCard = ({ service, onBookingClick }) => {
  const navigate = useNavigate();

  // 1. Kiểm tra dữ liệu service đầu vào
  if (!service) return null;

  const {
    id,
    name,
    description,
    basePrice,
    durationMin,
    averageRating,
    categoryName,
    categoryId, // Lấy thêm categoryId để mapping dữ liệu từ store
    serviceImages = [],
  } = service;

  // 2. Kết nối Zustand store: Tìm category tương ứng dựa trên categoryId
  const storeCategoryName = useCategoryStore((state) => {
    const foundCategory = state.categories.find((c) => c.id === categoryId);
    return foundCategory?.name || foundCategory?.title; // fallback phòng trường hợp backend trả về key 'title' thay vì 'name'
  });

  // 3. Xử lý logic sự kiện Đặt lịch
  const handleBooking = () => {
    if (typeof onBookingClick === "function") {
      return onBookingClick();
    }
    navigate(`/spa/booking/create?serviceId=${id}`);
  };

  // 4. Tìm ảnh thumbnail hoặc ảnh đầu tiên từ mảng có sẵn trong service
  const thumbnailImg = serviceImages.find((img) => img.isThumbnail)?.imageUrl;
  const firstImg = serviceImages[0]?.imageUrl;
  const fallbackDefaultImg = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800";
  const displayImage = thumbnailImg || firstImg || fallbackDefaultImg;

  // 5. Xác định tên danh mục: Ưu tiên API service -> Store -> Fallback mặc định
  const displayCategoryName = categoryName || storeCategoryName || "Dịch vụ Spa";
  
  const displayRating =
    averageRating !== null && averageRating !== undefined
      ? averageRating.toFixed(1)
      : "4.8";

  return (
    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left">
      {/* Khối hình ảnh */}
      <div className="relative overflow-hidden h-64 bg-gray-100">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== fallbackDefaultImg) {
              e.target.src = fallbackDefaultImg;
            }
          }}
        />
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-2xl rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          {displayCategoryName}
        </div>
      </div>

      {/* Khối nội dung */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs uppercase tracking-[0.18em] font-bold text-pet-orange">
            {durationMin || 0} phút
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
            <Star size={16} className="fill-yellow-500" />
            {displayRating}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-tight mb-3 line-clamp-1">
          {name}
        </h3>
        
        <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3 flex-grow">
          {description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp, chuẩn an toàn và yêu thương.'}
        </p>

        {/* Khối giá tiền */}
        <div className="flex items-center justify-between gap-4 mb-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-pet-orange">
              {formatPrice(basePrice || 0)}
            </span>
          </div>
          <span className="text-sm text-gray-500 max-w-[120px] truncate">
            {displayCategoryName}
          </span>
        </div>

        {/* Khối nút bấm */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="w-full"
            onClick={() => navigate(`/spa/service/${id}`)}
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