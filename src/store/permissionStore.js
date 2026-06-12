import { create } from 'zustand';
import PermissionService from '../services/PermissionService';

export const usePermissionStore = create((set, get) => ({
  // ─── STATES ───────────────────────────────────────────────────────────────
  permissions: [],               // Mảng phẳng chứa toàn bộ quyền hạn
  permissionsByModule: {},       // Object nhóm quyền theo module (vd: { PRODUCTS: [...], SERVICES: [...] })
  isLoading: false,
  error: null,

  // ─── ACTIONS ──────────────────────────────────────────────────────────────
  
  /**
   * Tải danh sách quyền hạn hệ thống từ Service và tiến hành phân nhóm dữ liệu
   */
  fetchPermissions: async () => {
    // Tối ưu hóa: Nếu đã tải dữ liệu trước đó rồi thì không cần gọi lại API giả lập
    if (get().permissions.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const res = await PermissionService.getPermissions();

      if (res && res.success) {
        const rawPermissions = res.data || [];
        
        // Tiến hành gom nhóm quyền hạn theo cụm chức năng (Module) để phục vụ UI phân chia tab/bảng
        const grouped = rawPermissions.reduce((acc, curr) => {
          const moduleName = curr.module || 'OTHERS';
          if (!acc[moduleName]) {
            acc[moduleName] = [];
          }
          acc[moduleName].push(curr);
          return acc;
        }, {});

        set({ 
          permissions: rawPermissions,
          permissionsByModule: grouped,
          isLoading: false 
        });
      } else {
        set({ permissions: [], permissionsByModule: {}, isLoading: false, error: res.message });
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách quyền hệ thống:", err);
      set({ isLoading: false, error: err.message || "Lỗi bất định khi tải quyền hạn" });
    }
  },

  /**
   * Hàm hỗ trợ lấy nhanh danh sách quyền hạn thuộc về một module cụ thể
   */
  getPermissionsByModule: (moduleName) => {
    return get().permissionsByModule[moduleName] || [];
  }
}));