import { create } from "zustand";
import WarehouseService from "../services/WarehouseService";

export const useWarehouseStore = create((set, get) => ({
  // ───────────────────────── STATES ─────────────────────────
  inventory: [],
  transactions: [],

  metaInventory: null,
  metaTransactions: null,

  loading: false,
  submitting: false,

  // ───────────────────────── FILTERS ─────────────────────────
  inventoryKeyword: "",
  transactionKeyword: "",

  transactionType: "",

  productId: "",

  minQuantity: "",
  maxQuantity: "",

  // ───────────────────────── FILTER ACTIONS ─────────────────────────

  setInventoryKeyword: (keyword) =>
    set({
      inventoryKeyword: keyword,
    }),

  setTransactionKeyword: (keyword) =>
    set({
      transactionKeyword: keyword,
    }),

  setTransactionType: (type) =>
    set({
      transactionType: type,
    }),

  setProductId: (id) =>
    set({
      productId: id,
    }),

  setMinQuantity: (value) =>
    set({
      minQuantity: value,
    }),

  setMaxQuantity: (value) =>
    set({
      maxQuantity: value,
    }),

  // ───────────────────────── INVENTORY ─────────────────────────

  fetchInventory: async (
    overrideParams = {}
  ) => {
    try {
      set({ loading: true });

      const state = get();

      const params = {
        keyword: state.inventoryKeyword,

        productId:
          state.productId || null,

        minQuantity:
          state.minQuantity || null,

        maxQuantity:
          state.maxQuantity || null,

        ...overrideParams,
      };

      const res =
        await WarehouseService.getInventory(
          params
        );

      if (res?.success) {
        set({
          inventory:
            res.data?.result || [],

          metaInventory:
            res.data?.meta || null,
        });
      } else {
        set({
          inventory: [],
          metaInventory: null,
        });
      }
    } catch (err) {
      console.error(
        "Lỗi khi lấy inventory:",
        err
      );
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── TRANSACTIONS ─────────────────────────

  fetchTransactions: async (
    overrideParams = {}
  ) => {
    try {
      set({ loading: true });

      const state = get();

      const params = {
        keyword:
          state.transactionKeyword,

        type:
          state.transactionType ||
          null,

        productId:
          state.productId || null,

        ...overrideParams,
      };

      const res =
        await WarehouseService.getTransactions(
          params
        );

      if (res?.success) {
        set({
          transactions:
            res.data?.result || [],

          metaTransactions:
            res.data?.meta || null,
        });
      } else {
        set({
          transactions: [],
          metaTransactions: null,
        });
      }
    } catch (err) {
      console.error(
        "Lỗi khi lấy transactions:",
        err
      );
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── CREATE TRANSACTION ─────────────────────────

  handleStockTransaction: async (
    payload
  ) => {
    try {
      set({ submitting: true });

      const res =
        await WarehouseService.createTransaction(
          payload
        );

      if (res?.success) {
        set((state) => ({
          transactions: [
            res.data,
            ...state.transactions,
          ],

          metaTransactions:
            state.metaTransactions
              ? {
                  ...state.metaTransactions,
                  total:
                    state
                      .metaTransactions
                      .total + 1,
                }
              : null,
        }));

        // refresh inventory
        await get().fetchInventory();
      }

      return res;
    } catch (err) {
      console.error(
        "Lỗi transaction kho:",
        err
      );

      return {
        success: false,
        message:
          "Đã xảy ra lỗi hệ thống!",
      };
    } finally {
      set({ submitting: false });
    }
  },

  // ───────────────────────── RESET FILTERS ─────────────────────────

  resetFilters: () =>
    set({
      inventoryKeyword: "",
      transactionKeyword: "",
      transactionType: "",
      productId: "",
      minQuantity: "",
      maxQuantity: "",
    }),
}));