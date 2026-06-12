import { create } from "zustand";
import RoleService from "../services/RoleService"; // Đồng bộ chuẩn xác theo file service đã import

export const useRolePermissionStore = create((set, get) => ({
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */
  roles: [],
  permissions: [],
  permissionsByModule: {}, // Quyền hạn được nhóm sẵn theo từng phân hệ (PRODUCTS, INVENTORY...)
  loading: false,
  error: null,

  /*
  |--------------------------------------------------------------------------
  | PERMISSION ACTIONS
  |--------------------------------------------------------------------------
  */
  // Tải danh sách tất cả các quyền hạn trong hệ thống
  fetchPermissions: async () => {
    set({ loading: true, error: null });
    try {
      // ĐÃ SỬA: Thay AuthService bằng RoleService theo đúng biến import ở đầu file
      const res = await RoleService.PermissionService.getAllPermissions();
      const list = res?.data?.data || [];
      
      // Tự động gom nhóm các quyền theo thuộc tính 'module' phục vụ UI hiển thị dạng Checkbox/Bảng
      const grouped = list.reduce((acc, curr) => {
        const mod = curr.module || "OTHERS";
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(curr);
        return acc;
      }, {});

      set({ 
        permissions: list, 
        permissionsByModule: grouped, 
        loading: false 
      });
    } catch (err) {
      set({ loading: false, error: err?.message || "Không thể tải danh sách quyền" });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | ROLE ACTIONS
  |--------------------------------------------------------------------------
  */
  // Tải danh sách toàn bộ các Vai trò
  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      // ĐÃ SỬA: Thay AuthService bằng RoleService theo đúng biến import ở đầu file
      const res = await RoleService.RoleService.getAllRoles();
      set({ roles: res?.data?.data || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err?.message || "Không thể tải danh sách vai trò" });
    }
  },

  // Cập nhật mảng ID quyền lợi cho một Vai trò cụ thể
  updatePermissionsForRole: async (roleId, permissionIds) => {
    set({ loading: true, error: null });
    try {
      // ĐÃ SỬA: Thay AuthService bằng RoleService theo đúng biến import ở đầu file
      await RoleService.RoleService.updateRolePermissions(roleId, permissionIds);
      
      // Đồng bộ trực tiếp mảng roles tại Client State để giao diện Admin render lại ngay lập tức
      set((state) => ({
        loading: false,
        roles: state.roles.map((role) =>
          role.id === roleId ? { ...role, permissionIds } : role
        ),
      }));
      return { success: true };
    } catch (err) {
      set({ loading: false, error: err?.message || "Cập nhật quyền thất bại" });
      return { success: false, error: err?.message };
    }
  },

  /*
  |--------------------------------------------------------------------------
  | UTILITY HELPERS
  |--------------------------------------------------------------------------
  */
  // Hàm bổ trợ lấy nhanh danh sách ID quyền của một Role theo tên (ví dụ: 'STAFF')
  getPermissionIdsByRoleName: (roleName) => {
    const role = get().roles.find(r => r.name?.toUpperCase() === roleName?.toUpperCase());
    return role ? role.permissionIds : [];
  }
}));