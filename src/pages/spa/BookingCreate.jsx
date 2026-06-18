import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { CalendarClock, CheckCircle, AlertCircle, Sparkles, ShoppingBag, Loader2 } from "lucide-react";

import Modal from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import PaymentModal from "../../components/common/PaymentModal";
import BookingForm from "../../components/form/BookingForm";
import ServiceCard from "../../components/ui/ServiceCard";

import { useAuthStore } from "../../store/authStore";
import { useServiceStore } from "../../store/serviceStore";
import { usePetStore } from "../../store/petStore";
import { useBookingStore } from "../../store/bookingStore";
import useRecommendationStore from "../../store/apioriStore";
import { SLOT_TIMES } from "../../constants";

const BookingCreate = () => {
  const navigate = useNavigate();
  const { id: serviceIdFromParams } = useParams();
  const [searchParams] = useSearchParams();

  const initialServiceId = (
    serviceIdFromParams ||
    searchParams.get("serviceId") ||
    ""
  ).toString();

  // ─── STORES ───
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { services, fetchServices, loading: loadingServices } = useServiceStore();
  const { myPets, fetchMyPets, loading: loadingPets } = usePetStore();

  const {
    bookings,
    fetchBookings,
    submitting,
    createBooking,
    unavailableSlots,
    loadingSlots,
    fetchUnavailableSlots,
  } = useBookingStore();

  const {
    productRecommendations: serviceRecommendations,
    fetchProductRecommendations: fetchServiceRecommendations,
    loading: recLoading,
    error: recError,
  } = useRecommendationStore();

  // ─── LOCAL STATE ───
  const [slots, setSlots] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBookingData, setCreatedBookingData] = useState(null);
  const [errors, setErrors] = useState({});
  const [recommendedList, setRecommendedList] = useState([]);

  const [formData, setFormData] = useState({
    serviceIds: initialServiceId ? [initialServiceId] : [],
    petId: "",
    date: "",
    time: "",
    note: "",
  });

  // ─── DERIVED ───
  const servicesReady = services?.length > 0;
  const bookingsReady = bookings?.length > 0;

  const selectedServices = services.filter((s) =>
    formData.serviceIds.includes(s.id.toString())
  );

  const totalDuration =
    selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0) || 30;
  const totalAmount = selectedServices.reduce(
    (sum, s) => sum + (s.basePrice || 0),
    0
  );
  const slotsNeeded = Math.ceil(totalDuration / 30);

  // ─── HELPER: tính endTime ───
  const computeEndTime = useCallback(
    (startTime) => {
      if (!startTime) return undefined;
      const [h, m] = startTime.split(":").map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + totalDuration;
      const endH = Math.floor(endMinutes / 60) % 24;
      const endM = endMinutes % 60;
      return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    },
    [totalDuration]
  );

  // ─── FETCH INITIAL DATA ───
  useEffect(() => {
    fetchServices();
    fetchMyPets({ keyword: "", speciesId: null, gender: null, ownerId: null });
    if (!bookings?.length && typeof fetchBookings === "function") {
      fetchBookings({ page: 1, pageSize: 10 });
    }
  }, [fetchServices, fetchMyPets, bookings, fetchBookings]);

  // ─── APRIORI: extract service IDs from booking history → fetch recommendations ───
  useEffect(() => {
    if (!bookingsReady) return;
    const serviceIds = Array.from(
      new Set(
        bookings
          .flatMap((booking) => {
            const items = booking.bookingDetails || booking.services || booking.items || [];
            return items.map((item) => item.serviceId || item.service?.id || item.id);
          })
          .filter(Boolean)
      )
    );
    if (serviceIds.length > 0) {
      fetchServiceRecommendations(serviceIds).catch((err) =>
        console.error("[APRIORI ERROR]:", err)
      );
    }
  }, [bookingsReady, fetchServiceRecommendations]);

  // ─── APRIORI: map recommendation IDs → service objects ───
  useEffect(() => {
    if (!serviceRecommendations?.length || !servicesReady) return;
    const mapped = serviceRecommendations
      .map((id) => services.find((s) => String(s.id) === String(id)))
      .filter(Boolean)
      .slice(0, 4);
    setRecommendedList(mapped);
  }, [serviceRecommendations, servicesReady, services]);

  // ─── DATE CHANGE: reset time, fetch unavailable slots ───
  useEffect(() => {
    if (!formData.date) {
      // Không có ngày → hiển thị toàn bộ slot trống
      setSlots(
        SLOT_TIMES.map((slot) => ({
          start_time: slot.startTime,
          end_time: slot.endTime,
          available: true,
          reason: null,
        }))
      );
      return;
    }

    // Reset time trước khi fetch — tránh inBlock stale khi unavailableSlots chưa về
    setFormData((prev) => ({ ...prev, time: "" }));
    fetchUnavailableSlots({ date: formData.date });
  }, [formData.date, fetchUnavailableSlots]);

  // ─── SERVICE CHANGE: reset time khi duration thay đổi ───
  useEffect(() => {
    setFormData((prev) => (prev.time ? { ...prev, time: "" } : prev));
  }, [slotsNeeded]);

  // ─── SYNC slots với unavailableSlots từ backend ───
  // FIX: reset time TRƯỚC khi cập nhật slots, đảm bảo inBlock không còn stale
  useEffect(() => {
  if (!formData.date) return;

  setFormData((prev) => ({ ...prev, time: "" }));

  // FIX: mark unavailable tất cả slot bị overlap với booking [startTime, endTime]
  const mappedSlots = SLOT_TIMES.map((slot) => {
    const isBooked = (unavailableSlots || []).some((booking) => {
      // Slot bị block nếu slot.startTime < booking.endTime VÀ slot.endTime > booking.startTime
      return slot.startTime < booking.endTime && slot.endTime > booking.startTime;
    });

    return {
      start_time: slot.startTime,
      end_time: slot.endTime,
      available: !isBooked,
      reason: isBooked ? "BOOKED" : null,
    };
  });

  setSlots(mappedSlots);
}, [unavailableSlots]);  // formData.date KHÔNG vào dep — chỉ trigger khi server trả data về

  // ─── SLOT VALIDATION ───
  const checkConsecutiveSlots = useCallback(
    (startIndex) => {
      if (startIndex < 0 || startIndex + slotsNeeded > slots.length) {
        return { available: false, reason: "OVER_WORKING_HOURS" };
      }
      for (let i = 0; i < slotsNeeded; i++) {
        const slot = slots[startIndex + i];
        if (!slot?.available) {
          return {
            available: false,
            reason: i === 0
              ? slot.reason || "BOOKED"
              : "INSUFFICIENT_CONSECUTIVE_SLOTS",
          };
        }
      }
      return { available: true };
    },
    [slots, slotsNeeded]
  );

  // ─── SELECT SLOT ───
  const handleSelectSlot = (slot, index) => {
    const result = checkConsecutiveSlots(index);
    if (result.available) {
      setFormData((prev) => ({ ...prev, time: slot.start_time }));
    }
  };

  // ─── AUTO-SELECT: chọn slot khả dụng đầu tiên sau khi slots cập nhật ───
  useEffect(() => {
    if (!formData.date) return;
    if (!formData.serviceIds.length) return;
    if (formData.time) return;   // đã có time → không override
    if (!slots.length) return;

    for (let i = 0; i < slots.length; i++) {
      const result = checkConsecutiveSlots(i);
      if (result.available) {
        setFormData((prev) => ({ ...prev, time: slots[i].start_time }));
        break;
      }
    }
  }, [slots, slotsNeeded, formData.date, formData.serviceIds, formData.time, checkConsecutiveSlots]);

  // ─── SERVICE TOGGLE ───
  const handleServiceToggle = (id) => {
    setFormData((prev) => {
      const strId = id.toString();
      const newServiceIds = prev.serviceIds.includes(strId)
        ? prev.serviceIds.filter((i) => i !== strId)
        : [...prev.serviceIds, strId];
      return { ...prev, serviceIds: newServiceIds, time: "" };
    });
  };

  const handleSelectRecommendedService = (id) => {
    handleServiceToggle(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── SUBMIT ───
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrors({});

    if (!formData.serviceIds.length) {
      setErrors({ submit: "Vui lòng chọn ít nhất một dịch vụ." });
      return;
    }
    if (!formData.petId) {
      setErrors({ submit: "Vui lòng chọn thú cưng." });
      return;
    }
    if (!formData.date) {
      setErrors({ submit: "Vui lòng chọn ngày." });
      return;
    }
    if (!formData.time) {
      setErrors({ submit: "Vui lòng chọn giờ." });
      return;
    }

    try {
      const payload = {
        userId: user?.id,
        serviceIds: formData.serviceIds.map((id) => Number(id)),
        petId: Number(formData.petId),
        bookingDate: formData.date,
        startTime: formData.time,
        endTime: computeEndTime(formData.time),
        note: formData.note,
        durationMinutes: totalDuration,
      };

      const response = await createBooking(payload);

      if (response?.success !== false && response?.data) {
        setCreatedBookingData({ id: response.data?.id, amount: totalAmount });
        setIsPaymentModalOpen(true);
      } else {
        setErrors({ submit: response?.message || "Hệ thống từ chối tạo lịch hẹn." });
      }
    } catch {
      setErrors({ submit: "Đã xảy ra lỗi hệ thống. Xin thử lại sau!" });
    }
  };

  const isRecLoading = recLoading && recommendedList.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8">
          <h1 className="text-2xl font-black text-pet-blue mb-6 flex items-center gap-2">
            <CalendarClock size={28} /> Đặt lịch Spa
          </h1>

          {errors.submit && (
            <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={18} /> {errors.submit}
            </div>
          )}

          <BookingForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            services={services}
            pets={myPets}
            slots={slots}
            loadingSlots={loadingSlots}
            isAuthenticated={isAuthenticated}
            handleServiceToggle={handleServiceToggle}
            handleSelectSlot={handleSelectSlot}
            checkConsecutiveSlots={checkConsecutiveSlots}
            slotsNeeded={slotsNeeded}
            totalDuration={totalDuration}
            totalAmount={totalAmount}
            onSubmit={handleSubmit}
            submitting={submitting}
            loading={loadingServices || loadingPets}
          />
        </div>

        {/* APRIORI RECOMMENDATION BLOCK */}
        {isRecLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2 bg-white rounded-3xl border border-gray-100">
            <Loader2 className="animate-spin text-pet-blue" size={28} />
            <p className="text-xs font-medium">Đang tìm các dịch vụ phù hợp đi kèm...</p>
          </div>
        ) : recommendedList.length > 0 ? (
          <div className="bg-gradient-to-b from-blue-50/40 to-transparent p-6 rounded-3xl border border-blue-50/60 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-left">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl animate-pulse">
                  <Sparkles size={18} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-800 uppercase tracking-tight">
                    Dịch vụ thường được đặt kèm
                  </h2>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Gợi ý thông minh dựa trên thói quen chăm sóc của bạn
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-pet-blue bg-blue-50 px-2.5 py-1.5 rounded-full">
                <ShoppingBag size={12} />
                <span>Apriori AI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedList.map((service) => (
                <div key={service.id} className="relative group scale-95 hover:scale-100 transition-transform duration-300">
                  <div className="absolute -top-1.5 -left-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider">
                    Gợi ý đặt kèm ✨
                  </div>
                  <ServiceCard
                    service={service}
                    onBookingClick={() => handleSelectRecommendedService(service.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Success Modal */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => navigate("/profile")}>
        <div className="text-center p-4">
          <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Đặt lịch thành công!</h3>
          <Button onClick={() => navigate("/profile")} className="w-full">
            Xem lịch
          </Button>
        </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={createdBookingData}
        onPaymentSuccess={() => {
          setIsPaymentModalOpen(false);
          setIsSuccessModalOpen(true);
        }}
      />
    </div>
  );
};

export default BookingCreate;