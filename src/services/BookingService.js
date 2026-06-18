import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";
import { APP_CONFIG } from "./config";

let useApi = APP_CONFIG.USE_REAL_API;

export const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined ? !!options.api : useApi;

const unwrap = (res) => res?.data ?? res;

/* =====================================================
| GET BOOKINGS
===================================================== */
const getBookings = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(URL_CONSTANT.Booking.GET_ALL_BOOKINGS, {
      params,
    });
    console.log("fetching bookings", resp);
    return unwrap(resp);
  }

  return { success: true, data: { result: [] } };
};

/* =====================================================
| GET BOOKING BY ID
===================================================== */
const getBookingById = async (id, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Booking.GET_BOOKING.replace("{id}", id)
    );
    return unwrap(resp);
  }

  return { success: true, data: null };
};

/* =====================================================
| GET MY BOOKINGS
===================================================== */
const getMyBookings = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(URL_CONSTANT.Booking.GET_MY_BOOKINGS, {
      params,
    });
    return unwrap(resp);
  }

  return { success: true, data: { result: [] } };
};

/* =====================================================
| GET BOOKED TIMES
===================================================== */
const getUnavailableSlots = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(URL_CONSTANT.Booking.GET_BOOKED_TIMES, {
      params,
    });
    console.log("res =", resp);
    return unwrap(resp);
  }

  return { success: true, data: [] };
};

/* =====================================================
| CREATE BOOKING (FIXED - MATCH BACKEND DTO)
===================================================== */
const createBooking = async (bookingData, options = {}) => {
  const payload = {
    userId: bookingData.userId,

    serviceIds: (bookingData.serviceIds || []).map(Number),

    petId: bookingData.petId ? Number(bookingData.petId) : null,

    bookingDate: bookingData.bookingDate, // YYYY-MM-DD
    startTime: bookingData.startTime,     // HH:mm:ss
    endTime: bookingData.endTime,         // HH:mm:ss
  };

  console.log("BOOKING PAYLOAD (FINAL) =>", payload);

  // 🔥 VALIDATE FRONTEND (QUAN TRỌNG)
  if (
    !payload.userId ||
    !payload.serviceIds.length ||
    !payload.bookingDate ||
    !payload.startTime ||
    !payload.endTime
  ) {
    throw new Error("Missing booking fields");
  }

  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Booking.CREATE_BOOKING,
      payload
    );
    return unwrap(resp);
  }

  return {
    success: true,
    data: { ...payload, id: Date.now() },
  };
};

/* =====================================================
| CANCEL BOOKING
===================================================== */
const cancelBooking = async (id, options = {}) => {
  if (shouldUseApi(options)) {
    const resp = await api.patch(
      URL_CONSTANT.Booking.CANCEL_BOOKING.replace("{id}", id)
    );
    return unwrap(resp);
  }

  return { success: true };
};

/* =====================================================
| UPDATE STATUS
===================================================== */
const updateBookingStatus = async (id, status, options = {}) => {
    console.log("STATUS =", status);
  console.log("TYPE =", typeof status);

  if (shouldUseApi(options)) {
    const resp = await api.patch(
      URL_CONSTANT.Booking.UPDATE_BOOKING_STATUS.replace("{id}", id),
      null,
      { params: { status } }
    );
    return unwrap(resp);
  }

  return { success: true };
};

export default {
  setApi,
  getBookings,
  getBookingById,
  getMyBookings,
  getUnavailableSlots,
  createBooking,
  cancelBooking,
  updateBookingStatus,
};