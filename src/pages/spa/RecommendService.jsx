import React, { useEffect, useState, useRef } from "react";
import { Sparkles, ShoppingBag, Loader2, Plus } from "lucide-react";

import { useServiceStore } from "../../store/serviceStore";
import useRecommendationStore from "../../store/apioriStore";

const RecommendedServices = ({
  maxItems = 4,
  currentCartIds = [],
  onServiceSelect,
}) => {
  // ================= STORE CONNECTIONS =================
  const { services, fetchServices, loading: servLoading } = useServiceStore();
  const {
    serviceRecommendations,
    fetchServiceRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  const [recommendedList, setRecommendedList] = useState([]);

  // Ref lưu cache chuỗi IDs để ngăn chặn việc re-render gọi API vô hạn
  const lastFetchedIdsRef = useRef("");

  const servicesReady = services?.length > 0;

  /* =====================================================
  | STEP 1: LOAD NỀN TẢNG DỊCH VỤ HỆ THỐNG
  ===================================================== */
  useEffect(() => {
    if (!services?.length) {
      fetchServices({ page: 1, pageSize: 50 });
    }
  }, [services?.length, fetchServices]);

  /* =====================================================
  | STEP 2: PIPELINE APRIORI - CHỈ CHẠY KHI GIỎ HÀNG CÓ PHẦN TỬ
  ===================================================== */
  useEffect(() => {
    // SỬA LỖI: Nếu giỏ hàng trống -> Xóa sạch danh sách hiển thị và dừng luôn luồng xử lý
    if (!currentCartIds || currentCartIds.length === 0) {
      setRecommendedList([]);
      lastFetchedIdsRef.current = "";
      return;
    }

    const cleanServiceIds = Array.from(new Set(currentCartIds))
      .filter(Boolean)
      .map(Number);

    if (!cleanServiceIds.length) return;

    // Chống spam gọi trùng lặp API liên tục
    const currentIdsString = cleanServiceIds.sort().join(",");
    if (lastFetchedIdsRef.current === currentIdsString) return;

    lastFetchedIdsRef.current = currentIdsString;

    // Gửi mảng ID đang chọn đi phân tích kết hợp Apriori
    fetchServiceRecommendations(cleanServiceIds).catch((err) =>
      console.error("[APRIORI CORE PIPELINE ERROR]:", err),
    );
  }, [currentCartIds, fetchServiceRecommendations]);

  /* =====================================================
  | STEP 3: MAPPING ĐỒNG BỘ ĐẦU RA (KHÔNG CÓ FALLBACK MỒI)
  ===================================================== */
  useEffect(() => {
    // SỬA LỖI: Giỏ hàng trống hoặc API không có gợi ý phù hợp -> Ẩn toàn bộ, không lấy mồi mặc định
    if (
      !currentCartIds.length ||
      !serviceRecommendations?.length ||
      !servicesReady
    ) {
      setRecommendedList([]);
      return;
    }

    const mapped = serviceRecommendations
      .map((id) => services.find((s) => String(s.id) === String(id)))
      .filter(Boolean)
      .slice(0, maxItems);

    setRecommendedList(mapped);
  }, [
    serviceRecommendations,
    services,
    servicesReady,
    maxItems,
    currentCartIds.length,
  ]);

  /* =====================================================
  | LOADING & ERROR STATES
  ===================================================== */
  const isLoading = (recLoading || servLoading) && recommendedList.length === 0;

  if (recError) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3 bg-white border border-gray-100 rounded-3xl mb-8">
        <Loader2 className="animate-spin text-blue-500" size={28} />
        <p className="text-xs font-semibold text-gray-500">
          Đang tìm kiếm dịch vụ đi kèm phù hợp...
        </p>
      </div>
    );
  }

  // Nếu không chọn dịch vụ hoặc không có gợi ý thỏa mãn luật kết hợp -> Trả về null ẩn giao diện
  if (!recommendedList.length) return null;

  // ================= MAIN RENDER =================
  return (
    <div className="my-8 bg-slate-50/50 p-6 rounded-3xl border border-gray-100 text-left">
      {/* Header tối giản chuyên nghiệp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg shrink-0">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-tight">
              Gợi ý trải nghiệm cùng dịch vụ bạn chọn
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">
              Các dịch vụ thường được khách hàng đặt cùng nhau để đạt hiệu quả
              tốt nhất
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full w-fit">
          <ShoppingBag size={11} />
          <span>Apriori System</span>
        </div>
      </div>

      {/* Grid danh sách Thẻ dịch vụ thiết kế tối giản mới */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendedList.map((service) => {
          // Kiểm tra xem dịch vụ gợi ý này đã được người dùng chọn trên form hay chưa
          const isSelected =
            currentCartIds.includes(String(service.id)) ||
            currentCartIds.includes(service.id);

          return (
            <div
              key={service.id}
              className={`flex flex-col justify-between bg-white p-4 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? "border-green-200 bg-green-50/10 cursor-not-allowed opacity-80"
                  : "border-gray-100 shadow-sm hover:border-gray-300 hover:shadow"
              }`}
            >
              {/* Phần thông tin chính */}
              <div>
                <span className="inline-block text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase mb-2">
                  Gợi ý thêm
                </span>
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                  {service.name || service.serviceName}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium mt-1">
                  Thời gian:{" "}
                  {service.durationMin || service.durationMinutes || 30} phút
                </p>
              </div>

              {/* Phần giá & nút hành động */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-sm font-black text-orange-500">
                  {(service.basePrice || 0).toLocaleString("vi-VN")}đ
                </span>

                <button
                  type="button"
                  disabled={isSelected}
                  onClick={
                    onServiceSelect
                      ? () => onServiceSelect(service.id)
                      : undefined
                  }
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-green-50 text-green-600"
                      : "bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  {isSelected ? (
                    <span>Đã chọn</span>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Thêm</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedServices;
