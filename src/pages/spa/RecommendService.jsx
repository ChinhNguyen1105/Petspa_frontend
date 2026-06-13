import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, Loader2 } from 'lucide-react';

import ServiceCard from '../../components/ui/ServiceCard';
import { useBookingStore } from '../../store/bookingStore';
import { useServiceStore } from '../../store/serviceStore';
import useRecommendationStore from '../../store/apioriStore';

const RecommendedServices = ({ maxItems = 4 }) => {
  // ================= STORE (SYNCHRONIZED) =================
  const { bookings, fetchBookings } = useBookingStore();

  const {
    productRecommendations: serviceRecommendations, // Định danh lại mảng ID trả về từ Apriori cho rõ nghĩa dịch vụ
    fetchProductRecommendations: fetchServiceRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  const {
    services,
    fetchServices,
    loading: servLoading,
  } = useServiceStore();

  const [recommendedList, setRecommendedList] = useState([]);

  // 🔥 KHỞI TẠO GUARD READY STATE ĐỂ ĐỒNG BỘ FLOW TUẦN TỰ
  const servicesReady = services?.length > 0;
  const bookingsReady = bookings?.length > 0;

  /* =====================================================
  | STEP 1: LOAD BOOKINGS (SAFE DEBUG)
  ===================================================== */
  useEffect(() => {
    console.log("[STEP 1] bookings state:", bookings);

    if (!bookings?.length) {
      console.log("[STEP 1] fetching bookings...");
      // Đồng bộ theo tham số cấu hình phân trang của Store
      fetchBookings({ page: 1, pageSize: 10 });
    }
  }, [bookings, fetchBookings]);

  /* =====================================================
  | STEP 2: EXTRACT SERVICE IDS + CALL RECOMENDATION API
  ===================================================== */
  useEffect(() => {
    if (!bookingsReady) {
      console.log("[STEP 2] skip - bookings not ready yet");
      return;
    }

    console.log("[STEP 2] bookings changed & ready:", bookings);

    const serviceIds = Array.from(
      new Set(
        bookings
          .flatMap(booking => {
            // Quét và bóc tách toàn bộ các trường hợp mảng chứa dịch vụ trong dữ liệu lịch đặt
            const items =
              booking.bookingDetails ||
              booking.services ||
              booking.items ||
              [];

            return items.map(item =>
              item.serviceId ||
              item.service?.id ||
              item.id
            );
          })
          .filter(Boolean)
      )
    );

    console.log("[STEP 2] extracted serviceIds:", serviceIds);

    if (!serviceIds.length) {
      console.warn("[STEP 2] NO SERVICE IDS → SKIP RECOMMENDATION API");
      return;
    }

    console.log("[STEP 2] calling recommendation API...");

    fetchServiceRecommendations(serviceIds)
      .then(res => console.log("[STEP 2] API SUCCESS:", res))
      .catch(err => console.error("[STEP 2] API ERROR:", err));
  }, [bookingsReady]);

  /* =====================================================
  | STEP 3: LOAD ALL SERVICES
  ===================================================== */
  useEffect(() => {
    console.log("[STEP 3] services state:", services);

    if (!services?.length) {
      console.log("[STEP 3] fetching services...");
      // Đồng bộ gọi danh sách tất cả dịch vụ hiện có
      fetchServices({ page: 1, pageSize: 50 });
    }
  }, [services, fetchServices]);

  /* =====================================================
  | STEP 4: MAP RECOMMENDATIONS → SERVICES (SAFE STRING MATCH)
  ===================================================== */
  useEffect(() => {
    console.log("[STEP 4] serviceRecommendations:", serviceRecommendations);
    console.log("[STEP 4] services state ready:", servicesReady);

    if (!serviceRecommendations?.length || !servicesReady) {
      console.warn("[STEP 4] waiting for recommendations or services list...");
      return;
    }

    // 🔥 FIX LỖI MAPPING SAI KIỂU DỮ LIỆU: Ép toàn bộ về String để tránh lệch kiểu số (Long) và chuỗi
    const mapped = serviceRecommendations
      .map(id => services.find(s => String(s.id) === String(id)))
      .filter(Boolean)
      .slice(0, maxItems);

    console.log("[STEP 4] mapped service result successfully:", mapped);

    setRecommendedList(mapped);
  }, [serviceRecommendations, servicesReady, maxItems]);

  /* =====================================================
  | LOADING STATE (DEBUG SAFE)
  ===================================================== */
  const isLoading =
    (recLoading || servLoading) &&
    recommendedList.length === 0;

  if (recError) {
    console.error("[SERVICE RECOMMENDATION ERROR]:", recError);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin text-pet-blue" size={32} />
        <p className="text-sm font-medium">
          Đang tính toán dịch vụ phù hợp cho thú cưng của bạn...
        </p>
      </div>
    );
  }

  /* =====================================================
  | EMPTY STATE
  ===================================================== */
  if (!recommendedList.length) {
    console.warn("[FINAL] recommendedServiceList is empty");
    return null;
  }

  // ================= MAIN RENDER =================
  return (
    <div className="my-10 bg-gradient-to-b from-blue-50/40 to-transparent p-6 rounded-3xl border border-blue-50/60">
      
      {/* Tiêu đề Khối Gợi Ý Dịch Vụ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 text-left">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl animate-pulse">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
              Dịch vụ thường được trải nghiệm cùng
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Gợi ý thông minh dựa trên thói quen chăm sóc thú cưng của bạn
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs font-bold text-pet-blue bg-blue-50 px-3 py-1.5 rounded-full">
          <ShoppingBag size={13} />
          <span>Apriori System</span>
        </div>
      </div>

      {/* Danh sách lưới dịch vụ gợi ý đặc quyền */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {recommendedList.map((service) => (
          <div key={service.id} className="relative group">
            {/* Nhãn Đánh Dấu Gợi Ý Trải Nghiệm */}
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-sm z-10 uppercase tracking-wider flex items-center gap-1">
              Gợi ý đặt kèm ✨
            </div>
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedServices;