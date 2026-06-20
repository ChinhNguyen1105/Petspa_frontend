import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  X,
  Notebook,
  CheckCircle2,
  Mail,
} from "lucide-react";

import validateBookingForm from "../../utils/bookingValidator";

import { useBookingStore } from "../../store/bookingStore";
import { useServiceStore } from "../../store/serviceStore";
import { useUserStore } from "../../store/userStore";
import { usePetStore } from "../../store/petStore";
import { SLOT_TIMES } from "../../constants";
import { BOOKING_CONFIG } from "../../constants";

const toMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const isOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && bStart < aEnd;

const BookingFormAdmin = ({ initialData, onSubmit, onClose }) => {
  console.log("initial data thực tế:", initialData);

  // ─── STORE DATA ──────────────────────────────────────────────────────────────
  const { services, fetchServices } = useServiceStore();
  const { users, fetchUsers } = useUserStore();
  const { unavailableSlots, fetchUnavailableSlots, updateBookingStatus } =
    useBookingStore();
  const { pets, fetchPetsByUser, loading: loadingPets } = usePetStore();

  // ─── LOCAL UI STATE ──────────────────────────────────────────────────────────
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [userError, setUserError] = useState("");

  const needsInit = !services?.length || !users?.length;
  const [loading, setLoading] = useState(needsInit);

  // ─── FORM STATE ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    userEmail: "", // Sẽ được đồng bộ thông minh qua useEffect bên dưới
    petId: initialData?.petId || initialData?.pet?.id || "",
    date: initialData?.bookingDate || "",
    time: initialData?.startTime || "",
    note: initialData?.note || "",
    serviceIds: [], // Sẽ được bóc tách an toàn từ các cấu trúc mảng khác nhau
  });

  // ─── ĐỒNG BỘ INITIAL DATA & FILTER TỪ STORE ────────────────────────────────────
  useEffect(() => {
    // 1. Tìm Email dựa trên userId thu được từ initialData bằng cách tra cứu mảng users từ Store
    let targetEmail = initialData?.user?.email || "";
    if (!targetEmail && initialData?.userId && users.length > 0) {
      const userFound = users.find(
        (u) => String(u.id) === String(initialData.userId),
      );
      if (userFound) targetEmail = userFound.email;
    }

    // 2. Trích xuất danh sách Service IDs an toàn bất kể cấu trúc DB phẳng hay lồng nhau
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
      petId: initialData?.petId || initialData?.pet?.id || "",
      date: initialData?.bookingDate || "",
      time: initialData?.startTime || "",
      note: initialData?.note || "",
      serviceIds: extractedServiceIds,
    });
  }, [initialData, users]); // Chạy lại khi initialData cập nhật hoặc khi danh sách users đã fetch xong

  // ─── MATCHED USER ─────────────────────────────────────────────────────────────
  const matchedUser = useMemo(() => {
    const email = formData.userEmail?.trim().toLowerCase();
    if (!email) return undefined;
    return users.find((u) => u.email?.toLowerCase() === email);
  }, [users, formData.userEmail]);

  // ─── DERIVED ─────────────────────────────────────────────────────────────────
  const selectedServices = useMemo(
    () => services.filter((s) => formData.serviceIds.includes(s.id.toString())),
    [services, formData.serviceIds],
  );

  const totalDuration = useMemo(
    () =>
      selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0) || 30,
    [selectedServices],
  );

  const totalAmount = useMemo(
    () =>
      selectedServices.reduce(
        (sum, s) => sum + (s.basePrice || s.price || 0),
        0,
      ),
    [selectedServices],
  );

  const slotsNeeded = Math.ceil(totalDuration / 30);

  // ─── FETCH METADATA: chỉ fetch khi thực sự cần ───────────────────────────────
  useEffect(() => {
    if (!needsInit) return;

    let cancelled = false;
    const init = async () => {
      try {
        const tasks = [];
        if (!services?.length) tasks.push(fetchServices());
        if (!users?.length) tasks.push(fetchUsers());
        await Promise.all(tasks);
      } catch (err) {
        console.error("Error initializing form:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── VALIDATE USER EMAIL ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.userEmail) {
      setUserError("");
      return;
    }
    setUserError(matchedUser ? "" : "Không tìm thấy người dùng với email này.");
  }, [formData.userEmail, matchedUser]);

  const filteredPets = useMemo(() => {
    if (!matchedUser?.id) return [];
    return pets.filter((pet) => String(pet.ownerId) === String(matchedUser.id));
  }, [pets, matchedUser?.id]);

  // ─── AUTO FETCH PETS KHI USER THAY ĐỔI ──────────────────────────────────────
  useEffect(() => {
    if (!matchedUser) return;

    // Tìm kiếm email cũ tương ứng để tránh bị reset pet oan khi vừa gieo dữ liệu sửa vào form
    let initialEmail = initialData?.user?.email;
    if (!initialEmail && initialData?.userId) {
      initialEmail = users.find(
        (u) => String(u.id) === String(initialData.userId),
      )?.email;
    }

    if (
      !initialData ||
      formData.userEmail?.toLowerCase() !== initialEmail?.toLowerCase()
    ) {
      setFormData((prev) => ({ ...prev, petId: prev.petId ? prev.petId : "" }));
    }
    fetchPetsByUser(matchedUser.id);
  }, [matchedUser, initialData, fetchPetsByUser, users]);

  // ─── FETCH SLOTS KHI NGÀY THAY ĐỔI ──────────────────────────────────────────
  useEffect(() => {
    if (!formData.date) {
      setSlots(
        SLOT_TIMES.map((slot) => ({
          start_time: slot.startTime,
          end_time: slot.endTime,
          available: true,
          reason: null,
        })),
      );
      return;
    }

    let cancelled = false;
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetchUnavailableSlots({ date: formData.date });
        if (cancelled) return;
        const unavailable = res?.data || [];

        const computedSlots = SLOT_TIMES.map((slotTime) => {
          const slotStart = toMinutes(slotTime.startTime);
          const slotEnd = toMinutes(slotTime.endTime);
          const isBooked = unavailable.some((u) => {
            // Loại trừ chính lịch hẹn hiện tại đang sửa đổi ra để không bị tính là bị trùng lịch (Overlap)
            if (
              initialData &&
              String(u.bookingId || u.id) === String(initialData.id)
            ) {
              return false;
            }
            const uStart = toMinutes(u.startTime);
            const uEnd = toMinutes(u.endTime);
            return isOverlap(slotStart, slotEnd, uStart, uEnd);
          });
          return {
            start_time: slotTime.startTime,
            end_time: slotTime.endTime,
            available: !isBooked,
            reason: isBooked ? "BOOKED" : null,
          };
        });

        setSlots(computedSlots);
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi lấy danh sách khung giờ trống:", err);
          setSlots(
            SLOT_TIMES.map((slot) => ({
              start_time: slot.startTime,
              end_time: slot.endTime,
              available: true,
              reason: null,
            })),
          );
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [formData.date, fetchUnavailableSlots, initialData]);

  // ─── KIỂM TRA N SLOT LIÊN TIẾP ───────────────────────────────────────────────
  const checkConsecutiveSlots = useCallback(
    (startIndex) => {
      if (startIndex < 0 || startIndex >= slots.length)
        return { available: false, reason: "INVALID_INDEX" };

      for (let i = 0; i < slotsNeeded; i++) {
        const slot = slots[startIndex + i];
        if (!slot) return { available: false, reason: "OVER_WORKING_HOURS" };

        const isOwnCurrentSlot =
          initialData &&
          formData.date === initialData.bookingDate &&
          slot.start_time === initialData.startTime;

        if (!slot.available && !isOwnCurrentSlot) {
          return {
            available: false,
            reason: i === 0 ? slot.reason : "INSUFFICIENT_CONSECUTIVE_SLOTS",
          };
        }
      }
      return { available: true };
    },
    [slots, slotsNeeded, initialData, formData.date],
  );

  const selectedStartIndex = useMemo(
    () =>
      formData.time
        ? slots.findIndex((s) => s.start_time === formData.time)
        : -1,
    [formData.time, slots],
  );

  const isBlockValid = useMemo(() => {
    if (selectedStartIndex < 0) return false;
    return slots
      .slice(selectedStartIndex, selectedStartIndex + slotsNeeded)
      .every((s) => {
        if (!s) return false;
        const isOwnCurrentSlot =
          initialData &&
          formData.date === initialData.bookingDate &&
          s.start_time === initialData.startTime;
        return s.available || isOwnCurrentSlot;
      });
  }, [selectedStartIndex, slotsNeeded, slots, initialData, formData.date]);

  useEffect(() => {
    if (selectedStartIndex !== -1 && !isBlockValid) {
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  }, [slotsNeeded, slots, selectedStartIndex, isBlockValid]);

  // Auto-select slot khả dụng
  useEffect(() => {
    if (
      !formData.date ||
      !formData.serviceIds.length ||
      formData.time ||
      !slots.length
    )
      return;

    for (let i = 0; i < slots.length; i++) {
      if (checkConsecutiveSlots(i).available) {
        setFormData((prev) => ({ ...prev, time: slots[i].start_time }));
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

  // ─── HANDLERS ────────────────────────────────────────────────────────────────
  const handleServiceToggle = (serviceIdStr) => {
    setFormData((prev) => {
      const isExist = prev.serviceIds.includes(serviceIdStr);
      return {
        ...prev,
        serviceIds: isExist
          ? prev.serviceIds.filter((id) => id !== serviceIdStr)
          : [...prev.serviceIds, serviceIdStr],
        time: "",
      };
    });
  };

  const handleSelectSlot = (slot, index) => {
    if (!checkConsecutiveSlots(index).available) return;
    setFormData((prev) => ({ ...prev, time: slot.start_time }));
  };

  // ─── SUBMIT ──────────────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const errors = validateBookingForm(
      {
        serviceIds: formData.serviceIds,
        date: formData.date,
        time: formData.time,
        customerId: matchedUser?.id,
        petId: formData.petId,
      },
      { requireGroomer: false },
    );

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    onSubmit({
      userId: matchedUser?.id,
      serviceIds: formData.serviceIds.map((id) => Number(id)),
      bookingDate: formData.date,
      startTime: formData.time,
      endTime:
        slots[selectedStartIndex + slotsNeeded - 1]?.end_time || formData.time,
      petId: formData.petId ? Number(formData.petId) : null,
      note: formData.note,
    });
  };

  const getReasonBadge = (reason) => {
    switch (reason) {
      case "BOOKED":
        return { label: "Kín lịch", color: "bg-red-100 text-red-500" };
      case "OUTSIDE_WORKING_HOURS":
        return { label: "Ngoài giờ", color: "bg-gray-200 text-gray-500" };
      case "OVER_WORKING_HOURS":
        return { label: "Cuối ca", color: "bg-gray-200 text-gray-500" };
      case "INSUFFICIENT_CONSECUTIVE_SLOTS":
        return { label: "Thiếu ô tiếp", color: "bg-amber-100 text-amber-600" };
      default:
        return { label: "Hết chỗ", color: "bg-gray-200 text-gray-500" };
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-gray-500 animate-pulse">
        Đang tải cấu hình biểu mẫu...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-2"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {/* 1. CHỌN DỊCH VỤ */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
          1. Dịch vụ chăm sóc <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {services.map((s) => {
            const isChecked = formData.serviceIds.includes(s.id.toString());
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleServiceToggle(s.id.toString())}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isChecked
                    ? "bg-orange-50 border-orange-400 text-orange-600 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {isChecked ? <X size={12} /> : <Plus size={12} />}
                {s.name} ({s.durationMin}p)
              </button>
            );
          })}
        </div>

        {selectedServices.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex justify-between items-center font-medium">
            <span>Đã chọn: {selectedServices.length} dịch vụ</span>
            <span>
              Tổng thời gian:{" "}
              <strong className="text-orange-500 font-bold">
                {totalDuration} phút
              </strong>
            </span>
          </div>
        )}

        {formErrors.serviceIds && (
          <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.serviceIds}
          </p>
        )}
      </div>

      {/* 2. KHÁCH HÀNG */}
      <div className="space-y-4 bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">
          2. Thông tin khách hàng <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
              <Mail size={12} /> Email khách{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Ví dụ: customer@email.com"
              value={formData.userEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userEmail: e.target.value }))
              }
              className={`w-full p-2.5 rounded-xl border outline-none text-sm text-gray-700 focus:border-orange-500 ${
                formErrors.userEmail ? "border-red-400" : "border-gray-200"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Kết quả tra cứu
            </label>
            {matchedUser ? (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <div>
                  <p>{matchedUser.name || initialData?.userName}</p>
                  <p className="font-medium text-gray-400 text-[10px]">
                    ID: {matchedUser.id}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-gray-100 text-gray-400 border border-dashed rounded-xl text-xs font-medium text-center">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {userError && (
          <p className="text-xs font-semibold text-red-500 mt-1">{userError}</p>
        )}
        {formErrors.userId && (
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.userId}
          </p>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            Chọn Thú cưng tương ứng <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full p-2.5 rounded-xl border outline-none bg-white font-medium text-sm text-gray-700 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              formErrors.petId ? "border-red-400" : "border-gray-200"
            }`}
            value={formData.petId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, petId: e.target.value }))
            }
            disabled={!matchedUser || loadingPets}
          >
            {!matchedUser ? (
              <option value="">-- Vui lòng nhập Email hợp lệ trước --</option>
            ) : loadingPets ? (
              <option value="">Đang tải danh sách pet của khách...</option>
            ) : filteredPets.length === 0 ? (
              <option value="">Tài khoản khách này chưa đăng ký Pet nào</option>
            ) : (
              <>
                <option value="">-- Chọn thú cưng nhận dịch vụ --</option>
                {filteredPets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.specie || "Thú cưng"})
                  </option>
                ))}
              </>
            )}
          </select>
          {formErrors.petId && (
            <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {formErrors.petId}
            </p>
          )}
        </div>
      </div>

      {/* 3. NGÀY HẸN */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Calendar size={14} /> 3. Chọn ngày đặt lịch{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={formData.date}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, date: e.target.value }))
          }
          className={`w-full p-3 rounded-xl border outline-none bg-white font-medium text-sm text-gray-700 focus:border-orange-500 ${
            formErrors.date ? "border-red-400" : "border-gray-200"
          }`}
        />
        {formErrors.date && (
          <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.date}
          </p>
        )}
      </div>

      {/* 4. KHUNG GIỜ */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Clock size={14} /> 4. Trạng thái ca trống{" "}
          <span className="text-red-500">*</span>
        </label>

        {!formData.date ? (
          <div className="p-4 bg-gray-50 text-gray-400 rounded-xl border border-dashed border-gray-200 text-center text-xs flex items-center justify-center gap-1.5">
            <AlertCircle size={14} /> Vui lòng chọn{" "}
            <strong>Ngày đặt lịch</strong> để hiển thị ca trống.
          </div>
        ) : formData.serviceIds.length === 0 ? (
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl border border-dashed border-amber-200 text-center text-xs font-bold">
            Vui lòng chọn dịch vụ ở mục 1 để tính toán thời lượng giữ ô!
          </div>
        ) : loadingSlots ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="p-4 bg-red-50 text-red-500 rounded-xl border border-red-100 text-center text-xs font-bold">
            Không có ca làm việc hoặc đã kín lịch vào ngày này!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-gray-50 rounded-xl border">
            {slots.map((slot, index) => {
              const evaluation = checkConsecutiveSlots(index);
              const isAvailable = evaluation.available;
              const reason = isAvailable
                ? null
                : evaluation.reason || slot.reason;

              const isInSelectedBlock =
                isBlockValid &&
                selectedStartIndex >= 0 &&
                index >= selectedStartIndex &&
                index < selectedStartIndex + slotsNeeded;

              const isActualStart = formData.time === slot.start_time;
              const badge = reason ? getReasonBadge(reason) : null;

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSelectSlot(slot, index)}
                  className={`p-2 rounded-xl border text-left relative transition-all flex flex-col justify-between h-14 ${
                    isInSelectedBlock
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm font-bold scale-[1.01]"
                      : !isAvailable
                        ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-orange-50/40 border-gray-200 text-gray-700 hover:border-orange-300 cursor-pointer font-semibold"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs tracking-wide font-bold">
                      {slot.start_time} – {slot.end_time}
                    </span>
                    {!isAvailable && badge && (
                      <span
                        className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-wider ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] block font-medium truncate ${
                      isInSelectedBlock ? "text-orange-100" : "text-gray-400"
                    }`}
                  >
                    {isInSelectedBlock
                      ? isActualStart
                        ? `Bắt đầu (${totalDuration}p)`
                        : "Chuỗi giữ chỗ"
                      : isAvailable
                        ? "Đủ điều kiện chọn"
                        : reason === "INSUFFICIENT_CONSECUTIVE_SLOTS"
                          ? "Thiếu ô liền kề"
                          : "Không thể chọn"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {formErrors.time && (
          <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {formErrors.time}
          </p>
        )}
      </div>

      {/* GHI CHÚ */}
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Notebook size={14} /> Ghi chú lịch hẹn
        </label>
        <textarea
          rows="2"
          placeholder="Yêu cầu đặc biệt về sức khỏe hoặc hành vi của bé..."
          value={formData.note}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, note: e.target.value }))
          }
          className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-gray-700"
        />
      </div>

      {/* TỔNG TIỀN */}
      {(totalAmount > 0 || initialData?.actualPrice) && (
        <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-600">
            {initialData ? "Doanh thu thực tế:" : "Doanh thu dự kiến:"}
          </span>
          <strong className="text-lg font-black text-orange-600">
            {(totalAmount || initialData?.actualPrice || 0).toLocaleString(
              "vi-VN",
            )}{" "}
            đ
          </strong>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={!formData.time || !matchedUser}
          className="px-5 py-2 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          Xác nhận lịch đặt
        </button>
      </div>
    </form>
  );
};

export default BookingFormAdmin;
