import { create } from "zustand";
import OrderService from "../services/OrderService";

export const useOrderStore = create((set, get) => ({
  /* ───────────────────────── STATES ───────────────────────── */
  orders: [],
  currentOrder: null,
  meta: null,

  loading: false,
  submitting: false,

  error: null,

  /* ───────────────────────── FETCH ALL ORDERS ───────────────────────── */
fetchOrders: async (params = {}) => {
  set({ loading: true, error: null });

  try {
    const res = await OrderService.getOrders(params);

    if (res?.status === "SUCCESS") {
      set({
        orders: res?.data?.result || [],
        meta: res?.data?.meta || null,
      });
    } else {
      set({
        orders: [],
        meta: null,
      });
    }

    return res;
  } catch (err) {
    set({
      error:
        err?.response?.data?.message ||
        "Fetch orders failed",
      orders: [],
      meta: null,
    });

    throw err;
  } finally {
    set({ loading: false });
  }
},

  /* ───────────────────────── FETCH ORDER DETAIL ───────────────────────── */
  fetchOrderById: async (orderId) => {
    set({ loading: true, currentOrder: null, error: null });

    try {
      const res = await OrderService.getOrderById(orderId);

      if (res?.success) {
        set({ currentOrder: res.data });
      }

      return res;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Fetch order failed",
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ───────────────────────── CREATE ORDER (CHECKOUT) ───────────────────────── */
  createOrder: async (orderData) => {
    set({ submitting: true, error: null });

    try {
      const payload = {
        cartItemIds: Array.isArray(orderData?.cartItemIds)
          ? orderData.cartItemIds
          : [],
        addressId: orderData?.addressId,
        paymentMethod: orderData?.paymentMethod || "COD",
      };

      // 🔥 FRONTEND VALIDATION (TRÁNH 400 BACKEND)
      if (!payload.cartItemIds.length) {
        throw new Error("Bạn chưa chọn sản phẩm");
      }

      if (!payload.addressId) {
        throw new Error("Vui lòng chọn địa chỉ giao hàng");
      }

      const res = await OrderService.createOrder(payload);

      if (res?.success) {
        set((state) => ({
          orders: [res.data, ...state.orders],
          currentOrder: res.data,
        }));
      }

      return res;
    } catch (err) {
      set({
        error: err.message || "Create order failed",
      });

      return {
        success: false,
        message: err.message,
      };
    } finally {
      set({ submitting: false });
    }
  },

  /* ───────────────────────── UPDATE STATUS ───────────────────────── */
  updateOrderStatus: async (orderId, status) => {
    set({ submitting: true, error: null });

    try {
      const res = await OrderService.updateOrderStatus(orderId, status);

      if (res?.success) {
        set((state) => ({
          orders: state.orders.map((o) =>
            String(o.id) === String(orderId)
              ? { ...o, status }
              : o
          ),
          currentOrder:
            String(state.currentOrder?.id) === String(orderId)
              ? { ...state.currentOrder, status }
              : state.currentOrder,
        }));
      }

      return res;
    } catch (err) {
      set({
        error:
          err?.response?.data?.message || "Update order status failed",
      });
    } finally {
      set({ submitting: false });
    }
  },

  /* ───────────────────────── CANCEL ORDER ───────────────────────── */
  cancelOrder: async (orderId) => {
    set({ submitting: true, error: null });

    try {
      const res = await OrderService.cancelOrder(orderId);

      if (res?.success) {
        set((state) => ({
          orders: state.orders.map((o) =>
            String(o.id) === String(orderId)
              ? { ...o, status: "CANCELLED" }
              : o
          ),
          currentOrder:
            String(state.currentOrder?.id) === String(orderId)
              ? { ...state.currentOrder, status: "CANCELLED" }
              : state.currentOrder,
        }));
      }

      return res;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Cancel order failed",
      });
    } finally {
      set({ submitting: false });
    }
  },

  /* ───────────────────────── PAY ORDER ───────────────────────── */
  payOrder: async (orderId, paymentMethod) => {
    set({ submitting: true, error: null });

    try {
      const res = await OrderService.payOrder(orderId, paymentMethod);

      if (res?.success) {
        const updateFields = {
          paymentStatus: "SUCCESS",
          paymentMethod,
        };

        set((state) => ({
          orders: state.orders.map((o) =>
            String(o.id) === String(orderId)
              ? { ...o, ...updateFields }
              : o
          ),
          currentOrder:
            String(state.currentOrder?.id) === String(orderId)
              ? { ...state.currentOrder, ...updateFields }
              : state.currentOrder,
        }));
      }

      return res;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Payment failed",
      });
    } finally {
      set({ submitting: false });
    }
  },

  /* ───────────────────────── RESET ───────────────────────── */
  resetOrderState: () => {
    set({
      orders: [],
      currentOrder: null,
      meta: null,
      loading: false,
      submitting: false,
      error: null,
    });
  },
}));