// src/store/bookingStore.js

import { create } from "zustand";
import BookingService from "../services/BookingService";
import { SLOT_TIMES } from "../constants";

export const useBookingStore = create((set, get) => ({
  // ─────────────────────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────────────────────
  bookings: [],
  meta: null,           // Thông tin phân trang (page, pageSize, pages, total)
  currentBooking: null,

  slots: [],
  bookedSlots: [],      // Lưu trữ danh sách các slot không khả dụng (đã bị đặt)

  loading: false,
  loadingDetail: false,
  loadingSlots: false,
  submitting: false,

  error: null,

  // ─────────────────────────────────────────────────────────────
  // FETCH BOOKINGS
  // ─────────────────────────────────────────────────────────────
  fetchBookings: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await BookingService.getBookings();

      // SỬA: đồng bộ cấu trúc mock mới — data bọc trong res.data.result (giống orderStore)
      set({
        bookings: res?.success ? res.data?.result || [] : [],
        meta: res?.success ? res.data?.meta || null : null,
      });
    } catch (err) {
      console.error("fetchBookings error:", err);

      set({
        bookings: [],
        error: err.message,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // FETCH BOOKING DETAIL
  // ─────────────────────────────────────────────────────────────
  fetchBookingDetail: async (bookingId) => {
    try {
      set({
        loadingDetail: true,
        currentBooking: null,
        error: null,
      });

      const res = await BookingService.getBookingById(bookingId);

      set({
        currentBooking:
          res?.success && res.data ? res.data : null,
      });
    } catch (err) {
      console.error("fetchBookingDetail error:", err);

      set({
        currentBooking: null,
        error: err.message,
      });
    } finally {
      set({
        loadingDetail: false,
      });
    }
  },

  // Alias để tương thích với các component cũ
  fetchBookingById: async (bookingId) => {
    return get().fetchBookingDetail(bookingId);
  },

  clearCurrentBooking: () =>
    set({
      currentBooking: null,
    }),

  // ─────────────────────────────────────────────────────────────
  // FETCH UNAVAILABLE SLOTS (MỚI BỔ SUNG)
  // ─────────────────────────────────────────────────────────────
  fetchUnavailableSlots: async (params = {}) => {
    try {
      set({
        loadingSlots: true,
        error: null,
      });

      const res = await BookingService.getUnavailableSlots(params);

      set({
        bookedSlots: res?.success ? res.data || [] : [],
      });
    } catch (err) {
      console.error("fetchUnavailableSlots error:", err);
      set({
        bookedSlots: [],
        error: err.message,
      });
    } finally {
      set({
        loadingSlots: false,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // BOOKING REVIEW LOGIC
  // ─────────────────────────────────────────────────────────────

  /**
   * Đánh dấu booking đã được đánh giá
   *
   * Dùng sau khi:
   * createBookingReview()
   * thành công
   */
  markBookingReviewed: (bookingId) => {
    set((state) => ({
      currentBooking:
        state.currentBooking?.id === Number(bookingId)
          ? {
              ...state.currentBooking,
              reviewed: true,
            }
          : state.currentBooking,

      bookings: state.bookings.map((booking) =>
        booking.id === Number(bookingId)
          ? {
              ...booking,
              reviewed: true,
            }
          : booking
      ),
    }));
  },

  // ─────────────────────────────────────────────────────────────
  // CREATE BOOKING
  // ─────────────────────────────────────────────────────────────
  createBooking: async (formData) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res =
        await BookingService.createBooking(formData);

      if (res?.success) {
        get().fetchBookings();
      }

      return res;
    } catch (err) {
      console.error("createBooking error:", err);

      return {
        success: false,
        message:
          "Đã xảy ra lỗi hệ thống khi xử lý. Xin thử lại sau!",
      };
    } finally {
      set({
        submitting: false,
      });
    }
  },

  // ─────────────────────────────────────────────────────────────
  // CANCEL BOOKING
  // ─────────────────────────────────────────────────────────────
  cancelBooking: async (bookingId) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      await BookingService.cancelBooking(bookingId);

      set((state) => ({
        currentBooking:
          state.currentBooking?.id === bookingId
            ? {
                ...state.currentBooking,
                status: "CANCELLED",
              }
            : state.currentBooking,

        bookings: state.bookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking
        ),
      }));

      return {
        success: true,
      };
    } catch (err) {
      console.error("cancelBooking error:", err);

      return {
        success: false,
        message:
          "Hủy lịch thất bại, vui lòng thử lại sau.",
      };
    } finally {
      set({
        submitting: false,
      });
    }
  },
}));