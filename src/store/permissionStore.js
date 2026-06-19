import { create } from "zustand";
import PermissionService from "../services/PermissionService";

export const usePermissionStore =
  create((set, get) => ({
    // ───────────────────────── STATE ─────────────────────────

    permissions: [],
    selectedPermission: null,

    metaPermissions: null,

    loading: false,
    submitting: false,
    error: null,

    keyword: "",

    // ───────────────────────── FILTERS ─────────────────────────

    setKeyword: (keyword) =>
      set({ keyword }),

    // ───────────────────────── GET ALL ─────────────────────────

    fetchPermissions: async (
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
          await PermissionService.getPermissions(
            params
          );
        console.log("fetch permission: ", res);
        set({
          permissions:
            res?.result || [],

          metaPermissions:
            res?.meta || null,
        });
      } catch (err) {
        console.error(
          "Fetch permissions error:",
          err
        );

        set({
          permissions: [],
          metaPermissions: null,
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

    fetchPermissionById:
      async (id) => {
        try {
          set({
            loading: true,
            error: null,
          });

          const res =
            await PermissionService.getPermissionById(
              id
            );

          set({
            selectedPermission:
              res,
          });

          return res;
        } catch (err) {
          console.error(
            "Fetch permission detail error:",
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

    createPermission:
      async (request) => {
        try {
          set({
            submitting: true,
            error: null,
          });

          const res =
            await PermissionService.createPermission(
              request
            );

          await get().fetchPermissions();

          return {
            success: true,
            data: res,
          };
        } catch (err) {
          console.error(
            "Create permission error:",
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

    updatePermission:
      async (request) => {
        try {
          set({
            submitting: true,
            error: null,
          });

          const res =
            await PermissionService.updatePermission(
              request
            );

          await get().fetchPermissions();

          return {
            success: true,
            data: res,
          };
        } catch (err) {
          console.error(
            "Update permission error:",
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

    deletePermission:
      async (id) => {
        try {
          set({
            submitting: true,
            error: null,
          });

          const res =
            await PermissionService.deletePermission(
              id
            );

          await get().fetchPermissions();

          return {
            success: true,
            data: res,
          };
        } catch (err) {
          console.error(
            "Delete permission error:",
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

    resetPermissionState:
      () =>
        set({
          selectedPermission:
            null,
          keyword: "",
          error: null,
        }),
  }));