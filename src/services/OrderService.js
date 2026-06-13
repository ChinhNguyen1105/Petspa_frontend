import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let useApi = APP_CONFIG.USE_REAL_API;

const setApi = (flag) => {
  useApi = !!flag;
};

const shouldUseApi = (options = {}) =>
  options.api !== undefined ? !!options.api : useApi;

/* ───────────────────────── SAFE HELPERS ───────────────────────── */
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

/* ───────────────────────── GET ALL ORDERS ───────────────────────── */
const getOrders = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.get(URL_CONSTANT.Order.GET_ALL_ORDERS, {
      params,
    });
    console.log("getOrders", res.data);
    return res.data;
  }

  await delay(300);

  return {
    success: true,
    data: { result: [], meta: { total: 0 } },
  };
};

/* ───────────────────────── GET ORDER BY ID ───────────────────────── */
const getOrderById = async (orderId, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.get(
      URL_CONSTANT.Order.GET_ORDER_DETAIL.replace("{id}", orderId)
    );
    return res.data;
  }

  await delay(200);

  return {
    success: true,
    data: null,
  };
};

/* ───────────────────────── MY ORDERS ───────────────────────── */
const getMyOrders = async (params = {}, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.get(URL_CONSTANT.Order.GET_MY_ORDERS, {
      params,
    });
    return res.data;
  }

  await delay(200);

  return {
    success: true,
    data: { result: [] },
  };
};

/* ───────────────────────── CREATE ORDER FROM CART ───────────────────────── */
const createOrder = async (orderData, options = {}) => {
  const payload = {
    cartItemIds: safeArray(orderData?.cartItemIds),
    addressId: orderData?.addressId,
    paymentMethod: orderData?.paymentMethod || "COD",
  };

  // 🔥 FRONTEND VALIDATION (CHẶN LỖI 400)
  if (!payload.cartItemIds.length) {
    throw new Error("[ORDER] Bạn chưa chọn sản phẩm");
  }

  if (!payload.addressId) {
    throw new Error("[ORDER] Thiếu địa chỉ giao hàng");
  }

  if (!payload.paymentMethod) {
    throw new Error("[ORDER] Thiếu phương thức thanh toán");
  }

  console.log("🔥 CREATE ORDER PAYLOAD:", payload);

  if (shouldUseApi(options)) {
    const res = await api.post(
      URL_CONSTANT.Order.CREATE_ORDER_FROM_CART,
      payload
    );
    return res.data;
  }

  await delay(500);

  return {
    success: true,
    data: {
      id: Date.now(),
      ...payload,
      status: "PROCESSING",
      paymentStatus: "PENDING",
      createdDate: new Date().toISOString(),
    },
  };
};

/* ───────────────────────── UPDATE STATUS ───────────────────────── */
const updateOrderStatus = async (orderId, status, options = {}) => {
  const payload = {
    orderId,
    status,
  };

  if (shouldUseApi(options)) {
    const res = await api.patch(
      URL_CONSTANT.Order.UPDATE_ORDER_STATUS,
      payload
    );
    return res.data;
  }

  await delay(200);

  return {
    success: true,
    data: payload,
  };
};

/* ───────────────────────── CANCEL ORDER ───────────────────────── */
const cancelOrder = async (orderId, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.patch(
      URL_CONSTANT.Order.CANCEL_ORDER.replace("{id}", orderId)
    );
    return res.data;
  }

  await delay(200);

  return {
    success: true,
    data: { id: orderId, status: "CANCELLED" },
  };
};

/* ───────────────────────── PAYMENT ───────────────────────── */
const payOrder = async (orderId, paymentMethod, options = {}) => {
  if (shouldUseApi(options)) {
    const res = await api.post(URL_CONSTANT.Payment.CREATE_PAYMENT, {
      orderId,
      paymentMethod,
    });
    return res.data;
  }

  await delay(300);

  return {
    success: true,
    data: {
      orderId,
      paymentMethod,
      paymentStatus: "SUCCESS",
    },
  };
};

export default {
  setApi,

  getOrders,
  getOrderById,
  getMyOrders,

  createOrder,

  updateOrderStatus,
  cancelOrder,
  payOrder,
};