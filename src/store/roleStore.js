import { create } from "zustand";
import RoleService from "../services/RoleService";

export const useRoleStore = create(
  (set, get) => ({
    // ───────────────────────── STATE ─────────────────────────

    roles: [],
    selectedRole: null,

    metaRoles: null,

    loading: false,
    submitting: false,
    error: null,

    keyword: "",

    // ───────────────────────── FILTERS ─────────────────────────

    setKeyword: (keyword) =>
      set({ keyword }),

    // ───────────────────────── GET ALL ─────────────────────────

    fetchRoles: async (
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
            state.keyword ||
            undefined,

          ...overrideParams,
        };

        const res =
          await RoleService.getRoles(
            params
          );

        set({
          roles:
            res?.result || [],

          metaRoles:
            res?.meta || null,
        });
      } catch (err) {
        console.error(
          "Fetch roles error:",
          err
        );

        set({
          roles: [],
          metaRoles: null,
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

    // ───────────────────────── DETAIL ─────────────────────────

    fetchRoleById: async (
      id
    ) => {
      try {
        set({
          loading: true,
          error: null,
        });

        const res =
          await RoleService.getRoleById(
            id
          );

        set({
          selectedRole: res,
        });

        return res;
      } catch (err) {
        console.error(
          "Fetch role detail error:",
          err
        );

        set({
          error:
            err?.response?.data
              ?.message ||
            err?.message,
        });

        return null;
      } finally {
        set({
          loading: false,
        });
      }
    },

    // ───────────────────────── CREATE ─────────────────────────

    createRole: async (
      request
    ) => {
      try {
        set({
          submitting: true,
          error: null,
        });

        const res =
          await RoleService.createRole(
            request
          );

        await get().fetchRoles();

        return {
          success: true,
          data: res,
        };
      } catch (err) {
        console.error(
          "Create role error:",
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

    // ───────────────────────── UPDATE ─────────────────────────

    updateRole: async (
      request
    ) => {
      try {
        set({
          submitting: true,
          error: null,
        });

        const res =
          await RoleService.updateRole(
            request
          );

        await get().fetchRoles();

        return {
          success: true,
          data: res,
        };
      } catch (err) {
        console.error(
          "Update role error:",
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

    // ───────────────────────── DELETE ─────────────────────────

    deleteRole: async (
      id
    ) => {
      try {
        set({
          submitting: true,
          error: null,
        });

        const res =
          await RoleService.deleteRole(
            id
          );

        await get().fetchRoles();

        return {
          success: true,
          data: res,
        };
      } catch (err) {
        console.error(
          "Delete role error:",
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

    resetRoleState: () =>
      set({
        selectedRole: null,
        keyword: "",
        error: null,
      }),
  })
);