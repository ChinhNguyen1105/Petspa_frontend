import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Tag, ShieldAlert, CheckCircle2, Heart,
  ArrowLeft, CalendarCheck, User2
} from 'lucide-react';

import { useServiceStore } from '../../store/serviceStore';
import { useReviewStore } from '../../store/reviewStore';

import { Button } from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatPrice } from '../../utils/formatPrice';

// IMPORT COMPONENT ĐÃ TÁI SỬ DỤNG TẠI ĐÂY
// (Hãy điều chỉnh đường dẫn ../ cho đúng vị trí file ReviewProduct bạn lưu)
import ReviewService from '../review/ReviewService';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState('');

  const {
    currentService,
    loading: loadingService,
    fetchServiceById,
    clearCurrentService,
  } = useServiceStore();

  const {
    reviews,
    loading: loadingReviews,
    getServiceReviews,
    clearReviews,
  } = useReviewStore();
  
  console.log("review service: ", reviews);

  // Fetch chi tiết dịch vụ
  useEffect(() => {
    if (id) fetchServiceById(id);
    return () => {
      clearCurrentService();
      clearReviews();
    };
  }, [id]);

  // Fetch reviews riêng theo serviceId
  useEffect(() => {
    if (id) getServiceReviews(id);
  }, [id]);

  // Gom danh sách ảnh
  const allImages = currentService
    ? [
        (currentService.serviceImages?.find((img) => img.isThumbnail) ||
          currentService.serviceImages?.[0])?.imageUrl,
        ...(currentService.serviceImages?.map((img) => img.imageUrl) || []),
        currentService.thumbnailUrl || currentService.thumbnailURL,
        ...(currentService.imagesUrls || []),
        ...(currentService.images || []),
      ]
        .filter(Boolean)
        .filter((v, i, self) => self.indexOf(v) === i)
    : [];

  useEffect(() => {
    setActiveImage(allImages.length > 0 ? allImages[0] : '');
  }, [currentService]);

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

  return (
    <div className="min-h-screen bg-gray-50/50 pt-10 pb-20 text-left">
      <div className="container mx-auto px-10 max-w-5xl">

        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-pet-blue mb-6 font-bold text-sm transition-colors cursor-pointer bg-transparent border-none outline-none"
        >
          <ArrowLeft size={18} className="mr-2" /> Quay lại trang trước
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">

          {/* CỘT TRÁI: GALLERY */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
              <img
                src={activeImage || 'https://placehold.co/500x500'}
                alt={currentService.name}
                className="w-full h-full object-cover transition-all duration-300 transform hover:scale-105"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
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
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {(currentService.categoryName || currentService.category?.name) && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-pet-blue rounded-xl text-xs font-bold uppercase tracking-wider">
                  {currentService.categoryName || currentService.category?.name}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight">
                {currentService.name}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-gray-800 font-bold">
                    {currentService.averageRating || 5}
                  </span>
                  <span className="text-gray-400">
                    ({reviews.length} đánh giá)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <span className="text-3xl font-black text-pet-orange">
                  {formatPrice(currentService.basePrice || currentService.price || 0)}
                </span>
                {currentService.discountPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through font-medium">
                      {formatPrice(currentService.originalPrice || 0)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-500 rounded-lg font-bold flex items-center gap-0.5">
                      <Tag size={12} /> Giảm {currentService.discountPercent}%
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {currentService.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                  <Clock size={18} className="text-pet-blue" />
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      Thời gian ước tính
                    </p>
                    <p className="font-bold text-gray-800">
                      {currentService.durationMin || currentService.durationMinutes || 45} phút
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
                      {currentService.suitableFor
                        ? currentService.suitableFor
                            .map((item) => (item === 'Dog' ? 'Chó' : 'Mèo'))
                            .join(', ')
                        : 'Chó, Mèo'}
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          <div className="md:col-span-8 space-y-8">
            {currentService.includedServices?.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-base font-black text-gray-800 flex items-center gap-2 border-b pb-3 border-gray-50">
                  <CheckCircle2 size={18} className="text-green-500" /> Các bước chăm sóc đi kèm trong gói
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentService.includedServices.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-100 text-sm text-gray-700 font-bold"
                    >
                      <span className="w-5 h-5 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-xs font-black">
                        {idx + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── KHU VỰC ĐÁNH GIÁ ĐÃ ĐƯỢC THAY THẾ BẰNG COMPONENT REUSE ── */}
            {loadingReviews ? (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-center py-8">
                <Loading />
              </div>
            ) : (
              <ReviewService reviews={reviews} />
            )}
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;