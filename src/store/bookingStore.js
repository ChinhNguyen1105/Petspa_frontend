import { create } from "zustand";
import BookingService from "../services/BookingService";

export const useBookingStore = create((set, get) => ({
  /* ================= STATE ================= */
  bookings: [],
  myBookings: [],
  currentBooking: null,
  unavailableSlots: [],
  meta: null,

  loading: false,
  error: null,

  /* ================= COMMON ================= */
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /* ================= ADMIN ================= */
  fetchBookings: async (params = {}, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await BookingService.getBookings(params, options);

      set({
        bookings: res?.data?.result || [],
        meta: res?.data?.meta || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /* ================= DETAIL ================= */
  fetchBookingById: async (id, options = {}) => {
    try {
      set({ loading: true });

      const res = await BookingService.getBookingById(id, options);

      set({
        currentBooking: res?.data || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /* ================= MY BOOKINGS ================= */
  fetchMyBookings: async (params = {}, options = {}) => {
    try {
      set({ loading: true });

      const res = await BookingService.getMyBookings(params, options);
      console.log("booking from store: ", res);
      
      set({
        myBookings: res?.data?.result || [],
        meta: res?.data?.meta || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /* ================= UNAVAILABLE ================= */
  fetchUnavailableSlots: async (params = {}, options = {}) => {
  try {
    const res = await BookingService.getUnavailableSlots(
      {
        bookingDate: params.date,
      },
      options
    );

    set({
      unavailableSlots: res?.data || [],
    });

    console.log("unavailable:", res);
    return res;
  } catch (err) {
    set({ error: err.message });
  }
},

  /* ================= CREATE ================= */
  createBooking: async (data, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await BookingService.createBooking(data, options);

      const booking = res?.data;

      set((state) => ({
        bookings: booking ? [booking, ...state.bookings] : state.bookings,
        myBookings: booking ? [booking, ...state.myBookings] : state.myBookings,
        loading: false,
      }));

      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /* ================= CANCEL ================= */
  cancelBooking: async (id, options = {}) => {
    try {
      const res = await BookingService.cancelBooking(id, options);

      set((state) => ({
        bookings: state.bookings.map((b) =>
          String(b.id) === String(id)
            ? { ...b, status: "CANCELLED" }
            : b
        ),
        myBookings: state.myBookings.map((b) =>
          String(b.id) === String(id)
            ? { ...b, status: "CANCELLED" }
            : b
        ),
        currentBooking:
          String(state.currentBooking?.id) === String(id)
            ? { ...state.currentBooking, status: "CANCELLED" }
            : state.currentBooking,
      }));

      return res;
    } catch (err) {
      set({ error: err.message });
    }
  },

  /* ================= UPDATE ================= */
 updateBookingStatus: async (id, status, options = {}) => {
  try {
    const statusValue =
      typeof status === "object"
        ? status.status
        : status;

    const res = await BookingService.updateBookingStatus(
      id,
      statusValue,
      options
    );

    set((state) => ({
      bookings: state.bookings.map((b) =>
        String(b.id) === String(id)
          ? { ...b, status: statusValue }
          : b
      ),

      myBookings: state.myBookings.map((b) =>
        String(b.id) === String(id)
          ? { ...b, status: statusValue }
          : b
      ),

      currentBooking:
        String(state.currentBooking?.id) === String(id)
          ? {
              ...state.currentBooking,
              status: statusValue,
            }
          : state.currentBooking,
    }));

    return res;
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    set({ error: err.message });
  }
},

  /* ================= UTIL ================= */
  setCurrentBooking: (b) => set({ currentBooking: b }),
  clearBookings: () => set({ bookings: [], myBookings: [] }),
}));