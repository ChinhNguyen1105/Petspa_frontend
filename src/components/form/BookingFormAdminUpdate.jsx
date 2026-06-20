import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Notebook,
  CheckCircle2,
  Mail,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";

import { useServiceStore } from "../../store/serviceStore";
import { useUserStore } from "../../store/userStore";
import { usePetStore } from "../../store/petStore";
import { BOOKING_CONFIG } from "../../constants";

const BookingFormAdminUpdate = ({ initialData, onSubmit, onClose }) => {
  console.log("initial data thực tế:", initialData);

  // ─── STORE DATA ──────────────────────────────────────────────────────────────
  const { services, fetchServices } = useServiceStore();
  const { users, fetchUsers } = useUserStore();
  const { pets, fetchPetsByUser } = usePetStore();

  // ─── LOCAL STATE ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(!services?.length || !users?.length);
  const [currentStatus, setCurrentStatus] = useState("PENDING");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dữ liệu bóc tách từ initialData để hiển thị tĩnh
  const [formData, setFormData] = useState({
    userEmail: "",
    petName: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    note: "",
    serviceIds: [],
  });

  // ─── EFFECT 1: MASTER DATA FETCHING (CHỈ CHẠY 1 LẦN KHI MOUNT) ──────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const tasks = [];
        if (!services?.length) tasks.push(fetchServices());
        if (!users?.length) tasks.push(fetchUsers());
        await Promise.all(tasks);
      } catch (err) {
        console.error("Error initializing details component:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ─── EFFECT 2: FETCH PETS THEO USER (CHỈ CHẠY KHI USERID THAY ĐỔI) ──────────────
  const userId = initialData?.userId || initialData?.user?.id;
  useEffect(() => {
    if (userId) {
      fetchPetsByUser(userId).catch((err) =>
        console.error("Lỗi khi lấy danh sách thú cưng:", err),
      );
    }
  }, [userId]);

  // ─── EFFECT 3: ĐỒNG BỘ DATA KHI INITIALDATA HOẶC MASTER DATA SẴN SÀNG ──────────
  useEffect(() => {
    if (loading || !initialData) return;

    // 1. Tìm Email khách hàng
    let targetEmail = initialData?.user?.email || "";
    if (!targetEmail && userId && users.length > 0) {
      const userFound = users.find((u) => String(u.id) === String(userId));
      if (userFound) targetEmail = userFound.email;
    }

    // 2. Tìm tên Pet tương ứng trong danh sách pets
    let petId = initialData?.petId || initialData?.pet?.id;
    let targetPetName =
      initialData?.pet?.name || initialData?.petName || "Không rõ";
    if (petId && pets.length > 0) {
      const petFound = pets.find((p) => String(p.id) === String(petId));
      if (petFound) {
        targetPetName = `${petFound.name} (${petFound.specie || "Thú cưng"})`;
      }
    }

    // 3. Trích xuất danh sách Service IDs
    const rawServices =
      initialData?.bookingDetails ||
      initialData?.services ||
      initialData?.items ||
      [];
    const extractedServiceIds = rawServices.map((s) =>
      (s.serviceId || s.id).toString(),
    );

    setFormData({
      userEmail: targetEmail,
      petName: targetPetName,
      date: initialData?.bookingDate || "",
      timeStart: initialData?.startTime || "",
      timeEnd: initialData?.endTime || "",
      note: initialData?.note || "Không có ghi chú.",
      serviceIds: extractedServiceIds,
    });

    if (initialData?.status) {
      setCurrentStatus(initialData.status);
    }
  }, [initialData, users, pets, loading, userId]);

  // ─── DERIVED MEMOS ────────────────────────────────────────────────────────────
  const selectedServices = useMemo(() => {
    return services.filter((s) =>
      formData.serviceIds.includes(s.id.toString()),
    );
  }, [services, formData.serviceIds]);

  const totalAmount = useMemo(() => {
    return (
      initialData?.actualPrice ||
      selectedServices.reduce(
        (sum, s) => sum + (s.basePrice || s.price || 0),
        0,
      )
    );
  }, [selectedServices, initialData]);

  // ─── HANDLER CẬP NHẬT TRẠNG THÁI ──────────────────────────────────────────────
  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!initialData?.id) return;

    setIsSubmitting(true);
    try {
      // ✅ ĐỒNG BỘ VỚI COMPONENT CHA: Gửi payload chứa status mới lên hàm onSubmit ở BookingManagement
      if (onSubmit) {
        await onSubmit({ status: currentStatus });
      }
    } catch (error) {
      console.error("Cập nhật thất bại:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── RENDER LOADING ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-gray-500 animate-pulse">
        Đang tải thông tin lịch đặt...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleStatusUpdateSubmit}
      className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {/* CẬP NHẬT TRẠNG THÁI */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-3">
        <label className="block text-xs font-black text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={16} /> Quản lý trạng thái lịch hẹn{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(BOOKING_CONFIG).map(([statusKey, config]) => {
            const isSelected = currentStatus === statusKey;

            const colorMaps = {
              warning: "border-amber-400 text-amber-700 bg-amber-50",
              info: "border-blue-400 text-blue-700 bg-blue-50",
              success: "border-emerald-400 text-emerald-700 bg-emerald-50",
              danger: "border-red-400 text-red-700 bg-red-50",
            };
            const variantClass =
              colorMaps[config.variant] || "border-gray-400 text-gray-700";

            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => setCurrentStatus(statusKey)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  isSelected
                    ? `${variantClass} ring-2 ring-offset-1 ring-orange-400 shadow-sm font-black`
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 1. DỊCH VỤ ĐÃ CHỌN (READ-ONLY) */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
          1. Danh sách dịch vụ sử dụng
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedServices.map((s) => (
            <div
              key={s.id}
              className="px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 flex items-center gap-1"
            >
              • {s.name} ({s.durationMin}p)
            </div>
          ))}
          {selectedServices.length === 0 && (
            <span className="text-xs text-gray-400 italic">
              Không có dịch vụ nào được chỉ định
            </span>
          )}
        </div>
      </div>

      {/* 2. KHÁCH HÀNG & THÚ CƯNG (READ-ONLY) */}
      <div className="space-y-4 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">
          2. Thông tin khách hàng & Thú cưng
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
              <Mail size={12} /> Email khách hàng
            </span>
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
              {formData.userEmail || "N/A"}
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Tên khách hàng (Hệ thống)
            </span>
            <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-800">
              {initialData?.user?.name ||
                initialData?.userName ||
                "Khách vãng lai"}
            </div>
          </div>
        </div>

        <div>
          <span className="block text-xs font-bold text-gray-400 mb-1">
            Thú cưng nhận dịch vụ
          </span>
          <div className="p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700">
            {formData.petName}
          </div>
        </div>
      </div>

      {/* 3. NGÀY HẸN & KHUNG GIỜ (READ-ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Calendar size={14} /> 3. Ngày đặt lịch
          </label>
          <div className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            {formData.date}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Clock size={14} /> 4. Thời gian hẹn (Khung giờ)
          </label>
          <div className="p-3 bg-orange-500 text-white rounded-xl text-sm font-black flex items-center justify-between shadow-sm">
            <span>
              {formData.timeStart} – {formData.timeEnd}
            </span>
            <span className="text-[10px] bg-orange-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Cố định
            </span>
          </div>
        </div>
      </div>

      {/* GHI CHÚ (READ-ONLY) */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Notebook size={14} /> Ghi chú từ khách hàng
        </label>
        <div className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-600 whitespace-pre-wrap italic">
          {formData.note}
        </div>
      </div>

      {/* TỔNG TIỀN DOANH THU (READ-ONLY) */}
      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
          <CircleDollarSign size={14} /> Doanh thu hóa đơn:
        </span>
        <strong className="text-lg font-black text-zinc-800">
          {totalAmount.toLocaleString("vi-VN")} đ
        </strong>
      </div>

      {/* FOOTER ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Đóng lại
        </button>
        <button
          type="submit"
          disabled={isSubmitting || currentStatus === initialData?.status}
          className="px-5 py-2 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-opacity-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Đang cập nhật..." : "Lưu trạng thái mới"}
        </button>
      </div>
    </form>
  );
};

export default BookingFormAdminUpdate;
