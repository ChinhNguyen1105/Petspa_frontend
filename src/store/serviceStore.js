import { create } from 'zustand';
import ServiceService from '../services/ServiceService';

// Helper: ép response về array an toàn dù backend trả array thẳng hay { result: [] }
const toArray = (data) =>
  Array.isArray(data) ? data : data?.result || [];

export const useServiceStore = create((set, get) => ({
  // ─── INITIAL STATE ───
  services: [],
  currentService: null,
  meta: {          // 🌟 SỬA: Đổi từ pagination thành meta để đồng bộ chuẩn UI
    page: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  submitting: false,
  error: null,     // 🌟 SỬA: Khai báo rõ state error ban đầu

  // ─── READ ───
  fetchServices: async (params = {}) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const response = await ServiceService.getServices(params);

      set({
        services: response?.data?.result || [],
        meta: response?.data?.meta,
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Đã xảy ra lỗi khi tải dịch vụ',
      });
      throw error;
    }
  },

  fetchServicesByCategory: async (categoryId) => {
    try {
      set({ loading: true });
      const res = await ServiceService.getServicesByCategory(categoryId);
      set({ services: res?.success ? toArray(res.data) : [] });
    } catch (err) {
      console.error('fetchServicesByCategory error:', err);
      set({ services: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchServiceById: async (serviceId) => {
    try {
      set({ loading: true, currentService: null });
      const res = await ServiceService.getServiceById(serviceId);
      set({ currentService: res?.success ? res.data : null });
    } catch (err) {
      console.error('fetchServiceById error:', err);
      set({ currentService: null });
    } finally {
      set({ loading: false });
    }
  },

  clearCurrentService: () => set({ currentService: null }),

  // ─── CREATE ──────────────────────────────────────────────────────────────

  createService: async (serviceData) => {
    try {
      set({ submitting: true });
      const res = await ServiceService.createService(serviceData);
      if (res?.success) {
        set((state) => ({ services: [res.data, ...state.services] }));
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      set({ submitting: false });
    }
  },

  // ─── UPDATE ──────────────────────────────────────────────────────────────

  updateService: async (serviceId, serviceData) => {
    try {
      set({ submitting: true });
      const res = await ServiceService.updateService(serviceId, serviceData);
      if (res?.success) {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === Number(serviceId) ? { ...s, ...res.data } : s
          ),
          currentService:
            state.currentService?.id === Number(serviceId)
              ? { ...state.currentService, ...res.data }
              : state.currentService,
        }));
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      set({ submitting: false });
    }
  },

  // ─── DELETE ──────────────────────────────────────────────────────────────

  deleteService: async (serviceId) => {
    try {
      set({ submitting: true });
      const res = await ServiceService.deleteService(serviceId);
      if (res?.success) {
        set((state) => ({
          services: state.services.filter((s) => s.id !== Number(serviceId)),
          currentService:
            state.currentService?.id === Number(serviceId)
              ? null
              : state.currentService,
        }));
      }
      return res;
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      set({ submitting: false });
    }
  },
}));