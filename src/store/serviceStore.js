import { create } from 'zustand';
import ServiceService from '../services/ServiceService';

// Helper: ép response về array an toàn
const toArray = (data) =>
  Array.isArray(data) ? data : data?.result || [];

export const useServiceStore = create((set, get) => ({
  // ─── STATE ───
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

  // ───────────────── FETCH SERVICES ─────────────────
  fetchServices: async (params = {}) => {
    try {
      set({ loading: true, error: null });

      const res = await ServiceService.getServices(params);

      // backend: { success, data: { meta, result } }
      const payload = res?.data || res;

      set({
        services: payload?.result || [],
        meta: payload?.meta || {
          page: 1,
          pageSize: 10,
          total: 0,
          pages: 0,
        },
        loading: false,
      });

      return res;
    } catch (error) {
      set({
        loading: false,
        error: error?.response?.data?.message || 'Đã xảy ra lỗi khi tải dịch vụ',
      });
      throw error;
    }
  },

  // ───────────────── BY CATEGORY ─────────────────
  fetchServicesByCategory: async (categoryId) => {
    try {
      set({ loading: true });

      const res = await ServiceService.getServicesByCategory(categoryId);
      const payload = res?.data || res;

      set({
        services: toArray(payload),
        loading: false,
      });
    } catch (err) {
      console.error('fetchServicesByCategory error:', err);
      set({ services: [], loading: false });
    }
  },

  // ───────────────── DETAIL ─────────────────
  fetchServiceById: async (serviceId) => {
    try {
      set({ loading: true, currentService: null });

      const res = await ServiceService.getServiceById(serviceId);
      const payload = res?.data || res;

      set({
        currentService: payload || null,
        loading: false,
      });
    } catch (err) {
      console.error('fetchServiceById error:', err);
      set({ currentService: null, loading: false });
    }
  },

  clearCurrentService: () => set({ currentService: null }),

  // ───────────────── CREATE (Chuẩn cấu trúc) ─────────────────
  createService: async (serviceData) => {
    try {
      set({ submitting: true });

      const res = await ServiceService.createService(serviceData);
      const payload = res?.data || res; // Đề phòng axios interceptor đã unwrap hoặc chưa

      set((state) => ({
        services: [payload, ...state.services],
      }));

      return {
        success: true,
        data: payload,
      };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "Thêm mới dịch vụ thất bại.",
      };
    } finally {
      set({ submitting: false });
    }
  },

  // ───────────────── UPDATE (Sửa lỗi cấu trúc trả về) ─────────────────
  updateService: async (serviceId, serviceData) => {
    try {
      set({ submitting: true });

      const res = await ServiceService.updateService(serviceId, serviceData);
      const payload = res?.data || res; // Lấy dữ liệu gói dịch vụ sạch sau update

      // Cập nhật State cục bộ trong mảng services của Zustand real-time
      set((state) => ({
        services: state.services.map((s) =>
          s.id === Number(serviceId) ? { ...s, ...payload } : s
        ),
        currentService:
          state.currentService?.id === Number(serviceId)
            ? { ...state.currentService, ...payload }
            : state.currentService,
      }));

      // Đóng gói trả ra cấu trúc chuẩn hóa cho ServiceFormAdmin xử lý đúng if(res?.success)
      return {
        success: true,
        data: payload,
      };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "Cập nhật dịch vụ thất bại.",
      };
    } finally {
      set({ submitting: false });
    }
  },

  // ───────────────── DELETE (Chuẩn cấu trúc) ─────────────────
  deleteService: async (serviceId) => {
    try {
      set({ submitting: true });

      const res = await ServiceService.deleteService(serviceId);
      
      // Giả định nếu API thành công hoặc có success flag bóc từ Axios
      set((state) => ({
        services: state.services.filter(
          (s) => s.id !== Number(serviceId)
        ),
        currentService:
          state.currentService?.id === Number(serviceId)
            ? null
            : state.currentService,
      }));

      return {
        success: true,
        data: res?.data || res,
      };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "Xóa dịch vụ thất bại.",
      };
    } finally {
      set({ submitting: false });
    }
  },
}));