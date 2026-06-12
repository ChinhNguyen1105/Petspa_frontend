import { create } from "zustand";
import UserService from "../services/UserService";

export const useUserStore = create((set, get) => ({
  // ───────────────────────── STATES ─────────────────────────
  users: [],
  meta: null,
  currentUser: null,

  keyword: "",
  selectedRole: "",
  selectedActiveFlag: "",
  selectedDeleteFlag: false, // Thường mặc định false để ẩn tài khoản đã xóa trên UI chính

  page: 1,
  pageSize: 10,

  loading: false,
  detailLoading: false,

  // ───────────────────────── FILTER SETTERS ─────────────────────────
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setSelectedRole: (role) => set({ selectedRole: role === "ALL" ? "" : role, page: 1 }),
  setSelectedActiveFlag: (activeFlag) => set({ selectedActiveFlag: activeFlag, page: 1 }),
  setSelectedDeleteFlag: (deleteFlag) => set({ selectedDeleteFlag: deleteFlag, page: 1 }),
  setPage: (page) => set({ page }),
  clearCurrentUser: () => set({ currentUser: null }),

  // ───────────────────────── GET USERS ─────────────────────────
  fetchUsers: async (overrideParams = {}) => {
    try {
      set({ loading: true });
      const state = get();

      const params = {
        keyword: state.keyword,
        role: state.selectedRole || null,
        activeFlag: state.selectedActiveFlag !== "" ? state.selectedActiveFlag : null,
        deleteFlag: state.selectedDeleteFlag !== "" ? state.selectedDeleteFlag : null,
        page: state.page,
        pageSize: state.pageSize,
        ...overrideParams,
      };

      const res = await UserService.getUsers(params);

      if (res?.success) {
        set({
          users: res.data?.result || [],
          meta: res.data?.meta || null,
        });
      } else {
        set({ users: [], meta: null });
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách user:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── GET USER DETAIL ─────────────────────────
  fetchUserById: async (id) => {
    if (get().currentUser?.id === id) return;
    try {
      set({ detailLoading: true, currentUser: null });
      const res = await UserService.getUserById(id);
      set({ currentUser: res?.success ? res.data : null });
    } catch (err) {
      console.error(`Lỗi khi tải user ID ${id}:`, err);
    } finally {
      set({ detailLoading: false });
    }
  },

  // ───────────────────────── CREATE USER ─────────────────────────
  createUser: async (userData) => {
    try {
      set({ loading: true });
      const res = await UserService.createUser(userData);

      if (res?.success) {
        set((state) => ({
          users: [res.data, ...state.users],
          meta: state.meta ? { ...state.meta, total: state.meta.total + 1 } : null,
        }));
      }
      return res;
    } catch (err) {
      console.error("Lỗi khi tạo user:", err);
      return { success: false, message: "Lỗi hệ thống khi tạo user" };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── UPDATE USER ─────────────────────────
  updateUser: async (id, userData) => {
    try {
      set({ loading: true });
      const res = await UserService.updateUser(id, userData);

      if (res?.success) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...res.data } : u)),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...res.data } : state.currentUser,
        }));
      }
      return res;
    } catch (err) {
      console.error(`Lỗi update user ${id}:`, err);
      return { success: false, message: "Lỗi hệ thống khi update user" };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── UPDATE STATUS ─────────────────────────
  updateUserStatus: async (id, activeFlag) => {
    try {
      set({ loading: true });
      const res = await UserService.updateStatus(id, activeFlag);

      if (res?.success) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, activeFlag } : u)),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, activeFlag } : state.currentUser,
        }));
      }
      return res;
    } catch (err) {
      console.error(`Lỗi update status user ${id}:`, err);
      return { success: false, message: "Lỗi hệ thống khi update status" };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── SOFT DELETE USER ─────────────────────────
  deleteUser: async (id) => {
    try {
      set({ loading: true });
      const res = await UserService.deleteUser(id);

      if (res?.success) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, deleteFlag: true } : u)),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, deleteFlag: true } : state.currentUser,
        }));
      }
      return res;
    } catch (err) {
      console.error(`Lỗi delete user ${id}:`, err);
      return { success: false, message: "Lỗi hệ thống khi delete user" };
    } finally {
      set({ loading: false });
    }
  },
}));