import { create } from "zustand";
import OrderService from "../services/OrderService";

export const useOrderStore = create((set, get) => ({
  /* ================= STATE ================= */
  orders: [],
  myOrders: [],
  currentOrder: null,
  meta: null,

  loading: false,
  submitting: false,
  error: null,

  /* ================= COMMON ================= */
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /* ================= ADMIN ================= */
  fetchOrders: async (params = {}, options = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await OrderService.getOrders(params, options);

      set({
        orders: res?.data?.result || [],
        meta: res?.data?.meta || null,
        loading: false,
      });
      console.log("fetch order: ", res);
      return res;
    } catch (err) {
      set({
        orders: [],
        meta: null,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch orders failed",
      });
    }
  },

  /* ================= DETAIL ================= */
  fetchOrderById: async (orderId, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await OrderService.getOrderById(orderId, options);

      set({
        currentOrder: res?.data || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        currentOrder: null,
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch order failed",
      });
    }
  },

  /* ================= MY ORDERS ================= */
  fetchMyOrders: async (params = {}, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res = await OrderService.getMyOrders(params, options);

      set({
        myOrders: res?.data?.result || [],
        meta: res?.data?.meta || null,
        loading: false,
      });

      return res;
    } catch (err) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Fetch my orders failed",
      });
    }
  },

  /* ================= CREATE ================= */
  createOrder: async (orderData, options = {}) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res = await OrderService.createOrder(orderData, options);

      set((state) => ({
        orders: [res?.data, ...state.orders],
        currentOrder: res?.data,
        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Create order failed",
      });

      throw err;
    }
  },

  /* ================= UPDATE STATUS ================= */
  updateOrderStatus: async (
  orderId,
  status,
  note = "",
  options = {}
) => {
  try {
    set({
      submitting: true,
      error: null,
    });

    const res = await OrderService.updateOrderStatus(
      orderId,
      status,
      note,
      options
    );

    set((state) => ({
      orders: state.orders.map((o) =>
        String(o.id) === String(orderId)
          ? { ...o, status }
          : o
      ),
      currentOrder:
        String(state.currentOrder?.id) === String(orderId)
          ? {
              ...state.currentOrder,
              status,
            }
          : state.currentOrder,
      submitting: false,
    }));

    return res;
  } catch (err) {
    set({
      submitting: false,
      error:
        err?.response?.data?.message ||
        err?.message ||
        "Update order status failed",
    });
  }
},
  /* ================= CANCEL ================= */
  cancelOrder: async (orderId, options = {}) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res = await OrderService.cancelOrder(
        orderId,
        options
      );

      set((state) => ({
        orders: state.orders.map((o) =>
          String(o.id) === String(orderId)
            ? { ...o, status: "CANCELLED" }
            : o
        ),
        currentOrder:
          String(state.currentOrder?.id) === String(orderId)
            ? {
                ...state.currentOrder,
                status: "CANCELLED",
              }
            : state.currentOrder,
        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Cancel order failed",
      });
    }
  },

  /* ================= PAYMENT ================= */
  payOrder: async (
    orderId,
    paymentMethod,
    options = {}
  ) => {
    try {
      set({
        submitting: true,
        error: null,
      });

      const res = await OrderService.payOrder(
        orderId,
        paymentMethod,
        options
      );

      set((state) => ({
        orders: state.orders.map((o) =>
          String(o.id) === String(orderId)
            ? {
                ...o,
                paymentStatus: "SUCCESS",
                paymentMethod,
              }
            : o
        ),
        currentOrder:
          String(state.currentOrder?.id) === String(orderId)
            ? {
                ...state.currentOrder,
                paymentStatus: "SUCCESS",
                paymentMethod,
              }
            : state.currentOrder,
        submitting: false,
      }));

      return res;
    } catch (err) {
      set({
        submitting: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Payment failed",
      });
    }
  },

  /* ================= RESET ================= */
  resetOrderState: () => {
    set({
      orders: [],
      myOrders: [],
      currentOrder: null,
      meta: null,
      loading: false,
      submitting: false,
      error: null,
    });
  },
}));