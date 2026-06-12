import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { CalendarClock, CheckCircle, AlertCircle } from "lucide-react";

import Modal from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import PaymentModal from "../../components/common/PaymentModal";
import BookingForm from "../../components/form/BookingForm";

import { useAuthStore } from "../../store/authStore";
import { useServiceStore } from "../../store/serviceStore";
import { usePetStore } from "../../store/petStore";
import { useBookingStore } from "../../store/bookingStore";

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
  const { services, fetchServices, loading: loadingServices } = useServiceStore();
  const { pets, fetchPets, loading: loadingPets } = usePetStore();
  
  const { 
    submitting, 
    createBooking,
    bookedSlots, // Danh sách các slot đã bị đặt
    loadingSlots,
    fetchUnavailableSlots
  } = useBookingStore();

  // Local unified slots format for UI: { start_time, end_time, available, reason }
  const [slots, setSlots] = useState([]);

  // ─── LOCAL STATE ───
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdBookingData, setCreatedBookingData] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    serviceIds: initialServiceId ? [initialServiceId] : [],
    petId: "",
    date: "",
    time: "",
    note: "",
  });

  // ─── DERIVED STATES ───
  const selectedServices = services.filter((s) =>
    formData.serviceIds.includes(s.id.toString())
  );
  
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0) || 30;
  const totalAmount = selectedServices.reduce((sum, s) => sum + (s.basePrice || 0), 0);
  const slotsNeeded = Math.ceil(totalDuration / 30);

  // ─── HELPER FUNCTIONS ───
  
// ─── EFFECTS ───

// Khởi tạo dữ liệu ban đầu
useEffect(() => {
  fetchServices();
  fetchPets({
    keyword: "",
    speciesId: null,
    gender: null,
    ownerId: null,
  });
}, [fetchServices, fetchPets]);

// Khi chưa chọn ngày → hiển thị toàn bộ slot
useEffect(() => {
  if (!formData.date) {
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

  // Reset giờ đã chọn khi đổi ngày
  setFormData((prev) =>
    prev.time ? { ...prev, time: "" } : prev
  );

  // Lấy danh sách slot đã được đặt trong ngày
  fetchUnavailableSlots({
    date: formData.date,
  });
}, [formData.date, fetchUnavailableSlots]);

// Reset giờ khi thay đổi dịch vụ (duration thay đổi)
useEffect(() => {
  setFormData((prev) =>
    prev.time ? { ...prev, time: "" } : prev
  );
}, [slotsNeeded]);

// Đồng bộ SLOT_TIMES với bookedSlots từ backend
useEffect(() => {
  const bookedTimes = new Set(
    (bookedSlots || [])
      .map((slot) => slot.startTime)
      .filter(Boolean)
  );

  const mappedSlots = SLOT_TIMES.map((slot) => {
    const isBooked = bookedTimes.has(slot.startTime);

    return {
      start_time: slot.startTime,
      end_time: slot.endTime,
      available: !isBooked,
      reason: isBooked ? "BOOKED" : null,
    };
  });

  setSlots(mappedSlots);
}, [bookedSlots]);

// ─── SLOT VALIDATION ───

const checkConsecutiveSlots = useCallback(
  (startIndex) => {
    if (
      startIndex < 0 ||
      startIndex + slotsNeeded > slots.length
    ) {
      return {
        available: false,
        reason: "OVER_WORKING_HOURS",
      };
    }

    for (let i = 0; i < slotsNeeded; i++) {
      const slot = slots[startIndex + i];

      if (!slot?.available) {
        return {
          available: false,
          reason:
            i === 0
              ? slot.reason || "BOOKED"
              : "INSUFFICIENT_CONSECUTIVE_SLOTS",
        };
      }
    }

    return { available: true };
  },
  [slots, slotsNeeded]
);

// Chọn slot thủ công
const handleSelectSlot = (slot, index) => {
  const result = checkConsecutiveSlots(index);

  if (result.available) {
    setFormData((prev) => ({
      ...prev,
      time: slot.start_time,
    }));
  }
};

// Tự động chọn slot đầu tiên khả dụng
useEffect(() => {
  if (!formData.date) return;
  if (!formData.serviceIds.length) return;
  if (formData.time) return;
  if (!slots.length) return;

  for (let i = 0; i < slots.length; i++) {
    const result = checkConsecutiveSlots(i);

    if (result.available) {
      setFormData((prev) => ({
        ...prev,
        time: slots[i].start_time,
      }));
      break;
    }
  }
}, [
  slots,
  slotsNeeded,
  formData.date,
  formData.serviceIds,
  formData.time,
  checkConsecutiveSlots,
]);


  const handleServiceToggle = (id) => {
    setFormData((prev) => {
      const strId = id.toString();
      const newServiceIds = prev.serviceIds.includes(strId)
        ? prev.serviceIds.filter((i) => i !== strId)
        : [...prev.serviceIds, strId];

      return { ...prev, serviceIds: newServiceIds, time: "" };
    });
  };
  
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrors({});

    try {
      const payload = {
        ...formData,
        durationMinutes: totalDuration,
      };

      const response = await createBooking(payload);

      if (response?.success) {
        setCreatedBookingData({ id: response.data?.id, amount: totalAmount });
        setIsPaymentModalOpen(true);
      } else {
        setErrors({
          submit: response?.message || "Hệ thống từ chối tạo lịch hẹn.",
        });
      }
    } catch {
      setErrors({ submit: "Đã xảy ra lỗi hệ thống. Xin thử lại sau!" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
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
            pets={pets}
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