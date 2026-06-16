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
  error: null,

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
      set({
        loading: true,
        error: null,
      });

      const state = get();

      const params = {
        keyword:
          state.inventoryKeyword ||
          undefined,

        productId:
          state.productId ||
          undefined,

        minQuantity:
          state.minQuantity ||
          undefined,

        maxQuantity:
          state.maxQuantity ||
          undefined,

        ...overrideParams,
      };
      const res =
        await WarehouseService.getInventory(
          params
        );

      if (
        res?.status === "SUCCESS"
      ) {
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

      set({
        inventory: [],
        metaInventory: null,
        error:
          err?.response?.data
            ?.message ||
          err?.message,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── TRANSACTIONS ─────────────────────────

  fetchTransactions: async (
    overrideParams = {}
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });
      const state = get();

      const params = {
        keyword:
          state.transactionKeyword ||
          undefined,

        type:
          state.transactionType ||
          undefined,

        productId:
          state.productId ||
          undefined,

        ...overrideParams,
      };

      const res =
        await WarehouseService.getTransactions(
          params
        );

      if (
        res?.status === "SUCCESS"
      ) {
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

      set({
        transactions: [],
        metaTransactions: null,
        error:
          err?.response?.data
            ?.message ||
          err?.message,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── IMPORT PRODUCT ─────────────────────────

  importProduct: async (
    request
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await WarehouseService.importProduct(
          request
        );

      if (
        res?.status === "SUCCESS"
      ) {
        await get().fetchInventory();
        await get().fetchTransactions();

        return {
          success: true,
          data: res.data,
        };
      }

      return {
        success: false,
        message:
          "Import product failed",
      };
    } catch (err) {
      console.error(
        "Import product error:",
        err
      );

      set({
        error:
          err?.response?.data
            ?.message ||
          err?.message,
      });

      return {
        success: false,
        message:
          err?.response?.data
            ?.message ||
          err?.message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── EXPORT PRODUCT ─────────────────────────

  exportProduct: async (
    request
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await WarehouseService.exportProduct(
          request
        );

      if (
        res?.status === "SUCCESS"
      ) {
        await get().fetchInventory();
        await get().fetchTransactions();

        return {
          success: true,
          data: res.data,
        };
      }

      return {
        success: false,
        message:
          "Export product failed",
      };
    } catch (err) {
      console.error(
        "Export product error:",
        err
      );

      set({
        error:
          err?.response?.data
            ?.message ||
          err?.message,
      });

      return {
        success: false,
        message:
          err?.response?.data
            ?.message ||
          err?.message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── ADJUST PRODUCT ─────────────────────────

  adjustProduct: async (
    request
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });
      
      const payload = {
        productId: request.productId,
        newQuantity: request.quantity,
        note: request.note,
      }

    const res =
      await WarehouseService.adjustProduct(
        payload
      );

      if (
        res?.status === "SUCCESS"
      ) {
        await get().fetchInventory();
        await get().fetchTransactions();

        return {
          success: true,
          data: res.data,
        };
      }

      return {
        success: false,
        message:
          "Adjust product failed",
      };
    } catch (err) {
      console.error(
        "Adjust product error:",
        err
      );

      set({
        error:
          err?.response?.data
            ?.message ||
          err?.message,
      });

      return {
        success: false,
        message:
          err?.response?.data
            ?.message ||
          err?.message,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },

  // ───────────────────────── OLD TRANSACTION API ─────────────────────────

  handleStockTransaction:
    async (payload) => {
      try {
        set({
          submitting: true,
        });

        const res =
          await WarehouseService.createTransaction(
            payload
          );

        if (
          res?.status ===
          "SUCCESS"
        ) {
          await get().fetchInventory();
          await get().fetchTransactions();
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
        set({
          submitting: false,
        });
      }
    },

  // ───────────────────────── RESET ─────────────────────────

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