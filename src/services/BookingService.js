import api from "./api";
import { URL_CONSTANT } from "../constants/urlConstant";

import { bookingMock } from "../assets/data/mocks/booking/bookingMock";
import { unavailableSlotMock } from "../assets/data/mocks/booking/unavailableSlotMock";
import { APP_CONFIG } from "./config";

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/
let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined
    ? !!options.api
    : useApi;

/*
|--------------------------------------------------------------------------
| GET BOOKINGS
|--------------------------------------------------------------------------
*/
const getBookings = async (
  params = {},
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.get(
      URL_CONSTANT.Booking.GET_ALL_BOOKINGS,
      { params }
    );

    return resp.data;
  }

  await delay(500);

  let result = [...bookingMock.result];

  const {
    keyword,
    status,
    bookingDate,
    userId,
  } = params;

  if (keyword) {
    result = result.filter(
      (item) =>
        item.userName
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||
        item.petName
          ?.toLowerCase()
          .includes(keyword.toLowerCase())
    );
  }

  if (status) {
    result = result.filter(
      (item) => item.status === status
    );
  }

  if (bookingDate) {
    result = result.filter(
      (item) =>
        item.bookingDate === bookingDate
    );
  }

  if (userId) {
    result = result.filter(
      (item) => item.userId === userId
    );
  }

  return {
    success: true,
    message:
      bookingMock.message ||
      "Get bookings successfully",
    data: {
      meta: {
        ...bookingMock.meta,
        total: result.length,
      },
      result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET BOOKING DETAIL
|--------------------------------------------------------------------------
*/
const getBookingById = async (
  id,
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.get(
      URL_CONSTANT.Booking.GET_BOOKING.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(500);

  const booking =
    bookingMock.result.find(
      (item) => item.id === Number(id)
    ) || null;

  return {
    success: !!booking,
    message: booking
      ? "Get booking detail successfully"
      : "Booking not found",
    data: booking,
  };
};

/*
|--------------------------------------------------------------------------
| GET MY BOOKINGS
|--------------------------------------------------------------------------
*/
const getMyBookings = async (
  params = {},
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.get(
      URL_CONSTANT.Booking.GET_MY_BOOKINGS,
      { params }
    );

    return resp.data;
  }

  return getBookings(params);
};

/*
|--------------------------------------------------------------------------
| GET UNAVAILABLE SLOTS
|--------------------------------------------------------------------------
*/
const getUnavailableSlots = async (
  params = {},
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.get(
      URL_CONSTANT.Booking.GET_BOOKINGS_BY_STATUS,
      {
        params,
      }
    );

    return resp.data;
  }

  await delay(400);

  let result = [
    ...unavailableSlotMock.data,
  ];

  const { date } = params;

  if (date) {
    result = result.filter(
      (slot) =>
        !slot.date ||
        slot.date === date
    );
  }

  return {
    success: true,
    message:
      unavailableSlotMock.message ||
      "Get unavailable slots successfully",
    data: result,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/
const createBooking = async (
  bookingData,
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.post(
      URL_CONSTANT.Booking.CREATE_BOOKING,
      bookingData
    );

    return resp.data;
  }

  await delay(600);

  const newBooking = {
    id: Date.now(),

    userId:
      bookingData.userId ||
      "550e8400-e29b-41d4-a716-446655440000",

    userName:
      bookingData.userName ||
      "Nguyễn Văn A",

    petId: bookingData.petId,

    petName:
      bookingData.petName || "",

    status: "PENDING",

    actualPrice:
      bookingData.actualPrice || 0,

    bookingDate:
      bookingData.bookingDate,

    startTime:
      bookingData.startTime,

    endTime:
      bookingData.endTime,

    bookingDetails:
      bookingData.bookingDetails ||
      [],

    createdDate:
      new Date().toISOString(),

    lastModifiedDate:
      new Date().toISOString(),
  };

  bookingMock.result.unshift(
    newBooking
  );

  return {
    success: true,
    message:
      "Create booking successfully",
    data: newBooking,
  };
};

/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/
const cancelBooking = async (
  id,
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.patch(
      URL_CONSTANT.Booking.CANCEL_BOOKING.replace(
        "{id}",
        id
      )
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message:
      "Cancel booking successfully",
    data: {
      id: Number(id),
      status: "CANCELLED",
      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
*/
const updateBookingStatus = async (
  id,
  status,
  options = {}
) => {
  const useReal = shouldUseApi(options);

  if (useReal) {
    const resp = await api.patch(
      URL_CONSTANT.Booking.UPDATE_BOOKING_STATUS.replace(
        "{id}",
        id
      ),
      { status }
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message:
      "Update booking status successfully",
    data: {
      id: Number(id),
      status,
      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

export default {
  setApi,

  getBookings,
  getMyBookings,

  getBookingById,

  getUnavailableSlots,

  createBooking,

  cancelBooking,
  updateBookingStatus,
};