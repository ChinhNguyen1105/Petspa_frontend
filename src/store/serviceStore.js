import { create } from "zustand";
import ServiceService from "../services/ServiceService";

export const useServiceStore = create((set, get) => ({
  // ───────────────── STATE ─────────────────
  services: [],
  currentService: null,

  meta: {
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  },

  loading: false,
  submitting: false,
  error: null,

  // ───────────────── FETCH ALL ─────────────────
  fetchServices: async (params = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const res =
        await ServiceService.getServices(
          params
        );

      if (res?.success) {
        set({
          services:
            res.data?.result || [],

          meta:
            res.data?.meta || {
              page: 1,
              pageSize: 10,
              total: 0,
              pages: 0,
            },
        });
      } else {
        set({
          services: [],
        });
      }

      return res;
    } catch (err) {
      console.error(
        "Fetch services error:",
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

  // ───────────────── FETCH BY CATEGORY ─────────────────
  fetchServicesByCategory:
    async (categoryId) => {
      try {
        set({
          loading: true,
        });

        const res =
          await ServiceService.getServicesByCategory(
            categoryId
          );

        set({
          services:
            res?.result || [],
        });

        return res;
      } catch (err) {
        console.error(
          "Fetch services by category error:",
          err
        );

        set({
          services: [],
        });
      } finally {
        set({
          loading: false,
        });
      }
    },

  // ───────────────── DETAIL ─────────────────
  fetchServiceById: async (
    serviceId
  ) => {
    try {
      set({
        loading: true,
        currentService: null,
      });

      const res =
        await ServiceService.getServiceById(
          serviceId
        );

      set({
        currentService:
          res.data || null,
      });

      return res.data;
    } catch (err) {
      console.error(
        "Fetch service detail error:",
        err
      );

      set({
        currentService: null,
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  clearCurrentService: () =>
    set({
      currentService: null,
    }),

  // ───────────────── CREATE ─────────────────
  createService: async (
    serviceData
  ) => {
    console.log("payload service", serviceData);
    try {
      set({
        submitting: true,
      });

      const res =
        await ServiceService.createService(
          serviceData
        );

      set((state) => ({
        services: [
          res,
          ...state.services,
        ],
      }));

      return {
        success: true,
        data: res,
      };
    } catch (err) {
      console.error(
        "Create service error:",
        err
      );

      return {
        success: false,
        message:
          err?.response?.data
            ?.message ||
          err?.message,
      };
    } finally {
      set({
        submitting: false,
      });
    }
  },

  // ───────────────── UPDATE ─────────────────
  updateService: async (
    serviceId,
    serviceData
  ) => {
    try {
      set({
        submitting: true,
      });

      const res =
        await ServiceService.updateService(
          serviceId,
          serviceData
        );

      set((state) => ({
        services:
          state.services.map(
            (service) =>
              service.id ===
                Number(serviceId)
                ? res
                : service
          ),

        currentService:
          state.currentService
            ?.id ===
            Number(serviceId)
            ? res
            : state.currentService,
      }));

      return {
        success: true,
        data: res,
      };
    } catch (err) {
      console.error(
        "Update service error:",
        err
      );

      return {
        success: false,
        message:
          err?.response?.data
            ?.message ||
          err?.message,
      };
    } finally {
      set({
        submitting: false,
      });
    }
  },

  // ───────────────── DELETE ─────────────────
  deleteService: async (
    serviceId
  ) => {
    try {
      set({
        submitting: true,
      });

      const res =
        await ServiceService.deleteService(
          serviceId
        );

      set((state) => ({
        services:
          state.services.filter(
            (service) =>
              service.id !==
              Number(serviceId)
          ),

        currentService:
          state.currentService
            ?.id ===
            Number(serviceId)
            ? null
            : state.currentService,
      }));

      return {
        success: true,
        data: res,
      };
    } catch (err) {
      console.error(
        "Delete service error:",
        err
      );

      return {
        success: false,
        message:
          err?.response?.data
            ?.message ||
          err?.message,
      };
    } finally {
      set({
        submitting: false,
      });
    }
  },

  // ───────────────── SEARCH & FILTER ─────────────────
  searchServices: async (keyword, params = {}, options = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      // Gọi hàm searchServices từ tầng Service layer của bạn
      const res = await ServiceService.searchServices(keyword, params, options);

      if (res?.success) {
        set({
          services: res.data?.result || [],
          meta: res.data?.meta || {
            page: 1,
            pageSize: 10,
            total: 0,
            pages: 0,
          },
        });
      } else {
        set({
          services: [],
        });
      }

      return res;
    } catch (err) {
      console.error("Search services error:", err);

      const errorMessage = err?.response?.data?.message || err?.message;

      set({
        error: errorMessage,
      });

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      set({
        loading: false,
      });
    }
  },


}));