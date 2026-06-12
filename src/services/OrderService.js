import api from "./api";
import { APP_CONFIG } from "./config";
import { URL_CONSTANT } from "../constants/urlConstant";

import { orderMock } from "../assets/data/mocks/order/orderList";

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
| GET ORDERS
|--------------------------------------------------------------------------
*/
const getOrders = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Order.GET_ALL_ORDERS,
      { params }
    );

    return resp.data;
  }

  await delay(500);

  let result = [...orderMock.result];

  const {
    keyword,
    status,
    paymentStatus,
    userId,
  } = params;

  if (keyword) {
    result = result.filter(
      (order) =>
        order.userName
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||
        order.userEmail
          ?.toLowerCase()
          .includes(keyword.toLowerCase()) ||
        String(order.id).includes(keyword)
    );
  }

  if (status) {
    result = result.filter(
      (order) => order.status === status
    );
  }

  if (paymentStatus) {
    result = result.filter(
      (order) =>
        order.paymentStatus ===
        paymentStatus
    );
  }

  if (userId) {
    result = result.filter(
      (order) =>
        String(order.userId) ===
        String(userId)
    );
  }

  return {
    success: true,
    message:
      orderMock.message ||
      "Get all orders successfully",
    data: {
      meta: {
        ...(orderMock.meta || {}),
        total: result.length,
      },
      result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET ORDER DETAIL
|--------------------------------------------------------------------------
*/
const getOrderById = async (
  orderId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Order.GET_ORDER_DETAIL.replace(
        "{id}",
        orderId
      )
    );

    return resp.data;
  }

  await delay(500);

  const foundOrder =
    orderMock.result.find(
      (order) =>
        String(order.id) ===
        String(orderId)
    ) || null;

  return {
    success: !!foundOrder,
    message: foundOrder
      ? "Get order detail successfully"
      : "Order not found",
    data: foundOrder,
  };
};

/*
|--------------------------------------------------------------------------
| GET MY ORDERS
|--------------------------------------------------------------------------
*/
const getMyOrders = async (
  params = {},
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Order.GET_MY_ORDERS,
      { params }
    );

    return resp.data;
  }

  await delay(500);

  return {
    success: true,
    message:
      "Get my orders successfully",
    data: {
      meta: {
        total: orderMock.result.length,
      },
      result: orderMock.result,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET ORDERS BY USER
|--------------------------------------------------------------------------
*/
const getOrdersByUser = async (
  userId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.get(
      URL_CONSTANT.Order.GET_MY_ORDERS,
      {
        params: { userId },
      }
    );

    return resp.data;
  }

  await delay(500);

  const userOrders =
    orderMock.result.filter(
      (order) =>
        String(order.userId) ===
        String(userId)
    );

  return {
    success: true,
    message:
      "Get user orders successfully",
    data: userOrders,
  };
};

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/
const createOrder = async (
  orderData,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Order.CREATE_ORDER_FROM_CART,
      orderData
    );

    return resp.data;
  }

  await delay(800);

  return {
    success: true,
    message:
      "Create order successfully",
    data: {
      id: Date.now(),

      userId:
        orderData.userId || 1,

      userName:
        orderData.userName ||
        "Khách Hàng Mới",

      userEmail:
        orderData.userEmail || "",

      shippingName:
        orderData.shippingName ||
        "Khách Hàng Mới",

      shippingPhone:
        orderData.shippingPhone || "",

      shippingAddressFull:
        orderData.shippingAddressFull ||
        "",

      totalQuantity:
        orderData.totalQuantity || 0,

      totalAmount:
        orderData.totalAmount || 0,

      status: "PROCESSING",

      paymentMethod:
        orderData.paymentMethod ||
        "COD",

      paymentStatus:
        "PENDING",

      activeFlag: true,
      deleteFlag: false,

      createdDate:
        new Date().toISOString(),

      orderDetails:
        orderData.orderDetails || [],
    },
  };
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (
  orderId,
  newStatus,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.patch(
      URL_CONSTANT.Order.UPDATE_ORDER_STATUS,
      {
        orderId,
        status: newStatus,
      }
    );

    return resp.data;
  }

  await delay(600);

  return {
    success: true,
    message:
      "Update order status successfully",
    data: {
      id: Number(orderId),
      status: newStatus,
      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
*/
const cancelOrder = async (
  orderId,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.patch(
      URL_CONSTANT.Order.CANCEL_ORDER.replace(
        "{id}",
        orderId
      )
    );

    return resp.data;
  }

  await delay(600);

  return {
    success: true,
    message:
      "Cancel order successfully",
    data: {
      id: Number(orderId),
      status: "CANCELLED",
      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/
const payOrder = async (
  orderId,
  paymentMethod,
  options = {}
) => {
  if (shouldUseApi(options)) {
    const resp = await api.post(
      URL_CONSTANT.Payment.CREATE_PAYMENT,
      {
        orderId,
        paymentMethod,
      }
    );

    return resp.data;
  }

  await delay(1000);

  return {
    success: true,
    message:
      "Payment successfully",
    data: {
      id: Number(orderId),
      paymentMethod,
      paymentStatus:
        "SUCCESS",
      lastModifiedDate:
        new Date().toISOString(),
    },
  };
};

export default {
  setApi,

  getOrders,
  getOrderById,

  getMyOrders,
  getOrdersByUser,

  createOrder,

  updateOrderStatus,
  cancelOrder,

  payOrder,
};