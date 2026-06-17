import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Heart, ArrowLeft, CalendarCheck
} from 'lucide-react';

import { useServiceStore } from '../../store/serviceStore';
import { useReviewStore } from '../../store/reviewStore';

import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatPrice } from '../../utils/formatPrice';
import ReviewService from '../review/ReviewService';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState('');
  const fallbackDefaultImg = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800';

  const {
    currentService,
    loading: loadingService,
    fetchServiceById,
    clearCurrentService,
  } = useServiceStore();

  const {
    reviews,
    loading: loadingReviews,
    fetchServiceReviews,
    resetReviews,
  } = useReviewStore();

  // 1. Fetch chi tiết dịch vụ & dọn dẹp khi Unmount
  useEffect(() => {
    if (id) {
      fetchServiceById(id);
      fetchServiceReviews(id);
    }
    
    return () => {
      clearCurrentService();
      resetReviews();
    };
  }, [id, fetchServiceById, fetchServiceReviews, clearCurrentService, resetReviews]);

  console.log("current service: ", currentService);
  // 2. Thu gom mảng hình ảnh từ API mới (Ưu tiên đưa ảnh thumbnail lên đầu)
  const allImages = React.useMemo(() => {
    if (!currentService?.serviceImages || !Array.isArray(currentService.serviceImages)) return [];
    
    const images = [...currentService.serviceImages];
    images.sort((a, b) => (b.isThumbnail ? 1 : 0) - (a.isThumbnail ? 1 : 0));
    
    return images.map(img => img.imageUrl).filter(Boolean);
  }, [currentService]);

  // 3. Theo dõi đặt ảnh hoạt động đầu tiên
  useEffect(() => {
    setActiveImage(allImages.length > 0 ? allImages[0] : fallbackDefaultImg);
  }, [allImages]);

  const handleBookingRedirect = () => {
    if (currentService?.id) {
      navigate(`/spa/booking/create?serviceId=${currentService.id}`);
    }
  };

  if (loadingService) return <Loading fullScreen />;

  if (!currentService) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20 text-center">
        <p className="text-gray-500 font-medium mb-4">
          Không tìm thấy thông tin dịch vụ yêu cầu.
        </p>
        <Button onClick={() => navigate('/spa')}>Xem tất cả dịch vụ</Button>
      </div>
    );
  }

  // 4. Đồng bộ các hằng số hiển thị từ API mới
  const displayCategoryName = currentService.categoryName || "Dịch vụ Spa";
  const displayRating = currentService.averageRating !== null && currentService.averageRating !== undefined 
    ? currentService.averageRating.toFixed(1) 
    : "4.5";
  const displayTotalReviews = currentService.totalReviews !== undefined 
    ? currentService.totalReviews 
    : (reviews?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-4 md:px-10 max-w-5xl">

        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-pet-blue mb-6 font-bold text-sm transition-colors cursor-pointer bg-transparent border-none outline-none"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại trang trước
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">

          {/* CỘT TRÁI: KHỐI ALBUM ẢNH */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
              <img
                src={activeImage}
                alt={currentService.name}
                className="w-full h-full object-cover transition-all duration-300 transform hover:scale-105"
                onError={(e) => {
                  if (e.target.src !== fallbackDefaultImg) {
                    e.target.src = fallbackDefaultImg;
                  }
                }}
              />
            </div>

           {allImages.length > 1 && (
  <div 
    className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar cursor-grab active:cursor-grabbing select-none"
    onMouseDown={(e) => {
      const container = e.currentTarget;
      container.dataset.isDown = "true";
      container.dataset.startX = String(e.pageX - container.offsetLeft);
      container.dataset.scrollLeft = String(container.scrollLeft);
    }}
    onMouseLeave={(e) => {
      e.currentTarget.dataset.isDown = "false";
    }}
    onMouseUp={(e) => {
      e.currentTarget.dataset.isDown = "false";
    }}
    onMouseMove={(e) => {
      const container = e.currentTarget;
      if (container.dataset.isDown !== "true") return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - Number(container.dataset.startX)) * 1.5; // Tốc độ lướt (1.5)
      container.scrollLeft = Number(container.dataset.scrollLeft) - walk;
    }}
  >
    {allImages.map((imgUrl, idx) => (
      <div
        key={idx}
        onClick={() => setActiveImage(imgUrl)}
        className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-gray-50 ${
          activeImage === imgUrl
            ? 'border-pet-blue scale-[0.95] shadow-md'
            : 'border-transparent opacity-70 hover:opacity-100'
        }`}
      >
        <img
          src={imgUrl}
          alt={`gallery-thumb-${idx}`}
          className="w-full h-full object-cover pointer-events-none" // Chặn hành vi kéo ảnh mặc định của trình duyệt
          onError={(e) => { e.target.src = fallbackDefaultImg; }}
        />
      </div>
    ))}
  </div>
)}</div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-blue-50 text-pet-blue rounded-xl text-xs font-bold uppercase tracking-wider">
                {displayCategoryName}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight">
                {currentService.name}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-gray-800 font-bold">
                    {displayRating}
                  </span>
                  <span className="text-gray-400">
                    ({displayTotalReviews} đánh giá)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <span className="text-3xl font-black text-pet-orange">
                  {formatPrice(currentService.basePrice || 0)}
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {currentService.description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp chuẩn chất lượng.'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                  <Clock size={18} className="text-pet-blue" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      Thời gian ước tính
                    </p>
                    <p className="font-bold text-gray-800">
                      {currentService.durationMin || 0} phút
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                  <Heart size={18} className="text-red-400 fill-red-100" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      Thích hợp cho
                    </p>
                    <p className="font-bold text-gray-800">
                      Chó, Mèo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Button
                onClick={handleBookingRedirect}
                className="w-full !py-4 text-base font-bold rounded-2xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <CalendarCheck size={18} /> ĐẶT LỊCH HẸN NGAY
              </Button>
            </div>
          </div>
        </div>

        {/* KHU VỰC ĐÁNH GIÁ (REVIEW) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            {loadingReviews ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-center py-8">
                <Loading />
              </div>
            ) : (
              <ReviewService reviews={reviews || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;