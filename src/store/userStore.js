import { create } from "zustand";
import UserService from "../services/UserService";

export const useUserStore = create((set, get) => ({
  // ───────────────────────── STATE ─────────────────────────
  users: [],
  meta: null,
  currentUser: null,

  loading: false,
  detailLoading: false,

  page: 1,
  pageSize: 10,

  // ───────────────────────── SETTERS ─────────────────────────
  setPage: (page) => set({ page }),

  clearCurrentUser: () =>
    set({
      currentUser: null,
    }),

  // ───────────────────────── GET USERS ─────────────────────────
  fetchUsers: async (params = {}) => {
    try {
      set({ loading: true });

      const state = get();

      const res = await UserService.getUsers({
        page: state.page,
        size: state.pageSize,
        ...params,
      });

      console.log("fetchUsers:", res);

      if (res?.status === "SUCCESS") {
        set({
          users: res?.data?.result || res?.data || [],
          meta: res?.data?.meta || null,
        });
      } else {
        set({
          users: [],
          meta: null,
        });
      }

      return res;
    } catch (err) {
      console.error(
        "Lỗi khi tải danh sách user:",
        err
      );

      set({
        users: [],
        meta: null,
      });

      return {
        status: "ERROR",
        message: err.message,
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── GET USER DETAIL ─────────────────────────
  fetchUserById: async (id) => {
    console.log("userid: ", id);
    try {
      set({
        detailLoading: true,
        currentUser: null,
      });

      const res =
        await UserService.getUserById(id);

      set({
        currentUser:
          res?.status === "SUCCESS"
            ? res.data
            : null,
      });

      return res;
    } catch (err) {
      console.error(
        `Lỗi khi tải user ${id}:`,
        err
      );

      return {
        status: "ERROR",
        message: err.message,
      };
    } finally {
      set({
        detailLoading: false,
      });
    }
  },

  // ───────────────────────── CREATE USER ─────────────────────────
  createUser: async (userData) => {

    try {
      set({ loading: true });

      const res =
        await UserService.createUser(
          userData
        );

      if (res?.status === "SUCCESS") {
        set((state) => ({
          users: [
            res.data,
            ...state.users,
          ],
        }));
      }

      return res;
    } catch (err) {
      console.error(
        "Lỗi khi tạo user:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi tạo user",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── UPDATE USER ─────────────────────────
  updateUser: async (userData) => {
    console.log("payload from store: ", userData);
    try {
      set({ loading: true });

      const res =
        await UserService.updateUser(
          userData
        );

      if (res?.status === "SUCCESS") {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userData.id
              ? {
                  ...u,
                  ...res.data,
                }
              : u
          ),

          currentUser:
            state.currentUser?.id ===
            userData.id
              ? {
                  ...state.currentUser,
                  ...res.data,
                }
              : state.currentUser,
        }));
      }

      return res;
    } catch (err) {
      console.error(
        `Lỗi update user ${userData.id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi update user",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── CHANGE STATUS ─────────────────────────
  updateUserStatus: async (id) => {
    try {
      set({ loading: true });

      const res =
        await UserService.updateUserStatus(
          id
        );

      if (res?.status === "SUCCESS") {
        await get().fetchUsers();
      }

      return res;
    } catch (err) {
      console.error(
        `Lỗi đổi trạng thái user ${id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi đổi trạng thái user",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── DELETE USER ─────────────────────────
  deleteUser: async (id) => {
    try {
      set({ loading: true });

      const res =
        await UserService.deleteUser(id);

      if (res?.status === "SUCCESS") {
        set((state) => ({
          users: state.users.filter(
            (u) => u.id !== id
          ),

          currentUser:
            state.currentUser?.id === id
              ? null
              : state.currentUser,
        }));
      }

      return res;
    } catch (err) {
      console.error(
        `Lỗi xóa user ${id}:`,
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi xóa user",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── AVATAR ─────────────────────────
  uploadAvatar: async (
    userId,
    file
  ) => {
    try {
      set({ loading: true });

      return await UserService.uploadAvatar(
        userId,
        file
      );
    } catch (err) {
      console.error(
        "Lỗi upload avatar:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi upload avatar",
      };
    } finally {
      set({ loading: false });
    }
  },

  // ───────────────────────── PROFILE ─────────────────────────
  fetchProfile: async () => {
    try {
      set({
        detailLoading: true,
      });

      const res =
        await UserService.getProfile();

      return res;
    } catch (err) {
      console.error(
        "Lỗi lấy profile:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi lấy profile",
      };
    } finally {
      set({
        detailLoading: false,
      });
    }
  },

  updateProfile: async (
    profileData
  ) => {
    try {
      set({ loading: true });

      const res =
        await UserService.updateProfile(
          profileData
        );

      return res;
    } catch (err) {
      console.error(
        "Lỗi cập nhật profile:",
        err
      );

      return {
        status: "ERROR",
        message:
          err?.response?.data?.message ||
          "Lỗi cập nhật profile",
      };
    } finally {
      set({ loading: false });
    }
  },
}));

