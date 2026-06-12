import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Star,
} from "lucide-react";

// ─── HELPERS ────────────────────────────────────────────────────────
const formatPrice = (n) =>
  typeof n === "number"
    ? n.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "—";

const formatDuration = (min) => {
  if (!min) return "—";
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}g ${m}p` : `${h} giờ`;
};

const BookingForm = ({
  formData,
  setFormData,
  errors = {},
  setErrors,
  services = [],
  pets = [],
  slots = [],
  loadingSlots = false,
  handleServiceToggle,
  handleSelectSlot,
  checkConsecutiveSlots,
  slotsNeeded = 1,
  totalDuration = 0,
  totalAmount = 0,
  onSubmit,
  submitting = false,
  loading = false,
}) => {
  const [step, setStep] = useState(1);
  console.log(slots);
  // ─── DERIVED ──────────────────────────────────────────────────────
  const selectedServices = useMemo(
    () => services.filter((s) => formData.serviceIds.includes(s.id.toString())),
    [services, formData.serviceIds]
  );

  const selectedStartIndex = useMemo(
    () =>
      formData.time
        ? slots.findIndex((s) => s.start_time === formData.time)
        : -1,
    [formData.time, slots]
  );

  // ─── STEP VALIDATION ──────────────────────────────────────────────
  const validateStep = (s) => {
    const errs = {};
    if (s === 1 && formData.serviceIds.length === 0)
      errs.serviceIds = "Vui lòng chọn ít nhất một dịch vụ.";
    if (s === 2) {
      if (!formData.petId) errs.petId = "Vui lòng chọn thú cưng.";
      if (!formData.date)  errs.date  = "Vui lòng chọn ngày hẹn.";
      if (!formData.time)  errs.time  = "Vui lòng chọn khung giờ.";
    }
    return errs;
  };

  const goNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const goBack = () => { setErrors({}); setStep((s) => s - 1); };

  // ─── LOADING ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Đang tải dịch vụ...</p>
      </div>
    );
  }

  const STEPS = ["Dịch vụ", "Lịch hẹn", "Xác nhận"];

  return (
    <div className="flex flex-col">
      {/* ── STEP INDICATOR ── */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((label, i) => {
          const num    = i + 1;
          const active = step === num;
          const done   = step > num;
          return (
            <React.Fragment key={num}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all
                    ${done   ? "bg-orange-500 text-white"
                    : active ? "bg-orange-500 text-white ring-4 ring-orange-100"
                    :          "bg-gray-100 text-gray-400"}`}
                >
                  {done ? <CheckCircle2 size={13} /> : num}
                </div>
                <span
                  className={`text-xs font-bold transition-colors
                    ${active || done ? "text-gray-800" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 transition-colors
                    ${done ? "bg-orange-300" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div
        className="space-y-5 overflow-y-auto max-h-[60vh] pr-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* ────────────────── STEP 1: SERVICES ────────────────── */}
        {step === 1 && (
          <>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Chọn dịch vụ <span className="text-red-500">*</span>
            </p>

            {errors.serviceIds && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1 -mt-2">
                <AlertCircle size={12} /> {errors.serviceIds}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3">
              {services.map((s) => {
                const id      = s.id.toString();
                const checked = formData.serviceIds.includes(id);
                const thumb   =
                  s.serviceImages?.find((i) => i.isThumbnail)?.imageUrl ||
                  s.serviceImages?.[0]?.imageUrl;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleServiceToggle(id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all
                      ${checked
                        ? "border-orange-400 bg-orange-50/60 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"}`}
                  >
                    {/* thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🐾
                        </div>
                      )}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-black truncate
                          ${checked ? "text-orange-700" : "text-gray-800"}`}
                      >
                        {s.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-0.5">
                          <Clock size={10} />
                          {formatDuration(s.durationMin || s.durationMinutes || s.duration_minutes)}
                        </span>
                        {s.averageRating && (
                          <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" />
                            {s.averageRating}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-black text-orange-500 mt-0.5">
                        {formatPrice(s.basePrice || s.price)}
                      </p>
                    </div>

                    {/* checkbox */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                        ${checked
                          ? "bg-orange-500 border-orange-500"
                          : "border-gray-300"}`}
                    >
                      {checked && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary bar */}
            {selectedServices.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-700">
                    {selectedServices.length} dịch vụ đã chọn
                  </p>
                  <p className="text-xs text-orange-500 font-medium">
                    Tổng thời gian: {formatDuration(totalDuration)}
                  </p>
                </div>
                <p className="text-base font-black text-orange-600">
                  {formatPrice(totalAmount)}
                </p>
              </div>
            )}
          </>
        )}

        {/* ────────────────── STEP 2: PET & DATETIME ────────────────── */}
        {step === 2 && (
          <>
            {/* Pet */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Thú cưng nhận dịch vụ <span className="text-red-500">*</span>
              </p>

              {pets.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                  Bạn chưa đăng ký thú cưng nào. Hãy thêm tại trang hồ sơ!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {pets.map((p) => {
                    const sel = formData.petId.toString() === p.id.toString();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            petId: p.id.toString(),
                          }))
                        }
                        className={`p-3 rounded-xl border-2 text-left transition-all
                          ${sel
                            ? "border-orange-400 bg-orange-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gray-200"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg
                              ${sel ? "bg-orange-100" : "bg-gray-100"}`}
                          >
                            {p.specie === "Cat" ? "🐱" : "🐶"}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-black truncate
                                ${sel ? "text-orange-700" : "text-gray-700"}`}
                            >
                              {p.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium truncate">
                              {p.specie}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.petId && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.petId}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Calendar size={12} /> Ngày hẹn <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: e.target.value,
                    time: "",
                  }))
                }
                className={`w-full p-3 rounded-xl border outline-none bg-white font-semibold text-sm text-gray-700
                  focus:border-orange-400 transition-colors
                  ${errors.date ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.date && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.date}
                </p>
              )}
            </div>

            {/* Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Clock size={12} /> Khung giờ <span className="text-red-500">*</span>
                </label>
                {totalDuration > 0 && (
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    Cần {slotsNeeded} ô · {formatDuration(totalDuration)}
                  </span>
                )}
              </div>

              {!formData.date ? (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-400 font-medium">
                  Chọn ngày trước để xem lịch trống
                </div>
              ) : loadingSlots ? (
                <div className="grid grid-cols-2 gap-2 animate-pulse">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-xs text-red-500 font-bold">
                  Không có ca trống vào ngày này
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-100">
                  {slots.map((slot, idx) => {
                    const evaluation = checkConsecutiveSlots(idx);
                    const canStart   = slot.available && evaluation.available;
                    const inBlock    =
                      selectedStartIndex >= 0 &&
                      idx >= selectedStartIndex &&
                      idx < selectedStartIndex + slotsNeeded;
                    const isStart    = formData.time === slot.start_time;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!canStart && !inBlock}
                        onClick={() => handleSelectSlot(slot, idx)}
                        title={
                          !slot.available
                            ? "Đã được đặt"
                            : !canStart
                            ? "Không đủ ô liên tiếp"
                            : undefined
                        }
                        className={`relative flex flex-col items-center justify-center h-14 rounded-xl border text-xs font-bold transition-all
                          ${inBlock
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm scale-[1.02]"
                            : !slot.available
                            ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                            : canStart
                            ? "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40 cursor-pointer"
                            : "bg-amber-50 border-amber-100 text-amber-400 cursor-not-allowed"}`}
                      >
                        <span className="leading-tight">
                          {slot.start_time}
                          <br />
                          <span className="text-[10px] font-semibold opacity-80">
                            {slot.end_time}
                          </span>
                        </span>
                        {inBlock && (
                          <span
                            className={`text-[8px] font-semibold mt-1 leading-none
                              ${isStart ? "text-orange-100" : "text-orange-200"}`}
                          >
                            {isStart ? "Bắt đầu" : "Tiếp theo"}
                          </span>
                        )}
                        {!slot.available && !inBlock && (
                          <span className="text-[8px] font-semibold text-gray-400 mt-1 leading-none">
                            Đã đặt
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.time && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.time}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="Bé có tính cách đặc biệt, dị ứng, hay yêu cầu nào không?"
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-gray-700 resize-none"
              />
            </div>
          </>
        )}

        {/* ────────────────── STEP 3: REVIEW ────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Xác nhận thông tin lịch hẹn
            </p>

            {/* Services */}
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-2">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-wider">
                Dịch vụ đã chọn
              </p>
              {selectedServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 font-semibold">
                    {s.name}
                  </span>
                  <span className="text-sm font-black text-orange-600">
                    {formatPrice(s.basePrice || s.price)}
                  </span>
                </div>
              ))}
              <div className="border-t border-orange-100 pt-2 flex justify-between">
                <span className="text-xs font-bold text-gray-500">
                  Tổng cộng · {formatDuration(totalDuration)}
                </span>
                <span className="text-base font-black text-orange-600">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Pet */}
            {(() => {
              const pet = pets.find(
                (p) => p.id.toString() === formData.petId.toString()
              );
              return pet ? (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl">
                    {pet.specie === "Cat" ? "🐱" : "🐶"}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800">{pet.name}</p>
                    <p className="text-xs text-gray-400 font-medium">
                      {pet.specie} · {pet.gender}
                    </p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Ngày hẹn
                </p>
                <p className="text-sm font-black text-gray-800">
                  {formData.date
                    ? new Date(formData.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                      })
                    : "—"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Khung giờ
                </p>
                <p className="text-sm font-black text-gray-800">
                  {formData.time || "—"}
                  {selectedStartIndex >= 0 &&
                    slots[selectedStartIndex + slotsNeeded - 1] &&
                    ` – ${slots[selectedStartIndex + slotsNeeded - 1].end_time}`}
                </p>
              </div>
            </div>

            {/* Note */}
            {formData.note && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Ghi chú
                </p>
                <p className="text-sm text-gray-700">{formData.note}</p>
              </div>
            )}

            {/* Submit error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs font-semibold text-red-600">
                <AlertCircle size={14} /> {errors.submit}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={step > 1 ? goBack : undefined}
          className={`px-4 py-2.5 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all
            ${step === 1 ? "invisible" : ""}`}
        >
          Quay lại
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-orange-600 transition-all shadow-sm shadow-orange-200"
          >
            Tiếp theo <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm shadow-orange-200"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Xác nhận đặt lịch
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingForm;